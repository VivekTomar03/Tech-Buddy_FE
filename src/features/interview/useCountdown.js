import { useEffect, useState } from 'react';

/** Seconds left until `endsAt` (null when there is no deadline), ticking every second. */
export function useCountdown(endsAt) {
  const target = endsAt ? new Date(endsAt).getTime() : null;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!target) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);
  return target ? Math.max(0, Math.round((target - now) / 1000)) : null;
}
