import { create } from 'zustand';

const KEY = 'tb-theme';
const read = () => {
  try {
    return localStorage.getItem(KEY) || 'system';
  } catch {
    return 'system';
  }
};

const media = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

function apply(mode) {
  const dark = mode === 'dark' || (mode === 'system' && media && media.matches);
  document.documentElement.classList.toggle('dark', !!dark);
}

export const useTheme = create((set, get) => ({
  mode: read(),
  setMode: (mode) => {
    try {
      localStorage.setItem(KEY, mode);
    } catch {
      /* ignore */
    }
    apply(mode);
    set({ mode });
  },
  isDark: () => document.documentElement.classList.contains('dark'),
  _sync: () => apply(get().mode),
}));

if (media) media.addEventListener('change', () => useTheme.getState()._sync());
