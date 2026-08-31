import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  provider: localStorage.getItem('provider') || null,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      // Decode provider from JWT payload
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const provider = payload.provider || 'google';
        localStorage.setItem('provider', provider);
        set({ token, isAuthenticated: true, provider });
      } catch {
        set({ token, isAuthenticated: true });
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('provider');
      set({ token: null, isAuthenticated: false, user: null, provider: null });
    }
  },
  setLoading: (loading) => set({ loading }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  // Basic sync reset
  resetAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('provider');
    set({ user: null, token: null, isAuthenticated: false, loading: false, provider: null });
  }
}));

export default useAuthStore;
