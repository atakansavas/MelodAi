import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SpotifyArtist, SpotifyPlaylist, SpotifyTrack } from './types';
import { useSpotifyService } from './useSpotifyService';

export function SpotifyServiceExample() {
  const spotifyService = useSpotifyService();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [currentPlayback, setCurrentPlayback] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Get current user profile
  const loadCurrentUser = async () => {
    try {
      setLoading(true);
      const response = await spotifyService.getCurrentUser();
      if (response.data) {
        setCurrentUser(response.data);
      } else {
        Alert.alert('Error', response.error || 'Failed to load user profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  // Get user's top tracks
  const loadTopTracks = async () => {
    try {
      setLoading(true);
      const response = await spotifyService.getTopTracks('medium_term', 10);
      if (response.data) {
        setTopTracks(response.data.items);
      } else {
        Alert.alert('Error', response.error || 'Failed to load top tracks');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load top tracks');
    } finally {
      setLoading(false);
    }
  };

  // Get user's top artists
  const loadTopArtists = async () => {
    try {
      setLoading(true);
      const response = await spotifyService.getTopArtists('medium_term', 10);
      if (response.data) {
        setTopArtists(response.data.items);
      } else {
        Alert.alert('Error', response.error || 'Failed to load top artists');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load top artists');
    } finally {
      setLoading(false);
    }
  };

  // Get user's playlists
  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const response = await spotifyService.getUserPlaylists(10);
      if (response.data) {
        setPlaylists(response.data.items);
      } else {
        Alert.alert('Error', response.error || 'Failed to load playlists');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  // Get current playback
  const loadCurrentPlayback = async () => {
    try {
      setLoading(true);
      const response = await spotifyService.getCurrentPlayback();
      if (response.data) {
        setCurrentPlayback(response.data);
      } else {
        setCurrentPlayback(null);
      }
    } catch (error) {
      setCurrentPlayback(null);
    } finally {
      setLoading(false);
    }
  };

  // Playback controls
  const playTrack = async (trackUri: string) => {
    try {
      const response = await spotifyService.play({ uris: [trackUri] });
      if (response.error) {
        Alert.alert('Error', response.error);
      } else {
        Alert.alert('Success', 'Track started playing');
        loadCurrentPlayback();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to play track');
    }
  };

  const pausePlayback = async () => {
    try {
      const response = await spotifyService.pause();
      if (response.error) {
        Alert.alert('Error', response.error);
      } else {
        Alert.alert('Success', 'Playback paused');
        loadCurrentPlayback();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pause playback');
    }
  };

  const skipToNext = async () => {
    try {
      const response = await spotifyService.skipToNext();
      if (response.error) {
        Alert.alert('Error', response.error);
      } else {
        Alert.alert('Success', 'Skipped to next track');
        loadCurrentPlayback();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to skip to next track');
    }
  };

  const skipToPrevious = async () => {
    try {
      const response = await spotifyService.skipToPrevious();
      if (response.error) {
        Alert.alert('Error', response.error);
      } else {
        Alert.alert('Success', 'Skipped to previous track');
        loadCurrentPlayback();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to skip to previous track');
    }
  };

  // Search functionality
  const searchTracks = async (query: string) => {
    try {
      setLoading(true);
      const response = await spotifyService.search({
        query,
        types: ['track'],
        limit: 10,
      });
      if (response.data?.tracks) {
        setTopTracks(response.data.tracks.items);
      } else {
        Alert.alert('Error', response.error || 'No tracks found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search tracks');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadCurrentUser();
    loadTopTracks();
    loadTopArtists();
    loadPlaylists();
    loadCurrentPlayback();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Spotify Service Example</Text>

      {/* Current User */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current User</Text>
        {currentUser ? (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{currentUser.display_name}</Text>
            <Text style={styles.userEmail}>{currentUser.email}</Text>
            <Text style={styles.userProduct}>Product: {currentUser.product}</Text>
          </View>
        ) : (
          <Text style={styles.loadingText}>Loading user info...</Text>
        )}
      </View>

      {/* Current Playback */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Playback</Text>
        {currentPlayback?.item ? (
          <View style={styles.playbackInfo}>
            <Text style={styles.trackName}>{currentPlayback.item.name}</Text>
            <Text style={styles.artistName}>
              {currentPlayback.item.artists.map((artist: any) => artist.name).join(', ')}
            </Text>
            <Text style={styles.playbackStatus}>
              {currentPlayback.is_playing ? 'Playing' : 'Paused'}
            </Text>
            <View style={styles.playbackControls}>
              <TouchableOpacity style={styles.controlButton} onPress={skipToPrevious}>
                <Text style={styles.buttonText}>⏮</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={pausePlayback}>
                <Text style={styles.buttonText}>⏸</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={skipToNext}>
                <Text style={styles.buttonText}>⏭</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.loadingText}>No active playback</Text>
        )}
      </View>

      {/* Top Tracks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Tracks</Text>
        {topTracks.length > 0 ? (
          topTracks.map((track, index) => (
            <TouchableOpacity
              key={track.id}
              style={styles.trackItem}
              onPress={() => playTrack(track.uri)}
            >
              <Text style={styles.trackNumber}>{index + 1}</Text>
              <View style={styles.trackInfo}>
                <Text style={styles.trackName}>{track.name}</Text>
                <Text style={styles.artistName}>
                  {track.artists.map((artist) => artist.name).join(', ')}
                </Text>
              </View>
              <Text style={styles.duration}>
                {spotifyService.formatDuration(track.duration_ms)}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.loadingText}>Loading top tracks...</Text>
        )}
      </View>

      {/* Top Artists */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Artists</Text>
        {topArtists.length > 0 ? (
          topArtists.map((artist, index) => (
            <View key={artist.id} style={styles.artistItem}>
              <Text style={styles.artistNumber}>{index + 1}</Text>
              <Text style={styles.artistName}>{artist.name}</Text>
              <Text style={styles.artistGenres}>{artist.genres.slice(0, 3).join(', ')}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.loadingText}>Loading top artists...</Text>
        )}
      </View>

      {/* Playlists */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Playlists</Text>
        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <View key={playlist.id} style={styles.playlistItem}>
              <Text style={styles.playlistName}>{playlist.name}</Text>
              <Text style={styles.playlistTracks}>{playlist.tracks.total} tracks</Text>
              <Text style={styles.playlistVisibility}>
                {playlist.public ? 'Public' : 'Private'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.loadingText}>Loading playlists...</Text>
        )}
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1DB954',
    marginBottom: 12,
  },
  userInfo: {
    backgroundColor: '#282828',
    padding: 16,
    borderRadius: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 14,
    color: '#B3B3B3',
    marginTop: 4,
  },
  userProduct: {
    fontSize: 14,
    color: '#B3B3B3',
    marginTop: 4,
  },
  playbackInfo: {
    backgroundColor: '#282828',
    padding: 16,
    borderRadius: 8,
  },
  playbackStatus: {
    fontSize: 14,
    color: '#1DB954',
    marginTop: 8,
  },
  playbackControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  controlButton: {
    backgroundColor: '#1DB954',
    padding: 12,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  trackNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B3B3B3',
    width: 30,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trackName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  artistName: {
    fontSize: 14,
    color: '#B3B3B3',
    marginTop: 2,
  },
  duration: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  artistItem: {
    backgroundColor: '#282828',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  artistNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B3B3B3',
  },
  artistGenres: {
    fontSize: 12,
    color: '#B3B3B3',
    marginTop: 4,
  },
  playlistItem: {
    backgroundColor: '#282828',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  playlistTracks: {
    fontSize: 14,
    color: '#B3B3B3',
    marginTop: 4,
  },
  playlistVisibility: {
    fontSize: 12,
    color: '#1DB954',
    marginTop: 4,
  },
  loadingText: {
    fontSize: 14,
    color: '#B3B3B3',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
