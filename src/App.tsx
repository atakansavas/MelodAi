import { registerRootComponent } from 'expo';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { LoadingSpinner } from '@components/common';
import { useAppStore } from '@store/app';
import { useAuthStore } from '@store/auth';

import { useRouter } from './hooks/useRouter';
import Navigator from './navigation/Navigator';

function App() {
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);
  const { checkAuth } = useAuthStore();
  const { checkOnboardingStatus } = useAppStore();
  const hasInitialized = useRef(false);

  const initializeApp = useCallback(async () => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    try {
      const isAuth = await checkAuth();

      if (!isAuth) {
        router.goToLogin();
        return;
      }

      const onboardingCompleted = await checkOnboardingStatus();

      if (!onboardingCompleted) {
        router.goToOnboarding();
        return;
      }

      router.goToHome();
    } finally {
      setIsInitializing(false);
    }
  }, [checkAuth, checkOnboardingStatus, router]);

  useEffect(() => {
    // Only run initialization once when component mounts
    initializeApp();
  }, [initializeApp]);

  // Show loading screen while checking auth and onboarding status
  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  return <Navigator />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
});

// Register the root component
registerRootComponent(App);

export default App;
