import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

const control =
  'w-full rounded-md border border-line bg-surface px-3 text-fg transition-colors duration-150 ' +
  'hover:border-line-strong focus:border-accent focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-accent/25 ' +
  'disabled:opacity-60 aria-[invalid=true]:border-danger';

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(control, 'h-11 sm:h-10 text-base sm:text-sm', className)} {...props} />;
});

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(control, 'min-h-24 py-2.5 text-base leading-relaxed sm:text-sm', className)} {...props} />;
});

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(control, 'h-11 appearance-none pr-9 text-base sm:h-10 sm:text-sm', className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
    </div>
  );
});

/**
 * Label + control + hint/error. The child receives id / aria props via render function
 * or, for simple cases, use `htmlFor` with your own id.
 */
export function Field({ label, hint, error, children, className, optional }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className="flex items-baseline justify-between text-sm font-medium text-fg">
          {label}
          {optional && <span className="text-xs font-normal text-subtle">Optional</span>}
        </label>
      )}
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-subtle">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
