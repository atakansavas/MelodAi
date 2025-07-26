import * as SecureStore from 'expo-secure-store';

import { STORAGE_KEYS } from '../../constants/config';

export interface StorageService {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

export class SecureStorageService implements StorageService {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw error;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await Promise.all([
        this.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        this.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        this.removeItem(STORAGE_KEYS.TOKEN_EXPIRY),
        this.removeItem(STORAGE_KEYS.USER_DATA),
        this.removeItem(STORAGE_KEYS.AUTH_DATA),
        this.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED),
        this.removeItem(STORAGE_KEYS.SELECTED_AGENT),
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  async setObject<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await this.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error setting object ${key}:`, error);
      throw error;
    }
  }

  async getObject<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await this.getItem(key);
      return jsonValue ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error getting object ${key}:`, error);
      return null;
    }
  }

  async getBatch(keys: string[]): Promise<Record<string, string | null>> {
    try {
      const results = await Promise.all(
        keys.map(async (key) => ({
          key,
          value: await this.getItem(key),
        }))
      );

      return results.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, string | null>);
    } catch (error) {
      console.error('Error getting batch items:', error);
      throw error;
    }
  }

  async setBatch(items: Record<string, string>): Promise<void> {
    try {
      await Promise.all(Object.entries(items).map(([key, value]) => this.setItem(key, value)));
    } catch (error) {
      console.error('Error setting batch items:', error);
      throw error;
    }
  }

  async removeBatch(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map((key) => this.removeItem(key)));
    } catch (error) {
      console.error('Error removing batch items:', error);
      throw error;
    }
  }
}

// Singleton instance
export const storageService = new SecureStorageService();

// Auth-specific storage utilities
export const authStorage = {
  async saveTokens(accessToken: string, refreshToken: string, expiresAt: number): Promise<void> {
    await storageService.setBatch({
      [STORAGE_KEYS.ACCESS_TOKEN]: accessToken,
      [STORAGE_KEYS.REFRESH_TOKEN]: refreshToken,
      [STORAGE_KEYS.TOKEN_EXPIRY]: expiresAt.toString(),
    });
  },

  async getTokens(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: number | null;
  }> {
    const tokens = await storageService.getBatch([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.TOKEN_EXPIRY,
    ]);

    return {
      accessToken: tokens[STORAGE_KEYS.ACCESS_TOKEN] || null,
      refreshToken: tokens[STORAGE_KEYS.REFRESH_TOKEN] || null,
      expiresAt: tokens[STORAGE_KEYS.TOKEN_EXPIRY]
        ? parseInt(tokens[STORAGE_KEYS.TOKEN_EXPIRY]!)
        : null,
    };
  },

  async clearTokens(): Promise<void> {
    await storageService.removeBatch([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.TOKEN_EXPIRY,
    ]);
  },

  async saveUser<T>(user: T): Promise<void> {
    await storageService.setObject(STORAGE_KEYS.USER_DATA, user);
  },

  async getUser<T>(): Promise<T | null> {
    return await storageService.getObject<T>(STORAGE_KEYS.USER_DATA);
  },

  async saveAuthData<T>(data: T): Promise<void> {
    await storageService.setObject(STORAGE_KEYS.AUTH_DATA, data);
  },

  async getAuthData<T>(): Promise<T | null> {
    return await storageService.getObject<T>(STORAGE_KEYS.AUTH_DATA);
  },

  async clearAll(): Promise<void> {
    await storageService.removeBatch([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.TOKEN_EXPIRY,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.AUTH_DATA,
    ]);
  },
};
