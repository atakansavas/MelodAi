import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SpotifyApiService, SpotifyAuthService } from '@services/spotify';
import { useAuthStore } from '@store/auth';

import { useRouter } from '../../hooks/useRouter';

export default function LoginScreen() {
  const router = useRouter();
  const { setLoading, setUser } = useAuthStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const authService = SpotifyAuthService.getInstance();
  const apiService = SpotifyApiService.getInstance();

  const handleSpotifyLogin = async () => {
    setIsAuthenticating(true);
    setLoading(true);

    try {
      const request = authService.getAuthRequest();
      console.log('🚀 ~ handleSpotifyLogin ~ request:', request);
      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.spotify.com/authorize',
      });
      console.log('🚀 ~ handleSpotifyLogin ~ result:', result);

      if (result.type === 'success') {
        const tokenResponse = await authService.handleAuthResponse(result, request);

        if (tokenResponse) {
          // Get user information
          try {
            const user = await apiService.getCurrentUser();
            setUser(user);
            console.log('User data:', user);
          } catch (userError) {
            console.error('Failed to get user data:', userError);
          }

          Alert.alert('🎉 Giriş Başarılı!', 'Spotify hesabınıza başarıyla giriş yaptınız.', [
            {
              text: 'Devam Et',
              onPress: () => router.goToOnboarding(),
            },
          ]);
        } else {
          Alert.alert('Hata', 'Giriş yapılırken bir hata oluştu.');
        }
      } else {
        Alert.alert('İptal', 'Giriş işlemi iptal edildi.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Hata', 'Giriş yapılırken bir hata oluştu.');
    } finally {
      setIsAuthenticating(false);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Title */}
        <View style={styles.header}>
          <Text style={styles.logo}>🎵 Melodia</Text>
          <Text style={styles.subtitle}>Müziğinizin hikayelerini keşfedin</Text>
        </View>

        {/* Description */}
        <View style={styles.description}>
          <Text style={styles.descriptionText}>
            Spotify dinleme geçmişinizde bulunan şarkılarla AI asistanları ile sohbet edin. Her
            şarkının hikayesini, analizini ve duygusal etkilerini keşfedin.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📚</Text>
            <Text style={styles.featureText}>Şarkı hikayeleri</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🎵</Text>
            <Text style={styles.featureText}>Müzik analizi</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>✍️</Text>
            <Text style={styles.featureText}>Şarkı sözü yorumu</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🧠</Text>
            <Text style={styles.featureText}>Ruh hali analizi</Text>
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, isAuthenticating && styles.loginButtonDisabled]}
          onPress={handleSpotifyLogin}
          disabled={isAuthenticating}
        >
          {isAuthenticating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.loginButtonText}>Spotify ile Giriş Yap</Text>
              <Text style={styles.spotifyIcon}>♪</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Info */}
        <Text style={styles.info}>
          Spotify Premium hesabınıza güvenli bir şekilde bağlanıyoruz. Verileriniz korunur ve hiçbir
          bilgi saklanmaz.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1DB954',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
  },
  description: {
    marginBottom: 40,
  },
  descriptionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.7,
  },
  features: {
    marginBottom: 60,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  loginButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  spotifyIcon: {
    fontSize: 20,
    color: '#fff',
  },
  info: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.5,
    lineHeight: 18,
  },
});
