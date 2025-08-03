import { z } from 'zod';

import { API_CONFIG } from '../../constants/config';
import { supabase } from '../../src/lib/supabase';

// Helper schemas
const emailSchema = z.string().email('Invalid email format');
const countrySchema = z.string().min(2, 'Country code too short').max(3, 'Country code too long');
const urlSchema = z.string().url('Invalid URL format');

export const userRegistrationSchema = z.object({
  deviceInfo: z.object({
    deviceId: z.string().min(1, 'Device ID is required'),
    platform: z.string().min(1, 'Platform is required'),
    deviceName: z.string().min(1, 'Device name is required').max(100),
    osVersion: z.string().min(1, 'OS version is required').max(50),
    appVersion: z.string().min(1, 'App version is required').max(20),
    pushToken: z.string().max(200).optional(),
    notificationsEnabled: z.boolean().default(true),
  }),

  spotifyProfile: z.object({
    id: z.string().min(1, 'Spotify ID is required'),
    display_name: z.string().min(1, 'Display name is required').max(100),
    email: emailSchema,
    country: countrySchema,
    product: z.enum(['premium', 'free']),
    followers: z.number().min(0).default(0),
    images: z
      .array(
        z.object({
          url: urlSchema,
          height: z.number().positive().nullable().default(null),
          width: z.number().positive().nullable().default(null),
        })
      )
      .default([]),
    external_urls: z
      .object({
        spotify: urlSchema,
      })
      .optional(),
  }),

  preferences: z
    .object({
      preferred_genres: z.array(z.string().trim().toLowerCase()).max(20).default([]),
      language_preference: z.string().min(2).max(5).default('en'),
      timezone: z.string().default('UTC'),
      listening_habits: z.string().default(''),
      interaction_patterns: z.string().default(''),
      privacy_settings: z.string().default(''),
      notification_preferences: z
        .object({
          new_music: z.boolean().default(true),
          playlist_updates: z.boolean().default(true),
          recommendations: z.boolean().default(true),
          system_updates: z.boolean().default(true),
          marketing: z.boolean().default(false),
        })
        .optional(),
    })
    .optional(),
});

export type UserRegistrationData = z.infer<typeof userRegistrationSchema>;

export interface ChatStartData {
  trackId?: string;
  trackName?: string;
  artistName?: string;
  initialMessage?: string;
  timestamp: string;
}

// Add new interfaces for the chat API
export interface MessageHistoryItem {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ChatContext {
  userIntent?: string;
  spotifyData?: Record<string, any>;
  userPreferences?: Record<string, any>;
}

export interface ChatMessagePayload {
  message: string;
  messageHistory?: MessageHistoryItem[];
  context?: ChatContext;
}

export interface SpotifyData {
  tracks?: any[];
  artists?: any[];
  albums?: any[];
  currentPlayback?: Record<string, any>;
  recommendations?: any[];
  topTracks?: any[];
  topArtists?: any[];
  createdPlaylist?: Record<string, any>;
  actionTaken?: string;
  actionResult?: Record<string, any>;
}

export interface ChatApiResponse {
  success: boolean;
  data: {
    response: string;
    contextUsed?: string[];
    spotifyData?: SpotifyData;
    toolsUsed?: string[];
  };
  meta: {
    requestId: string;
    responseTime: number;
    timestamp: string;
  };
  error?: string;
  details?: string;
}

export interface ServiceCallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

export class MelodAiService {
  private static instance: MelodAiService;

  private constructor() {}

  public static getInstance(): MelodAiService {
    if (!MelodAiService.instance) {
      MelodAiService.instance = new MelodAiService();
    }
    return MelodAiService.instance;
  }

  /**
   * Helper method for making service calls
   */
  private async makeServiceCall(endpoint: string, options: ServiceCallOptions = {}): Promise<any> {
    try {
      if (!API_CONFIG.SERVICE_URL) {
        throw new Error('SERVICE_URL not configured');
      }

      const url = `${API_CONFIG.SERVICE_URL}${endpoint}`;
      const { method = 'GET', body, headers = {} } = options;
      console.log('🚀 ~ MelodAiService ~ makeServiceCall ~ url:', url);

      // Get Supabase session for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
      };

      // Add authorization header if session exists
      if (session?.access_token) {
        authHeaders['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(url, {
        method,
        headers: authHeaders,
        ...(body && { body: JSON.stringify(body) }),
      });

      console.log('🚀 ~ MelodAiService ~ makeServiceCall ~ response:', response);
      if (!response.ok) {
        throw new Error(`Service call failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Service call error:', error);
      throw error;
    }
  }

  /**
   * Start a new chat session
   */
  public async startChat(chatData: ChatStartData): Promise<any> {
    try {
      const response = await this.makeServiceCall('/chat/start', {
        method: 'POST',
        body: chatData,
      });

      return response;
    } catch (error) {
      console.error('Error starting chat:', error);
      throw error;
    }
  }

  /**
   * Send a message to the AI and get a response
   */
  public async sendMessage(
    message: string,
    messageHistory: MessageHistoryItem[] = [],
    context: ChatContext = {}
  ): Promise<ChatApiResponse> {
    try {
      const payload: ChatMessagePayload = {
        message,
        messageHistory,
        context,
      };
      console.log('🚀 ~ MelodAiService ~ sendMessage ~ payload:', payload);

      const response = await this.makeServiceCall('chat', {
        method: 'POST',
        body: payload,
      });

      // Validate response structure
      if (!response.success || !response.data) {
        throw new Error('Invalid response format from AI service');
      }

      return response as ChatApiResponse;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get chat history
   */
  public async getChatHistory(chatId: string): Promise<any> {
    try {
      const response = await this.makeServiceCall(`/chat/history/${chatId}`);
      return response;
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }

  /**
   * Analyze a track with AI
   */
  public async analyzeTrack(trackId: string): Promise<any> {
    try {
      const response = await this.makeServiceCall('/ai/analyze', {
        method: 'POST',
        body: {
          trackId,
          timestamp: new Date().toISOString(),
        },
      });

      return response;
    } catch (error) {
      console.error('Error analyzing track:', error);
      throw error;
    }
  }

  /**
   * Get AI recommendations based on a track
   */
  public async getRecommendations(trackId: string, limit: number = 10): Promise<any> {
    try {
      const response = await this.makeServiceCall('/ai/recommendations', {
        method: 'POST',
        body: {
          trackId,
          limit,
          timestamp: new Date().toISOString(),
        },
      });

      return response;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  /**
   * Register a new user
   */
  public async userRegister(userData: UserRegistrationData): Promise<any> {
    try {
      // Validate the data against the schema
      const validatedData = userRegistrationSchema.parse(userData);

      const response = await this.makeServiceCall('user', {
        method: 'POST',
        body: {
          ...validatedData,
          timestamp: new Date().toISOString(),
        },
      });
      console.log('🚀 ~ MelodAiService ~ userRegister ~ response:', response);

      return response;
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        console.error('User registration validation error:', error.issues);
        throw new Error(
          `Validation failed: ${error.issues.map((e: z.ZodIssue) => e.message).join(', ')}`
        );
      }
      console.error('Error registering user:', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Get chat history sessions
   */
  public async getChatHistorySessions(page: number = 1, _limit: number = 10): Promise<any> {
    try {
      // TODO: Implement with Supabase when ready
      return {
        success: true,
        data: {
          sessions: [],
          pagination: {
            page,
            hasMore: false,
          },
        },
      };
    } catch (error) {
      console.error('Error getting chat history sessions:', error);
      throw error;
    }
  }
}
