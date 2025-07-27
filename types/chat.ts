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
