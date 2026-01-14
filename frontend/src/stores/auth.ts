import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: any | null;
  isGuest: boolean;
  setToken: (token: string) => void;
  setUser: (user: any) => void;
  setGuest: () => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isGuest: false,
  setToken: (token) => set({ token, isGuest: false }),
  setUser: (user) => set({ user }),
  setGuest: () => set({ isGuest: true, token: null, user: null }),
  logout: () => set({ token: null, user: null, isGuest: false }),
}));

export default useAuthStore;
