import { create } from 'zustand';

import { AuthError, SpotifyAuthService } from '@services/spotify';

import { SpotifyUser } from '../types/spotify';

interface AuthStore {
  // Auth state
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  user: SpotifyUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authData: any | null;
  error: string | null;

  // Actions
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  setUser: (user: SpotifyUser) => void;
  setLoading: (loading: boolean) => void;
  setAuthData: (data: any) => Promise<void>;
  refreshAuthState: () => Promise<void>;
  clearError: () => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  authData: null,
  error: null,

  login: async () => {
    const authService = SpotifyAuthService.getInstance();
    set({ isLoading: true, error: null });

    try {
      const isAuth = await authService.isAuthenticated();

      if (isAuth) {
        const authState = await authService.getAuthState();
        set({
          isAuthenticated: authState.isAuthenticated,
          user: authState.user,
          accessToken: authState.accessToken,
          refreshToken: authState.refreshToken,
          expiresAt: authState.expiresAt,
          isLoading: false,
          error: null,
        });
      } else {
        set({ isAuthenticated: false, isLoading: false });
      }

      return isAuth;
    } catch (error: any) {
      const errorMessage =
        error instanceof AuthError ? error.message : 'An unexpected error occurred during login';

      console.error('Login error:', error);
      set({
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      return false;
    }
  },

  logout: async () => {
    const authService = SpotifyAuthService.getInstance();
    set({ isLoading: true, error: null });

    try {
      await authService.logout();
      set({
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        user: null,
        authData: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error instanceof AuthError ? error.message : 'An unexpected error occurred during logout';

      console.error('Logout error:', error);
      set({
        isLoading: false,
        error: errorMessage,
      });

      // Even if logout fails, clear local state
      set({
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        user: null,
        authData: null,
        isAuthenticated: false,
      });
    }
  },

  checkAuth: async () => {
    const authService = SpotifyAuthService.getInstance();
    set({ isLoading: true, error: null });

    try {
      const authState = await authService.getAuthState();
      const authData = await authService.getAuthData();

      set({
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        accessToken: authState.accessToken,
        refreshToken: authState.refreshToken,
        expiresAt: authState.expiresAt,
        authData,
        isLoading: false,
        error: null,
      });

      return authState.isAuthenticated;
    } catch (error: any) {
      const errorMessage =
        error instanceof AuthError ? error.message : 'Failed to check authentication status';

      console.error('Check auth error:', error);
      set({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        authData: null,
        isLoading: false,
        error: errorMessage,
      });
      return false;
    }
  },

  setUser: (user: SpotifyUser) => {
    const authService = SpotifyAuthService.getInstance();
    set({ user, error: null });

    // Save user to storage
    authService.saveUser(user).catch((error) => {
      const errorMessage = error instanceof AuthError ? error.message : 'Failed to save user data';

      console.error('Error saving user to storage:', error);
      set({ error: errorMessage });
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setAuthData: async (data: any) => {
    const authService = SpotifyAuthService.getInstance();

    try {
      await authService.saveAuthData(data);
      set({ authData: data, error: null });
    } catch (error: any) {
      const errorMessage =
        error instanceof AuthError ? error.message : 'Failed to save authentication data';

      console.error('Error saving auth data:', error);
      set({ error: errorMessage });
      throw error;
    }
  },

  refreshAuthState: async () => {
    const authService = SpotifyAuthService.getInstance();

    try {
      const authState = await authService.getAuthState();
      const authData = await authService.getAuthData();

      set({
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        accessToken: authState.accessToken,
        refreshToken: authState.refreshToken,
        expiresAt: authState.expiresAt,
        authData,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error instanceof AuthError ? error.message : 'Failed to refresh authentication state';

      console.error('Error refreshing auth state:', error);
      set({ error: errorMessage });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
