export function formatDate(value, { time = false } = {}) {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
    ...(time ? { hour: 'numeric', minute: '2-digit' } : {}),
  });
}

export function relativeTime(value) {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h ago`;
  const days = Math.round(h / 24);
  if (days < 7) return `${days} d ago`;
  return formatDate(value);
}

export function clock(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds || 0));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/** Text tone for a 0-100 score. */
export function scoreTone(score) {
  if (score == null) return 'text-subtle';
  if (score >= 70) return 'text-accent-text';
  if (score >= 45) return 'text-warn';
  return 'text-danger';
}

export function scoreBar(score) {
  if (score == null) return 'bg-line-strong';
  if (score >= 70) return 'bg-accent';
  if (score >= 45) return 'bg-warn';
  return 'bg-danger';
}

export const KIND_LABEL = {
  theory: 'Theory',
  coding: 'Coding',
  system_design: 'System design',
  machine_coding: 'Machine coding',
  intro: 'Intro',
};

/** Same rules as the backend, used only for the setup preview. */
export function classifyTopic(name) {
  const n = String(name || '').toLowerCase();
  if (/\b(dsa|data structures?|algorithms?|leetcode|competitive programming)\b/.test(n)) return 'coding';
  if (/system design|\bhld\b|\blld\b|architecture/.test(n)) return 'system_design';
  if (/machine coding/.test(n)) return 'machine_coding';
  return 'theory';
}

export const pluralize = (n, word, plural = `${word}s`) => `${n} ${n === 1 ? word : plural}`;
