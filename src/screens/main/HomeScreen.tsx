import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SpotifyPlayHistory, SpotifyTrack } from '../../../types/spotify';
import { MainLayout } from '../../components/Layout';
import { useRouter } from '../../hooks/useRouter';

export default function HomeScreen() {
  const router = useRouter();
  const [user] = useState({ display_name: 'User' }); // Placeholder user data

  const [recentTracks, setRecentTracks] = useState<SpotifyPlayHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecentTracks = useCallback(async () => {
    try {
      setIsLoading(true);
      // TODO: Implement with Supabase data
      setRecentTracks([]);
    } catch (error) {
      console.error('Error loading recent tracks:', error);
      Alert.alert('Hata', 'Şarkılar yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecentTracks();
    setRefreshing(false);
  };

  const handleTrackPress = (track: SpotifyTrack) => {
    router.goToChatDetail({
      trackId: track.id,
      trackName: track.name,
      artistName: track.artists.map((artist) => artist.name).join(', '),
    });
  };

  // TODO: Implement chat submit when needed
  // const handleChatSubmit = (input: string) => {
  //   if (input.trim()) {
  //     // Navigate to chat detail screen for general music chat
  //     router.goToChatDetail({
  //       trackName: 'Genel Müzik Sohbeti',
  //       artistName: '',
  //     });
  //   }
  // };

  useEffect(() => {
    loadRecentTracks();
  }, [loadRecentTracks]);

  const formatPlayedAt = (playedAt: string) => {
    const date = new Date(playedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Az önce';
    } else if (diffHours < 24) {
      return `${diffHours} saat önce`;
    } else if (diffDays < 7) {
      return `${diffDays} gün önce`;
    } else {
      return date.toLocaleDateString('tr-TR');
    }
  };

  const getAlbumImageUrl = (track: SpotifyTrack) => {
    if (track.album?.images && track.album.images.length > 0) {
      // Use the smallest image for better performance
      const lastImage = track.album.images[track.album.images.length - 1];
      return lastImage?.url || null;
    }
    return null;
  };

  return (
    <MainLayout
      title={`Selam ${user?.display_name}! 👋`}
      subtitle="Hangi şarkı hakkında konuşmak istersiniz?"
      showChatInput={true}
    >
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1DB954" />
        }
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Son Dinlenenler</Text>
          <Text style={styles.sectionSubtitle}>
            Spotify geçmişinizden bir şarkı seçin ve AI asistanlarla sohbet edin
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Şarkılar yükleniyor...</Text>
          </View>
        ) : recentTracks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz dinlenen şarkı bulunmuyor</Text>
            <Text style={styles.emptySubtext}>Spotify&apos;da müzik dinleyin ve buradan görün</Text>
          </View>
        ) : (
          <View style={styles.tracksList}>
            {recentTracks.map((item, index) => (
              <TouchableOpacity
                key={`${item.track.id}-${index}`}
                style={styles.trackCard}
                onPress={() => handleTrackPress(item.track)}
              >
                <View style={styles.trackImageContainer}>
                  {getAlbumImageUrl(item.track) ? (
                    <Image
                      source={{ uri: getAlbumImageUrl(item.track)! }}
                      style={styles.trackImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.trackImagePlaceholder}>
                      <Text style={styles.trackImageText}>🎵</Text>
                    </View>
                  )}
                </View>

                <View style={styles.trackInfo}>
                  <Text style={styles.trackName} numberOfLines={1}>
                    {item.track.name}
                  </Text>
                  <Text style={styles.trackArtist} numberOfLines={1}>
                    {item.track.artists.map((artist) => artist.name).join(', ')}
                  </Text>
                  <Text style={styles.trackAlbum} numberOfLines={1}>
                    {item.track.album.name}
                  </Text>
                  <Text style={styles.trackTime}>{formatPlayedAt(item.played_at)}</Text>
                </View>

                <View style={styles.trackActions}>
                  <View style={styles.chatIcon}>
                    <Text style={styles.chatIconText}>💬</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  tracksList: {
    paddingBottom: 20,
  },
  trackCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  trackImageContainer: {
    marginRight: 12,
  },
  trackImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  trackImagePlaceholder: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackImageText: {
    fontSize: 24,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 2,
  },
  trackAlbum: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.6,
    marginBottom: 4,
  },
  trackTime: {
    fontSize: 11,
    color: '#1DB954',
    opacity: 0.8,
  },
  trackActions: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#1DB954',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatIconText: {
    fontSize: 18,
  },
});
