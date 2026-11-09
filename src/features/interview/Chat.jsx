import { useEffect, useRef } from 'react';
import { Code2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { LogoMark } from '@/components/layout/Logo';

function metaLine(meta = {}) {
  if (meta.kind === 'end') return 'wrap-up';
  if (meta.kind === 'intro') return 'introduction';
  const parts = [meta.subject && meta.subject.toLowerCase(), meta.difficulty, meta.followUp && 'follow-up', meta.clarification && 'clarification'];
  return parts.filter(Boolean).join(' · ');
}

function CodeSubmission({ entry }) {
  const t = entry.meta && entry.meta.tests;
  const body = String(entry.content || '').replace(/^\[CODE SUBMISSION[^\]]*\]\s*/, '');
  return (
    <details className="group w-full rounded-lg border border-line bg-surface-2">
      <summary className="flex list-none items-center gap-2 px-3.5 py-2.5 text-sm [&::-webkit-details-marker]:hidden">
        <Code2 className="size-4 text-subtle" aria-hidden="true" />
        <span className="font-medium">Code submitted</span>
        <span className="font-mono text-xs text-subtle">{entry.meta && entry.meta.language}</span>
        {t && t.executed ? (
          <span className={cn('ml-auto font-mono text-xs', t.passed === t.total ? 'text-accent-text' : 'text-warn')}>
            {t.passed}/{t.total} tests
          </span>
        ) : (
          <span className="ml-auto font-mono text-xs text-subtle">reviewed, not run</span>
        )}
      </summary>
      <pre className="scrollbar-thin max-h-64 overflow-auto border-t border-line px-3.5 py-2.5 font-mono text-[12px] leading-relaxed">{body}</pre>
    </details>
  );
}

export function Message({ entry }) {
  const isBuddy = entry.role === 'interviewer';
  if (!isBuddy && entry.meta && entry.meta.kind === 'code') {
    return (
      <div className={cn('ml-auto flex w-full max-w-[92%] sm:max-w-[80%]', entry.pending && 'opacity-60')}>
        <CodeSubmission entry={entry} />
      </div>
    );
  }
  if (isBuddy) {
    return (
      <div className="flex max-w-[95%] animate-rise gap-3 sm:max-w-[85%]">
        <LogoMark className="mt-0.5 size-7 shrink-0" />
        <div className="min-w-0">
          <p className="label-mono mb-1 normal-case">
            buddy{metaLine(entry.meta) ? ` · ${metaLine(entry.meta)}` : ''}
          </p>
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{entry.content}</p>
        </div>
      </div>
    );
  }
  return (
    <div className={cn('ml-auto max-w-[90%] rounded-lg bg-surface-3 px-3.5 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap sm:max-w-[75%]', entry.pending && 'opacity-60')}>
      {entry.content}
      {entry.pending && <span className="sr-only"> (sending)</span>}
    </div>
  );
}

export function Thinking() {
  return (
    <div className="flex gap-3" role="status" aria-label="Interviewer is thinking">
      <LogoMark className="mt-0.5 size-7 shrink-0 opacity-70" />
      <p className="flex items-center gap-1 pt-1 font-mono text-sm text-subtle">
        thinking<span className="inline-block h-4 w-2 animate-blink bg-subtle" aria-hidden="true" />
      </p>
    </div>
  );
}

export function MessageList({ entries, thinking, footer }) {
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current && endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [entries.length, thinking]);

  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto" aria-live="polite" aria-relevant="additions">
      <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6 sm:px-6">
        {entries.map((e, i) => (
          <Message key={e._id || `m${i}`} entry={e} />
        ))}
        {thinking && <Thinking />}
        {footer}
        <div ref={endRef} />
      </div>
    </div>
  );
}
