import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Spinner } from './Feedback';

const VARIANTS = {
  primary: 'bg-accent text-accent-fg hover:bg-accent-hover border border-transparent font-semibold',
  secondary: 'bg-surface-2 text-fg border border-line hover:border-line-strong hover:bg-surface-3',
  outline: 'bg-transparent text-fg border border-line hover:bg-surface-2',
  ghost: 'bg-transparent text-muted hover:text-fg hover:bg-surface-2 border border-transparent',
  danger: 'bg-transparent text-danger border border-line hover:bg-danger-soft hover:border-danger/40',
  dangerSolid: 'bg-danger text-white border border-transparent hover:opacity-90 font-semibold',
};

const SIZES = {
  sm: 'h-10 sm:h-8 px-3 text-[13px] gap-1.5 rounded-md',
  md: 'h-11 sm:h-10 px-4 text-sm gap-2 rounded-md',
  lg: 'h-12 px-5 text-[15px] gap-2 rounded-lg',
  icon: 'h-11 w-11 sm:h-10 sm:w-10 rounded-md justify-center',
  iconSm: 'h-9 w-9 sm:h-8 sm:w-8 rounded-md justify-center',
};

const buttonClass = ({ variant = 'primary', size = 'md', className } = {}) =>
  cn(
    'inline-flex shrink-0 items-center justify-center whitespace-nowrap select-none transition-colors duration-150',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className
  );

/**
 * <Button> or, with `to`, a router <Link> styled as a button.
 */
const Button = forwardRef(function Button({ variant, size, className, loading = false, disabled, children, to, type = 'button', ...props }, ref) {
  const cls = buttonClass({ variant, size, className });
  if (to) {
    return (
      <Link ref={ref} to={to} className={cls} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button ref={ref} type={type} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  );
});

export default Button;
