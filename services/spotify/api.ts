import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from '@/constants/config';
import { SpotifyAuthService } from './auth';
import { 
  SpotifyUser, 
  SpotifyPlayHistory, 
  SpotifyTrack,
  SpotifyArtist,
  SpotifyAlbum 
} from '@/types/spotify';

export class SpotifyApiService {
  private static instance: SpotifyApiService;
  private authService: SpotifyAuthService;
  private api: AxiosInstance;

  private constructor() {
    this.authService = SpotifyAuthService.getInstance();
    this.api = axios.create({
      baseURL: API_CONFIG.SPOTIFY_BASE_URL,
    });

    // Add auth interceptor
    this.api.interceptors.request.use(async (config) => {
      const token = await this.authService.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const newToken = await this.authService.refreshAccessToken();
          if (newToken) {
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return this.api.request(error.config);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  static getInstance(): SpotifyApiService {
    if (!SpotifyApiService.instance) {
      SpotifyApiService.instance = new SpotifyApiService();
    }
    return SpotifyApiService.instance;
  }

  async getCurrentUser(): Promise<SpotifyUser> {
    const { data } = await this.api.get<SpotifyUser>('/me');
    return data;
  }

  async getRecentlyPlayed(limit: number = 50): Promise<SpotifyPlayHistory[]> {
    const { data } = await this.api.get('/me/player/recently-played', {
      params: { limit },
    });
    return data.items;
  }

  async getTrack(trackId: string): Promise<SpotifyTrack> {
    const { data } = await this.api.get<SpotifyTrack>(`/tracks/${trackId}`);
    return data;
  }

  async getArtist(artistId: string): Promise<SpotifyArtist> {
    const { data } = await this.api.get<SpotifyArtist>(`/artists/${artistId}`);
    return data;
  }

  async getAlbum(albumId: string): Promise<SpotifyAlbum> {
    const { data } = await this.api.get<SpotifyAlbum>(`/albums/${albumId}`);
    return data;
  }

  async getTopTracks(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 20): Promise<SpotifyTrack[]> {
    const { data } = await this.api.get('/me/top/tracks', {
      params: { time_range: timeRange, limit },
    });
    return data.items;
  }

  async getTopArtists(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 20): Promise<SpotifyArtist[]> {
    const { data } = await this.api.get('/me/top/artists', {
      params: { time_range: timeRange, limit },
    });
    return data.items;
  }

  async searchTracks(query: string, limit: number = 20): Promise<SpotifyTrack[]> {
    const { data } = await this.api.get('/search', {
      params: {
        q: query,
        type: 'track',
        limit,
      },
    });
    return data.tracks.items;
  }
}