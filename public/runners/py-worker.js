/* global importScripts, loadPyodide */
/* Runs candidate Python with Pyodide (CPython compiled to WebAssembly) inside a worker.
 * Classic worker in /public so Vite doesn't try to bundle the CDN script.
 * The main thread terminates this worker on timeout; it is then recreated on the next run. */

const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
importScripts(PYODIDE_URL + 'pyodide.js');

const ready = loadPyodide({ indexURL: PYODIDE_URL });

const HARNESS = `
import json, sys, io, time, traceback

def _tb_run(_name, _input_json):
    _fn = globals().get(_name)
    _args = json.loads(_input_json)
    _buf = io.StringIO()
    _old = sys.stdout
    sys.stdout = _buf
    _t = time.perf_counter()
    _res, _err = None, None
    try:
        _res = _fn(*_args)
    except Exception as e:
        _err = f"{type(e).__name__}: {e}"
    finally:
        sys.stdout = _old
    _ms = (time.perf_counter() - _t) * 1000
    try:
        _out = json.dumps(_res)
    except Exception:
        _out = None
        if _err is None:
            _err = f"Return value of type {type(_res).__name__} can't be converted to JSON (return a list, dict, str, number or bool)."
    return json.dumps({"out": _out, "error": _err, "ms": _ms, "logs": _buf.getvalue()[-2000:]})

def _tb_script(_code):
    _buf = io.StringIO()
    _old = sys.stdout
    sys.stdout = _buf
    _err = None
    try:
        exec(_code, globals())
    except Exception:
        _err = traceback.format_exc(limit=2)
    finally:
        sys.stdout = _old
    return json.dumps({"logs": _buf.getvalue()[-4000:], "error": _err})
`;

function cleanError(err) {
  const msg = String((err && err.message) || err);
  const lines = msg.trim().split('\n');
  // Pyodide tracebacks include internal frames; the last few lines are the useful part.
  return lines.slice(-4).join('\n');
}

self.onmessage = async (event) => {
  const { id, code, functionName, tests } = event.data;
  let py;
  try {
    py = await ready;
  } catch {
    self.postMessage({ id, type: 'load_error', error: 'Could not load the Python runtime. Check your connection and try again.' });
    return;
  }
  self.postMessage({ id, type: 'ready' });

  const ns = py.toPy({}); // fresh globals per run, so old definitions never leak between runs
  try {
    py.runPython(HARNESS, { globals: ns });
    if (!functionName) {
      const script = ns.get('_tb_script');
      const result = JSON.parse(script(code));
      script.destroy();
      self.postMessage({ id, type: 'script', logs: result.logs ? result.logs.split('\n').filter(Boolean) : [], error: result.error });
      return;
    }
    py.runPython(code, { globals: ns });
  } catch (err) {
    self.postMessage({ id, type: 'compile_error', error: cleanError(err) });
    ns.destroy();
    return;
  }

  const fn = ns.get(functionName);
  const exists = fn !== undefined;
  if (fn && fn.destroy) fn.destroy();
  if (!exists) {
    self.postMessage({ id, type: 'compile_error', error: `Function "${functionName}" was not found. Keep the function name from the starter code.` });
    ns.destroy();
    return;
  }

  const run = ns.get('_tb_run');
  for (let i = 0; i < tests.length; i++) {
    try {
      const r = JSON.parse(run(functionName, JSON.stringify(tests[i].input)));
      const logs = r.logs ? r.logs.split('\n').filter(Boolean).slice(-20) : [];
      if (r.error) self.postMessage({ id, type: 'test', index: i, ms: r.ms, logs, error: r.error });
      else self.postMessage({ id, type: 'test', index: i, ms: r.ms, logs, value: JSON.parse(r.out) });
    } catch (err) {
      self.postMessage({ id, type: 'test', index: i, error: cleanError(err) });
    }
  }
  run.destroy();
  ns.destroy();
  self.postMessage({ id, type: 'done' });
};
