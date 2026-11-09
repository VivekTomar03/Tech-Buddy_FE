import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Spinner({ className }) {
  return (
    <svg className={cn('size-5 animate-spin', className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-md bg-surface-2', className)} aria-hidden="true" />;
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[50dvh] items-center justify-center gap-3 text-muted" role="status">
      <Spinner />
      <span className="text-sm">{label}</span>
    </div>
  );
}

const TONES = {
  info: { box: 'border-info/30 bg-info-soft', icon: Info, iconCls: 'text-info' },
  success: { box: 'border-accent/30 bg-accent-soft', icon: CheckCircle2, iconCls: 'text-accent-text' },
  warn: { box: 'border-warn/30 bg-warn-soft', icon: AlertTriangle, iconCls: 'text-warn' },
  danger: { box: 'border-danger/30 bg-danger-soft', icon: XCircle, iconCls: 'text-danger' },
};

export function Alert({ tone = 'info', title, children, action, className }) {
  const t = TONES[tone];
  const Icon = t.icon;
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-lg border p-3.5 text-sm', t.box, className)}>
      <Icon className={cn('mt-0.5 size-4 shrink-0', t.iconCls)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold text-fg">{title}</p>}
        {children && <div className={cn('text-muted', title && 'mt-0.5')}>{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      {Icon && (
        <div className="mb-4 flex size-11 items-center justify-center rounded-lg border border-line bg-surface-2 text-subtle">
          <Icon className="size-5" aria-hidden="true" />
        </div>
      )}
      <p className="font-semibold">{title}</p>
      {children && <p className="mt-1 max-w-sm text-sm text-muted">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
