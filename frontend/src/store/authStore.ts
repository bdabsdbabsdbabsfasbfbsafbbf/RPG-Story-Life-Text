import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { id: string; username: string; email: string } | null;
  accessToken: string | null;
  refreshToken: string | null;
  error: string | null;
  setAuth: (user: { id: string; username: string; email: string }, accessToken: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  updateToken: (accessToken: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      error: null,
      setAuth: (user, accessToken, refreshToken) =>
        set({ isAuthenticated: true, user, accessToken, refreshToken, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      logout: () =>
        set({ isAuthenticated: false, user: null, accessToken: null, refreshToken: null, error: null }),
      updateToken: (accessToken) => set({ accessToken }),
    }),
    {
      name: 'rpg-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
