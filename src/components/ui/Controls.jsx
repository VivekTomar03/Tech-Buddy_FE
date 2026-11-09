import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import Button from './Button';

/** Accessible on/off switch. */
export function Switch({ checked, onChange, label, description, disabled, id }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
        </label>
        {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-150 disabled:opacity-50',
          checked ? 'border-accent bg-accent' : 'border-line-strong bg-surface-3'
        )}
      >
        <span className={cn('inline-block size-4.5 rounded-full bg-white shadow-sm transition-transform duration-150', checked ? 'translate-x-5.5' : 'translate-x-0.5')} />
      </button>
    </div>
  );
}

/** Single-choice segmented control (radio group). */
export function Segmented({ options, value, onChange, name, className, size = 'md' }) {
  return (
    <div role="radiogroup" aria-label={name} className={cn('inline-flex w-full rounded-lg border border-line bg-surface-2 p-1', className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 rounded-md px-2 text-center transition-colors duration-150',
              size === 'sm' ? 'h-8 text-xs' : 'h-10 text-sm sm:h-9',
              active ? 'bg-surface font-semibold text-fg shadow-sm ring-1 ring-line' : 'text-muted hover:text-fg'
            )}
          >
            {opt.label}
            {opt.hint && <span className="ml-1 hidden font-mono text-[11px] text-subtle sm:inline">{opt.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}

const BADGE = {
  neutral: 'border-line bg-surface-2 text-muted',
  accent: 'border-accent/30 bg-accent-soft text-accent-text',
  warn: 'border-warn/30 bg-warn-soft text-warn',
  danger: 'border-danger/30 bg-danger-soft text-danger',
  info: 'border-info/30 bg-info-soft text-info',
};

export function Badge({ tone = 'neutral', className, children, mono = false }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[11px] leading-4 font-medium whitespace-nowrap', mono && 'font-mono', BADGE[tone], className)}>
      {children}
    </span>
  );
}

export function Card({ className, children, as: Tag = 'section', ...props }) {
  return (
    <Tag className={cn('rounded-xl border border-line bg-surface', className)} {...props}>
      {children}
    </Tag>
  );
}

export function CardHeader({ title, kicker, action, className, children }) {
  return (
    <div className={cn('flex items-start justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5', className)}>
      <div className="min-w-0">
        {kicker && <p className="label-mono mb-1">{kicker}</p>}
        {title && <h2 className="text-[15px] font-semibold">{title}</h2>}
        {children}
      </div>
      {action}
    </div>
  );
}

/** Horizontal meter for 0-100 values. */
export function Meter({ value, className, barClass = 'bg-accent', label }) {
  const v = value == null ? 0 : Math.max(0, Math.min(100, value));
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-surface-3', className)} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value ?? undefined} aria-label={label}>
      <div className={cn('h-full rounded-full transition-[width] duration-500', barClass)} style={{ width: `${v}%` }} />
    </div>
  );
}

/** Native <dialog> modal: focus trap, Esc and backdrop handled by the browser. */
export function Dialog({ open, onClose, title, description, children, footer, className }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="dialog-title"
      className={cn(
        'm-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-line bg-surface p-0 text-fg shadow-2xl open:animate-rise',
        className
      )}
    >
      {open && (
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <h2 id="dialog-title" className="text-base font-semibold">
              {title}
            </h2>
            <Button variant="ghost" size="iconSm" onClick={onClose} aria-label="Close">
              <X className="size-4" />
            </Button>
          </div>
          {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
          {children && <div className="mt-4">{children}</div>}
          {footer && <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', tone = 'primary', loading }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={tone === 'danger' ? 'dangerSolid' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
