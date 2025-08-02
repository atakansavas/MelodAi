import { Session, User } from '@supabase/supabase-js';

// Auth User interface extending Supabase User
export interface AuthUser extends Omit<User, 'user_metadata'> {
  user_metadata?: {
    spotify_id?: string;
    spotify_access_token?: string;
    spotify_refresh_token?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

// Authentication state
export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isNewUser: boolean;
}

// Authentication context interface
export interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  refreshSpotifyToken: () => Promise<string | null>;
  getSpotifyAccessToken: () => Promise<string | null>;
}

// Spotify profile interface
export interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
  images?: Array<{
    url: string;
    height: number | null;
    width: number | null;
  }>;
  external_urls?: {
    spotify: string;
  };
  followers?: {
    total: number;
  };
  product?: 'premium' | 'free';
  country?: string;
}

// Spotify token response
export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

// OAuth error types
export interface OAuthError {
  error: string;
  error_description?: string;
  state?: string;
}

// Authentication error types
export interface AuthError {
  message: string;
  code?: string;
  status?: number;
}

// User preferences interface
export interface UserPreferences {
  preferred_genres?: string[];
  language_preference?: string;
  timezone?: string;
  listening_habits?: string;
  interaction_patterns?: string;
  privacy_settings?: string;
  notification_preferences?: {
    new_music: boolean;
    playlist_updates: boolean;
    recommendations: boolean;
    system_updates: boolean;
    marketing: boolean;
  };
}

// Database user interface
export interface DatabaseUser {
  id: string;
  spotify_id: string;
  display_name: string;
  avatar_url?: string;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

// Chat session interface
export interface ChatSession {
  id: string;
  user_id: string;
  session_id: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

// Chat message interface
export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  message: string;
  response?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// Storage keys
export const STORAGE_KEYS = {
  SPOTIFY_ACCESS_TOKEN: 'spotify_access_token',
  SPOTIFY_REFRESH_TOKEN: 'spotify_refresh_token',
  IS_NEW_USER: 'is_new_user',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  SELECTED_AGENT: 'selected_agent_id',
  USER_PREFERENCES: 'user_preferences',
} as const;

// OAuth scopes
export const SPOTIFY_SCOPES = [
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'playlist-read-private',
  'playlist-read-collaborative',
  'streaming',
] as const;

// Authentication events
export type AuthEvent =
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'USER_DELETED';

// Token refresh result
export interface TokenRefreshResult {
  success: boolean;
  access_token?: string;
  error?: string;
}
