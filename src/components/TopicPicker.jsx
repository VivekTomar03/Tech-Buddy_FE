import { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { classifyTopic, KIND_LABEL } from '@/lib/format';
import { MAX_TOPICS, TOPIC_GROUPS } from '@/lib/topics';


export default function TopicPicker({ value, onChange, error }) {
  const [custom, setCustom] = useState('');
  const has = (t) => value.some((v) => v.toLowerCase() === t.toLowerCase());
  const full = value.length >= MAX_TOPICS;

  const toggle = (t) => {
    if (has(t)) onChange(value.filter((v) => v.toLowerCase() !== t.toLowerCase()));
    else if (!full) onChange([...value, t]);
  };
  const addCustom = () => {
    const t = custom.trim().replace(/\s+/g, ' ').slice(0, 40);
    if (t && !has(t) && !full) onChange([...value, t]);
    setCustom('');
  };

  return (
    <div className="space-y-4">
      {TOPIC_GROUPS.map((group) => (
        <div key={group.name}>
          <p className="label-mono mb-2">{group.name}</p>
          <div className="flex flex-wrap gap-2">
            {group.topics.map((t) => {
              const on = has(t);
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  disabled={!on && full}
                  onClick={() => toggle(t)}
                  className={cn(
                    'inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors duration-150 disabled:opacity-40',
                    on ? 'border-accent bg-accent-soft font-medium text-fg' : 'border-line bg-surface text-muted hover:border-line-strong hover:text-fg'
                  )}
                >
                  {on && <Check className="size-3.5 text-accent-text" aria-hidden="true" />}
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div>
        <label htmlFor="custom-topic" className="label-mono mb-2 block">
          Custom topic
        </label>
        <div className="flex gap-2">
          <input
            id="custom-topic"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustom();
              }
            }}
            disabled={full}
            placeholder={full ? `Maximum ${MAX_TOPICS} topics` : 'e.g. Kafka, Spring Boot, Flutter'}
            className="h-11 min-w-0 flex-1 rounded-md border border-line bg-surface px-3 text-base text-fg hover:border-line-strong focus:border-accent focus:ring-2 focus:ring-accent/25 focus:outline-none disabled:opacity-60 sm:h-10 sm:text-sm"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!custom.trim() || full}
            className="inline-flex h-11 items-center gap-1.5 rounded-md border border-line bg-surface-2 px-3 text-sm hover:bg-surface-3 disabled:opacity-50 sm:h-10"
          >
            <Plus className="size-4" aria-hidden="true" /> Add
          </button>
        </div>
      </div>

      <div aria-live="polite">
        {value.length > 0 ? (
          <ul className="flex flex-wrap gap-2" aria-label="Selected topics">
            {value.map((t, i) => (
              <li key={t} className="inline-flex h-8 items-center gap-2 rounded-md border border-line bg-surface-2 pr-1 pl-2.5 text-sm">
                <span className="font-mono text-[11px] text-subtle">{String(i + 1).padStart(2, '0')}</span>
                {t}
                <span className="text-[11px] text-subtle">{KIND_LABEL[classifyTopic(t)]}</span>
                <button type="button" onClick={() => toggle(t)} className="flex size-6 items-center justify-center rounded text-subtle hover:bg-surface-3 hover:text-fg" aria-label={`Remove ${t}`}>
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={cn('text-sm', error ? 'text-danger' : 'text-subtle')}>{error || 'Pick 1 to 6 topics. They are asked in this order.'}</p>
        )}
      </div>
    </div>
  );
}
