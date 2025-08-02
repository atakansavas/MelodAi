import {
  PlaybackParams,
  RecommendationsParams,
  RepeatMode,
  SearchParams,
  SpotifyAlbum,
  SpotifyApiResponse,
  SpotifyArtist,
  SpotifyAudioAnalysis,
  SpotifyAudioFeatures,
  SpotifyCache,
  SpotifyCategoriesResponse,
  SpotifyCurrentPlayback,
  SpotifyDevicesResponse,
  SpotifyFeaturedPlaylistsResponse,
  SpotifyImage,
  SpotifyNewReleasesResponse,
  SpotifyPlaylist,
  SpotifyPlaylistTracksResponse,
  SpotifyRecentlyPlayedResponse,
  SpotifyRecommendationsResponse,
  SpotifyRequestOptions,
  SpotifySavedAlbumsResponse,
  SpotifySavedTracksResponse,
  SpotifySearchResponse,
  SpotifyServiceConfig,
  SpotifyTopArtistsResponse,
  SpotifyTopTracksResponse,
  SpotifyTrack,
  SpotifyUser,
  SpotifyUserPlaylistsResponse,
  TimeRange,
} from './types';

export class SpotifyService {
  private config: SpotifyServiceConfig;
  private cache: SpotifyCache = {};
  private getSpotifyAccessToken: () => Promise<string | null>;
  private refreshSpotifyToken: () => Promise<string | null>;

  constructor(
    getSpotifyAccessToken: () => Promise<string | null>,
    refreshSpotifyToken: () => Promise<string | null>,
    config?: Partial<SpotifyServiceConfig>
  ) {
    this.getSpotifyAccessToken = getSpotifyAccessToken;
    this.refreshSpotifyToken = refreshSpotifyToken;
    this.config = {
      baseUrl: 'https://api.spotify.com/v1',
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 10000,
      ...config,
    };
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getSpotifyAccessToken();
    if (!token) {
      throw new Error('No Spotify access token available');
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: SpotifyRequestOptions = {}
  ): Promise<SpotifyApiResponse<T>> {
    const { method = 'GET', headers = {}, body, params } = options;

    try {
      const authHeaders = await this.getAuthHeaders();
      const url = new URL(`${this.config.baseUrl}${endpoint}`);

      // Add query parameters
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      const requestOptions: RequestInit = {
        method,
        headers: { ...authHeaders, ...headers },
      };

      if (body && method !== 'GET') {
        requestOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url.toString(), requestOptions);
      const responseData = await response.json();

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401) {
          const newToken = await this.refreshSpotifyToken();
          if (newToken) {
            // Retry the request with new token
            return this.makeRequest(endpoint, options);
          }
        }

        return {
          data: null,
          error: responseData.error?.message || `HTTP ${response.status}`,
          status: response.status,
        };
      }

      return {
        data: responseData,
        error: null,
        status: response.status,
      };
    } catch (error) {
      console.log('🚀 ~ SpotifyService ~ makeRequest ~ error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 0,
      };
    }
  }

  private getCacheKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${endpoint}${paramString}`;
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache[key];
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      delete this.cache[key];
      return null;
    }

    return cached.data;
  }

  private setCachedData<T>(key: string, data: T, ttl: number = 300000): void {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      ttl,
    };
  }

  private clearCache(): void {
    this.cache = {};
  }

  // ==================== USER PROFILE & INFO ====================

  async getCurrentUser(): Promise<SpotifyApiResponse<SpotifyUser>> {
    const cacheKey = this.getCacheKey('/me');
    const cached = this.getCachedData<SpotifyUser>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<SpotifyUser>('/me');
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 300000); // 5 minutes
    }
    return response;
  }

  async getUserProfile(userId: string): Promise<SpotifyApiResponse<SpotifyUser>> {
    const cacheKey = this.getCacheKey(`/users/${userId}`);
    const cached = this.getCachedData<SpotifyUser>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<SpotifyUser>(`/users/${userId}`);
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 600000); // 10 minutes
    }
    return response;
  }

  async getTopTracks(
    timeRange: TimeRange = 'medium_term',
    limit: number = 20
  ): Promise<SpotifyApiResponse<SpotifyTopTracksResponse>> {
    const cacheKey = this.getCacheKey('/me/top/tracks', { time_range: timeRange, limit });
    const cached = this.getCachedData<SpotifyTopTracksResponse>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<SpotifyTopTracksResponse>('/me/top/tracks', {
      params: { time_range: timeRange, limit },
    });
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 900000); // 15 minutes
    }
    return response;
  }

  async getTopArtists(
    timeRange: TimeRange = 'medium_term',
    limit: number = 20
  ): Promise<SpotifyApiResponse<SpotifyTopArtistsResponse>> {
    const cacheKey = this.getCacheKey('/me/top/artists', { time_range: timeRange, limit });
    const cached = this.getCachedData<SpotifyTopArtistsResponse>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<SpotifyTopArtistsResponse>('/me/top/artists', {
      params: { time_range: timeRange, limit },
    });
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 900000); // 15 minutes
    }
    return response;
  }

  async getRecentlyPlayed(
    limit: number = 20
  ): Promise<SpotifyApiResponse<SpotifyRecentlyPlayedResponse>> {
    const cacheKey = this.getCacheKey('/me/player/recently-played', { limit });
    const cached = this.getCachedData<SpotifyRecentlyPlayedResponse>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<SpotifyRecentlyPlayedResponse>(
      '/me/player/recently-played',
      {
        params: { limit },
      }
    );
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 300000); // 5 minutes
    }
    return response;
  }

  // ==================== PLAYBACK CONTROL ====================

  async getCurrentPlayback(): Promise<SpotifyApiResponse<SpotifyCurrentPlayback>> {
    return this.makeRequest<SpotifyCurrentPlayback>('/me/player');
  }

  async play(params?: PlaybackParams): Promise<SpotifyApiResponse<void>> {
    return this.makeRequest<void>('/me/player/play', {
      method: 'PUT',
      body: params,
    });
  }

  async pause(): Promise<SpotifyApiResponse<void>> {
    return this.makeRequest<void>('/me/player/pause', {
      method: 'PUT',
    });
  }

  async skipToNext(): Promise<SpotifyApiResponse<void>> {
    return this.makeRequest<void>('/me/player/next', {
      method: 'POST',
    });
  }

  async skipToPrevious(): Promise<SpotifyApiResponse<void>> {
    return this.makeRequest<void>('/me/player/previous', {
      method: 'POST',
    });
  }

  async setVolume(volumePercent: number): Promise<SpotifyApiResponse<void>> {
    return this.makeRequest<void>('/me/player/volume', {
      method: 'PUT',
      params: { volume_percent: volumePercent },
    });
  }

  async seekToPosition(positionMs: number): Promise<SpotifyApiResponse<void>> {
    return this.makeRequest<void>('/me/player/seek', {
      method: 'PUT',
      params: { position_ms: positionMs },
    });
  }

  // ==================== PLAYER STATE ====================

  async getAvailableDevices(): Promise<SpotifyApiResponse<SpotifyDevicesResponse>> {
    return this.makeRequest<SpotifyDevicesResponse>('/me/player/devices');
  }

  async transferPlayback(deviceId: string): Promise<SpotifyApiResponse<void>> {
    return this.makeRequest<void>('/me/player', {
      method: 'PUT',
      body: { device_ids: [deviceId], play: false },
    });
  }

  async setRepeatMode(state: RepeatMode): Promise<SpotifyApiResponse<void>> {
    return this.makeRequest<void>('/me/player/repeat', {
      method: 'PUT',
      params: { state },
    });
  }

  async setShuffle(state: boolean): Promise<SpotifyApiResponse<void>> {
    return this.makeRequest<void>('/me/player/shuffle', {
      method: 'PUT',
      params: { state },
    });
  }

  // ==================== SEARCH & DISCOVERY ====================

  async search(params: SearchParams): Promise<SpotifyApiResponse<SpotifySearchResponse>> {
    const cacheKey = this.getCacheKey('/search', params);
    const cached = this.getCachedData<SpotifySearchResponse>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<SpotifySearchResponse>('/search', {
      params: {
        q: params.query,
        type: params.types.join(','),
        limit: params.limit || 20,
        offset: params.offset || 0,
        market: params.market || 'US',
      },
    });
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 600000); // 10 minutes
    }
    return response;
  }

  async getRecommendations(
    params: RecommendationsParams
  ): Promise<SpotifyApiResponse<SpotifyRecommendationsResponse>> {
    const cacheKey = this.getCacheKey('/recommendations', params);
    const cached = this.getCachedData<SpotifyRecommendationsResponse>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<SpotifyRecommendationsResponse>('/recommendations', {
      params: params as any,
    });
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 900000); // 15 minutes
    }
    return response;
  }

  async getNewReleases(
    limit: number = 20
  ): Promise<SpotifyApiResponse<SpotifyNewReleasesResponse>> {
    const cacheKey = this.getCacheKey('/browse/new-releases', { limit });
    const cached = this.getCachedData<SpotifyNewReleasesResponse>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<SpotifyNewReleasesResponse>('/browse/new-releases', {
      params: { limit },
    });
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 1800000); // 30 minutes
    }
    return response;
  }

  async getFeaturedPlaylists(
    limit: number = 20
  ): Promise<SpotifyApiResponse<SpotifyFeaturedPlaylistsResponse>> {
    const cacheKey = this.getCacheKey('/browse/featured-playlists', { limit });
    const cached = this.getCachedData<SpotifyFeaturedPlaylistsResponse>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<SpotifyFeaturedPlaylistsResponse>(
      '/browse/featured-playlists',
      {
        params: { limit },
      }
    );
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 1800000); // 30 minutes
    }
    return response;
  }

  async getCategories(limit: number = 20): Promise<SpotifyApiResponse<SpotifyCategoriesResponse>> {
    const cacheKey = this.getCacheKey('/browse/categories', { limit });
    const cached = this.getCachedData<SpotifyCategoriesResponse>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<SpotifyCategoriesResponse>('/browse/categories', {
      params: { limit },
    });
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 3600000); // 1 hour
    }
    return response;
  }

  async getCategoryPlaylists(
    categoryId: string,
    limit: number = 20
  ): Promise<SpotifyApiResponse<SpotifyFeaturedPlaylistsResponse>> {
    const cacheKey = this.getCacheKey(`/browse/categories/${categoryId}/playlists`, { limit });
    const cached = this.getCachedData<SpotifyFeaturedPlaylistsResponse>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<SpotifyFeaturedPlaylistsResponse>(
      `/browse/categories/${categoryId}/playlists`,
      {
        params: { limit },
      }
    );
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 1800000); // 30 minutes
    }
    return response;
  }

  // ==================== LIBRARY MANAGEMENT ====================

  async getSavedTracks(
    limit: number = 20,
    offset: number = 0
  ): Promise<SpotifyApiResponse<SpotifySavedTracksResponse>> {
    const cacheKey = this.getCacheKey('/me/tracks', { limit, offset });
    const cached = this.getCachedData<SpotifySavedTracksResponse>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<SpotifySavedTracksResponse>('/me/tracks', {
      params: { limit, offset },
    });
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 300000); // 5 minutes
    }
    return response;
  }

  async saveTrack(trackId: string): Promise<SpotifyApiResponse<void>> {
    return this.makeRequest<void>('/me/tracks', {
      method: 'PUT',
      body: { ids: [trackId] },
    });
  }

  async removeSavedTrack(trackId: string): Promise<SpotifyApiResponse<void>> {
    return this.makeRequest<void>('/me/tracks', {
      method: 'DELETE',
      body: { ids: [trackId] },
    });
  }

  async checkSavedTracks(trackIds: string[]): Promise<SpotifyApiResponse<boolean[]>> {
    return this.makeRequest<boolean[]>('/me/tracks/contains', {
      params: { ids: trackIds.join(',') },
    });
  }

  async getSavedAlbums(
    limit: number = 20,
    offset: number = 0
  ): Promise<SpotifyApiResponse<SpotifySavedAlbumsResponse>> {
    const cacheKey = this.getCacheKey('/me/albums', { limit, offset });
    const cached = this.getCachedData<SpotifySavedAlbumsResponse>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<SpotifySavedAlbumsResponse>('/me/albums', {
      params: { limit, offset },
    });
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 300000); // 5 minutes
    }
    return response;
  }

  async saveAlbum(albumId: string): Promise<SpotifyApiResponse<void>> {
    return this.makeRequest<void>('/me/albums', {
      method: 'PUT',
      body: { ids: [albumId] },
    });
  }

  async removeSavedAlbum(albumId: string): Promise<SpotifyApiResponse<void>> {
    return this.makeRequest<void>('/me/albums', {
      method: 'DELETE',
      body: { ids: [albumId] },
    });
  }

  // ==================== PLAYLIST OPERATIONS ====================

  async getUserPlaylists(
    limit: number = 20,
    offset: number = 0
  ): Promise<SpotifyApiResponse<SpotifyUserPlaylistsResponse>> {
    const cacheKey = this.getCacheKey('/me/playlists', { limit, offset });
    const cached = this.getCachedData<SpotifyUserPlaylistsResponse>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<SpotifyUserPlaylistsResponse>('/me/playlists', {
      params: { limit, offset },
    });
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 300000); // 5 minutes
    }
    return response;
  }

  async getPlaylist(
    playlistId: string,
    fields?: string
  ): Promise<SpotifyApiResponse<SpotifyPlaylist>> {
    const cacheKey = this.getCacheKey(`/playlists/${playlistId}`, { fields });
    const cached = this.getCachedData<SpotifyPlaylist>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<SpotifyPlaylist>(`/playlists/${playlistId}`, {
      params: fields ? { fields } : undefined,
    });
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 300000); // 5 minutes
    }
    return response;
  }

  async createPlaylist(
    name: string,
    description?: string,
    isPublic: boolean = false
  ): Promise<SpotifyApiResponse<SpotifyPlaylist>> {
    const user = await this.getCurrentUser();
    if (!user.data) {
      return { data: null, error: 'Failed to get current user', status: 400 };
    }

    return this.makeRequest<SpotifyPlaylist>(`/users/${user.data.id}/playlists`, {
      method: 'POST',
      body: {
        name,
        description: description || '',
        public: isPublic,
      },
    });
  }

  async addTracksToPlaylist(playlistId: string, uris: string[]): Promise<SpotifyApiResponse<void>> {
    return this.makeRequest<void>(`/playlists/${playlistId}/tracks`, {
      method: 'POST',
      body: { uris },
    });
  }

  async removeTracksFromPlaylist(
    playlistId: string,
    tracks: { uri: string }[]
  ): Promise<SpotifyApiResponse<void>> {
    return this.makeRequest<void>(`/playlists/${playlistId}/tracks`, {
      method: 'DELETE',
      body: { tracks },
    });
  }

  async updatePlaylistDetails(
    playlistId: string,
    name?: string,
    description?: string
  ): Promise<SpotifyApiResponse<void>> {
    const body: any = {};
    if (name !== undefined) body.name = name;
    if (description !== undefined) body.description = description;

    return this.makeRequest<void>(`/playlists/${playlistId}`, {
      method: 'PUT',
      body,
    });
  }

  async reorderPlaylistTracks(
    playlistId: string,
    rangeStart: number,
    insertBefore: number
  ): Promise<SpotifyApiResponse<void>> {
    return this.makeRequest<void>(`/playlists/${playlistId}/tracks`, {
      method: 'PUT',
      body: { range_start: rangeStart, insert_before: insertBefore },
    });
  }

  // ==================== TRACK & ALBUM INFO ====================

  async getTrack(trackId: string): Promise<SpotifyApiResponse<SpotifyTrack>> {
    const cacheKey = this.getCacheKey(`/tracks/${trackId}`);
    const cached = this.getCachedData<SpotifyTrack>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<SpotifyTrack>(`/tracks/${trackId}`);
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 3600000); // 1 hour
    }
    return response;
  }

  async getTracks(trackIds: string[]): Promise<SpotifyApiResponse<{ tracks: SpotifyTrack[] }>> {
    const cacheKey = this.getCacheKey('/tracks', { ids: trackIds.join(',') });
    const cached = this.getCachedData<{ tracks: SpotifyTrack[] }>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<{ tracks: SpotifyTrack[] }>('/tracks', {
      params: { ids: trackIds.join(',') },
    });
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 3600000); // 1 hour
    }
    return response;
  }

  async getAlbum(albumId: string): Promise<SpotifyApiResponse<SpotifyAlbum>> {
    const cacheKey = this.getCacheKey(`/albums/${albumId}`);
    const cached = this.getCachedData<SpotifyAlbum>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<SpotifyAlbum>(`/albums/${albumId}`);
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 3600000); // 1 hour
    }
    return response;
  }

  async getAlbumTracks(
    albumId: string
  ): Promise<SpotifyApiResponse<SpotifyPlaylistTracksResponse>> {
    const cacheKey = this.getCacheKey(`/albums/${albumId}/tracks`);
    const cached = this.getCachedData<SpotifyPlaylistTracksResponse>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<SpotifyPlaylistTracksResponse>(
      `/albums/${albumId}/tracks`
    );
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 3600000); // 1 hour
    }
    return response;
  }

  async getArtist(artistId: string): Promise<SpotifyApiResponse<SpotifyArtist>> {
    const cacheKey = this.getCacheKey(`/artists/${artistId}`);
    const cached = this.getCachedData<SpotifyArtist>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<SpotifyArtist>(`/artists/${artistId}`);
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 3600000); // 1 hour
    }
    return response;
  }

  async getArtistTopTracks(
    artistId: string,
    country: string = 'US'
  ): Promise<SpotifyApiResponse<{ tracks: SpotifyTrack[] }>> {
    const cacheKey = this.getCacheKey(`/artists/${artistId}/top-tracks`, { country });
    const cached = this.getCachedData<{ tracks: SpotifyTrack[] }>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<{ tracks: SpotifyTrack[] }>(
      `/artists/${artistId}/top-tracks`,
      {
        params: { country },
      }
    );
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 1800000); // 30 minutes
    }
    return response;
  }

  async getArtistAlbums(
    artistId: string,
    includeGroups?: string[]
  ): Promise<SpotifyApiResponse<{ items: SpotifyAlbum[] }>> {
    const cacheKey = this.getCacheKey(`/artists/${artistId}/albums`, {
      include_groups: includeGroups?.join(','),
    });
    const cached = this.getCachedData<{ items: SpotifyAlbum[] }>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<{ items: SpotifyAlbum[] }>(
      `/artists/${artistId}/albums`,
      {
        params: includeGroups ? { include_groups: includeGroups.join(',') } : undefined,
      }
    );
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 1800000); // 30 minutes
    }
    return response;
  }

  async getRelatedArtists(
    artistId: string
  ): Promise<SpotifyApiResponse<{ artists: SpotifyArtist[] }>> {
    const cacheKey = this.getCacheKey(`/artists/${artistId}/related-artists`);
    const cached = this.getCachedData<{ artists: SpotifyArtist[] }>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<{ artists: SpotifyArtist[] }>(
      `/artists/${artistId}/related-artists`
    );
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 1800000); // 30 minutes
    }
    return response;
  }

  // ==================== AUDIO FEATURES ====================

  async getAudioFeatures(trackId: string): Promise<SpotifyApiResponse<SpotifyAudioFeatures>> {
    const cacheKey = this.getCacheKey(`/audio-features/${trackId}`);
    const cached = this.getCachedData<SpotifyAudioFeatures>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<SpotifyAudioFeatures>(`/audio-features/${trackId}`);
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 3600000); // 1 hour
    }
    return response;
  }

  async getAudioFeaturesMultiple(
    trackIds: string[]
  ): Promise<SpotifyApiResponse<{ audio_features: SpotifyAudioFeatures[] }>> {
    const cacheKey = this.getCacheKey('/audio-features', { ids: trackIds.join(',') });
    const cached = this.getCachedData<{ audio_features: SpotifyAudioFeatures[] }>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<{ audio_features: SpotifyAudioFeatures[] }>(
      '/audio-features',
      {
        params: { ids: trackIds.join(',') },
      }
    );
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 3600000); // 1 hour
    }
    return response;
  }

  async getAudioAnalysis(trackId: string): Promise<SpotifyApiResponse<SpotifyAudioAnalysis>> {
    const cacheKey = this.getCacheKey(`/audio-analysis/${trackId}`);
    const cached = this.getCachedData<SpotifyAudioAnalysis>(cacheKey);
    if (cached) {
      return { data: cached, error: null, status: 200 };
    }

    const response = await this.makeRequest<SpotifyAudioAnalysis>(`/audio-analysis/${trackId}`);
    if (response.data) {
      this.setCachedData(cacheKey, response.data, 3600000); // 1 hour
    }
    return response;
  }

  // ==================== UTILITY METHODS ====================

  formatTrackInfo(track: SpotifyTrack): string {
    const artists = track.artists.map((artist) => artist.name).join(', ');
    return `${track.name} - ${artists}`;
  }

  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  getSmallestImage(images: SpotifyImage[]): string | null {
    if (!images || images.length === 0) return null;
    return images[images.length - 1]?.url || null;
  }

  getLargestImage(images: SpotifyImage[]): string | null {
    if (!images || images.length === 0) return null;
    return images[0]?.url || null;
  }

  // ==================== CACHE MANAGEMENT ====================

  clearAllCache(): void {
    this.clearCache();
  }

  clearCacheForEndpoint(endpoint: string): void {
    const keysToDelete = Object.keys(this.cache).filter((key) => key.includes(endpoint));
    keysToDelete.forEach((key) => delete this.cache[key]);
  }
}
