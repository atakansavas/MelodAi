// Session Storage Utilities
export const STORAGE_KEYS = {
  CHAT_SESSIONS: 'chat_sessions',
  CURRENT_SESSION: 'current_session',
} as const;

// Session management utilities
export const SessionManager = {
  /**
   * Save a session to local storage
   */
  async saveSession(sessionId: string, data: any): Promise<void> {
    try {
      // Implementation would use AsyncStorage or similar in a real app
      console.log('Saving session:', sessionId, data);
    } catch (error) {
      console.error('Error saving session:', error);
    }
  },

  /**
   * Load a session from local storage
   */
  async loadSession(sessionId: string): Promise<any> {
    try {
      // Implementation would use AsyncStorage or similar in a real app
      console.log('Loading session:', sessionId);
      return null;
    } catch (error) {
      console.error('Error loading session:', error);
      return null;
    }
  },

  /**
   * Delete a session from local storage
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      // Implementation would use AsyncStorage or similar in a real app
      console.log('Deleting session:', sessionId);
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  },

  /**
   * Get all saved sessions
   */
  async getAllSessions(): Promise<string[]> {
    try {
      // Implementation would use AsyncStorage or similar in a real app
      return [];
    } catch (error) {
      console.error('Error getting sessions:', error);
      return [];
    }
  },
};

// Network utility functions
export const NetworkUtils = {
  /**
   * Check if we have a network connection
   */
  async isConnected(): Promise<boolean> {
    try {
      // In a real app, this would use NetInfo or similar
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Retry a function with exponential backoff
   */
  async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  },
};

// Input validation utilities
export const ChatValidation = {
  /**
   * Validate message content
   */
  validateMessage(message: string): { isValid: boolean; error?: string } {
    if (!message || typeof message !== 'string') {
      return { isValid: false, error: 'Message is required' };
    }

    const trimmed = message.trim();
    if (trimmed.length === 0) {
      return { isValid: false, error: 'Message cannot be empty' };
    }

    if (trimmed.length > 500) {
      return { isValid: false, error: 'Message is too long (max 500 characters)' };
    }

    return { isValid: true };
  },

  /**
   * Validate session ID
   */
  validateSessionId(sessionId: string): boolean {
    return typeof sessionId === 'string' && sessionId.length > 0;
  },

  /**
   * Sanitize user input
   */
  sanitizeInput(input: string): string {
    return input.trim().replace(/\s+/g, ' ');
  },
};

// Error handling utilities
export const ErrorHandler = {
  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error?.message) {
      // Map technical errors to user-friendly messages
      const message = error.message.toLowerCase();

      if (message.includes('network') || message.includes('fetch')) {
        return 'Bağlantı sorunu oluştu. İnternet bağlantınızı kontrol edin.';
      }

      if (message.includes('timeout')) {
        return 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
      }

      if (message.includes('401') || message.includes('unauthorized')) {
        return 'Yetkilendirme hatası. Lütfen yeniden giriş yapın.';
      }

      if (message.includes('500') || message.includes('server')) {
        return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
      }

      return error.message;
    }

    return 'Beklenmeyen bir hata oluştu.';
  },

  /**
   * Log error with context
   */
  logError(error: any, context: string, additionalData?: any): void {
    console.error(`[${context}] Error:`, error);
    if (additionalData) {
      console.error(`[${context}] Additional data:`, additionalData);
    }

    // In a real app, this would send to crash reporting service
  },
};

// Performance utilities
export const PerformanceUtils = {
  /**
   * Debounce function to limit rapid function calls
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  /**
   * Throttle function to limit function calls
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
};
