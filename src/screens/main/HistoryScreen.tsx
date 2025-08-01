import { Feather } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { MelodAiService } from '../../../services/ai/MelodAiService';
import type { ChatHistoryResponse, ChatSession } from '../../../types/chat';
import MainLayout from '../../components/Layout/MainLayout';
import { useRouter } from '../../hooks/useRouter';

interface LoadingState {
  initial: boolean;
  pagination: boolean;
  refreshing: boolean;
}

export default function HistoryScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    initial: true,
    pagination: false,
    refreshing: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const melodAiService = MelodAiService.getInstance();

  const loadChatSessions = useCallback(
    async (page: number = 1, isRefresh: boolean = false) => {
      try {
        if (page === 1) {
          setLoading((prev) => ({ ...prev, initial: !isRefresh, refreshing: isRefresh }));
          if (isRefresh) {
            setError(null);
          }
        } else {
          setLoading((prev) => ({ ...prev, pagination: true }));
        }

        const response: ChatHistoryResponse = await melodAiService.getChatHistorySessions(page, 10);

        if (response.success) {
          const newSessions = response.data.sessions;

          if (page === 1) {
            setSessions(newSessions);
          } else {
            setSessions((prevSessions) => [...prevSessions, ...newSessions]);
          }

          setCurrentPage(response.data.pagination.page);
          setHasMore(response.data.pagination.hasMore);
          setError(null);
        } else {
          throw new Error('Failed to load chat sessions');
        }
      } catch (error) {
        console.error('Error loading chat sessions:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Sohbet geçmişi yüklenirken bir hata oluştu.';
        setError(errorMessage);

        if (page === 1) {
          Alert.alert('Hata', errorMessage);
        }
      } finally {
        setLoading({
          initial: false,
          pagination: false,
          refreshing: false,
        });
      }
    },
    [melodAiService]
  );

  useEffect(() => {
    loadChatSessions(1);
  }, [loadChatSessions]);

  const handleRefresh = useCallback(() => {
    loadChatSessions(1, true);
  }, [loadChatSessions]);

  const handleLoadMore = useCallback(() => {
    if (!loading.pagination && hasMore && !error) {
      loadChatSessions(currentPage + 1);
    }
  }, [loading.pagination, hasMore, error, currentPage, loadChatSessions]);

  const handleRetry = useCallback(() => {
    setError(null);
    loadChatSessions(1);
  }, [loadChatSessions]);

  const formatDate = (dateString: string): string => {
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
    const minutes = Math.floor(durationMs / (1000 * 60));
    if (minutes < 60) {
      return `${minutes} dk`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}s ${remainingMinutes}dk`;
  };

  const handleSessionPress = useCallback(
    (session: ChatSession) => {
      router.goToChatDetail({
        sessionId: session.id,
      });
    },
    [router]
  );

  const renderSessionCard = useCallback(
    ({ item }: { item: ChatSession }) => (
      <TouchableOpacity
        style={styles.sessionCard}
        onPress={() => handleSessionPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.dateContainer}>
            <Feather name="clock" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Feather name="message-circle" size={12} color="rgba(255,255,255,0.6)" />
              <Text style={styles.statText}>{item.message_count}</Text>
            </View>
            <View style={styles.statItem}>
              <Feather name="clock" size={12} color="rgba(255,255,255,0.6)" />
              <Text style={styles.statText}>{formatDuration(item.session_duration_ms)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.firstMessage} numberOfLines={2}>
            {item.preview.first_user_message}
          </Text>
          <View style={styles.lastMessageContainer}>
            <Feather name="corner-down-right" size={14} color="rgba(255,255,255,0.4)" />
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.preview.last_message}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.interactionTypeContainer}>
            <View
              style={[styles.interactionBadge, getInteractionBadgeStyle(item.interaction_type)]}
            >
              <Text style={styles.interactionText}>
                {getInteractionTypeLabel(item.interaction_type)}
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.3)" />
        </View>
      </TouchableOpacity>
    ),
    [handleSessionPress]
  );

  const getInteractionTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      general: 'Genel',
      analysis: 'Analiz',
      recommendation: 'Öneri',
      lyrics: 'Sözler',
      mood: 'Ruh Hali',
    };
    return labels[type] || 'Genel';
  };

  const getInteractionBadgeStyle = (type: string) => {
    const styles: Record<string, any> = {
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
    };
    return styles[type] || styles.general;
  };

  const renderFooter = useCallback(() => {
    if (!loading.pagination) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#1DB954" />
        <Text style={styles.footerLoaderText}>Daha fazla sohbet yükleniyor...</Text>
      </View>
    );
  }, [loading.pagination]);

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Feather name="message-circle" size={64} color="rgba(255,255,255,0.3)" />
        <Text style={styles.emptyStateTitle}>Henüz sohbet geçmişiniz yok</Text>
        <Text style={styles.emptyStateSubtitle}>
          Bir şarkı hakkında konuşmaya başladığınızda, sohbetleriniz burada görünecek.
        </Text>
        <TouchableOpacity style={styles.startChatButton} onPress={() => router.goToHome()}>
          <Text style={styles.startChatButtonText}>Sohbete Başla</Text>
        </TouchableOpacity>
      </View>
    ),
    [router]
  );

  const renderErrorState = useCallback(
    () => (
      <View style={styles.errorState}>
        <Feather name="wifi-off" size={64} color="rgba(255,255,255,0.3)" />
        <Text style={styles.errorTitle}>Bağlantı Hatası</Text>
        <Text style={styles.errorSubtitle}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Feather name="refresh-cw" size={16} color="#fff" />
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    ),
    [error, handleRetry]
  );

  const renderLoadingState = useCallback(
    () => (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Sohbet geçmişi yükleniyor...</Text>
      </View>
    ),
    []
  );

  const getSubtitle = (): string => {
    if (loading.initial) return 'Yükleniyor...';
    if (error) return 'Bağlantı hatası';
    if (sessions.length === 0) return 'Henüz sohbet yok';
    return `${sessions.length} sohbet`;
  };

  if (loading.initial) {
    return (
      <MainLayout title="Sohbet Geçmişi" subtitle={getSubtitle()}>
        {renderLoadingState()}
      </MainLayout>
    );
  }

  if (error && sessions.length === 0) {
    return (
      <MainLayout title="Sohbet Geçmişi" subtitle={getSubtitle()}>
        {renderErrorState()}
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Sohbet Geçmişi" subtitle={getSubtitle()}>
      {sessions.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSessionCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={loading.refreshing}
              onRefresh={handleRefresh}
              colors={['#1DB954']}
              tintColor="#1DB954"
              title="Sohbet geçmişi yenileniyor..."
              titleColor="rgba(255,255,255,0.7)"
            />
          }
        />
      )}
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 16,
  },
  sessionCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  cardContent: {
    marginBottom: 12,
  },
  firstMessage: {
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
  lastMessage: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
    fontStyle: 'italic',
  },
  cardFooter: {
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
  separator: {
    height: 12,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  footerLoaderText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  startChatButton: {
    backgroundColor: '#1DB954',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  startChatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
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
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 16,
  },
});
