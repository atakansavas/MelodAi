import { registerRootComponent } from 'expo';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { LoadingSpinner } from '@components/common';
import { useAppStore } from '@store/app';
import { useAuthStore } from '@store/auth';

import { useRouter } from './hooks/useRouter';
import Navigator from './navigation/Navigator';

function App() {
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const { checkAuth, refreshAuthState, isAuthenticated, user } = useAuthStore();
  const { checkOnboardingStatus } = useAppStore();
  const hasInitialized = useRef(false);

  const handleInitError = useCallback(
    (error: any, context: string) => {
      console.error(`Initialization error in ${context}:`, error);
      const errorMessage = error?.message || 'An unexpected error occurred during initialization';
      setInitError(errorMessage);
      setIsInitializing(false);

      Alert.alert('Initialization Error', errorMessage, [
        {
          text: 'Retry',
          onPress: () => {
            setInitError(null);
            setIsInitializing(true);
            hasInitialized.current = false;
            initializeApp();
          },
        },
        {
          text: 'Continue to Login',
          onPress: () => {
            setInitError(null);
            setIsInitializing(false);
            router.goToLogin();
          },
        },
      ]);
    },
    [router]
  );

  const initializeApp = useCallback(async () => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    try {
      console.log('Starting app initialization...');

      // Step 1: Refresh auth state from storage
      await refreshAuthState();

      // Step 2: Check authentication status
      const isAuth = await checkAuth();
      console.log('Auth check result:', isAuth);

      if (!isAuth) {
        console.log('User not authenticated, redirecting to login');
        router.goToLogin();
        return;
      }

      // Step 3: Check if we have user data
      if (!user) {
        console.log('No user data found, redirecting to login');
        router.goToLogin();
        return;
      }

      console.log('User authenticated:', user.display_name);

      // Step 4: Check onboarding status
      const onboardingCompleted = await checkOnboardingStatus();
      console.log('Onboarding completed:', onboardingCompleted);

      if (!onboardingCompleted) {
        console.log('Onboarding not completed, redirecting to onboarding');
        router.goToOnboarding();
        return;
      }

      // Step 5: All checks passed, go to home
      console.log('All checks passed, redirecting to home');
      router.goToHome();
    } catch (error) {
      handleInitError(error, 'app initialization');
    } finally {
      setIsInitializing(false);
    }
  }, [checkAuth, refreshAuthState, checkOnboardingStatus, router, user, handleInitError]);

  useEffect(() => {
    // Only run initialization once when component mounts
    if (!hasInitialized.current) {
      initializeApp();
    }
  }, [initializeApp]);

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  // Show error state if initialization failed
  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to initialize app: {initError}</Text>
      </View>
    );
  }

  return <Navigator />;
}

registerRootComponent(App);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
