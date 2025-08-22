import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { MainLayout } from '@/src/components/Layout';
import { useRouter } from '@/src/hooks/useRouter';

type ChatListItem = {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
};

export default function AppMainScreen() {
  const router = useRouter();

  const chats = useMemo<ChatListItem[]>(
    () => [
      {
        id: '1',
        title: 'Genel Müzik Sohbeti',
        subtitle: 'Yeni bir sohbet başlatın',
        timestamp: 'Now',
      },
      {
        id: '2',
        title: 'Sevdiğim Şarkılar',
        subtitle: 'Son konuşma: Benzer şarkılar',
        timestamp: 'Dün',
      },
      {
        id: '3',
        title: 'AI Müzik Analizi',
        subtitle: 'Ritmik yapı analizi',
        timestamp: 'Geçen hafta',
      },
    ],
    []
  );

  const renderItem = ({ item }: { item: ChatListItem }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => router.goToChatDetail({ initialMessage: item.title })}
    >
      <View style={styles.chatAvatar}>
        <Text style={styles.chatAvatarText}>💬</Text>
      </View>
      <View style={styles.chatContent}>
        <Text style={styles.chatTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.chatSubtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
      <View style={styles.chatMeta}>
        <Text style={styles.chatTime}>{item.timestamp}</Text>
      </View>
    </TouchableOpacity>
  );

  const listHeader = (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Sohbetler</Text>
      <Text style={styles.headerSubtitle}>Müzik ile ilgili konuşmalarınızı yönetin</Text>
    </View>
  );

  return (
    <MainLayout title="Spot Song" subtitle="Müzik hakkında sohbet edin" showChatInput={false}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
      />
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerContainer: {
    marginBottom: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#fff',
    opacity: 0.6,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  chatAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chatAvatarText: {
    fontSize: 20,
  },
  chatContent: {
    flex: 1,
  },
  chatTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  chatSubtitle: {
    color: '#fff',
    opacity: 0.7,
    fontSize: 13,
  },
  chatMeta: {
    marginLeft: 8,
  },
  chatTime: {
    color: '#fff',
    opacity: 0.5,
    fontSize: 12,
  },
});
