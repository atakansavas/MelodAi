import { Feather } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useSpotifyService } from '@/services/spotify/useSpotifyService';
import { useAuth } from '@/src/contexts/AuthContext';
import { ChatService, ChatSessionData } from '@services/supabase';

import { SpotifyPlayHistory, SpotifyTrack } from '../../../types/spotify';
import { MainLayout } from '../../components/Layout';
import { useRouter } from '../../hooks/useRouter';
import { useNavigation } from '../../navigation/NavigationStore';

interface LoadingState {
  initial: boolean;
  chatHistory: boolean;
  spotify: boolean;
  refreshing: boolean;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { chatSessionUpdated, clearChatSessionUpdated } = useNavigation();

  const spotifyService = useSpotifyService();
  const chatService = ChatService.getInstance();

  // Chat input state
  const [chatInput, setChatInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Spotify tracks state
  const [recentTracks, setRecentTracks] = useState<SpotifyPlayHistory[]>([]);

  // Chat history state
  const [chatSessions, setChatSessions] = useState<ChatSessionData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreChats, setHasMoreChats] = useState(true);

  // Loading states
  const [loading, setLoading] = useState<LoadingState>({
    initial: true,
    chatHistory: true,
    spotify: true,
    refreshing: false,
  });

  // Error states
  const [error, setError] = useState<{
    chatHistory?: string;
    spotify?: string;
  }>({});

  // Load recent Spotify tracks
  const loadRecentTracks = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, spotify: true }));
      setError((prev) => ({ ...prev, spotify: undefined }));
      const recentTracks = await spotifyService.getRecentlyPlayed(20);
      setRecentTracks(recentTracks.data?.items || []);
    } catch (error) {
      console.error('Error loading recent tracks:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Şarkılar yüklenirken bir hata oluştu.';
      setError((prev) => ({ ...prev, spotify: errorMessage }));
    } finally {
      setLoading((prev) => ({ ...prev, spotify: false }));
    }
  }, [spotifyService]);

  // Load chat history
  const loadChatHistory = useCallback(
    async (page: number = 1, isRefresh: boolean = false) => {
      try {
        if (!user?.id) return;

        if (page === 1) {
          setLoading((prev) => ({
            ...prev,
            chatHistory: !isRefresh,
            refreshing: isRefresh,
          }));
          setError((prev) => ({ ...prev, chatHistory: undefined }));
        }

        const sessions = await chatService.getChatSessions();

        if (sessions) {
          // For simplicity, we'll show all sessions at once
          // In a real pagination setup, you'd request specific pages
          const newSessions = sessions.slice(0, page * 10);

          if (page === 1) {
            setChatSessions(newSessions);
          } else {
            setChatSessions((prevSessions) => [...prevSessions, ...newSessions]);
          }

          setCurrentPage(page);
          setHasMoreChats(sessions.length > page * 10);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Sohbet geçmişi yüklenirken bir hata oluştu.';
        setError((prev) => ({ ...prev, chatHistory: errorMessage }));

        if (page === 1) {
          Alert.alert('Hata', errorMessage);
        }
      } finally {
        setLoading((prev) => ({
          ...prev,
          chatHistory: false,
          refreshing: false,
        }));
      }
    },
    [user?.id, chatService]
  );

  // Refresh both data sources
  const onRefresh = useCallback(async () => {
    setLoading((prev) => ({ ...prev, refreshing: true }));
    await Promise.all([loadRecentTracks(), loadChatHistory(1, true)]);
    setLoading((prev) => ({ ...prev, refreshing: false }));
  }, [loadRecentTracks, loadChatHistory]);

  // Handle track selection from Spotify history
  const handleTrackPress = (track: SpotifyTrack) => {
    router.goToChatDetail({
      trackId: track.id,
      trackName: track.name,
      artistName: track.artists.map((artist) => artist.name).join(', '),
    });
  };

  // Handle chat input submission
  const handleChatSubmit = useCallback(async () => {
    if (!chatInput.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Basic validation
      if (chatInput.trim().length < 3) {
        Alert.alert('Uyarı', 'Lütfen en az 3 karakter uzunluğunda bir mesaj yazın.');
        return;
      }

      if (chatInput.trim().length > 200) {
        Alert.alert('Uyarı', 'Mesaj çok uzun. Lütfen 200 karakterden kısa bir mesaj yazın.');
        return;
      }

      // Navigate to chat detail screen with the initial message
      router.goToChatDetail({
        initialMessage: chatInput.trim(),
        trackName: 'Genel Müzik Sohbeti',
        artistName: '',
      });

      setChatInput('');
    } catch (error) {
      console.error('Error submitting chat:', error);
      Alert.alert('Hata', 'Sohbet başlatılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  }, [chatInput, isSubmitting, router]);

  // Handle existing chat session selection
  const handleChatSessionPress = useCallback(
    (session: ChatSessionData) => {
      router.goToChatDetail({
        trackId: session.spotify_context?.trackId,
        trackName: session.spotify_context?.trackName,
        artistName: session.spotify_context?.artistName,
        sessionId: session.id,
      });
    },
    [router]
  );

  // Load more chat history
  const handleLoadMoreChats = useCallback(() => {
    if (!loading.chatHistory && hasMoreChats) {
      loadChatHistory(currentPage + 1);
    }
  }, [loading.chatHistory, hasMoreChats, currentPage, loadChatHistory]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading((prev) => ({ ...prev, initial: true }));
      await Promise.all([loadRecentTracks(), loadChatHistory(1)]);
      setLoading((prev) => ({ ...prev, initial: false }));
    };

    loadInitialData();
  }, [loadRecentTracks, loadChatHistory]);

  // Handle refresh when returning from chat screens
  useEffect(() => {
    if (chatSessionUpdated) {
      loadChatHistory(1, true);
      clearChatSessionUpdated();
    }
  }, [chatSessionUpdated, loadChatHistory, clearChatSessionUpdated]);

  // Helper functions for date formatting
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

  const formatChatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return diffInMinutes < 1 ? 'Şimdi' : `${diffInMinutes} dakika önce`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} saat önce`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      if (days === 1) {
        return 'Dün';
      } else if (days < 7) {
        return `${days} gün önce`;
      } else {
        return date.toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
      }
    }
  };

  const formatDuration = (durationMs: number): string => {
    if (!durationMs || durationMs <= 0) return '0 dk';

    const minutes = Math.floor(durationMs / (1000 * 60));
    if (minutes < 60) {
      return `${minutes} dk`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}s ${remainingMinutes}dk`;
  };

  const getAlbumImageUrl = (track: SpotifyTrack) => {
    if (track.album?.images && track.album.images.length > 0) {
      // Use the smallest image for better performance
      const lastImage = track.album.images[track.album.images.length - 1];
      return lastImage?.url || null;
    }
    return null;
  };

  const getInteractionTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      general: 'Genel',
      analysis: 'Analiz',
      recommendation: 'Öneri',
      lyrics: 'Sözler',
      mood: 'Ruh Hali',
      chat: 'Sohbet',
      music_chat: 'Müzik Sohbeti',
    };
    return labels[type] || 'Genel';
  };

  const getInteractionBadgeStyle = (type: string) => {
    const badgeStyles: Record<string, any> = {
      general: { backgroundColor: 'rgba(29, 185, 84, 0.2)', borderColor: 'rgba(29, 185, 84, 0.5)' },
      analysis: {
        backgroundColor: 'rgba(30, 144, 255, 0.2)',
        borderColor: 'rgba(30, 144, 255, 0.5)',
      },
      recommendation: {
        backgroundColor: 'rgba(255, 165, 0, 0.2)',
        borderColor: 'rgba(255, 165, 0, 0.5)',
      },
      lyrics: {
        backgroundColor: 'rgba(138, 43, 226, 0.2)',
        borderColor: 'rgba(138, 43, 226, 0.5)',
      },
      mood: { backgroundColor: 'rgba(255, 20, 147, 0.2)', borderColor: 'rgba(255, 20, 147, 0.5)' },
      chat: { backgroundColor: 'rgba(29, 185, 84, 0.2)', borderColor: 'rgba(29, 185, 84, 0.5)' },
      music_chat: {
        backgroundColor: 'rgba(29, 185, 84, 0.2)',
        borderColor: 'rgba(29, 185, 84, 0.5)',
      },
    };
    return badgeStyles[type] || badgeStyles.general;
  };

  // Render methods
  const renderChatInputSection = () => (
    <View style={styles.chatInputSection}>
      <View style={styles.chatInputContainer}>
        <Text style={styles.chatInputTitle}>Bana soru sor</Text>
        <Text style={styles.chatInputSubtitle}>Müzik hakkında her şeyi sorabilirsiniz</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.chatInput}
            placeholder="Bir şarkı veya müzik konusu hakkında sohbet et..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={chatInput}
            onChangeText={setChatInput}
            onSubmitEditing={handleChatSubmit}
            returnKeyType="send"
            multiline={false}
            maxLength={200}
            editable={!isSubmitting}
            accessible={true}
            accessibilityLabel="Müzik sohbeti için mesaj yazın"
            accessibilityHint="Müzik hakkında bir soru yazın ve göndermek için enter tuşuna basın"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!chatInput.trim() || isSubmitting) && styles.sendButtonDisabled,
            ]}
            onPress={handleChatSubmit}
            disabled={!chatInput.trim() || isSubmitting}
            accessible={true}
            accessibilityLabel={isSubmitting ? 'Mesaj gönderiliyor' : 'Mesaj gönder'}
            accessibilityHint="Yazdığınız mesajı göndermek için dokunun"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather
                name="send"
                size={20}
                color={!chatInput.trim() ? 'rgba(255,255,255,0.3)' : '#fff'}
              />
            )}
          </TouchableOpacity>
        </View>
        {chatInput.length > 0 && <Text style={styles.characterCount}>{chatInput.length}/200</Text>}
      </View>
    </View>
  );

  const renderChatHistoryItem = useCallback(
    ({ item }: { item: ChatSessionData }) => {
      const songName = item.spotify_context?.trackName || 'Genel Sohbet';
      const artistName = item.spotify_context?.artistName || '';
      const messageCount = item.session_metadata?.message_count || 0;
      const sessionDuration = item.session_metadata?.session_duration_ms || 0;
      const lastMessage = item.session_metadata?.last_message || '';
      const interactionType = item.session_metadata?.interaction_type || 'general';

      const lastMessageContent =
        item.messages && item.messages.length > 0
          ? item.messages[item.messages.length - 1]?.content
          : lastMessage;

      return (
        <TouchableOpacity
          style={styles.chatCard}
          onPress={() => handleChatSessionPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.chatCardHeader}>
            <View style={styles.chatDateContainer}>
              <Feather name="clock" size={14} color="rgba(255,255,255,0.6)" />
              <Text style={styles.chatDateText}>{formatChatDate(item.created_at)}</Text>
            </View>
            <View style={styles.chatStatsContainer}>
              <View style={styles.chatStatItem}>
                <Feather name="message-circle" size={12} color="rgba(255,255,255,0.6)" />
                <Text style={styles.chatStatText}>{messageCount}</Text>
              </View>
              <View style={styles.chatStatItem}>
                <Feather name="clock" size={12} color="rgba(255,255,255,0.6)" />
                <Text style={styles.chatStatText}>{formatDuration(sessionDuration)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.chatCardContent}>
            <Text style={styles.chatTitle} numberOfLines={2}>
              {songName}
              {artistName && ` • ${artistName}`}
            </Text>
            <View style={styles.lastMessageContainer}>
              <Feather name="corner-down-right" size={14} color="rgba(255,255,255,0.4)" />
              <Text style={styles.lastMessageText} numberOfLines={1}>
                {lastMessageContent || 'Sohbete devam et'}
              </Text>
            </View>
          </View>

          <View style={styles.chatCardFooter}>
            <View style={styles.interactionTypeContainer}>
              <View style={[styles.interactionBadge, getInteractionBadgeStyle(interactionType)]}>
                <Text style={styles.interactionText}>
                  {getInteractionTypeLabel(interactionType)}
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.3)" />
          </View>
        </TouchableOpacity>
      );
    },
    [
      handleChatSessionPress,
      formatChatDate,
      formatDuration,
      getInteractionTypeLabel,
      getInteractionBadgeStyle,
    ]
  );

  const renderChatHistoryFooter = useCallback(() => {
    if (!loading.chatHistory) return null;

    return (
      <View style={styles.chatHistoryFooter}>
        <ActivityIndicator size="small" color="#1DB954" />
        <Text style={styles.chatHistoryFooterText}>Daha fazla sohbet yükleniyor...</Text>
      </View>
    );
  }, [loading.chatHistory]);

  if (loading.initial) {
    return (
      <MainLayout
        title={`Selam ${user?.user_metadata?.name}! 👋`}
        subtitle="Yükleniyor..."
        showChatInput={false}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title={`Selam ${user?.user_metadata?.name}! 👋`}
      subtitle="Müzik hakkında sohbet edin"
      showChatInput={false}
    >
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading.refreshing}
            onRefresh={onRefresh}
            tintColor="#1DB954"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Chat Input Section */}
        {renderChatInputSection()}

        {/* Chat History Section */}
        <View style={styles.chatHistorySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Geçmiş Sohbetler</Text>
            <Text style={styles.sectionSubtitle}>
              {chatSessions.length > 0 ? `${chatSessions.length} sohbet` : 'Henüz sohbet yok'}
            </Text>
          </View>

          {loading.chatHistory && chatSessions.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#1DB954" />
              <Text style={styles.loadingText}>Sohbet geçmişi yükleniyor...</Text>
            </View>
          ) : error.chatHistory ? (
            <View style={styles.emptyContainer}>
              <Feather name="wifi-off" size={48} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyText}>Sohbet geçmişine ulaşılamıyor</Text>
              <Text style={styles.emptySubtext}>{error.chatHistory}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => loadChatHistory(1)}>
                <Feather name="refresh-cw" size={16} color="#fff" />
                <Text style={styles.retryButtonText}>Tekrar Dene</Text>
              </TouchableOpacity>
            </View>
          ) : chatSessions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="message-circle" size={48} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyText}>Henüz sohbet geçmişiniz yok</Text>
              <Text style={styles.emptySubtext}>
                Yukarıdaki arama kutusunu kullanarak yeni bir sohbet başlatın
              </Text>
            </View>
          ) : (
            <FlatList
              data={chatSessions}
              renderItem={renderChatHistoryItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.chatItemSeparator} />}
              onEndReached={handleLoadMoreChats}
              onEndReachedThreshold={0.3}
              ListFooterComponent={renderChatHistoryFooter}
            />
          )}
        </View>

        {/* Spotify Tracks Section */}
        <View style={styles.spotifySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Dinlenenler</Text>
            <Text style={styles.sectionSubtitle}>
              Spotify geçmişinizden bir şarkı seçin ve AI asistanlarla sohbet edin
            </Text>
          </View>

          {loading.spotify ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#1DB954" />
              <Text style={styles.loadingText}>Şarkılar yükleniyor...</Text>
            </View>
          ) : error.spotify ? (
            <View style={styles.emptyContainer}>
              <Feather name="wifi-off" size={48} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyText}>Spotify verilerine ulaşılamıyor</Text>
              <Text style={styles.emptySubtext}>{error.spotify}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadRecentTracks}>
                <Feather name="refresh-cw" size={16} color="#fff" />
                <Text style={styles.retryButtonText}>Tekrar Dene</Text>
              </TouchableOpacity>
            </View>
          ) : recentTracks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="music" size={48} color="rgba(255,255,255,0.3)" />
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
        </View>
      </ScrollView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  // Chat Input Section
  chatInputSection: {
    marginBottom: 24,
  },
  chatInputContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  chatInputTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  chatInputSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chatInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    paddingVertical: 12,
    paddingRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(29, 185, 84, 0.3)',
  },
  characterCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'right',
    marginTop: 8,
  },
  // Chat History Section
  chatHistorySection: {
    marginBottom: 24,
  },
  chatCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chatCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chatDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chatDateText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  chatStatsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  chatStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chatStatText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  chatCardContent: {
    marginBottom: 12,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 22,
    marginBottom: 8,
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lastMessageText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
    fontStyle: 'italic',
  },
  chatCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  interactionTypeContainer: {
    flex: 1,
  },
  interactionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  interactionText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  chatItemSeparator: {
    height: 12,
  },
  chatHistoryFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  chatHistoryFooterText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  // Spotify Section
  spotifySection: {
    marginBottom: 24,
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.7,
    marginTop: 8,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  emptySubtext: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1DB954',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
