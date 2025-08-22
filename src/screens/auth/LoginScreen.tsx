import { Lato_300Light, Lato_400Regular, Lato_700Bold, useFonts } from '@expo-google-fonts/lato';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useAuth } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get('screen');

const _spacing = 16;

// Minimal login screen for anonymous auth

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    LatoRegular: Lato_400Regular,
    LatoBold: Lato_700Bold,
    LatoLight: Lato_300Light,
  });

  const handleAuthError = useCallback((errorMessage: string, error?: unknown) => {
    console.error('Auth error:', error);
    setError(errorMessage);
    setIsAuthenticating(false);

    Alert.alert('Authentication Error', errorMessage, [
      {
        text: 'Try Again',
        onPress: () => setError(null),
      },
    ]);
  }, []);

  const handleAnonymousLogin = useCallback(async () => {
    if (isAuthenticating || isLoading) return;
    setIsAuthenticating(true);
    setError(null);
    try {
      await login();
    } catch (error: unknown) {
      type ErrorWithMessage = { message?: unknown };
      const message =
        typeof error === 'object' && error && 'message' in (error as ErrorWithMessage)
          ? String((error as ErrorWithMessage).message || '')
          : 'An unexpected error occurred during login';
      handleAuthError(message || 'An unexpected error occurred during login', error);
    } finally {
      setIsAuthenticating(false);
    }
  }, [isAuthenticating, isLoading, login, handleAuthError]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.brandSection}>
            <View style={styles.brandContainer}>
              <Ionicons name="musical-notes" size={48} color="#1DB954" />
              <Text style={styles.brandText}>Spot Song</Text>
            </View>
            <Text style={styles.tagline}>Your AI-powered{'\n'}music companion</Text>
            <View style={styles.divider} />
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        {/* Anonymous Login Button */}
        <View style={styles.loginButtonsContainer}>
          <Pressable
            onPress={handleAnonymousLogin}
            disabled={isAuthenticating || isLoading}
            hitSlop={{ left: 20, bottom: 20, right: 20, top: 20 }}
            style={styles.loginButton}
          >
            <View
              style={[
                styles.loginButtonContent,
                (isAuthenticating || isLoading) && styles.loginButtonDisabled,
              ]}
            >
              <Ionicons name="person-circle-outline" size={28} color="#1DB954" />
              <Text style={styles.loginButtonText}>
                {isAuthenticating || isLoading ? 'Signing in...' : 'Continue as Guest'}
              </Text>
            </View>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'LatoRegular',
  },

  mainContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: height * 0.1,
    paddingHorizontal: _spacing * 2,
  },
  brandSection: {
    alignItems: 'center',
    marginTop: height * 0.15,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: _spacing * 2,
  },
  brandText: {
    marginLeft: _spacing,
    fontSize: 48,
    fontFamily: 'LatoBold',
    color: '#fff',
  },
  tagline: {
    fontSize: 28,
    fontFamily: 'LatoLight',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: _spacing * 3,
  },
  divider: {
    height: 3,
    width: width * 0.15,
    backgroundColor: '#1DB954',
    borderRadius: 2,
  },

  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingHorizontal: _spacing,
    paddingVertical: _spacing * 0.75,
    borderRadius: 8,
    marginHorizontal: _spacing,
    marginBottom: _spacing,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'LatoRegular',
    textAlign: 'center',
  },
  loginButtonsContainer: {
    marginHorizontal: _spacing * 2,
    marginBottom: _spacing * 2,
  },
  loginButton: {
    marginBottom: _spacing,
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: _spacing * 1.25,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  loginButtonText: {
    marginLeft: _spacing,
    fontSize: 18,
    fontFamily: 'LatoBold',
    color: '#1DB954',
  },
});
