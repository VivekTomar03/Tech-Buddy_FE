import { Check, Circle, CircleDot, CircleSlash } from 'lucide-react';
import { cn } from '@/lib/cn';
import { clock, KIND_LABEL } from '@/lib/format';
import { useCountdown } from './useCountdown';

export function Timer({ endsAt, className }) {
  const left = useCountdown(endsAt);
  if (left == null) return null;
  const low = left <= 180;
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[13px] tabular-nums', low ? 'border-warn/40 bg-warn-soft text-warn' : 'border-line text-muted', className)}
      role="timer"
      aria-label={left === 0 ? 'Time is up' : `${Math.floor(left / 60)} minutes ${left % 60} seconds left`}
    >
      {left === 0 ? "time's up" : clock(left)}
    </span>
  );
}

const ICON = { done: Check, current: CircleDot, upcoming: Circle, skipped: CircleSlash };

export default function ProgressRail({ progress, company, level, speechLang, onSpeechLang, voiceSupported }) {
  if (!progress) {
    return (
      <div className="p-5 text-sm text-muted">
        This interview was started before the latest update. Answer the next question and the interviewer will continue with a fresh plan.
      </div>
    );
  }
  const left = progress.planned - progress.answered;
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line p-5">
        <p className="label-mono">Interview</p>
        <p className="mt-1 truncate font-semibold">{company}</p>
        <p className="text-sm text-muted">{level}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <p className="label-mono mb-3">Plan</p>
        <ol className="space-y-1">
          {progress.items.map((item, i) => {
            const Icon = ICON[item.status];
            return (
              <li
                key={item.subject + i}
                className={cn('flex items-center gap-3 rounded-md px-2 py-2 text-sm', item.status === 'current' && 'bg-surface-2')}
                aria-current={item.status === 'current' ? 'step' : undefined}
              >
                <Icon className={cn('size-4 shrink-0', item.status === 'done' ? 'text-accent-text' : item.status === 'current' ? 'text-fg' : 'text-subtle')} aria-hidden="true" />
                <span className={cn('min-w-0 flex-1 truncate', item.status === 'upcoming' || item.status === 'skipped' ? 'text-muted' : 'text-fg')}>{item.subject}</span>
                <span className="font-mono text-[11px] text-subtle">{item.status === 'skipped' ? 'skipped' : KIND_LABEL[item.kind]}</span>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-line p-3">
            <p className="font-mono text-lg font-semibold tabular-nums">{progress.answered}</p>
            <p className="text-xs text-subtle">answered</p>
          </div>
          <div className="rounded-lg border border-line p-3">
            <p className="font-mono text-lg font-semibold tabular-nums">{Math.max(0, left)}</p>
            <p className="text-xs text-subtle">planned left</p>
          </div>
        </div>
        {progress.current && (
          <p className="mt-4 text-xs text-muted">
            Now: <span className="text-fg">{progress.current.subject}</span> · {progress.current.difficulty}
            {progress.current.followUp ? ' · follow-up' : ''}
          </p>
        )}
      </div>

      {voiceSupported && (
        <div className="border-t border-line p-5">
          <label htmlFor="speech-lang" className="label-mono mb-2 block">
            Speech language
          </label>
          <select
            id="speech-lang"
            value={speechLang}
            onChange={(e) => onSpeechLang(e.target.value)}
            className="h-9 w-full rounded-md border border-line bg-surface px-2 text-sm text-fg focus:border-accent focus:outline-none"
          >
            <option value="en-IN">English (India)</option>
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
          </select>
        </div>
      )}
    </div>
  );
}
