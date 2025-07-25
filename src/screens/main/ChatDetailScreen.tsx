import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SpotifyApiService } from '@services/spotify';

import { SpotifyTrack } from '../../../types/spotify';
import { useRouter } from '../../hooks/useRouter';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatDetailScreenProps {
  params?: {
    trackId?: string;
    trackName?: string;
    artistName?: string;
  };
}

export default function ChatDetailScreen({ params }: ChatDetailScreenProps) {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Merhaba! Müzik hakkında herhangi bir konuda sohbet edebiliriz. Hangi konuda yardımcı olabilirim?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const trackName = params?.trackName || 'Müzik';
  const artistName = params?.artistName || '';

  // Check if there are any user messages
  const hasUserMessages = messages.some((message) => message.isUser);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleQuickAction = async (actionText: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: actionText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'AI düşünüyor...',
      isUser: false,
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // Simulate AI response (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const aiResponses = [
        'Bu şarkı gerçekten harika! Müzik teorisi açısından bakarsak, bu parça çok güzel bir melodi yapısına sahip.',
        'Bu sanatçının diğer eserlerini de dinlemenizi öneririm. Benzer tarzda başka önerilerim de var.',
        'Müzik tarihinde bu tür eserlerin önemli bir yeri var. Hangi dönem hakkında daha fazla bilgi almak istersiniz?',
        'Bu şarkının sözleri gerçekten derin anlamlar taşıyor. Sanatçının hayatından izler bulabilirsiniz.',
        'Müzik prodüksiyonu açısından bu parça çok başarılı. Hangi teknik detaylar hakkında konuşmak istersiniz?',
        'Bu tür müzik dinlemek ruh halinizi nasıl etkiliyor? Müziğin psikolojik etkileri hakkında konuşabiliriz.',
        'Bu sanatçının kariyer yolculuğu gerçekten ilham verici. Başka hangi sanatçıları takip ediyorsunuz?',
        'Müzik türleri arasında geçiş yapmak her zaman ilginç. Hangi türleri keşfetmek istiyorsunuz?',
      ];

      const randomResponse =
        aiResponses[Math.floor(Math.random() * aiResponses.length)] ||
        'Merhaba! Size nasıl yardımcı olabilirim?';

      const aiMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: randomResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => prev.filter((msg) => !msg.isLoading).concat(aiMessage));
    } catch (error) {
      console.error('Error getting AI response:', error);
      Alert.alert('Hata', 'AI yanıtı alınırken bir hata oluştu. Lütfen tekrar deneyin.');

      // Remove loading message
      setMessages((prev) => prev.filter((msg) => !msg.isLoading));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'AI düşünüyor...',
      isUser: false,
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // Simulate AI response (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const aiResponses = [
        'Bu şarkı gerçekten harika! Müzik teorisi açısından bakarsak, bu parça çok güzel bir melodi yapısına sahip.',
        'Bu sanatçının diğer eserlerini de dinlemenizi öneririm. Benzer tarzda başka önerilerim de var.',
        'Müzik tarihinde bu tür eserlerin önemli bir yeri var. Hangi dönem hakkında daha fazla bilgi almak istersiniz?',
        'Bu şarkının sözleri gerçekten derin anlamlar taşıyor. Sanatçının hayatından izler bulabilirsiniz.',
        'Müzik prodüksiyonu açısından bu parça çok başarılı. Hangi teknik detaylar hakkında konuşmak istersiniz?',
        'Bu tür müzik dinlemek ruh halinizi nasıl etkiliyor? Müziğin psikolojik etkileri hakkında konuşabiliriz.',
        'Bu sanatçının kariyer yolculuğu gerçekten ilham verici. Başka hangi sanatçıları takip ediyorsunuz?',
        'Müzik türleri arasında geçiş yapmak her zaman ilginç. Hangi türleri keşfetmek istiyorsunuz?',
      ];

      const randomResponse =
        aiResponses[Math.floor(Math.random() * aiResponses.length)] ||
        'Merhaba! Size nasıl yardımcı olabilirim?';

      const aiMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: randomResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => prev.filter((msg) => !msg.isLoading).concat(aiMessage));
    } catch (error) {
      console.error('Error getting AI response:', error);
      Alert.alert('Hata', 'AI yanıtı alınırken bir hata oluştu. Lütfen tekrar deneyin.');

      // Remove loading message
      setMessages((prev) => prev.filter((msg) => !msg.isLoading));
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePlayAction = async () => {
    setIsModalVisible(false);

    try {
      const spotifyApi = SpotifyApiService.getInstance();

      // Check if we have a trackId
      if (!params?.trackId) {
        Alert.alert('Hata', 'Şarkı bilgisi bulunamadı.');
        return;
      }

      // Get track details first
      const trackDetails: SpotifyTrack = await spotifyApi.getTrack(params.trackId);

      // Start playback with the track
      await spotifyApi.startPlayback(params.trackId);

      Alert.alert(
        '🎵 Çalınıyor',
        `${trackDetails.name} - ${trackDetails.artists.map((artist) => artist.name).join(', ')}`
      );
    } catch (error) {
      console.error('Error playing track:', error);
      Alert.alert(
        'Hata',
        'Şarkı çalınırken bir hata oluştu. Spotify Premium hesabınızın aktif olduğundan emin olun.'
      );
    }
  };

  const handleComingSoonAction = () => {
    setIsModalVisible(false);
    Alert.alert('🚧 Yakında', 'Bu özellik yakında gelecek!');
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          message.isUser ? styles.userMessageBubble : styles.aiMessageBubble,
          message.isLoading && styles.loadingMessageBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.isUser ? styles.userMessageText : styles.aiMessageText,
            message.isLoading && styles.loadingMessageText,
          ]}
        >
          {message.text}
        </Text>
        {message.isLoading && (
          <View style={styles.loadingDots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        )}
      </View>
      <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.quickActionsTitle}>Hızlı Seçenekler</Text>
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => handleQuickAction('Şarkı sözleri')}
        disabled={isLoading}
      >
        <Feather name="music" size={20} color="#fff" />
        <Text style={styles.quickActionText}>Şarkı sözleri</Text>
        <Text style={styles.quickActionSubtext}>
          Şarkı sözlerini ve anlamlarını merak mı ediyorsunuz?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => handleQuickAction('Hikayesi')}
        disabled={isLoading}
      >
        <Feather name="book-open" size={20} color="#fff" />
        <Text style={styles.quickActionText}>Hikayesi</Text>
        <Text style={styles.quickActionSubtext}>Bu şarkıyı kim nasıl oluşturdu sizce?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => handleQuickAction('Rastgele')}
        disabled={isLoading}
      >
        <Feather name="shuffle" size={20} color="#fff" />
        <Text style={styles.quickActionText}>Rastgele</Text>
        <Text style={styles.quickActionSubtext}>Bu şarkının tarzı ne?</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.goBack()}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>AI Müzik Asistanı</Text>
          {trackName && (
            <Text style={styles.headerSubtitle}>
              {trackName}
              {artistName && ` • ${artistName}`}
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.moreButton} onPress={() => setIsModalVisible(true)}>
          <Feather name="more-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}

        {/* Quick Actions - only show if no user messages */}
        {!hasUserMessages && !isLoading && renderQuickActions()}
      </ScrollView>

      {/* Input Area - only show if there are user messages */}
      {hasUserMessages && (
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Müzik hakkında bir şeyler yazın..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Feather
                name="send"
                size={20}
                color={!inputText.trim() || isLoading ? 'rgba(255,255,255,0.3)' : '#fff'}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Action Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalButton} onPress={handlePlayAction}>
              <Feather name="play" size={20} color="#fff" />
              <Text style={styles.modalButtonText}>Çal</Text>
            </TouchableOpacity>

            <View style={styles.modalDivider} />

            <TouchableOpacity style={styles.modalButton} onPress={handleComingSoonAction}>
              <Feather name="clock" size={20} color="#fff" />
              <Text style={styles.modalButtonText}>Yakında</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(92, 50, 129, 0.95)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.7,
  },
  moreButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 4,
  },
  userMessageBubble: {
    backgroundColor: '#1DB954',
    borderBottomRightRadius: 4,
  },
  aiMessageBubble: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderBottomLeftRadius: 4,
  },
  loadingMessageBubble: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
    fontWeight: '500',
  },
  aiMessageText: {
    color: '#fff',
  },
  loadingMessageText: {
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
  },
  messageTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 2,
  },
  quickActionsContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  quickActionButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
    flex: 1,
  },
  quickActionSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 12,
    flex: 2,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    maxHeight: 100,
    paddingVertical: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#282828',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  modalDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: '100%',
    marginVertical: 15,
  },
});
