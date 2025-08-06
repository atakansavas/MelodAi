export const API_CONFIG = {
  AI_API_URL: process.env.EXPO_PUBLIC_AI_API_URL || '',
  AI_API_KEY: process.env.AI_API_KEY || '',
  SERVICE_URL: process.env.EXPO_PUBLIC_SERVICE_URL || 'http://localhost:3000/api/v1/',
};

export const SUPABASE_CONFIG = {
  URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
};

export const SPOTIFY_CONFIG = {
  CLIENT_ID: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID || '',
  CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET || '',
};

export const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: 'onboarding_completed',
  SELECTED_AGENT: 'selected_agent_id',
  SPOTIFY_ACCESS_TOKEN: 'spotify_access_token',
  SPOTIFY_REFRESH_TOKEN: 'spotify_refresh_token',
  IS_NEW_USER: 'is_new_user',
};
