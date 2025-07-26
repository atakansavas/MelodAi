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

export interface SpotifySearchResponse {
  tracks: {
    href: string;
    items: SpotifyTrack[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
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
];
