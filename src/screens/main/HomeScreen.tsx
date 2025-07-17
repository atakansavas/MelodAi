import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SpotifyApiService } from '@services/spotify';
import { useAuthStore } from '@store/auth';
import { SpotifyPlayHistory, SpotifyTrack } from '@types/spotify';

import { useRouter } from '../../hooks/useRouter';

export default function HomeScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [recentTracks, setRecentTracks] = useState<SpotifyPlayHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const spotifyApi = SpotifyApiService.getInstance();

  const loadRecentTracks = useCallback(async () => {
    try {
      setIsLoading(true);
      const tracks = await spotifyApi.getRecentlyPlayed(20);
      setRecentTracks(tracks);
    } catch (error) {
      console.error('Error loading recent tracks:', error);
      Alert.alert('Hata', 'Şarkılar yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  }, [spotifyApi]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecentTracks();
    setRefreshing(false);
  };

  const handleTrackPress = (track: SpotifyTrack) => {
    router.goToChat(track.id);
  };

  const handleLogout = async () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.goToLogin();
        },
      },
    ]);
  };

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba! 👋</Text>
          <Text style={styles.subtitle}>Hangi şarkı hakkında konuşmak istersiniz?</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Çıkış</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Tracks */}
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
                <View style={styles.trackImagePlaceholder}>
                  <Text style={styles.trackImageText}>🎵</Text>
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

      {/* AI Agents Preview */}
      <View style={styles.agentsPreview}>
        <Text style={styles.agentsTitle}>AI Asistanlar Hazır 🤖</Text>
        <View style={styles.agentsList}>
          <View style={styles.agentItem}>
            <Text style={styles.agentAvatar}>📚</Text>
            <Text style={styles.agentName}>Hikayeci</Text>
          </View>
          <View style={styles.agentItem}>
            <Text style={styles.agentAvatar}>🎵</Text>
            <Text style={styles.agentName}>Analist</Text>
          </View>
          <View style={styles.agentItem}>
            <Text style={styles.agentAvatar}>✍️</Text>
            <Text style={styles.agentName}>Şair</Text>
          </View>
          <View style={styles.agentItem}>
            <Text style={styles.agentAvatar}>🧠</Text>
            <Text style={styles.agentName}>Terapist</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.7,
  },
  logoutButton: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
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
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  trackImagePlaceholder: {
    width: 56,
    height: 56,
    backgroundColor: '#333',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  agentsPreview: {
    backgroundColor: '#111',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  agentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  agentsList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  agentItem: {
    alignItems: 'center',
  },
  agentAvatar: {
    fontSize: 20,
    marginBottom: 4,
  },
  agentName: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.7,
  },
});
