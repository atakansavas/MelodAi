import React from 'react';


// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import ChatScreen from '../screens/main/ChatScreen';
import HomeScreen from '../screens/main/HomeScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import { ScreenName } from '../types/navigation';

export const ScreenRegistry: Record<ScreenName, React.ComponentType<any>> = {
  AUTH_LOGIN: LoginScreen,
  ONBOARDING: OnboardingScreen,
  MAIN_HOME: HomeScreen,
  MAIN_CHAT: ChatScreen,
};

export const getScreenComponent = (screenName: ScreenName): React.ComponentType<any> => {
  const ScreenComponent = ScreenRegistry[screenName];
  if (!ScreenComponent) {
    throw new Error(`Screen "${screenName}" not found in registry`);
  }
  return ScreenComponent;
};