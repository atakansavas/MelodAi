import { Feather } from '@expo/vector-icons';
import { MotiText, MotiView } from 'moti';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useRouter } from '@/src/hooks/useRouter';
import { ChatMessage, createAssistantMessage, createUserMessage } from '@/types/chat';

interface AnonChatScreenProps {
  params?: {
    sessionId?: string;
  };
}

// Simulated responses for different user inputs
const SIMULATED_RESPONSES = {
  default: [
    'Merhaba! Ben müzik asistanınız. Size nasıl yardımcı olabilirim?',
    'Müzik hakkında herhangi bir konuda sohbet edebiliriz. Hangi konuda yardımcı olabilirim?',
    'Hoş geldiniz! Müzik dünyasına hoş geldiniz. Size nasıl yardımcı olabilirim?',
  ],
  lyrics: [
    'Şarkı sözleri çok önemli bir konu! Sözler, şarkının ruhunu ve anlamını taşır. Hangi şarkının sözlerini merak ediyorsunuz?',
    'Sözler olmadan müzik eksik kalır. Hangi şarkının sözlerini analiz etmek istiyorsunuz?',
    'Şarkı sözleri bazen hayatımızın aynası olur. Hangi şarkının sözlerini incelemek istiyorsunuz?',
  ],
  story: [
    'Her şarkının arkasında bir hikaye vardır. Hangi şarkının hikayesini merak ediyorsunuz?',
    'Şarkıların oluşturulma süreçleri çok ilginçtir. Hangi şarkının hikayesini dinlemek istiyorsunuz?',
    'Her şarkının bir doğuş hikayesi vardır. Hangi şarkının hikayesini öğrenmek istiyorsunuz?',
  ],
  similar: [
    'Benzer şarkılar bulmak için önce hangi şarkıyı seviyorsunuz?',
    'Müzik zevkinizi anlayıp size benzer şarkılar önerebilirim. Hangi şarkıyı seviyorsunuz?',
    'Benzer şarkılar keşfetmek harika! Hangi şarkıya benzer şarkılar arıyorsunuz?',
  ],
  mood: [
    'Müzik ruh halimizi çok etkiler. Hangi ruh halindesiniz?',
    'Müzik ve ruh hali arasında güçlü bir bağ var. Nasıl hissediyorsunuz?',
    'Ruh halinize uygun müzik önerebilirim. Nasıl hissediyorsunuz?',
  ],
  genre: [
    'Hangi müzik türünü seviyorsunuz? Rock, pop, jazz, klasik...',
    'Müzik türleri çok çeşitlidir. Hangi türü keşfetmek istiyorsunuz?',
    'Her müzik türünün kendine özgü bir karakteri vardır. Hangi türü seviyorsunuz?',
  ],
};

const QUICK_ACTIONS = [
  {
    id: 'lyrics',
    title: 'Şarkı Sözleri',
    subtitle: 'Şarkı sözlerini ve anlamlarını analiz edelim',
    icon: 'music',
    response: 'lyrics',
  },
  {
    id: 'story',
    title: 'Şarkı Hikayesi',
    subtitle: 'Bu şarkının oluşturulma hikayesini öğrenelim',
    icon: 'book-open',
    response: 'story',
  },
  {
    id: 'similar',
    title: 'Benzer Şarkılar',
    subtitle: 'Benzer şarkılar keşfedelim',
    icon: 'layers',
    response: 'similar',
  },
  {
    id: 'mood',
    title: 'Ruh Hali',
    subtitle: 'Ruh halinize uygun müzik önerileri',
    icon: 'heart',
    response: 'mood',
  },
  {
    id: 'genre',
    title: 'Müzik Türleri',
    subtitle: 'Farklı müzik türlerini keşfedelim',
    icon: 'disc',
    response: 'genre',
  },
];

export default function AnonChatScreen({ params }: AnonChatScreenProps) {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if there are any user messages
  const hasUserMessages = messages.some((message) => message.role === 'user');

  const createWelcomeMessage = useCallback(
    (sessionId: string) =>
      createAssistantMessage(
        'Merhaba! Ben müzik asistanınız. Test modunda çalışıyorum ve size müzik hakkında yardımcı olabilirim. Hangi konuda sohbet etmek istiyorsunuz?',
        sessionId
      ),
    []
  );

  const getRandomResponse = (category: keyof typeof SIMULATED_RESPONSES) => {
    const responses = SIMULATED_RESPONSES[category];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const simulateResponse = useCallback(
    async (userMessage: string) => {
      setIsLoading(true);

      // Simulate loading time
      await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

      let responseCategory: keyof typeof SIMULATED_RESPONSES = 'default';

      // Determine response category based on user input
      const lowerMessage = userMessage.toLowerCase();
      if (lowerMessage.includes('söz') || lowerMessage.includes('lyric')) {
        responseCategory = 'lyrics';
      } else if (lowerMessage.includes('hikaye') || lowerMessage.includes('story')) {
        responseCategory = 'story';
      } else if (lowerMessage.includes('benzer') || lowerMessage.includes('similar')) {
        responseCategory = 'similar';
      } else if (lowerMessage.includes('ruh') || lowerMessage.includes('mood')) {
        responseCategory = 'mood';
      } else if (lowerMessage.includes('tür') || lowerMessage.includes('genre')) {
        responseCategory = 'genre';
      }

      const response = getRandomResponse(responseCategory);
      const assistantMessage = createAssistantMessage(response, params?.sessionId || 'anon');

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    },
    [params?.sessionId]
  );

  const handleQuickAction = useCallback(
    async (action: (typeof QUICK_ACTIONS)[0]) => {
      const userMessage = createUserMessage(action.title, params?.sessionId || 'anon');
      setMessages((prev) => [...prev, userMessage]);

      await simulateResponse(action.title);
    },
    [params?.sessionId, simulateResponse]
  );

  const handleInputSubmit = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = createUserMessage(inputText.trim(), params?.sessionId || 'anon');
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    await simulateResponse(inputText.trim());
  }, [inputText, isLoading, params?.sessionId, simulateResponse]);

  const formatTime = (date: Date) => date.toString().slice(16, 21);

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
                AI düşünüyor...
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
      {QUICK_ACTIONS.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={styles.quickActionButton}
          onPress={() => handleQuickAction(action)}
          disabled={isLoading}
          accessible={true}
          accessibilityLabel={action.title}
        >
          <Feather name={action.icon as any} size={20} color="#fff" />
          <Text style={styles.quickActionText}>{action.title}</Text>
          <Text style={styles.quickActionSubtext}>{action.subtitle}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const handleContinueWithSpotify = () => {
    router.navigate('AUTH_LOGIN');
  };

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      const welcomeMessage = createWelcomeMessage(params?.sessionId || 'anon');
      setMessages([welcomeMessage]);
    }
  }, [messages.length, createWelcomeMessage, params?.sessionId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

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
          <Text style={styles.headerTitle}>Test Modu - AI Müzik Asistanı</Text>
          <Text style={styles.headerSubtitle}>Spotify bağlantısı olmadan test edin</Text>
        </View>
        <TouchableOpacity
          style={styles.spotifyButton}
          onPress={handleContinueWithSpotify}
          accessible={true}
          accessibilityLabel="Spotify ile devam et"
        >
          <Feather name="music" size={20} color="#1DB954" />
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

      {/* Spotify Continue Button at bottom */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.continueWithSpotifyButton}
          onPress={handleContinueWithSpotify}
          accessible={true}
          accessibilityLabel="Spotify ile devam et"
        >
          <Feather name="music" size={20} color="#1DB954" />
          <Text style={styles.continueWithSpotifyText}>Spotify ile Devam Et</Text>
        </TouchableOpacity>
      </View>
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
  spotifyButton: {
    padding: 8,
    backgroundColor: 'rgba(29, 185, 84, 0.2)',
    borderRadius: 8,
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
  bottomContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  continueWithSpotifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(29, 185, 84, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  continueWithSpotifyText: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
});
