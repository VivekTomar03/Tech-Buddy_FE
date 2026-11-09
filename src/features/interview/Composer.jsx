import { useEffect, useRef } from 'react';
import { Mic, MicOff, SendHorizontal } from 'lucide-react';
import { cn } from '@/lib/cn';
import Button from '@/components/ui/Button';

const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

const MIC_LABEL = {
  idle: 'Start dictation',
  starting: 'Starting microphone — click to cancel',
  listening: 'Stop dictation',
  reconnecting: 'Reconnecting microphone — click to stop',
  paused: 'Paused while the interviewer speaks — click to stop',
  error: 'Microphone unavailable — click to retry',
};

/**
 * Answer box. Dictated text is appended to the draft; words still being recognised
 * are shown underneath so the caret never jumps while you speak.
 */
export default function Composer({ value, onChange, onSend, disabled, sending, voice, placeholder }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const canSend = !disabled && !sending && (value.trim() || (voice && voice.interim.trim()));
  const micState = voice ? voice.status : 'idle';
  const micOn = micState === 'starting' || micState === 'listening' || micState === 'reconnecting' || micState === 'paused';

  return (
    <div className="border-t border-line bg-bg pb-safe">
      <div className="mx-auto max-w-3xl px-3 pt-3 sm:px-6">
        {voice && (micOn || voice.error) && (
          <div className="mb-2 flex items-start gap-2 px-1 text-xs" aria-live="polite">
            {voice.error ? (
              <span className="text-danger">{voice.error}</span>
            ) : (
              <>
                <span className={cn('mt-1 size-1.5 shrink-0 rounded-full', micState === 'listening' ? 'bg-danger' : 'bg-warn')} aria-hidden="true" />
                <span className="text-muted">
                  {micState === 'starting'
                    ? 'Starting the microphone — allow access if your browser asks'
                    : micState === 'paused'
                      ? 'Paused while the interviewer speaks'
                      : micState === 'reconnecting'
                        ? 'Reconnecting mic…'
                        : voice.hearing
                          ? 'Hearing you'
                          : 'Listening'}
                  {voice.interim && <span className="text-subtle italic"> — {voice.interim}</span>}
                </span>
              </>
            )}
          </div>
        )}
        <div className="flex items-end gap-2 rounded-xl border border-line bg-surface p-1.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
          {voice && voice.supported && (
            <Button
              variant="ghost"
              size="icon"
              onClick={voice.toggle}
              aria-label={MIC_LABEL[micState] || MIC_LABEL.idle}
              aria-pressed={micOn}
              title={MIC_LABEL[micState] || MIC_LABEL.idle}
              className={cn(micOn && 'animate-pulse-ring bg-danger-soft text-danger hover:bg-danger-soft hover:text-danger')}
            >
              {micOn ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </Button>
          )}
          <label htmlFor="answer" className="sr-only">
            Your answer
          </label>
          <textarea
            id="answer"
            ref={ref}
            rows={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !coarse && !e.nativeEvent.isComposing) {
                e.preventDefault();
                if (canSend) onSend();
              }
            }}
            disabled={disabled}
            placeholder={placeholder || 'Type your answer…'}
            className="scrollbar-thin max-h-[200px] min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 text-base leading-relaxed text-fg focus:outline-none sm:min-h-10 sm:text-[15px]"
          />
          <Button size="icon" onClick={onSend} disabled={!canSend} loading={sending} aria-label="Send answer">
            {!sending && <SendHorizontal className="size-5" />}
          </Button>
        </div>
        <p className="hidden px-1 pt-1.5 pb-2 text-[11px] text-subtle sm:block">
          <kbd className="font-mono">Enter</kbd> to send · <kbd className="font-mono">Shift+Enter</kbd> new line · say or type “skip” to skip a question
        </p>
        <div className="h-2 sm:hidden" />
      </div>
    </div>
  );
}
