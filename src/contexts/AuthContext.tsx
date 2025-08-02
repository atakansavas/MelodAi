import { Session } from '@supabase/supabase-js';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { useRouter } from '../hooks/useRouter';
import { supabase } from '../lib/supabase';

// Types
export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    spotify_id?: string;
    spotify_access_token?: string;
    spotify_refresh_token?: string;
    display_name?: string;
    avatar_url?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isNewUser: boolean;
}

export interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  refreshSpotifyToken: () => Promise<string | null>;
  getSpotifyAccessToken: () => Promise<string | null>;
}

// Storage keys
const STORAGE_KEYS = {
  SPOTIFY_ACCESS_TOKEN: 'spotify_access_token',
  SPOTIFY_REFRESH_TOKEN: 'spotify_refresh_token',
  IS_NEW_USER: 'is_new_user',
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    isNewUser: false,
  });

  // Check if user is new (first-time login)
  const checkIfNewUser = async (userId: string): Promise<boolean> => {
    try {
      const isNewUser = await SecureStore.getItemAsync(STORAGE_KEYS.IS_NEW_USER);
      if (isNewUser === null) {
        // Check if user exists in our database or has any history
        const { data: userData, error } = await supabase
          .from('users')
          .select('id, created_at')
          .eq('id', userId)
          .single();

        if (error && error.code === 'PGRST116') {
          // User doesn't exist in our database, mark as new
          await SecureStore.setItemAsync(STORAGE_KEYS.IS_NEW_USER, 'true');
          return true;
        }

        // User exists, mark as returning
        await SecureStore.setItemAsync(STORAGE_KEYS.IS_NEW_USER, 'false');
        return false;
      }
      return isNewUser === 'true';
    } catch (error) {
      console.error('Error checking if user is new:', error);
      return false;
    }
  };

  // Store Spotify tokens securely
  const storeSpotifyTokens = async (accessToken: string, refreshToken: string) => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.SPOTIFY_ACCESS_TOKEN, accessToken);
      await SecureStore.setItemAsync(STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN, refreshToken);
    } catch (error) {
      console.error('Error storing Spotify tokens:', error);
    }
  };

  // Get Spotify access token
  const getSpotifyAccessToken = async (): Promise<string | null> => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.SPOTIFY_ACCESS_TOKEN);
      console.log('🚀 ~ getSpotifyAccessToken ~ token:', token);
      return token;
    } catch (error) {
      console.error('Error getting Spotify access token:', error);
      return null;
    }
  };

  // Refresh Spotify token
  const refreshSpotifyToken = async (): Promise<string | null> => {
    try {
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID || '',
        }).toString(),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh Spotify token');
      }

      const data = await response.json();
      await storeSpotifyTokens(data.access_token, data.refresh_token || refreshToken);
      return data.access_token;
    } catch (error) {
      console.error('Error refreshing Spotify token:', error);
      return null;
    }
  };

  const createSessionFromUrl = async (url: string) => {
    const { params, errorCode } = QueryParams.getQueryParams(url);
    console.log('🚀 ~ createSessionFromUrl ~ params:', params);

    if (errorCode) throw new Error(errorCode);
    const { access_token, refresh_token, provider_refresh_token, provider_token } = params;

    if (!access_token) return;

    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token: refresh_token || '',
    });
    if (error) throw error;

    await storeSpotifyTokens(provider_token || '', provider_refresh_token || '');
    return data.session;
  };

  // Spotify OAuth login
  const login = async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      // Configure OAuth
      const redirectUri = 'songspot://auth/callback';
      // const redirectTo = AuthSession.makeRedirectUri();
      // console.log('🚀 ~ login ~ redirectTo:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'spotify',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
          scopes:
            'user-read-email user-read-private user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private playlist-read-collaborative streaming user-read-recently-played user-top-read ',
        },
      });

      const res = await WebBrowser.openAuthSessionAsync(data?.url ?? '', redirectUri);
      if (res.type === 'success') {
        const session = await createSessionFromUrl(res.url);
        console.log('🚀 ~ login ~ session:', session);

        setState((prev) => ({ ...prev, isNewUser: false }));
      } else if (res.type === 'cancel') {
        console.log('OAuth cancelled by user');
      } else {
        throw new Error('OAuth failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      // Clear Spotify tokens
      await SecureStore.deleteItemAsync(STORAGE_KEYS.SPOTIFY_ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.IS_NEW_USER);

      // Sign out from Supabase
      await supabase.auth.signOut();

      setState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        isNewUser: false,
      });
      router.goToLogin();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Check authentication status
  const checkAuthStatus = async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        setState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
          isNewUser: false,
        });
        return;
      }

      if (session?.user) {
        const isNewUser = await checkIfNewUser(session.user.id);
        setState({
          user: session.user as AuthUser,
          session,
          isLoading: false,
          isAuthenticated: true,
          isNewUser,
        });
      } else {
        setState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
          isNewUser: false,
        });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        isNewUser: false,
      });
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);

      console.log('🚀 ~ AuthProvider ~ session?.user:', session?.user);
      if (event === 'SIGNED_IN' && session?.user) {
        // const isNewUser = await checkIfNewUser(session.user.id);
        setState((prev) => ({
          ...prev,
          user: session.user as AuthUser,
          session,
          isAuthenticated: true,
          isNewUser: false,
        }));
        router.goToHome();
      } else if (event === 'INITIAL_SESSION' && session?.user) {
        router.goToHome();
      } else if (event === 'SIGNED_OUT') {
        setState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
          isNewUser: false,
        });
        router.goToLogin();
      }
    });

    // Initial auth check
    checkAuthStatus();

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    checkAuthStatus,
    refreshSpotifyToken,
    getSpotifyAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
