import { Lato_300Light, Lato_400Regular, Lato_700Bold, useFonts } from '@expo-google-fonts/lato';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { MotiView, useDynamicAnimation } from 'moti';
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
import { useRouter } from '../../hooks/useRouter';

const { width, height } = Dimensions.get('screen');

const _spacing = 16;

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// TODO: Implement push notification token when needed

// TODO: Implement logo component when needed

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    LatoRegular: Lato_400Regular,
    LatoBold: Lato_700Bold,
    LatoLight: Lato_300Light,
  });

  const dynamicAnimation = useDynamicAnimation(() => ({
    opacity: 0,
    translateY: 40,
  }));

  const handleAuthError = useCallback((errorMessage: string, error?: any) => {
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

  const handleLogin = useCallback(async () => {
    if (isAuthenticating || isLoading) return;

    setIsAuthenticating(true);
    setError(null);

    try {
      await login();
      // Navigation will be handled by the auth context
    } catch (error: any) {
      const errorMessage = error?.message || 'An unexpected error occurred during login';
      handleAuthError(errorMessage, error);
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

        {/* Background Video */}
        <Video
          shouldPlay
          isLooping
          source={{
            uri: 'https://user-images.githubusercontent.com/2805320/126218253-bae143d4-ed8e-4dd0-8ae6-eb0065883e6c.mp4',
          }}
          resizeMode={ResizeMode.COVER}
          style={[StyleSheet.absoluteFillObject, styles.videoOverlay]}
        />

        {/* Overlay */}
        <View style={styles.overlay} />

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.brandSection}>
            <View style={styles.brandContainer}>
              <Ionicons name="musical-notes" size={48} color="#1DB954" />
              <Text style={styles.brandText}>MelodAi</Text>
            </View>
            <Text style={styles.tagline}>Your AI-powered{'\n'}music companion</Text>
            <View style={styles.divider} />
          </View>

          {/* Features Section */}
          <MotiView state={dynamicAnimation} delay={200} style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>Discover Your Music</Text>
            <View style={styles.featuresGrid}>
              <View style={styles.featureItem}>
                <Ionicons name="book-outline" size={24} color="#1DB954" />
                <Text style={styles.featureText}>Song Stories</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="analytics-outline" size={24} color="#1DB954" />
                <Text style={styles.featureText}>Music Analysis</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="create-outline" size={24} color="#1DB954" />
                <Text style={styles.featureText}>Lyric Insights</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="heart-outline" size={24} color="#1DB954" />
                <Text style={styles.featureText}>Mood Detection</Text>
              </View>
            </View>
          </MotiView>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        {/* Login Button */}
        <Pressable
          onPress={handleLogin}
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
            {isAuthenticating || isLoading ? (
              <>
                <MaterialIcons name="hourglass-empty" size={28} color="#1DB954" />
                <Text style={styles.loginButtonText}>Connecting to Spotify...</Text>
              </>
            ) : (
              <>
                <Ionicons name="musical-notes" size={28} color="#1DB954" />
                <Text style={styles.loginButtonText}>Continue with Spotify</Text>
              </>
            )}
          </View>
        </Pressable>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  videoOverlay: {
    opacity: 0.8,
  },
  logo: {
    position: 'absolute',
    top: Constants.statusBarHeight + 20,
    left: _spacing,
    zIndex: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: _spacing,
    paddingVertical: _spacing * 0.75,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    marginLeft: _spacing * 0.5,
    fontSize: 20,
    fontFamily: 'LatoBold',
    color: '#1DB954',
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
  featuresSection: {
    alignItems: 'center',
    marginBottom: _spacing * 3,
  },
  featuresTitle: {
    fontSize: 24,
    fontFamily: 'LatoBold',
    color: '#fff',
    marginBottom: _spacing * 2,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  featureItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: _spacing * 2,
    paddingVertical: _spacing,
    paddingHorizontal: _spacing,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'LatoRegular',
    color: '#fff',
    marginTop: _spacing * 0.5,
    textAlign: 'center',
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
  loginButton: {
    marginHorizontal: _spacing * 2,
    marginBottom: _spacing * 2,
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
