import { SPOTIFY_SCOPES } from '../types/spotify';

export const SPOTIFY_CONFIG = {
  CLIENT_ID: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID || '',
  REDIRECT_URI: 'spoti://auth/callback',
  SCOPES: SPOTIFY_SCOPES.join(' '),
  DISCOVERY: {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
  },
};

export const API_CONFIG = {
  SPOTIFY_BASE_URL: 'https://api.spotify.com/v1',
  AI_API_URL: process.env.EXPO_PUBLIC_AI_API_URL || '',
  AI_API_KEY: process.env.EXPO_PUBLIC_AI_API_KEY || '',
  SERVICE_URL: process.env.EXPO_PUBLIC_SERVICE_URL || 'http://localhost:3000/api/v1/',
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'spotify_access_token',
  REFRESH_TOKEN: 'spotify_refresh_token',
  TOKEN_EXPIRY: 'spotify_token_expiry',
  USER_DATA: 'spotify_user_data',
  AUTH_DATA: 'melodai_auth_data',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  SELECTED_AGENT: 'selected_agent_id',
};
