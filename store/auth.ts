import { create } from 'zustand';
import { SpotifyAuthState, SpotifyUser } from '@/types/spotify';
import { SpotifyAuthService } from '@/services/spotify';

interface AuthStore extends SpotifyAuthState {
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  setUser: (user: SpotifyUser) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async () => {
    const authService = SpotifyAuthService.getInstance();
    set({ isLoading: true });
    
    try {
      const isAuth = await authService.isAuthenticated();
      set({ isAuthenticated: isAuth, isLoading: false });
      return isAuth;
    } catch (error) {
      console.error('Login error:', error);
      set({ isAuthenticated: false, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    const authService = SpotifyAuthService.getInstance();
    set({ isLoading: true });
    
    try {
      await authService.logout();
      set({
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    const authService = SpotifyAuthService.getInstance();
    set({ isLoading: true });
    
    try {
      const isAuth = await authService.isAuthenticated();
      set({ isAuthenticated: isAuth, isLoading: false });
      return isAuth;
    } catch (error) {
      console.error('Check auth error:', error);
      set({ isAuthenticated: false, isLoading: false });
      return false;
    }
  },

  setUser: (user: SpotifyUser) => {
    set({ user });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));