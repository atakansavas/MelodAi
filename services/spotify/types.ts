// Re-export Spotify types from the main types directory
export * from '../../types/spotify';

// Additional service-specific types
export interface SpotifyServiceConfig {
  baseUrl: string;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
}

export interface SpotifyApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface SpotifyRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
}

export interface SpotifyCacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface SpotifyCache {
  [key: string]: SpotifyCacheItem<any>;
}
