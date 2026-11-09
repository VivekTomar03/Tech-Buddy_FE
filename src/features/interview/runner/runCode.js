import { matches } from './compare';

/**
 * Run candidate code in the browser.
 *   JavaScript / TypeScript → module worker (fresh per run)
 *   Python                  → Pyodide worker (kept warm; first load downloads ~10 MB)
 * Java / C++ are not executed; the AI reviews them instead.
 */

export const RUNNABLE = ['javascript', 'typescript', 'python'];
const RUN_TIMEOUT_MS = 5000;
const PY_LOAD_TIMEOUT_MS = 90000;

let pyWorker = null;
let pyReady = false;
const getPyWorker = () => {
  if (!pyWorker) {
    pyWorker = new Worker('/runners/py-worker.js');
    pyReady = false;
  }
  return pyWorker;
};
const killPyWorker = () => {
  if (pyWorker) pyWorker.terminate();
  pyWorker = null;
  pyReady = false;
};

let nextId = 1;

/**
 * @param {object} opts
 * @param {'javascript'|'typescript'|'python'} opts.language
 * @param {string} opts.code
 * @param {object} [opts.problem] problem from the API; omit for script mode (machine coding)
 * @param {'examples'|'all'} [opts.which]
 * @param {(status: string) => void} [opts.onStatus]
 */
export function runCode({ language, code, problem, which = 'all', onStatus = () => {} }) {
  const tests = problem ? (which === 'examples' ? problem.examples : problem.tests) : [];
  const functionName = problem ? (language === 'python' ? problem.pythonName : problem.functionName) : null;
  const id = nextId++;

  return new Promise((resolve) => {
    const isPython = language === 'python';
    const worker = isPython ? getPyWorker() : new Worker(new URL('./js.worker.js', import.meta.url), { type: 'module' });
    const results = tests.map((t, index) => ({ index, input: t.input, expected: t.output, status: 'pending' }));
    let timer = null;
    let settled = false;

    const finish = (extra = {}) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
      if (!isPython) worker.terminate();
      const passed = results.filter((r) => r.status === 'pass').length;
      resolve({ id, mode: problem ? 'tests' : 'script', results, passed, total: results.length, ...extra });
    };

    const armRunTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        for (const r of results) if (r.status === 'pending') r.status = 'timeout';
        if (isPython) killPyWorker();
        else worker.terminate();
        finish({ timedOut: true, error: `Stopped after ${RUN_TIMEOUT_MS / 1000}s — check for an infinite loop or a very slow solution.` });
      }, RUN_TIMEOUT_MS);
    };

    function onMessage(event) {
      const m = event.data;
      if (!m || m.id !== id) return;
      if (m.type === 'ready') {
        pyReady = true;
        onStatus('running');
        armRunTimer();
      } else if (m.type === 'load_error') {
        killPyWorker();
        finish({ error: m.error, loadError: true });
      } else if (m.type === 'compile_error') {
        for (const r of results) r.status = 'error';
        finish({ compileError: m.error, logs: m.logs || [] });
      } else if (m.type === 'script') {
        finish({ logs: m.logs || [], error: m.error || null });
      } else if (m.type === 'test') {
        const r = results[m.index];
        r.ms = m.ms;
        r.logs = m.logs || [];
        if (m.error) {
          r.status = 'error';
          r.error = m.error;
        } else {
          r.got = m.undef ? undefined : m.value;
          r.status = matches(problem.compare, r.got, r.expected) ? 'pass' : 'fail';
        }
        armRunTimer(); // per-test budget
      } else if (m.type === 'done') {
        finish();
      }
    }
    function onError(event) {
      event.preventDefault && event.preventDefault();
      if (isPython) killPyWorker();
      finish({ error: 'The code runner crashed. Try again.' });
    }

    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);

    if (isPython && !pyReady) {
      onStatus('loading-python');
      timer = setTimeout(() => {
        killPyWorker();
        finish({ error: 'Loading Python took too long. Check your connection and try again.', loadError: true });
      }, PY_LOAD_TIMEOUT_MS);
    } else {
      onStatus('running');
      armRunTimer();
    }
    worker.postMessage({ id, code, language, functionName, tests });
  });
}

/** Payload the backend expects with a code submission. */
export function toSubmission(run) {
  const failures = run.results
    .filter((r) => r.status !== 'pass')
    .slice(0, 3)
    .map((r) => ({ input: r.input, expected: r.expected, got: r.status === 'timeout' ? 'timeout' : r.got, error: r.error || (r.status === 'timeout' ? 'Time limit exceeded' : '') }));
  return { passed: run.passed, total: run.total, failures };
}
