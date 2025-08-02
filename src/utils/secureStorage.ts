import * as SecureStore from 'expo-secure-store';

// Storage keys
export const STORAGE_KEYS = {
  // Supabase session is handled by Supabase client
  SPOTIFY_ACCESS_TOKEN: 'spotify_access_token',
  SPOTIFY_REFRESH_TOKEN: 'spotify_refresh_token',
  IS_NEW_USER: 'is_new_user',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  SELECTED_AGENT: 'selected_agent_id',
  USER_PREFERENCES: 'user_preferences',
} as const;

export class SecureStorage {
  /**
   * Store a value securely
   */
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve a value securely
   */
  static async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove a value securely
   */
  static async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  }

  /**
   * Store Spotify tokens
   */
  static async storeSpotifyTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      this.setItem(STORAGE_KEYS.SPOTIFY_ACCESS_TOKEN, accessToken),
      this.setItem(STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN, refreshToken),
    ]);
  }

  /**
   * Get Spotify access token
   */
  static async getSpotifyAccessToken(): Promise<string | null> {
    return this.getItem(STORAGE_KEYS.SPOTIFY_ACCESS_TOKEN);
  }

  /**
   * Get Spotify refresh token
   */
  static async getSpotifyRefreshToken(): Promise<string | null> {
    return this.getItem(STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN);
  }

  /**
   * Clear Spotify tokens
   */
  static async clearSpotifyTokens(): Promise<void> {
    await Promise.all([
      this.removeItem(STORAGE_KEYS.SPOTIFY_ACCESS_TOKEN),
      this.removeItem(STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN),
    ]);
  }

  /**
   * Set onboarding completion status
   */
  static async setOnboardingCompleted(completed: boolean): Promise<void> {
    await this.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, completed.toString());
  }

  /**
   * Get onboarding completion status
   */
  static async getOnboardingCompleted(): Promise<boolean> {
    const value = await this.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return value === 'true';
  }

  /**
   * Set selected agent
   */
  static async setSelectedAgent(agentId: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.SELECTED_AGENT, agentId);
  }

  /**
   * Get selected agent
   */
  static async getSelectedAgent(): Promise<string | null> {
    return this.getItem(STORAGE_KEYS.SELECTED_AGENT);
  }

  /**
   * Set user preferences
   */
  static async setUserPreferences(preferences: Record<string, any>): Promise<void> {
    await this.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
  }

  /**
   * Get user preferences
   */
  static async getUserPreferences(): Promise<Record<string, any> | null> {
    const value = await this.getItem(STORAGE_KEYS.USER_PREFERENCES);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error('Error parsing user preferences:', error);
      return null;
    }
  }

  /**
   * Set new user flag
   */
  static async setIsNewUser(isNew: boolean): Promise<void> {
    await this.setItem(STORAGE_KEYS.IS_NEW_USER, isNew.toString());
  }

  /**
   * Get new user flag
   */
  static async getIsNewUser(): Promise<boolean> {
    const value = await this.getItem(STORAGE_KEYS.IS_NEW_USER);
    return value === 'true';
  }

  /**
   * Clear all app data (logout)
   */
  static async clearAllData(): Promise<void> {
    const keys = Object.values(STORAGE_KEYS);
    await Promise.all(keys.map((key) => this.removeItem(key)));
  }
}
