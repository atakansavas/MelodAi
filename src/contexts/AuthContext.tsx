import { Session } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { useRouter } from '../hooks/useRouter';
import { supabase } from '../lib/supabase';

// Types
export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    avatar_url?: string;
    email?: string;
    email_verified?: boolean;
    full_name?: string;
    iss?: string;
    name?: string;
    phone_verified?: boolean;
    picture?: string;
    provider_id?: string;
    sub?: string;
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

  // Anonymous-only flow: no user profile checks

  // Deprecated: Spotify token helpers retained as no-ops for compatibility

  // Get Spotify access token
  const getSpotifyAccessToken = async (): Promise<string | null> => {
    return null;
  };

  // Refresh Spotify token
  const refreshSpotifyToken = async (): Promise<string | null> => {
    return null;
  };

  // Removed: OAuth callback handling

  // Anonymous login only
  const login = async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      if (data?.session?.user) {
        setState((prev) => ({
          ...prev,
          user: data.session.user as AuthUser,
          session: data.session,
          isAuthenticated: true,
          isNewUser: false,
        }));
        router.replace('APP_MAIN');
      }
    } catch (error) {
      console.error('Anonymous login error:', error);
      throw error;
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
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
        setState({
          user: session.user as AuthUser,
          session,
          isLoading: false,
          isAuthenticated: true,
          isNewUser: false,
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
      if (event === 'SIGNED_IN' && session?.user) {
        setState((prev) => ({
          ...prev,
          user: session.user as AuthUser,
          session,
          isAuthenticated: true,
          isNewUser: false,
        }));
        router.replace('APP_MAIN');
      } else if (event === 'INITIAL_SESSION' && session?.user) {
        router.replace('APP_MAIN');
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
