import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MainLayout } from '../../components/Layout';
import { useRouter } from '../../hooks/useRouter';

interface ChatScreenProps {
  params?: {
    trackId?: string;
  };
}

export default function ChatScreen({ params }: ChatScreenProps) {
  const router = useRouter();
  const trackId = params?.trackId || router.params.trackId;

  return (
    <MainLayout title="AI Chat" subtitle="Şarkı hakkında AI asistanlarla sohbet edin">
      <View style={styles.content}>
        <Text style={styles.title}>Chat Ekranı</Text>
        <Text style={styles.subtitle}>Track ID: {trackId}</Text>
        <Text style={styles.info}>
          Bu ekranda seçilen şarkı hakkında AI asistanlarla sohbet edeceksiniz.
        </Text>

        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonTitle}>🚧 Yakında Geliyor</Text>
          <Text style={styles.comingSoonText}>
            Bu özellik henüz geliştiriliyor. Şarkı detayları, AI asistan seçimi ve gerçek zamanlı
            sohbet özelliği burada olacak.
          </Text>
        </View>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#1DB954',
    textAlign: 'center',
    marginBottom: 24,
  },
  info: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 40,
    lineHeight: 20,
  },
  comingSoon: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
