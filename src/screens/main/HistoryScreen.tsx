import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import MainLayout from '../../components/Layout/MainLayout';
import { useRouter } from '../../hooks/useRouter';

interface ChatHistory {
  id: string;
  trackName: string;
  artistName: string;
  trackId?: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

export default function HistoryScreen() {
  const router = useRouter();
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChatHistories();
  }, []);

  const loadChatHistories = async () => {
    try {
      setIsLoading(true);

      // Simulate loading chat histories
      // In a real app, this would come from a storage service or API
      const mockHistories: ChatHistory[] = [
        {
          id: '1',
          trackName: 'Bohemian Rhapsody',
          artistName: 'Queen',
          trackId: 'track1',
          lastMessage: 'Bu şarkının hikayesi gerçekten etkileyici...',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          messageCount: 12,
        },
        {
          id: '2',
          trackName: 'Imagine',
          artistName: 'John Lennon',
          trackId: 'track2',
          lastMessage: 'Şarkı sözleri hakkında konuştuk',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          messageCount: 8,
        },
        {
          id: '3',
          trackName: 'Hotel California',
          artistName: 'Eagles',
          trackId: 'track3',
          lastMessage: 'Gitar sololarının analizi...',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          messageCount: 15,
        },
        {
          id: '4',
          trackName: 'Billie Jean',
          artistName: 'Michael Jackson',
          trackId: 'track4',
          lastMessage: 'Dans hareketleri ve müzik uyumu',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          messageCount: 6,
        },
        {
          id: '5',
          trackName: 'Stairway to Heaven',
          artistName: 'Led Zeppelin',
          trackId: 'track5',
          lastMessage: 'Rock müziğinin evrimi üzerine',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
          messageCount: 20,
        },
      ];

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setChatHistories(mockHistories);
    } catch (error) {
      console.error('Error loading chat histories:', error);
      Alert.alert('Hata', 'Sohbet geçmişi yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} dakika önce`;
    } else if (diffInMinutes < 1440) {
      // 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} saat önce`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      if (days === 1) {
        return 'Dün';
      } else if (days < 7) {
        return `${days} gün önce`;
      } else {
        return timestamp.toLocaleDateString('tr-TR');
      }
    }
  };

  const handleChatPress = (chatHistory: ChatHistory) => {
    router.goToChatDetail({
      trackId: chatHistory.trackId,
      trackName: chatHistory.trackName,
      artistName: chatHistory.artistName,
    });
  };

  const handleDeleteChat = (chatId: string) => {
    Alert.alert('Sohbeti Sil', 'Bu sohbeti silmek istediğinizden emin misiniz?', [
      {
        text: 'İptal',
        style: 'cancel',
      },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          setChatHistories((prevHistories) =>
            prevHistories.filter((history) => history.id !== chatId)
          );
        },
      },
    ]);
  };

  const renderChatHistoryItem = ({ item }: { item: ChatHistory }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => handleChatPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.chatItemContent}>
        <View style={styles.chatItemHeader}>
          <View style={styles.trackInfo}>
            <Text style={styles.trackName} numberOfLines={1}>
              {item.trackName}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {item.artistName}
            </Text>
          </View>
          <View style={styles.chatMeta}>
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
            <View style={styles.messageCountBadge}>
              <Text style={styles.messageCount}>{item.messageCount}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.lastMessage} numberOfLines={2}>
          {item.lastMessage}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteChat(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Feather name="trash-2" size={16} color="rgba(255,255,255,0.5)" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
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
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <Feather name="loader" size={32} color="#fff" />
      <Text style={styles.loadingText}>Sohbet geçmişi yükleniyor...</Text>
    </View>
  );

  return (
    <MainLayout title="Sohbet Geçmişi" subtitle={`${chatHistories.length} sohbet`}>
      {isLoading ? (
        renderLoadingState()
      ) : chatHistories.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={chatHistories}
          renderItem={renderChatHistoryItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 16,
  },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  chatItemContent: {
    flex: 1,
  },
  chatItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  trackInfo: {
    flex: 1,
    marginRight: 12,
  },
  trackName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  artistName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  chatMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  messageCountBadge: {
    backgroundColor: '#1DB954',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  messageCount: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  lastMessage: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  separator: {
    height: 12,
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
