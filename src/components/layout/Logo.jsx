import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-7', className)} aria-hidden="true">
      <rect width="32" height="32" rx="7" className="fill-fg" />
      <path d="M9 11l5 5-5 5" fill="none" stroke="#22c55e" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.5 21H23" fill="none" className="stroke-bg" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ to = '/', className }) {
  return (
    <Link to={to} className={cn('inline-flex items-center gap-2 rounded-md', className)} aria-label="TechBuddy home">
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight">
        techbuddy<span className="text-subtle">.ai</span>
      </span>
    </Link>
  );
}
