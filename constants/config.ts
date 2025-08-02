export const API_CONFIG = {
  AI_API_URL: process.env.EXPO_PUBLIC_AI_API_URL || '',
  AI_API_KEY: process.env.EXPO_PUBLIC_AI_API_KEY || '',
  SERVICE_URL: process.env.EXPO_PUBLIC_SERVICE_URL || 'http://localhost:3000/api/v1/',
};

export const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: 'onboarding_completed',
  SELECTED_AGENT: 'selected_agent_id',
};
