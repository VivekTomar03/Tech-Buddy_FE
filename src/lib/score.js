import { AlertTriangle, CheckCircle2, CircleDashed, XCircle } from 'lucide-react';

/** Score bands. Color always comes with an icon + text label, never alone. */
export function band(score) {
  if (score == null) return { label: 'Not covered', fill: 'bg-line-strong', track: 'bg-surface-3', text: 'text-subtle', icon: CircleDashed };
  if (score >= 70) return { label: 'Strong', fill: 'bg-accent', track: 'bg-accent-soft', text: 'text-accent-text', icon: CheckCircle2 };
  if (score >= 45) return { label: 'Fair', fill: 'bg-warn', track: 'bg-warn-soft', text: 'text-warn', icon: AlertTriangle };
  return { label: 'Needs work', fill: 'bg-danger', track: 'bg-danger-soft', text: 'text-danger', icon: XCircle };
}
