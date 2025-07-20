import { API_CONFIG } from '../../constants/config';
import { SpotifyPlayHistory, SpotifyUser } from '../../types/spotify';

import { SpotifyAuthService } from './auth';

export class SpotifyApiService {
  private static instance: SpotifyApiService;
  private authService: SpotifyAuthService;

  private constructor() {
    this.authService = SpotifyAuthService.getInstance();
  }

  static getInstance(): SpotifyApiService {
    if (!SpotifyApiService.instance) {
      SpotifyApiService.instance = new SpotifyApiService();
    }
    return SpotifyApiService.instance;
  }

  private async makeAuthenticatedRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const accessToken = await this.authService.getAccessToken();

    if (!accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${API_CONFIG.SPOTIFY_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        const newToken = await this.authService.refreshAccessToken();
        if (newToken) {
          // Retry the request with new token
          return this.makeAuthenticatedRequest(endpoint, options);
        }
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getCurrentUser(): Promise<SpotifyUser> {
    return this.makeAuthenticatedRequest('/me');
  }

  async getRecentlyPlayed(limit: number = 20): Promise<{ items: SpotifyPlayHistory[] }> {
    return this.makeAuthenticatedRequest(`/me/player/recently-played?limit=${limit}`);
  }

  async getTopTracks(
    timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
    limit: number = 20
  ) {
    return this.makeAuthenticatedRequest(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`);
  }

  async getTopArtists(
    timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
    limit: number = 20
  ) {
    return this.makeAuthenticatedRequest(`/me/top/artists?time_range=${timeRange}&limit=${limit}`);
  }

  async getPlaylists(limit: number = 20) {
    return this.makeAuthenticatedRequest(`/me/playlists?limit=${limit}`);
  }

  async getPlaylistTracks(playlistId: string, limit: number = 20) {
    return this.makeAuthenticatedRequest(`/playlists/${playlistId}/tracks?limit=${limit}`);
  }

  async searchTracks(query: string, limit: number = 20) {
    return this.makeAuthenticatedRequest(
      `/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`
    );
  }

  async getTrack(trackId: string) {
    return this.makeAuthenticatedRequest(`/tracks/${trackId}`);
  }

  async getArtist(artistId: string) {
    return this.makeAuthenticatedRequest(`/artists/${artistId}`);
  }

  async getAlbum(albumId: string) {
    return this.makeAuthenticatedRequest(`/albums/${albumId}`);
  }
}
