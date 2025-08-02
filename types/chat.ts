export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentId?: string;
  trackId?: string;
  isLoading?: boolean;
  sessionId?: string;
}

export interface Conversation {
  id: string;
  sessionId: string;
  trackId?: string;
  agentId?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  context?: Record<string, any>;
}

export interface ChatState {
  conversations: Map<string, Conversation>;
  activeConversationId: string | null;
  currentSessionId: string | null;
  isLoading: boolean;
  error: string | null;
}

// API Response types
export interface ChatApiResponse {
  success: boolean;
  data: {
    response: string;
    sessionId: string;
    isNewSession: boolean;
  };
  meta: {
    requestId: string;
    responseTime: number;
    timestamp: string;
  };
}

export interface ChatMessagePayload {
  message: string;
  sessionId: string;
  context: Record<string, any>;
}

// Utility functions for session management
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createUserMessage = (
  content: string,
  sessionId: string,
  trackId?: string
): ChatMessage => ({
  id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  role: 'user',
  content,
  timestamp: new Date(),
  sessionId,
  trackId,
});

export const createAssistantMessage = (
  content: string,
  sessionId: string,
  trackId?: string
): ChatMessage => ({
  id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  role: 'assistant',
  content,
  timestamp: new Date(),
  sessionId,
  trackId,
});

export const createLoadingMessage = (sessionId: string): ChatMessage => ({
  id: `loading_${Date.now()}`,
  role: 'assistant',
  content: 'AI düşünüyor...',
  timestamp: new Date(),
  sessionId,
  isLoading: true,
});

// TODO: Add proper types when implementing chat history
export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  session_duration_ms: number;
  trackId?: string;
  trackName?: string;
  artistName?: string;
  preview: {
    first_user_message: string;
    last_message: string;
  };
  interaction_type: string;
}

export interface ChatHistoryResponse {
  success: boolean;
  data: {
    sessions: ChatSession[];
    pagination: {
      page: number;
      hasMore: boolean;
    };
  };
}
