import { create } from 'zustand';
import api, { apiMessage, setUnauthorizedHandler } from '@/lib/api';

const load = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return key === 'user' ? (raw ? JSON.parse(raw) : null) : raw;
  } catch {
    return null;
  }
};
const save = (token, user) => {
  try {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  } catch {
    /* storage blocked: session-only login */
  }
};
const clear = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch {
    /* ignore */
  }
};

const useAuthStore = create((set) => ({
  user: load('user'),
  token: load('token'),
  loading: false,
  error: null,
  sessionExpired: false,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      save(data.token, data.user);
      set({ user: data.user, token: data.token, loading: false, sessionExpired: false });
      return true;
    } catch (error) {
      set({ error: apiMessage(error, 'Login failed'), loading: false });
      return false;
    }
  },

  register: async (form) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', form);
      save(data.token, data.user);
      set({ user: data.user, token: data.token, loading: false, sessionExpired: false });
      return true;
    } catch (error) {
      set({ error: apiMessage(error, 'Registration failed'), loading: false });
      return false;
    }
  },

  updateUser: (patch) =>
    set((state) => {
      const user = { ...state.user, ...patch };
      try {
        localStorage.setItem('user', JSON.stringify(user));
      } catch {
        /* ignore */
      }
      return { user };
    }),

  logout: (expired = false) => {
    clear();
    set({ user: null, token: null, sessionExpired: expired });
  },

  clearError: () => set({ error: null }),
}));

setUnauthorizedHandler(() => {
  if (useAuthStore.getState().token) useAuthStore.getState().logout(true);
});

export default useAuthStore;
