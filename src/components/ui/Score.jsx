import { cn } from '@/lib/cn';
import { band } from '@/lib/score';

export function BandLabel({ score, className }) {
  const b = band(score);
  const Icon = b.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', b.text, className)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {b.label}
    </span>
  );
}

/** Meter: fill carries severity, the track is a lighter step of the same hue. */
export function SeverityMeter({ label, score, detail }) {
  const b = band(score);
  const v = score == null ? 0 : Math.max(0, Math.min(100, score));
  return (
    <div>
      <div className="mb-1.5 flex items-baseline gap-2">
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
        {detail && <span className="hidden text-xs text-subtle sm:inline">{detail}</span>}
        <BandLabel score={score} />
        <span className="w-9 text-right text-sm font-semibold tabular-nums">{score == null ? '—' : score}</span>
      </div>
      <div className={cn('h-2 w-full overflow-hidden rounded-full', b.track)} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score ?? undefined} aria-label={`${label}: ${score == null ? 'not covered' : `${score} of 100, ${b.label}`}`}>
        <div className={cn('h-full rounded-full transition-[width] duration-500', b.fill)} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

/** Stat tile: label · value (sans semibold, proportional figures) · optional sub line. */
export function StatTile({ label, value, suffix, sub, children, className, valueClassName }) {
  return (
    <div className={cn('min-w-0 rounded-xl border border-line bg-surface p-4', className)}>
      <p className="text-[13px] text-muted">{label}</p>
      <p className={cn('mt-1.5 text-2xl font-semibold tracking-tight', valueClassName)}>
        {value ?? '—'}
        {suffix && value != null && <span className="ml-0.5 text-sm font-normal text-subtle">{suffix}</span>}
      </p>
      {sub && <div className="mt-1 text-xs text-subtle">{sub}</div>}
      {children}
    </div>
  );
}
