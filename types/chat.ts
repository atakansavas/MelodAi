export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentId?: string;
  trackId?: string;
}

export interface Conversation {
  id: string;
  trackId: string;
  agentId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatState {
  conversations: Map<string, Conversation>;
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
}