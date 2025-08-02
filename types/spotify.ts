export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: SpotifyImage[];
  product: 'free' | 'premium';
  country: string;
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string;
    total: number;
  };
  href: string;
  uri: string;
}

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: SpotifyImage[];
  genres: string[];
  popularity: number;
  uri: string;
  href: string;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date: string;
  release_date_precision: 'year' | 'month' | 'day';
  total_tracks: number;
  uri: string;
  href: string;
  artists: SpotifyArtist[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
  duration_ms: number;
  explicit: boolean;
  popularity: number;
  preview_url: string | null;
  uri: string;
  href: string;
}

export interface SpotifyPlayHistory {
  track: SpotifyTrack;
  played_at: string;
  context: {
    type: string;
    href: string;
    uri: string;
  } | null;
}

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
}

export interface SpotifyAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  user: SpotifyUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const SPOTIFY_SCOPES = [
  'user-read-recently-played',
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'playlist-read-private',
  'playlist-read-collaborative',
  'streaming',
  'user-modify-playback-state',
  'user-library-read',
  'user-library-modify',
  'user-follow-modify',
  'user-read-playback-state',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-follow-read',
  'playlist-read-private',
];

// Additional Spotify API Types
export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  images: SpotifyImage[];
  owner: SpotifyUser;
  public: boolean;
  collaborative: boolean;
  tracks: {
    href: string;
    total: number;
  };
  uri: string;
  href: string;
  snapshot_id: string;
}

export interface SpotifyPlaylistTrack {
  added_at: string;
  added_by: SpotifyUser;
  is_local: boolean;
  track: SpotifyTrack;
}

export interface SpotifyPlaylistTracksResponse {
  href: string;
  items: SpotifyPlaylistTrack[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

export interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number | null;
}

export interface SpotifyDevicesResponse {
  devices: SpotifyDevice[];
}

export interface SpotifyCurrentPlayback {
  device: SpotifyDevice;
  shuffle_state: boolean;
  repeat_state: 'off' | 'track' | 'context';
  timestamp: number;
  context: {
    type: string;
    href: string;
    uri: string;
  } | null;
  progress_ms: number | null;
  item: SpotifyTrack | null;
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown';
  actions: {
    disallows: {
      resuming: boolean;
      skipping_prev: boolean;
      skipping_next: boolean;
      seeking: boolean;
      pausing: boolean;
    };
  };
  is_playing: boolean;
}

export interface SpotifyTopTracksResponse {
  href: string;
  items: SpotifyTrack[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

export interface SpotifyTopArtistsResponse {
  href: string;
  items: SpotifyArtist[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

export interface SpotifyRecentlyPlayedResponse {
  items: SpotifyPlayHistory[];
  next: string | null;
  cursors: {
    after: string | null;
    before: string | null;
  };
}

export interface SpotifySavedTracksResponse {
  href: string;
  items: {
    added_at: string;
    track: SpotifyTrack;
  }[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

export interface SpotifySavedAlbumsResponse {
  href: string;
  items: {
    added_at: string;
    album: SpotifyAlbum;
  }[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

export interface SpotifyUserPlaylistsResponse {
  href: string;
  items: SpotifyPlaylist[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

export interface SpotifySearchResponse {
  tracks?: {
    href: string;
    items: SpotifyTrack[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
  artists?: {
    href: string;
    items: SpotifyArtist[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
  albums?: {
    href: string;
    items: SpotifyAlbum[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
  playlists?: {
    href: string;
    items: SpotifyPlaylist[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
}

export interface SpotifyRecommendationsResponse {
  tracks: SpotifyTrack[];
  seeds: {
    afterFilteringSize: number;
    afterRelinkingSize: number;
    href: string | null;
    id: string;
    initialPoolSize: number;
    type: string;
  }[];
}

export interface SpotifyNewReleasesResponse {
  albums: {
    href: string;
    items: SpotifyAlbum[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
}

export interface SpotifyFeaturedPlaylistsResponse {
  playlists: {
    href: string;
    items: SpotifyPlaylist[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
}

export interface SpotifyCategory {
  id: string;
  name: string;
  href: string;
  icons: SpotifyImage[];
}

export interface SpotifyCategoriesResponse {
  categories: {
    href: string;
    items: SpotifyCategory[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
}

export interface SpotifyAudioFeatures {
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  id: string;
  uri: string;
  track_href: string;
  analysis_url: string;
  duration_ms: number;
  time_signature: number;
}

export interface SpotifyAudioAnalysis {
  bars: {
    start: number;
    duration: number;
    confidence: number;
  }[];
  beats: {
    start: number;
    duration: number;
    confidence: number;
  }[];
  sections: {
    start: number;
    duration: number;
    confidence: number;
    loudness: number;
    tempo: number;
    tempo_confidence: number;
    key: number;
    key_confidence: number;
    mode: number;
    mode_confidence: number;
    time_signature: number;
    time_signature_confidence: number;
  }[];
  segments: {
    start: number;
    duration: number;
    confidence: number;
    loudness_start: number;
    loudness_max: number;
    loudness_max_time: number;
    loudness_end: number;
    pitches: number[];
    timbre: number[];
  }[];
  tatums: {
    start: number;
    duration: number;
    confidence: number;
  }[];
}

// Request parameter types
export type TimeRange = 'short_term' | 'medium_term' | 'long_term';
export type SearchType = 'track' | 'artist' | 'album' | 'playlist';
export type RepeatMode = 'off' | 'track' | 'context';

export interface SearchParams {
  query: string;
  types: SearchType[];
  limit?: number;
  offset?: number;
  market?: string;
}

export interface RecommendationsParams {
  seed_artists?: string[];
  seed_genres?: string[];
  seed_tracks?: string[];
  limit?: number;
  market?: string;
  min_energy?: number;
  max_energy?: number;
  min_danceability?: number;
  max_danceability?: number;
  min_valence?: number;
  max_valence?: number;
  target_energy?: number;
  target_danceability?: number;
  target_valence?: number;
}

export interface PlaybackParams {
  device_id?: string;
  context_uri?: string;
  uris?: string[];
  position_ms?: number;
}

// Error types
export interface SpotifyError {
  error: {
    status: number;
    message: string;
  };
}

// Response wrapper type
export interface SpotifyResponse<T> {
  data: T;
  error: SpotifyError | null;
  status: number;
}
