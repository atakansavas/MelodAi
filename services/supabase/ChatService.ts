import { supabase } from '@/src/lib/supabase';
import { ChatMessage } from '@/types/chat';

export interface ChatSessionData {
  id: string;
  user_id: string;
  messages: ChatMessage[];
  spotify_context?: {
    trackId?: string;
    trackName?: string;
    artistName?: string;
    albumName?: string;
    albumArt?: string;
    duration?: number;
  } | null;
  session_metadata?: {
    message_count: number;
    session_duration_ms: number;
    interaction_type: string;
    last_message?: string;
  };
  created_at: string;
  updated_at: string;
}

export class ChatService {
  private static instance: ChatService;

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async getChatSession(sessionId: string): Promise<ChatSessionData | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.warn('User not authenticated, returning null for chat session');
        return null;
      }
      console.log('🚀 ~ ChatService ~ getChatSession ~ sessionId:', sessionId);

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching chat session:', error);
        return null;
      }

      // Ensure timestamps in messages are properly converted to Date objects
      if (data && data.messages) {
        data.messages = data.messages.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp
            ? msg.timestamp instanceof Date
              ? msg.timestamp
              : new Date(msg.timestamp)
            : new Date(),
        }));
      }

      return data;
    } catch (error) {
      console.error('Error in getChatSession:', error);
      return null;
    }
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.warn('User not authenticated, returning empty messages array');
        return [];
      }

      console.log('🚀 ~ ChatService ~ getChatMessages ~ sessionId:', sessionId);
      const session = await this.getChatSession(sessionId);
      if (!session) return [];

      // Ensure timestamps are properly converted to Date objects
      const messages = session.messages || [];
      return messages.map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp
          ? msg.timestamp instanceof Date
            ? msg.timestamp
            : new Date(msg.timestamp)
          : new Date(),
      }));
    } catch (error) {
      console.error('Error in getChatMessages:', error);
      return [];
    }
  }

  async createChatSession(spotifyContext?: {
    trackId?: string;
    trackName?: string;
    artistName?: string;
    albumName?: string;
    albumArt?: string;
    duration?: number;
  }): Promise<string | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.warn('User not authenticated, cannot create chat session');
        return null;
      }

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          messages: [],
          spotify_context: spotifyContext || null,
          session_metadata: {
            message_count: 0,
            session_duration_ms: 0,
            interaction_type: 'chat',
          },
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating chat session:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error in createChatSession:', error);
      return null;
    }
  }

  async saveUserMessage(
    sessionId: string,
    message: string,
    spotifyContext?: {
      trackId?: string;
      trackName?: string;
      artistName?: string;
      albumName?: string;
      albumArt?: string;
      duration?: number;
    }
  ): Promise<string | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.warn('User not authenticated, cannot save user message');
        return null;
      }

      console.log('🚀 ~ ChatService ~ saveUserMessage ~ sessionId:', sessionId);
      let session = await this.getChatSession(sessionId);
      if (!session) {
        const sessionDbId = await this.createChatSession(spotifyContext);
        if (!sessionDbId) {
          console.error('Failed to create chat session');
          return null;
        }
        session = await this.getChatSession(sessionDbId);
        sessionId = sessionDbId;
        if (!session) {
          console.error('Failed to get created chat session');
          return null;
        }
      }

      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'user',
        content: message,
        timestamp: new Date(),
        sessionId,
        trackId: spotifyContext?.trackId,
      };

      const updatedMessages = [...(session.messages || []), userMessage];
      const messageCount = (session.session_metadata?.message_count || 0) + 1;
      const sessionDuration = Date.now() - new Date(session.created_at).getTime();

      const { error } = await supabase
        .from('chat_sessions')
        .update({
          messages: updatedMessages,
          session_metadata: {
            ...session.session_metadata,
            message_count: messageCount,
            session_duration_ms: sessionDuration,
            last_message: message,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error saving user message:', error);
        return null;
      }

      return sessionId;
    } catch (error) {
      console.error('Error in saveUserMessage:', error);
      return null;
    }
  }

  async saveAssistantMessage(
    sessionId: string,
    response: string,
    trackId?: string
  ): Promise<string | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.warn('User not authenticated, cannot save assistant message');
        return null;
      }

      console.log('🚀 ~ ChatService ~ saveAssistantMessage ~ sessionId:', sessionId);
      const session = await this.getChatSession(sessionId);
      if (!session) {
        console.error('Chat session not found');
        return null;
      }

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        sessionId,
        trackId,
      };

      const updatedMessages = [...(session.messages || []), assistantMessage];
      const messageCount = (session.session_metadata?.message_count || 0) + 1;
      const sessionDuration = Date.now() - new Date(session.created_at).getTime();

      const { error } = await supabase
        .from('chat_sessions')
        .update({
          messages: updatedMessages,
          session_metadata: {
            ...session.session_metadata,
            message_count: messageCount,
            session_duration_ms: sessionDuration,
            last_message: response,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error saving assistant message:', error);
        return null;
      }

      return sessionId;
    } catch (error) {
      console.error('Error in saveAssistantMessage:', error);
      return null;
    }
  }

  async getChatSessions(): Promise<ChatSessionData[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.warn('User not authenticated, returning empty sessions array');
        return [];
      }

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching chat sessions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getChatSessions:', error);
      return [];
    }
  }

  async deleteChatSession(sessionId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.warn('User not authenticated, cannot delete chat session');
        return false;
      }

      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting chat session:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteChatSession:', error);
      return false;
    }
  }
}
