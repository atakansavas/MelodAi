import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

import { SPOTIFY_CONFIG, STORAGE_KEYS } from '@/constants/config';
import { SpotifyTokenResponse } from '@/types/spotify';

WebBrowser.maybeCompleteAuthSession();

export class SpotifyAuthService {
  private static instance: SpotifyAuthService;

  private constructor() {}

  static getInstance(): SpotifyAuthService {
    if (!SpotifyAuthService.instance) {
      SpotifyAuthService.instance = new SpotifyAuthService();
    }
    return SpotifyAuthService.instance;
  }

  getAuthRequest() {
    return new AuthSession.AuthRequest({
      clientId: SPOTIFY_CONFIG.CLIENT_ID,
      scopes: SPOTIFY_CONFIG.SCOPES.split(' '),
      redirectUri: SPOTIFY_CONFIG.REDIRECT_URI,
      responseType: AuthSession.ResponseType.Code,
      extraParams: {
        show_dialog: 'true',
      },
    });
  }

  async handleAuthResponse(
    response: AuthSession.AuthSessionResult,
    _request: AuthSession.AuthRequest
  ): Promise<SpotifyTokenResponse | null> {
    if (response.type !== 'success' || !response.params.code) {
      return null;
    }

    try {
      // For now, we'll simulate a successful auth response
      // In a real app, you would exchange the code for tokens
      const tokenResponse: SpotifyTokenResponse = {
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: SPOTIFY_CONFIG.SCOPES,
      };

      await this.saveTokens(tokenResponse);
      return tokenResponse;
    } catch (error) {
      console.error('Token exchange error:', error);
      return null;
    }
  }

  async saveTokens(tokenResponse: SpotifyTokenResponse): Promise<void> {
    const expiresAt = Date.now() + tokenResponse.expires_in * 1000;

    await Promise.all([
      SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokenResponse.access_token),
      SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokenResponse.refresh_token),
      SecureStore.setItemAsync(STORAGE_KEYS.TOKEN_EXPIRY, expiresAt.toString()),
    ]);
  }

  async getAccessToken(): Promise<string | null> {
    const [accessToken, expiryStr] = await Promise.all([
      SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.getItemAsync(STORAGE_KEYS.TOKEN_EXPIRY),
    ]);

    if (!accessToken || !expiryStr) {
      return null;
    }

    const expiry = parseInt(expiryStr);
    if (Date.now() > expiry - 60000) {
      // Refresh 1 minute before expiry
      return await this.refreshAccessToken();
    }

    return accessToken;
  }

  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);

    if (!refreshToken) {
      return null;
    }

    try {
      // For now, we'll simulate a successful refresh
      // In a real app, you would make the actual refresh request
      const tokenResponse: SpotifyTokenResponse = {
        access_token: 'mock_refreshed_access_token',
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: 3600,
        scope: SPOTIFY_CONFIG.SCOPES,
      };

      await this.saveTokens(tokenResponse);
      return tokenResponse.access_token;
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.logout();
      return null;
    }
  }

  async logout(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN_EXPIRY),
      SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA),
    ]);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    console.log('Auth check - token exists:', !!token);
    return token !== null;
  }
}
