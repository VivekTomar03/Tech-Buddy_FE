import { useMemo, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { CheckCircle2, ChevronDown, Clock3, Play, Send, Terminal, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useTheme } from '@/lib/theme';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Controls';
import { Spinner } from '@/components/ui/Feedback';
import RichText from '@/components/ui/RichText';
import { RUNNABLE, runCode, toSubmission } from './runner/runCode';
import { show, showArgs } from './runner/compare';

const LANGS = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
];
const SCRIPT_LANGS = LANGS.filter((l) => RUNNABLE.includes(l.id));
const DIFF_TONE = { easy: 'accent', medium: 'warn', hard: 'danger' };

const store = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  },
};

function ProblemStatement({ problem, taskText }) {
  const [open, setOpen] = useState(true);
  if (!problem && !taskText) return null;
  return (
    <div className="border-b border-line">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center gap-2 px-4 py-2.5 text-left">
        <span className="label-mono">{problem ? 'Problem' : 'Task'}</span>
        <ChevronDown className={cn('ml-auto size-4 text-subtle transition-transform duration-150', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {open && (
        <div className="scrollbar-thin max-h-[24vh] space-y-3 overflow-y-auto px-4 pb-4 text-sm leading-relaxed lg:max-h-[30vh]">
          {problem ? (
            <>
              <p>
                <RichText text={problem.description} />
              </p>
              <div className="space-y-2">
                {problem.examples.map((ex, i) => (
                  <div key={i} className="rounded-md border border-line bg-surface-2 px-3 py-2 font-mono text-[12.5px]">
                    <p>
                      <span className="text-subtle">input </span>
                      {showArgs(ex.input)}
                    </p>
                    <p>
                      <span className="text-subtle">output </span>
                      {show(ex.output)}
                    </p>
                  </div>
                ))}
              </div>
              {problem.constraints && problem.constraints.length > 0 && (
                <ul className="list-disc space-y-0.5 pl-5 text-[13px] text-muted">
                  {problem.constraints.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              )}
              {problem.compare !== 'exact' && <p className="text-xs text-subtle">The order of the returned items doesn't matter.</p>}
            </>
          ) : (
            <p className="whitespace-pre-wrap">{taskText}</p>
          )}
        </div>
      )}
    </div>
  );
}

function Results({ run, running, status }) {
  if (running) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted" role="status">
        <Spinner className="size-4" />
        {status === 'loading-python' ? 'Loading Python in your browser (first run only, ~10 MB)…' : 'Running…'}
      </div>
    );
  }
  if (!run) {
    return <p className="px-4 py-3 text-sm text-subtle">Run the examples to check your code. Submit runs every test, including hidden ones.</p>;
  }
  if (run.compileError || (run.error && run.mode !== 'script')) {
    return (
      <div className="px-4 py-3">
        <p className="text-sm font-medium text-danger">{run.compileError ? 'Your code did not run' : 'Run stopped'}</p>
        <pre className="mt-2 font-mono text-xs whitespace-pre-wrap text-muted">{run.compileError || run.error}</pre>
      </div>
    );
  }
  if (run.mode === 'script') {
    return (
      <div className="px-4 py-3">
        <p className="label-mono mb-2">Console</p>
        <pre className="font-mono text-xs whitespace-pre-wrap">{(run.logs || []).join('\n') || '(no output)'}</pre>
        {run.error && <pre className="mt-2 font-mono text-xs whitespace-pre-wrap text-danger">{run.error}</pre>}
      </div>
    );
  }
  const allPass = run.passed === run.total;
  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-2.5">
        {allPass ? <CheckCircle2 className="size-4 text-accent-text" aria-hidden="true" /> : <XCircle className="size-4 text-danger" aria-hidden="true" />}
        <p className="text-sm font-semibold">
          {run.passed}/{run.total} passed
        </p>
        {run.timedOut && <Badge tone="warn">timed out</Badge>}
      </div>
      <ul className="divide-y divide-line border-t border-line">
        {run.results.map((r) => (
          <li key={r.index} className="px-4 py-2 font-mono text-[12px]">
            <div className="flex items-center gap-2">
              <span className={cn('w-12 shrink-0', r.status === 'pass' ? 'text-accent-text' : r.status === 'pending' ? 'text-subtle' : 'text-danger')}>
                {r.status === 'pass' ? 'pass' : r.status === 'timeout' ? 'timeout' : r.status === 'error' ? 'error' : r.status === 'pending' ? '—' : 'fail'}
              </span>
              <span className="truncate text-muted">({showArgs(r.input)})</span>
              {r.ms != null && <span className="ml-auto shrink-0 text-subtle">{r.ms < 1 ? '<1' : Math.round(r.ms)} ms</span>}
            </div>
            {r.status === 'fail' && (
              <p className="mt-1 pl-14 break-all text-muted">
                expected <span className="text-fg">{show(r.expected)}</span> · got <span className="text-danger">{show(r.got)}</span>
              </p>
            )}
            {r.error && <p className="mt-1 pl-14 break-all text-danger">{r.error}</p>}
            {r.logs && r.logs.length > 0 && <p className="mt-1 pl-14 break-all text-subtle">console: {r.logs.slice(-3).join(' | ')}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Editor + runner for coding (with tests) and machine-coding (script mode) questions.
 * `onSubmit(payload)` must return a promise.
 */
export default function CodePanel({ interviewId, questionKey, problem, taskText, disabled, onSubmit }) {
  const mode = useTheme((s) => s.mode);
  const dark = mode === 'dark' || (mode === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const langs = problem ? LANGS : SCRIPT_LANGS;
  const langKey = `tb-lang:${interviewId}`;
  const [language, setLanguage] = useState(() => {
    const saved = store.get(langKey);
    return langs.some((l) => l.id === saved) ? saved : 'javascript';
  });
  const codeKey = `tb-code:${interviewId}:${questionKey}:${language}`;
  const starter = problem ? problem.starters[language] : language === 'python' ? '# Build it here\n' : '// Build it here\n';
  // Drafts are kept per question + language; switching language shows that language's draft.
  const [edits, setEdits] = useState({});
  const code = edits[codeKey] ?? store.get(codeKey) ?? starter;
  const [runState, setRunState] = useState({ key: null, run: null });
  const run = runState.key === codeKey ? runState.run : null;
  const setRun = (r) => setRunState({ key: codeKey, run: r });
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const saveTimer = useRef(null);

  const onChange = (value) => {
    const v = value ?? '';
    setEdits((e) => ({ ...e, [codeKey]: v }));
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => store.set(codeKey, v), 400);
  };

  const runnable = RUNNABLE.includes(language);
  const exec = async (which) => {
    setRunning(true);
    setStatus('');
    const result = await runCode({ language, code, problem, which, onStatus: setStatus });
    setRun(result);
    setRunning(false);
    return result;
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      let tests = null;
      if (problem && runnable) {
        const result = await exec('all');
        if (result.loadError) return; // don't submit if the runtime failed to load
        tests = toSubmission(result);
      }
      await onSubmit({ code, language, ...(tests ? { tests } : {}) });
    } finally {
      setSubmitting(false);
    }
  };

  const busy = running || submitting || disabled;
  const langLabel = useMemo(() => (LANGS.find((l) => l.id === language) || {}).label, [language]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <Terminal className="size-4 shrink-0 text-subtle" aria-hidden="true" />
        <h2 className="min-w-0 truncate text-sm font-semibold">{problem ? problem.title : 'Machine coding'}</h2>
        {problem && <Badge tone={DIFF_TONE[problem.difficulty]}>{problem.difficulty}</Badge>}
        <label htmlFor="code-language" className="sr-only">
          Language
        </label>
        <select
          id="code-language"
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            store.set(langKey, e.target.value);
          }}
          className="ml-auto h-8 rounded-md border border-line bg-surface-2 px-2 text-[13px] text-fg focus:border-accent focus:outline-none"
        >
          {langs.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <ProblemStatement problem={problem} taskText={taskText} />

      {!runnable && (
        <p className="border-b border-line bg-warn-soft px-4 py-2 text-xs text-muted">
          {langLabel} isn't executed in the browser. The interviewer reviews it by reading; tests run for JavaScript, TypeScript and Python.
        </p>
      )}

      <div className="min-h-40 flex-1 lg:min-h-55">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={onChange}
          theme={dark ? 'vs-dark' : 'light'}
          loading={<div className="p-4 text-sm text-subtle">Loading editor…</div>}
          options={{
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontSize: 13.5,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            tabSize: language === 'python' ? 4 : 2,
            wordWrap: 'on',
            renderLineHighlight: 'line',
            lineNumbersMinChars: 3,
          }}
        />
      </div>

      <div className="scrollbar-thin max-h-[20vh] overflow-y-auto border-t border-line lg:max-h-[34vh]" aria-live="polite">
        <Results run={run} running={running} status={status} />
      </div>

      <div className="flex items-center gap-2 border-t border-line px-3 py-2.5 pb-safe lg:pb-2.5">
        {runnable && (
          <Button variant="secondary" size="sm" onClick={() => exec(problem ? 'examples' : 'all')} disabled={busy}>
            <Play className="size-3.5" /> {problem ? 'Run examples' : 'Run'}
          </Button>
        )}
        <span className="hidden items-center gap-1 text-xs text-subtle sm:inline-flex">
          <Clock3 className="size-3.5" aria-hidden="true" /> 5s limit per test
        </span>
        <Button size="sm" className="ml-auto" onClick={submit} loading={submitting} disabled={busy && !submitting}>
          {!submitting && <Send className="size-3.5" />} Submit
        </Button>
      </div>
    </div>
  );
}
