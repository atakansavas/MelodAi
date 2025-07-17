import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { SPOTIFY_CONFIG, STORAGE_KEYS } from '@/constants/config';
import { SpotifyTokenResponse, SpotifyUser } from '@/types/spotify';

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
      codeChallenge: AuthSession.AuthRequest.PKCE.codeChallenge,
      extraParams: {
        show_dialog: 'true',
      },
    });
  }

  async handleAuthResponse(
    response: AuthSession.AuthSessionResult,
    request: AuthSession.AuthRequest
  ): Promise<SpotifyTokenResponse | null> {
    if (response.type !== 'success' || !response.params.code) {
      return null;
    }

    try {
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          clientId: SPOTIFY_CONFIG.CLIENT_ID,
          code: response.params.code,
          redirectUri: SPOTIFY_CONFIG.REDIRECT_URI,
          codeVerifier: request.codeVerifier!,
          extraParams: {
            grant_type: 'authorization_code',
          },
        },
        SPOTIFY_CONFIG.DISCOVERY
      );

      await this.saveTokens(tokenResponse);
      return tokenResponse as SpotifyTokenResponse;
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
    if (Date.now() > expiry - 60000) { // Refresh 1 minute before expiry
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
      const response = await fetch(SPOTIFY_CONFIG.DISCOVERY.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: SPOTIFY_CONFIG.CLIENT_ID,
        }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const tokenResponse: SpotifyTokenResponse = await response.json();
      await this.saveTokens({
        ...tokenResponse,
        refresh_token: refreshToken, // Keep the original refresh token if not provided
      });

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
    return token !== null;
  }
}