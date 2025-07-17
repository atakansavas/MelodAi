import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.goBack()}
        >
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Chat</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Chat Ekranı</Text>
        <Text style={styles.subtitle}>Track ID: {trackId}</Text>
        <Text style={styles.info}>
          Bu ekranda seçilen şarkı hakkında AI asistanlarla sohbet edeceksiniz.
        </Text>
        
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonTitle}>🚧 Yakında Geliyor</Text>
          <Text style={styles.comingSoonText}>
            Bu özellik henüz geliştiriliyor. Şarkı detayları, AI asistan seçimi 
            ve gerçek zamanlı sohbet özelliği burada olacak.
          </Text>
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
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
    backgroundColor: '#111',
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