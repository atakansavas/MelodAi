import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

import { SPOTIFY_CONFIG, STORAGE_KEYS } from '../../constants/config';
import { SpotifyTokenResponse, SpotifyUser } from '../../types/spotify';

WebBrowser.maybeCompleteAuthSession();

export interface AuthState {
  isAuthenticated: boolean;
  user: SpotifyUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

export class AuthError extends Error {
  code: string;

  constructor(message: string, code: string = 'AUTH_ERROR') {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

export class SpotifyAuthService {
  private static instance: SpotifyAuthService;

  private constructor() {
    this.validateConfig();
  }

  static getInstance(): SpotifyAuthService {
    if (!SpotifyAuthService.instance) {
      SpotifyAuthService.instance = new SpotifyAuthService();
    }
    return SpotifyAuthService.instance;
  }

  private validateConfig(): void {
    if (!SPOTIFY_CONFIG.CLIENT_ID) {
      throw new AuthError('Spotify Client ID is not configured', 'CONFIG_ERROR');
    }
    if (!SPOTIFY_CONFIG.REDIRECT_URI) {
      throw new AuthError('Spotify Redirect URI is not configured', 'CONFIG_ERROR');
    }
  }

  getAuthRequest() {
    try {
      return new AuthSession.AuthRequest({
        clientId: SPOTIFY_CONFIG.CLIENT_ID,
        scopes: SPOTIFY_CONFIG.SCOPES.split(' '),
        redirectUri: SPOTIFY_CONFIG.REDIRECT_URI,
        responseType: AuthSession.ResponseType.Code,
        extraParams: {
          show_dialog: 'true',
        },
      });
    } catch (error) {
      throw new AuthError('Failed to create authorization request', 'REQUEST_CREATION_ERROR');
    }
  }

  async handleAuthResponse(
    response: AuthSession.AuthSessionResult,
    request: AuthSession.AuthRequest
  ): Promise<SpotifyTokenResponse | null> {
    if (response.type !== 'success' || !response.params.code) {
      if (response.type === 'error') {
        throw new AuthError(
          `Authorization failed: ${response.params?.error || 'Unknown error'}`,
          'AUTHORIZATION_ERROR'
        );
      }
      return null;
    }

    if (!process.env.SPOTIFY_CLIENT_SECRET) {
      throw new AuthError('Spotify Client Secret is not configured', 'CONFIG_ERROR');
    }

    try {
      // Exchange authorization code for access token
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          code: response.params.code,
          redirectUri: SPOTIFY_CONFIG.REDIRECT_URI,
          clientId: SPOTIFY_CONFIG.CLIENT_ID,
          clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
          extraParams: {
            code_verifier: request.codeVerifier || '',
          },
        },
        {
          tokenEndpoint: SPOTIFY_CONFIG.DISCOVERY.tokenEndpoint,
        }
      );

      if (!tokenResponse.accessToken) {
        throw new AuthError('Failed to obtain access token', 'TOKEN_EXCHANGE_ERROR');
      }

      const tokens: SpotifyTokenResponse = {
        access_token: tokenResponse.accessToken,
        refresh_token: tokenResponse.refreshToken || '',
        token_type: tokenResponse.tokenType || 'Bearer',
        expires_in: tokenResponse.expiresIn || 3600,
        scope: tokenResponse.scope || SPOTIFY_CONFIG.SCOPES,
      };

      await this.saveTokens(tokens);
      return tokens;
    } catch (error: any) {
      if (error instanceof AuthError) {
        throw error;
      }

      console.error('Token exchange error:', error);

      if (error.message?.includes('400')) {
        throw new AuthError(
          'Invalid authorization code or client credentials',
          'TOKEN_EXCHANGE_ERROR'
        );
      }

      throw new AuthError(
        'Failed to exchange authorization code for tokens',
        'TOKEN_EXCHANGE_ERROR'
      );
    }
  }

  async saveTokens(tokenResponse: SpotifyTokenResponse): Promise<void> {
    try {
      const expiresAt = Date.now() + tokenResponse.expires_in * 1000;

      await Promise.all([
        SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokenResponse.access_token),
        SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokenResponse.refresh_token),
        SecureStore.setItemAsync(STORAGE_KEYS.TOKEN_EXPIRY, expiresAt.toString()),
      ]);
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw new AuthError('Failed to save authentication tokens', 'STORAGE_ERROR');
    }
  }

  async saveUser(user: SpotifyUser): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw new AuthError('Failed to save user data', 'STORAGE_ERROR');
    }
  }

  async getUser(): Promise<SpotifyUser | null> {
    try {
      const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  }

  async saveAuthData(data: any): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_DATA, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw new AuthError('Failed to save authentication data', 'STORAGE_ERROR');
    }
  }

  async getAuthData(): Promise<any | null> {
    try {
      const authData = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_DATA);
      return authData ? JSON.parse(authData) : null;
    } catch (error) {
      console.error('Error retrieving auth data:', error);
      return null;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const [accessToken, expiryStr] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.getItemAsync(STORAGE_KEYS.TOKEN_EXPIRY),
      ]);

      if (!accessToken || !expiryStr) {
        return null;
      }

      const expiry = parseInt(expiryStr);
      if (isNaN(expiry)) {
        console.warn('Invalid token expiry format');
        return null;
      }

      if (Date.now() > expiry - 60000) {
        // Refresh 1 minute before expiry
        return await this.refreshAccessToken();
      }

      return accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);

      if (!refreshToken) {
        throw new AuthError('No refresh token available', 'REFRESH_TOKEN_MISSING');
      }

      if (!process.env.SPOTIFY_CLIENT_SECRET) {
        throw new AuthError('Spotify Client Secret is not configured', 'CONFIG_ERROR');
      }

      const response = await fetch(SPOTIFY_CONFIG.DISCOVERY.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${SPOTIFY_CONFIG.CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }).toString(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new AuthError('Refresh token is invalid or expired', 'REFRESH_TOKEN_INVALID');
        }
        throw new AuthError(`Token refresh failed: ${response.status}`, 'REFRESH_ERROR');
      }

      const data = await response.json();

      if (!data.access_token) {
        throw new AuthError('No access token received from refresh', 'REFRESH_ERROR');
      }

      const tokenResponse: SpotifyTokenResponse = {
        access_token: data.access_token,
        refresh_token: data.refresh_token || refreshToken,
        token_type: data.token_type,
        expires_in: data.expires_in,
        scope: data.scope,
      };

      await this.saveTokens(tokenResponse);
      return tokenResponse.access_token;
    } catch (error: any) {
      if (error instanceof AuthError) {
        console.error('Token refresh error:', error.message);

        // If refresh fails due to invalid token, logout user
        if (error.code === 'REFRESH_TOKEN_INVALID' || error.code === 'REFRESH_TOKEN_MISSING') {
          await this.logout();
        }

        throw error;
      }

      console.error('Unexpected token refresh error:', error);
      await this.logout();
      throw new AuthError('Failed to refresh access token', 'REFRESH_ERROR');
    }
  }

  async logout(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN_EXPIRY),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA),
        SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_DATA),
      ]);
    } catch (error) {
      console.error('Error during logout:', error);
      throw new AuthError('Failed to clear authentication data', 'LOGOUT_ERROR');
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      return token !== null;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  async getAuthState(): Promise<AuthState> {
    try {
      const [accessToken, refreshToken, expiryStr, user] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.getItemAsync(STORAGE_KEYS.TOKEN_EXPIRY),
        this.getUser(),
      ]);

      const expiresAt = expiryStr ? parseInt(expiryStr) : null;
      const isAuthenticated = !!(
        accessToken &&
        expiresAt &&
        !isNaN(expiresAt) &&
        Date.now() < expiresAt
      );

      return {
        isAuthenticated,
        user,
        accessToken,
        refreshToken,
        expiresAt,
      };
    } catch (error) {
      console.error('Error getting auth state:', error);
      return {
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      };
    }
  }
}
