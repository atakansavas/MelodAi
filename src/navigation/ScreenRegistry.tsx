import React from 'react';

// Import screens
import AppMainScreen from '../screens/app/Main';
import LoginScreen from '../screens/auth/LoginScreen';
import AnonChatScreen from '../screens/main/AnonChatScreen';
import ChatDetailScreen from '../screens/main/ChatDetailScreen';
import HistoryScreen from '../screens/main/HistoryScreen';
import HomeScreen from '../screens/main/HomeScreen';
import SearchScreen from '../screens/main/SearchScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import { ScreenName } from '../types/navigation';

export const ScreenRegistry: Record<ScreenName, React.ComponentType<any>> = {
  AUTH_LOGIN: LoginScreen,
  ONBOARDING: OnboardingScreen,
  MAIN_HOME: HomeScreen,
  MAIN_SEARCH: SearchScreen,
  MAIN_CHAT_DETAIL: ChatDetailScreen,
  MAIN_SETTINGS: SettingsScreen,
  MAIN_HISTORY: HistoryScreen,
  MAIN_ANON_CHAT: AnonChatScreen,
  APP_MAIN: AppMainScreen,
};

export const getScreenComponent = (screenName: ScreenName): React.ComponentType<any> => {
  const ScreenComponent = ScreenRegistry[screenName];
  if (!ScreenComponent) {
    throw new Error(`Screen "${screenName}" not found in registry`);
  }
  return ScreenComponent;
};
