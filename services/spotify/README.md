# Spotify Service

A comprehensive Spotify Web API integration for React Native Expo applications. This service provides a complete wrapper around Spotify's Web API with proper authentication, caching, error handling, and TypeScript support.

## Features

- ✅ **Complete Spotify Web API Coverage** - All major endpoints implemented
- ✅ **Authentication Integration** - Seamless token management with AuthContext
- ✅ **Intelligent Caching** - Built-in caching with configurable TTL
- ✅ **Error Handling** - Comprehensive error handling and retry logic
- ✅ **TypeScript Support** - Full type safety for all API responses
- ✅ **React Hook** - Easy-to-use `useSpotifyService` hook
- ✅ **Production Ready** - Rate limiting, timeout handling, and proper error recovery

## Installation

The service is already integrated into your project. To use it, simply import the hook:

```typescript
import { useSpotifyService } from '../services/spotify/useSpotifyService';
```

## Quick Start

```typescript
import React from 'react';
import { useSpotifyService } from '../services/spotify/useSpotifyService';

function MyComponent() {
  const spotifyService = useSpotifyService();

  const loadUserProfile = async () => {
    const response = await spotifyService.getCurrentUser();
    if (response.data) {
      console.log('User:', response.data.display_name);
    } else {
      console.error('Error:', response.error);
    }
  };

  return (
    // Your component JSX
  );
}
```

## API Reference

### User Profile & Info

#### `getCurrentUser()`

Get the current user's profile information.

```typescript
const response = await spotifyService.getCurrentUser();
// Returns: SpotifyApiResponse<SpotifyUser>
```

#### `getUserProfile(userId: string)`

Get a specific user's profile.

```typescript
const response = await spotifyService.getUserProfile('user_id');
// Returns: SpotifyApiResponse<SpotifyUser>
```

#### `getTopTracks(timeRange?: TimeRange, limit?: number)`

Get user's top tracks.

```typescript
const response = await spotifyService.getTopTracks('medium_term', 20);
// Returns: SpotifyApiResponse<SpotifyTopTracksResponse>
```

#### `getTopArtists(timeRange?: TimeRange, limit?: number)`

Get user's top artists.

```typescript
const response = await spotifyService.getTopArtists('long_term', 10);
// Returns: SpotifyApiResponse<SpotifyTopArtistsResponse>
```

#### `getRecentlyPlayed(limit?: number)`

Get recently played tracks.

```typescript
const response = await spotifyService.getRecentlyPlayed(20);
// Returns: SpotifyApiResponse<SpotifyRecentlyPlayedResponse>
```

### Playback Control

#### `getCurrentPlayback()`

Get current playback state.

```typescript
const response = await spotifyService.getCurrentPlayback();
// Returns: SpotifyApiResponse<SpotifyCurrentPlayback>
```

#### `play(params?: PlaybackParams)`

Start or resume playback.

```typescript
// Play specific track
await spotifyService.play({ uris: ['spotify:track:track_id'] });

// Play playlist
await spotifyService.play({ context_uri: 'spotify:playlist:playlist_id' });

// Resume playback
await spotifyService.play();
```

#### `pause()`

Pause playback.

```typescript
await spotifyService.pause();
```

#### `skipToNext()`

Skip to next track.

```typescript
await spotifyService.skipToNext();
```

#### `skipToPrevious()`

Skip to previous track.

```typescript
await spotifyService.skipToPrevious();
```

#### `setVolume(volumePercent: number)`

Set playback volume (0-100).

```typescript
await spotifyService.setVolume(50);
```

#### `seekToPosition(positionMs: number)`

Seek to position in track.

```typescript
await spotifyService.seekToPosition(30000); // 30 seconds
```

### Player State

#### `getAvailableDevices()`

Get user's available devices.

```typescript
const response = await spotifyService.getAvailableDevices();
// Returns: SpotifyApiResponse<SpotifyDevicesResponse>
```

#### `transferPlayback(deviceId: string)`

Transfer playback to specific device.

```typescript
await spotifyService.transferPlayback('device_id');
```

#### `setRepeatMode(state: RepeatMode)`

Set repeat mode.

```typescript
await spotifyService.setRepeatMode('track'); // 'off' | 'track' | 'context'
```

#### `setShuffle(state: boolean)`

Set shuffle mode.

```typescript
await spotifyService.setShuffle(true);
```

### Search & Discovery

#### `search(params: SearchParams)`

Search for tracks, artists, albums, or playlists.

```typescript
const response = await spotifyService.search({
  query: 'artist name',
  types: ['track', 'artist'],
  limit: 20,
  market: 'US',
});
// Returns: SpotifyApiResponse<SpotifySearchResponse>
```

#### `getRecommendations(params: RecommendationsParams)`

Get track recommendations.

```typescript
const response = await spotifyService.getRecommendations({
  seed_artists: ['artist_id'],
  seed_tracks: ['track_id'],
  limit: 20,
  min_energy: 0.5,
  max_energy: 0.8,
});
// Returns: SpotifyApiResponse<SpotifyRecommendationsResponse>
```

#### `getNewReleases(limit?: number)`

Get new album releases.

```typescript
const response = await spotifyService.getNewReleases(20);
// Returns: SpotifyApiResponse<SpotifyNewReleasesResponse>
```

#### `getFeaturedPlaylists(limit?: number)`

Get featured playlists.

```typescript
const response = await spotifyService.getFeaturedPlaylists(20);
// Returns: SpotifyApiResponse<SpotifyFeaturedPlaylistsResponse>
```

#### `getCategories(limit?: number)`

Get browse categories.

```typescript
const response = await spotifyService.getCategories(20);
// Returns: SpotifyApiResponse<SpotifyCategoriesResponse>
```

#### `getCategoryPlaylists(categoryId: string, limit?: number)`

Get playlists for a category.

```typescript
const response = await spotifyService.getCategoryPlaylists('category_id', 20);
// Returns: SpotifyApiResponse<SpotifyFeaturedPlaylistsResponse>
```

### Library Management

#### `getSavedTracks(limit?: number, offset?: number)`

Get user's saved tracks.

```typescript
const response = await spotifyService.getSavedTracks(20, 0);
// Returns: SpotifyApiResponse<SpotifySavedTracksResponse>
```

#### `saveTrack(trackId: string)`

Save track to library.

```typescript
await spotifyService.saveTrack('track_id');
```

#### `removeSavedTrack(trackId: string)`

Remove saved track from library.

```typescript
await spotifyService.removeSavedTrack('track_id');
```

#### `checkSavedTracks(trackIds: string[])`

Check if tracks are saved.

```typescript
const response = await spotifyService.checkSavedTracks(['track_id_1', 'track_id_2']);
// Returns: SpotifyApiResponse<boolean[]>
```

#### `getSavedAlbums(limit?: number, offset?: number)`

Get user's saved albums.

```typescript
const response = await spotifyService.getSavedAlbums(20, 0);
// Returns: SpotifyApiResponse<SpotifySavedAlbumsResponse>
```

#### `saveAlbum(albumId: string)`

Save album to library.

```typescript
await spotifyService.saveAlbum('album_id');
```

#### `removeSavedAlbum(albumId: string)`

Remove saved album from library.

```typescript
await spotifyService.removeSavedAlbum('album_id');
```

### Playlist Operations

#### `getUserPlaylists(limit?: number, offset?: number)`

Get user's playlists.

```typescript
const response = await spotifyService.getUserPlaylists(20, 0);
// Returns: SpotifyApiResponse<SpotifyUserPlaylistsResponse>
```

#### `getPlaylist(playlistId: string, fields?: string)`

Get specific playlist.

```typescript
const response = await spotifyService.getPlaylist('playlist_id');
// Returns: SpotifyApiResponse<SpotifyPlaylist>
```

#### `createPlaylist(name: string, description?: string, isPublic?: boolean)`

Create new playlist.

```typescript
const response = await spotifyService.createPlaylist('My Playlist', 'Description', false);
// Returns: SpotifyApiResponse<SpotifyPlaylist>
```

#### `addTracksToPlaylist(playlistId: string, uris: string[])`

Add tracks to playlist.

```typescript
await spotifyService.addTracksToPlaylist('playlist_id', ['spotify:track:track_id']);
```

#### `removeTracksFromPlaylist(playlistId: string, tracks: Array<{ uri: string }>)`

Remove tracks from playlist.

```typescript
await spotifyService.removeTracksFromPlaylist('playlist_id', [{ uri: 'spotify:track:track_id' }]);
```

#### `updatePlaylistDetails(playlistId: string, name?: string, description?: string)`

Update playlist details.

```typescript
await spotifyService.updatePlaylistDetails('playlist_id', 'New Name', 'New Description');
```

#### `reorderPlaylistTracks(playlistId: string, rangeStart: number, insertBefore: number)`

Reorder tracks in playlist.

```typescript
await spotifyService.reorderPlaylistTracks('playlist_id', 0, 5);
```

### Track & Album Info

#### `getTrack(trackId: string)`

Get track details.

```typescript
const response = await spotifyService.getTrack('track_id');
// Returns: SpotifyApiResponse<SpotifyTrack>
```

#### `getTracks(trackIds: string[])`

Get multiple tracks.

```typescript
const response = await spotifyService.getTracks(['track_id_1', 'track_id_2']);
// Returns: SpotifyApiResponse<{ tracks: SpotifyTrack[] }>
```

#### `getAlbum(albumId: string)`

Get album details.

```typescript
const response = await spotifyService.getAlbum('album_id');
// Returns: SpotifyApiResponse<SpotifyAlbum>
```

#### `getAlbumTracks(albumId: string)`

Get album tracks.

```typescript
const response = await spotifyService.getAlbumTracks('album_id');
// Returns: SpotifyApiResponse<SpotifyPlaylistTracksResponse>
```

#### `getArtist(artistId: string)`

Get artist details.

```typescript
const response = await spotifyService.getArtist('artist_id');
// Returns: SpotifyApiResponse<SpotifyArtist>
```

#### `getArtistTopTracks(artistId: string, country?: string)`

Get artist's top tracks.

```typescript
const response = await spotifyService.getArtistTopTracks('artist_id', 'US');
// Returns: SpotifyApiResponse<{ tracks: SpotifyTrack[] }>
```

#### `getArtistAlbums(artistId: string, includeGroups?: string[])`

Get artist's albums.

```typescript
const response = await spotifyService.getArtistAlbums('artist_id', ['album', 'single']);
// Returns: SpotifyApiResponse<{ items: SpotifyAlbum[] }>
```

#### `getRelatedArtists(artistId: string)`

Get related artists.

```typescript
const response = await spotifyService.getRelatedArtists('artist_id');
// Returns: SpotifyApiResponse<{ artists: SpotifyArtist[] }>
```

### Audio Features

#### `getAudioFeatures(trackId: string)`

Get track audio features.

```typescript
const response = await spotifyService.getAudioFeatures('track_id');
// Returns: SpotifyApiResponse<SpotifyAudioFeatures>
```

#### `getAudioFeaturesMultiple(trackIds: string[])`

Get multiple tracks' audio features.

```typescript
const response = await spotifyService.getAudioFeaturesMultiple(['track_id_1', 'track_id_2']);
// Returns: SpotifyApiResponse<{ audio_features: SpotifyAudioFeatures[] }>
```

#### `getAudioAnalysis(trackId: string)`

Get detailed audio analysis.

```typescript
const response = await spotifyService.getAudioAnalysis('track_id');
// Returns: SpotifyApiResponse<SpotifyAudioAnalysis>
```

### Utility Methods

#### `formatTrackInfo(track: SpotifyTrack)`

Format track information for display.

```typescript
const trackInfo = spotifyService.formatTrackInfo(track);
// Returns: "Track Name - Artist Name"
```

#### `formatDuration(ms: number)`

Format duration in milliseconds to MM:SS format.

```typescript
const duration = spotifyService.formatDuration(180000);
// Returns: "3:00"
```

#### `getSmallestImage(images: SpotifyImage[])`

Get the smallest image URL.

```typescript
const imageUrl = spotifyService.getSmallestImage(track.album.images);
```

#### `getLargestImage(images: SpotifyImage[])`

Get the largest image URL.

```typescript
const imageUrl = spotifyService.getLargestImage(track.album.images);
```

### Cache Management

#### `clearAllCache()`

Clear all cached data.

```typescript
spotifyService.clearAllCache();
```

#### `clearCacheForEndpoint(endpoint: string)`

Clear cache for specific endpoint.

```typescript
spotifyService.clearCacheForEndpoint('/me/top/tracks');
```

## Configuration

You can configure the service when creating the instance:

```typescript
const spotifyService = useSpotifyService({
  baseUrl: 'https://api.spotify.com/v1',
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 10000,
});
```

## Error Handling

All methods return a `SpotifyApiResponse<T>` object with the following structure:

```typescript
interface SpotifyApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}
```

Example usage:

```typescript
const response = await spotifyService.getCurrentUser();

if (response.data) {
  // Success - use response.data
  console.log(response.data.display_name);
} else {
  // Error - handle response.error
  console.error('Error:', response.error);
  console.log('Status:', response.status);
}
```

## Authentication

The service automatically handles authentication using the `useAuth` hook. It will:

1. Get the current access token from secure storage
2. Automatically refresh expired tokens
3. Retry failed requests with new tokens
4. Handle authentication errors gracefully

## Caching

The service includes intelligent caching with configurable TTL:

- **User profile**: 5 minutes
- **Top tracks/artists**: 15 minutes
- **Recently played**: 5 minutes
- **Search results**: 10 minutes
- **Recommendations**: 15 minutes
- **New releases**: 30 minutes
- **Categories**: 1 hour
- **Tracks/Albums/Artists**: 1 hour
- **Audio features**: 1 hour

## Rate Limiting

The service respects Spotify's rate limits and includes:

- Automatic retry logic for rate-limited requests
- Configurable retry delays
- Proper error handling for rate limit responses

## Example Usage

See `SpotifyServiceExample.tsx` for a complete example of how to use the service in a React Native component.

## Types

All Spotify API types are available for import:

```typescript
import {
  SpotifyUser,
  SpotifyTrack,
  SpotifyArtist,
  SpotifyAlbum,
  SpotifyPlaylist,
  SpotifyDevice,
  SpotifyCurrentPlayback,
  // ... and many more
} from '../services/spotify/types';
```

## Contributing

When adding new features to the Spotify service:

1. Add the corresponding type definitions to `types/spotify.ts`
2. Implement the method in `SpotifyService.ts`
3. Add appropriate caching if needed
4. Update this README with the new method documentation
5. Add tests if applicable

## License

This service is part of your React Native Expo project and follows the same license terms.
