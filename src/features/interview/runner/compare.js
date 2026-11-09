/** Same comparators as the backend problem bank (exact | sorted | groups). */
const canon = (v) => (v === undefined ? '__undefined__' : JSON.stringify(v));

export function matches(compare, actual, expected) {
  try {
    if (compare === 'sorted') {
      if (!Array.isArray(actual)) return false;
      const s = (a) => [...a].map(canon).sort();
      return canon(s(actual)) === canon(s(expected));
    }
    if (compare === 'groups') {
      if (!Array.isArray(actual) || actual.some((g) => !Array.isArray(g))) return false;
      const g = (a) => a.map((x) => canon([...x].sort())).sort();
      return canon(g(actual)) === canon(g(expected));
    }
    return canon(actual) === canon(expected);
  } catch {
    return false;
  }
}

/** Short printable form of a value for the results table. */
export function show(value, max = 160) {
  if (value === undefined) return 'undefined';
  let s;
  try {
    s = JSON.stringify(value);
  } catch {
    s = String(value);
  }
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

/** Render a test input (argument list) as "a, b, c". */
export const showArgs = (args) => (Array.isArray(args) ? args.map((a) => show(a, 80)).join(', ') : show(args));
