import { Feather } from '@expo/vector-icons';
import { MotiText, MotiView } from 'moti';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

import { useAuth } from '@/src/contexts/AuthContext';
import { useRouter } from '@/src/hooks/useRouter';
import { useNavigation } from '@/src/navigation/NavigationStore';
import {
  ChatMessage,
  createAssistantMessage,
  createLoadingMessage,
  createUserMessage,
} from '@/types/chat';
import { MelodAiService, type ChatContext, type MessageHistoryItem } from '@services/ai';
import { ChatService } from '@services/supabase';

interface ChatDetailScreenProps {
  params?: {
    sessionId?: string;
    trackId?: string;
    trackName?: string;
    artistName?: string;
    initialMessage?: string;
  };
}

export default function ChatDetailScreen({ params }: ChatDetailScreenProps) {
  const router = useRouter();
  const { markChatSessionUpdated } = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const { getSpotifyAccessToken } = useAuth();
  const trackName = params?.trackName || 'Müzik';
  const artistName = params?.artistName || '';
  const melodAiService = MelodAiService.getInstance();
  const chatService = ChatService.getInstance();

  // Check if there are any user messages (excluding welcome message for new sessions)
  const hasUserMessages = messages.some((message) => message.role === 'user');

  const buildContext = useCallback(
    async (): Promise<ChatContext> => ({
      userIntent: 'music_chat',
      spotifyData: {
        trackId: params?.trackId,
        trackName: params?.trackName,
        artistName: params?.artistName,
        currentToken: await getSpotifyAccessToken(),
      },
      userPreferences: {
        language: 'tr',
        timestamp: new Date().toISOString(),
      },
    }),
    [params?.trackId, params?.trackName, params?.artistName, getSpotifyAccessToken]
  );

  const convertMessagesToHistory = useCallback((messages: ChatMessage[]): MessageHistoryItem[] => {
    return messages
      .filter((msg) => !msg.isLoading)
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: msg.timestamp
          ? msg.timestamp instanceof Date
            ? msg.timestamp.toISOString()
            : new Date(msg.timestamp).toISOString()
          : new Date().toISOString(),
      }));
  }, []);

  const createWelcomeMessage = useCallback(
    (sessionId: string) =>
      createAssistantMessage(
        'Merhaba! Müzik hakkında herhangi bir konuda sohbet edebiliriz. Hangi konuda yardımcı olabilirim?',
        sessionId,
        params?.trackId
      ),
    [params?.trackId]
  );

  const initializeSession = useCallback(async () => {
    const initialSessionId = params?.sessionId || '';
    setSessionId(initialSessionId);

    if (initialSessionId) {
      try {
        const existingMessages = await chatService.getChatMessages(initialSessionId);
        if (existingMessages.length > 0) {
          setMessages(existingMessages);
        } else {
          setMessages([createWelcomeMessage(initialSessionId)]);
        }
      } catch (error) {
        console.error('Error loading chat session:', error);
        setMessages([createWelcomeMessage(initialSessionId)]);
      }
    } else {
      // Create new session through ChatService
      try {
        const newSessionId = await chatService.createChatSession({
          trackId: params?.trackId,
          trackName: params?.trackName,
          artistName: params?.artistName,
        });

        if (newSessionId) {
          setSessionId(newSessionId);
          setMessages([createWelcomeMessage(newSessionId)]);
        } else {
          // Fallback to local session ID if service fails
          const fallbackSessionId = `session_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          setSessionId(fallbackSessionId);
          setMessages([createWelcomeMessage(fallbackSessionId)]);
        }
      } catch (error) {
        console.error('Error creating chat session:', error);
        // Fallback to local session ID if service fails
        const fallbackSessionId = `session_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        setSessionId(fallbackSessionId);
        setMessages([createWelcomeMessage(fallbackSessionId)]);
      }
    }
  }, [
    params?.sessionId,
    params?.trackId,
    params?.trackName,
    params?.artistName,
    chatService,
    createWelcomeMessage,
  ]);

  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isLoading) return;

      try {
        setIsLoading(true);
        setError(null);

        // Create and display user message
        const userMessage = createUserMessage(messageText.trim(), sessionId, params?.trackId);
        setMessages((prev) => [...prev, userMessage]);

        // Save user message to Supabase and get potential new sessionId
        const newSessionId = await chatService.saveUserMessage(sessionId, messageText.trim(), {
          trackId: params?.trackId,
          trackName: params?.trackName,
          artistName: params?.artistName,
        });

        // Update sessionId if a new one was created
        if (newSessionId && newSessionId !== sessionId) {
          setSessionId(newSessionId);
          // Update the user message with the new sessionId
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === userMessage.id ? { ...msg, sessionId: newSessionId } : msg
            )
          );
        }

        // Add loading message
        const loadingMessage = createLoadingMessage(newSessionId || sessionId);
        setMessages((prev) => [...prev, loadingMessage]);

        // Get AI response with message history
        const messageHistory = convertMessagesToHistory(messages);
        const context = await buildContext();

        const response = await melodAiService.sendMessage(
          messageText.trim(),
          messageHistory,
          context
        );

        // Create and save AI response
        const aiMessage = createAssistantMessage(
          response.data.response,
          newSessionId || sessionId,
          params?.trackId
        );

        await chatService.saveAssistantMessage(
          newSessionId || sessionId,
          response.data.response,
          params?.trackId
        );

        // Replace loading message with AI response
        setMessages((prev) => prev.filter((msg) => !msg.isLoading).concat(aiMessage));
        setRetryCount(0);

        // Mark chat session as updated for home screen refresh
        markChatSessionUpdated();
      } catch (error) {
        console.error('Error sending message:', error);
        setError(error instanceof Error ? error.message : 'Failed to send message');
        setMessages((prev) => prev.filter((msg) => !msg.isLoading));

        Alert.alert('Hata', 'Mesaj gönderilirken bir hata oluştu. Tekrar denemek ister misiniz?', [
          { text: 'İptal', style: 'cancel' },
          { text: 'Tekrar Dene', onPress: () => handleRetry(messageText) },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [
      sessionId,
      params?.trackId,
      isLoading,
      chatService,
      melodAiService,
      buildContext,
      convertMessagesToHistory,
      messages,
    ]
  );

  const handleRetry = useCallback(
    async (messageText: string) => {
      if (retryCount >= 3) {
        Alert.alert('Hata', 'Maksimum deneme sayısına ulaşıldı. Lütfen daha sonra tekrar deneyin.');
        return;
      }
      setRetryCount((prev) => prev + 1);
      await handleSendMessage(messageText);
    },
    [retryCount]
  );

  useEffect(() => {
    initializeSession();
  }, [params, initializeSession]);

  useEffect(() => {
    // Handle initial message if provided (only for new sessions)
    if (params?.initialMessage && messages.length === 1 && !hasUserMessages && !params?.sessionId) {
      // Auto-send the initial message after session is initialized
      setTimeout(() => {
        handleSendMessage(params.initialMessage!);
      }, 500);
    }
  }, [
    params?.initialMessage,
    messages.length,
    hasUserMessages,
    params?.sessionId,
    handleSendMessage,
  ]);

  // Mark session updated when messages change (for home screen refresh)
  useEffect(() => {
    if (messages.length > 1) {
      // Only if there are actual conversation messages
      markChatSessionUpdated();
    }
  }, [messages.length, markChatSessionUpdated]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleInputSubmit = async () => {
    const messageText = inputText;
    setInputText('');
    await handleSendMessage(messageText);
  };

  const handleQuickAction = async (actionText: string) => {
    await handleSendMessage(actionText);
  };

  const formatTime = (date: Date) => date.toString().slice(16, 21);

  const handlePlayAction = async () => {
    setIsModalVisible(false);
    Alert.alert('Bilgi', 'Müzik çalma özelliği yakında gelecek!');
  };

  const handleShareAction = () => {
    setIsModalVisible(false);
    Alert.alert('📤 Paylaş', 'Paylaşım özelliği yakında gelecek!');
  };

  const renderMessage = (message: ChatMessage) => (
    <MotiView
      key={message.id}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: 300,
      }}
      style={[
        styles.messageContainer,
        message.role === 'user' ? styles.userMessageContainer : styles.aiMessageContainer,
      ]}
    >
      <MotiView
        from={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          damping: 15,
          stiffness: 150,
          delay: 100,
        }}
        style={[
          styles.messageBubble,
          message.role === 'user' ? styles.userMessageBubble : styles.aiMessageBubble,
          message.isLoading && styles.loadingMessageBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.role === 'user' ? styles.userMessageText : styles.aiMessageText,
            message.isLoading && styles.loadingMessageText,
          ]}
          accessible={true}
          accessibilityLabel={`${message.role === 'user' ? 'Kullanıcı' : 'AI'} mesajı: ${
            message.content
          }`}
        >
          {message.content}
        </Text>
        {message.isLoading && (
          <View style={styles.loadingContainer}>
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                type: 'timing',
                duration: 500,
                delay: 200,
              }}
              style={styles.loadingTextContainer}
            >
              <Feather name="music" size={16} color="#1DB954" style={styles.loadingIcon} />
              <MotiText
                from={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{
                  type: 'timing',
                  duration: 1000,
                  loop: true,
                }}
                style={styles.loadingText}
              >
                AI şarkıyı analiz ediyor...
              </MotiText>
            </MotiView>
            <View style={styles.loadingDots}>
              <MotiView
                from={{ scale: 0.8, opacity: 0.3 }}
                animate={{ scale: 1.2, opacity: 1 }}
                transition={{
                  type: 'timing',
                  duration: 600,
                  loop: true,
                  delay: 0,
                }}
                style={[styles.dot, { backgroundColor: '#1DB954' }]}
              />
              <MotiView
                from={{ scale: 0.8, opacity: 0.3 }}
                animate={{ scale: 1.2, opacity: 1 }}
                transition={{
                  type: 'timing',
                  duration: 600,
                  loop: true,
                  delay: 200,
                }}
                style={[styles.dot, { backgroundColor: '#1DB954' }]}
              />
              <MotiView
                from={{ scale: 0.8, opacity: 0.3 }}
                animate={{ scale: 1.2, opacity: 1 }}
                transition={{
                  type: 'timing',
                  duration: 600,
                  loop: true,
                  delay: 400,
                }}
                style={[styles.dot, { backgroundColor: '#1DB954' }]}
              />
            </View>
            <MotiView
              from={{ rotate: '0deg' }}
              animate={{ rotate: '360deg' }}
              transition={{
                type: 'timing',
                duration: 2000,
                loop: true,
              }}
              style={styles.loadingSpinner}
            >
              <Feather name="disc" size={20} color="#1DB954" />
            </MotiView>
          </View>
        )}
      </MotiView>
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          type: 'timing',
          duration: 400,
          delay: 300,
        }}
      >
        <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
      </MotiView>
    </MotiView>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.quickActionsTitle}>Hızlı Seçenekler</Text>
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => handleQuickAction('Bana bu şarkının sözlerini söyler misin?')}
        disabled={isLoading}
        accessible={true}
        accessibilityLabel="Şarkı sözleri hakkında sor"
      >
        <Feather name="music" size={20} color="#fff" />
        <Text style={styles.quickActionText}>Şarkı sözleri</Text>
        <Text style={styles.quickActionSubtext}>
          Şarkı sözlerini ve anlamlarını merak mı ediyorsunuz?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => handleQuickAction('Bana bu şarkının oluşturulma hikayesini söyler misin?')}
        disabled={isLoading}
        accessible={true}
        accessibilityLabel="Şarkının hikayesi hakkında sor"
      >
        <Feather name="book-open" size={20} color="#fff" />
        <Text style={styles.quickActionText}>Hikayesi</Text>
        <Text style={styles.quickActionSubtext}>Bu şarkıyı kim nasıl oluşturdu sizce?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => handleQuickAction('Benzer şarkılar neler?')}
        disabled={isLoading}
        accessible={true}
        accessibilityLabel="Yardım al"
      >
        <Feather name="info" size={20} color="#fff" />
        <Text style={styles.quickActionText}>Benzer şarkılar</Text>
        <Text style={styles.quickActionSubtext}>Benzer şarkılar neler?</Text>
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.goBack()}
          accessible={true}
          accessibilityLabel="Geri git"
        >
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
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => setIsModalVisible(true)}
          accessible={true}
          accessibilityLabel="Daha fazla seçenek"
        >
          <Feather name="more-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => setError(null)}
            accessible={true}
            accessibilityLabel="Hatayı kapat"
          >
            <Feather name="x" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

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

      {/* Input Area - show if there are user messages */}
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
              onSubmitEditing={handleInputSubmit}
              returnKeyType="send"
              accessible={true}
              accessibilityLabel="Mesaj yaz"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={handleInputSubmit}
              disabled={!inputText.trim() || isLoading}
              accessible={true}
              accessibilityLabel="Mesaj gönder"
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
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handlePlayAction}
              accessible={true}
              accessibilityLabel="Şarkıyı çal"
            >
              <Feather name="play" size={20} color="#fff" />
              <Text style={styles.modalButtonText}>Çal</Text>
            </TouchableOpacity>

            <View style={styles.modalDivider} />

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleShareAction}
              accessible={true}
              accessibilityLabel="Paylaş"
            >
              <Feather name="share-2" size={20} color="#fff" />
              <Text style={styles.modalButtonText}>Paylaş</Text>
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
  errorBanner: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  loadingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  loadingIcon: {
    marginRight: 6,
  },
  loadingText: {
    fontSize: 12,
    color: '#1DB954',
    fontWeight: '500',
  },
  loadingSpinner: {
    marginLeft: 8,
  },
});
