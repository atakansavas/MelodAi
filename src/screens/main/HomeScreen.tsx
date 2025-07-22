import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Easing } from 'react-native-reanimated';

import { SpotifyApiService } from '@services/spotify';
import { useAuthStore } from '@store/auth';

import { SpotifyPlayHistory, SpotifyTrack } from '../../../types/spotify';
import { useRouter } from '../../hooks/useRouter';

const { width } = Dimensions.get('screen');

const _spacing = 20;
const _icons = 60;
const _movingSize = _icons + _spacing * 2;
const _borderRadius = _icons / 2;
const _sideIconSize = _icons * 0.9;

export default function HomeScreen() {
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const [recentTracks, setRecentTracks] = useState<SpotifyPlayHistory[]>([]);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const spotifyApi = SpotifyApiService.getInstance();

  const loadRecentTracks = useCallback(async () => {
    try {
      setIsLoading(true);
      const tracks = await spotifyApi.getRecentlyPlayed(20);
      setRecentTracks(tracks.items);
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

  const handleChatSubmit = () => {
    if (chatInput.trim()) {
      // TODO: Implement chat functionality
      console.log('Chat input:', chatInput);
      setChatInput('');
    }
  };

  const handleMenuPress = (action: string) => {
    switch (action) {
      case 'profile':
        // TODO: Navigate to profile
        console.log('Profile pressed');
        break;
      case 'settings':
        // TODO: Navigate to settings
        console.log('Settings pressed');
        break;
      case 'favorites':
        // TODO: Navigate to favorites
        console.log('Favorites pressed');
        break;
      case 'history':
        // TODO: Navigate to history
        console.log('History pressed');
        break;
      case 'logout':
        handleLogout();
        break;
    }
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
    <View style={{ flex: 1 }}>
      {/* Blurred Background */}
      <BlurView intensity={20} style={StyleSheet.absoluteFillObject}>
        <View
          style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(55, 24, 83, 0.8)' }]}
        />
      </BlurView>

      {/* Drawer Background */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(55, 24, 83, 0.6)' }]}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              width: _icons,
              flex: 1,
              alignSelf: 'flex-end',
              alignItems: 'center',
              margin: _spacing,
              justifyContent: 'flex-end',
            }}
          >
            {/* User Profile */}
            <Pressable onPress={() => handleMenuPress('profile')}>
              <View
                style={{
                  borderRadius: _borderRadius / 2,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  height: _sideIconSize,
                  width: _sideIconSize,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: _spacing,
                }}
              >
                <Feather name="user" size={24} color="#fff" style={{ opacity: 0.5 }} />
              </View>
            </Pressable>

            {/* Favorites */}
            <Pressable onPress={() => handleMenuPress('favorites')}>
              <View
                style={{
                  borderRadius: _borderRadius / 2,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  height: _sideIconSize,
                  width: _sideIconSize,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: _spacing,
                }}
              >
                <Feather name="heart" size={24} color="#fff" style={{ opacity: 0.5 }} />
              </View>
            </Pressable>

            {/* History */}
            <Pressable onPress={() => handleMenuPress('history')}>
              <View
                style={{
                  borderRadius: _borderRadius / 2,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  height: _sideIconSize,
                  width: _sideIconSize,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: _spacing,
                }}
              >
                <Feather name="clock" size={24} color="#fff" style={{ opacity: 0.5 }} />
              </View>
            </Pressable>

            {/* Settings */}
            <Pressable onPress={() => handleMenuPress('settings')}>
              <View
                style={{
                  borderRadius: _borderRadius / 2,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  height: _sideIconSize,
                  width: _sideIconSize,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: _spacing,
                }}
              >
                <Feather name="settings" size={24} color="#fff" style={{ opacity: 0.5 }} />
              </View>
            </Pressable>

            {/* Logout */}
            <Pressable onPress={() => handleMenuPress('logout')}>
              <View
                style={{
                  borderRadius: _borderRadius / 2,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  height: _sideIconSize,
                  width: _sideIconSize,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: _spacing,
                }}
              >
                <Feather name="log-out" size={24} color="#fff" style={{ opacity: 0.5 }} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Chat Input in Footer */}
        <View
          style={{
            paddingHorizontal: _spacing,
            width: width - _movingSize,
            justifyContent: 'center',
            marginBottom: _icons - _spacing,
          }}
        >
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              height: _icons - _spacing,
              justifyContent: 'center',
              padding: _spacing / 2,
            }}
          >
            <TextInput
              style={{
                backgroundColor: '#fff',
                borderRadius: 20,
                height: _icons - _spacing * 2,
                paddingHorizontal: 16,
                color: '#000',
                fontSize: 14,
              }}
              placeholder="Bir şarkı hakkında konuşun..."
              placeholderTextColor="#666"
              value={chatInput}
              onChangeText={setChatInput}
              onSubmitEditing={handleChatSubmit}
              returnKeyType="send"
            />
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={{ flex: 1 }}>
        <MotiView
          from={{
            translateY: 0,
            translateX: 0,
          }}
          animate={{
            translateX: isDrawerVisible ? -_movingSize : 0,
            translateY: isDrawerVisible ? -_movingSize : 0,
          }}
          transition={{
            type: 'timing',
            duration: 600,
            easing: Easing.elastic(1.1),
          }}
          style={{
            flex: 1,
            backgroundColor: 'rgba(92, 50, 129, 0.9)',
            borderRadius: _borderRadius,
          }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Merhaba! 👋</Text>
              <Text style={styles.subtitle}>Hangi şarkı hakkında konuşmak istersiniz?</Text>
            </View>
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
                <Text style={styles.emptySubtext}>
                  Spotify&apos;da müzik dinleyin ve buradan görün
                </Text>
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
        </MotiView>

        {/* Drawer Toggle Button */}
        <TouchableOpacity
          onPress={() => {
            setIsDrawerVisible((isVisible) => !isVisible);
          }}
        >
          <>
            <MotiView
              animate={{
                scale: isDrawerVisible ? [2, 0] : 0,
                opacity: isDrawerVisible ? 0 : 1,
              }}
              transition={{
                type: 'timing',
                duration: 300,
              }}
              style={{
                position: 'absolute',
                width: _icons,
                height: _icons,
                borderRadius: _icons,
                backgroundColor: '#FE2A6B',
                alignItems: 'center',
                justifyContent: 'center',
                right: _spacing,
                bottom: _spacing,
              }}
            />
            <MotiView
              animate={{
                rotate: isDrawerVisible ? '90deg' : '0deg',
              }}
              transition={{
                type: 'timing',
                duration: 300,
              }}
              style={{
                width: _icons,
                height: _icons,
                borderRadius: _icons,
                backgroundColor: '#FE2A6B',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                right: _spacing,
                bottom: _spacing,
              }}
            >
              <Feather name="plus" size={24} color="#fff" />
            </MotiView>
          </>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  trackImagePlaceholder: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
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
