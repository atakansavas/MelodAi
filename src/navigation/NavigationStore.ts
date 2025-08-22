import { create } from 'zustand';

import { NavigationParams, NavigationState, ScreenName } from '../types/navigation';

interface NavigationStore extends NavigationState {
  navigate: (screen: ScreenName, params?: NavigationParams) => void;
  goBack: () => void;
  replace: (screen: ScreenName, params?: NavigationParams) => void;
  chatSessionUpdated: boolean;
  markChatSessionUpdated: () => void;
  clearChatSessionUpdated: () => void;
}

export const useNavigation = create<NavigationStore>((set, get) => ({
  currentScreen: 'AUTH_LOGIN',
  previousScreen: undefined,
  params: undefined,
  chatSessionUpdated: false,

  navigate: (screen: ScreenName, params?: NavigationParams) => {
    console.log('🚀 ~ NavigationStore ~ navigate ~ screen:', screen);
    console.log('🚀 ~ NavigationStore ~ navigate ~ params:', params);
    const currentState = get();

    // Check if navigating back to home screen from chat detail
    if (screen === 'MAIN_HOME' && currentState.currentScreen === 'MAIN_CHAT_DETAIL') {
      set({
        currentScreen: screen,
        previousScreen: currentState.currentScreen,
        params: params || {},
        chatSessionUpdated: true,
      });
    } else {
      set({
        currentScreen: screen,
        previousScreen: currentState.currentScreen,
        params: params || {},
      });
    }
  },

  goBack: () => {
    const { previousScreen, currentScreen } = get();
    if (previousScreen) {
      // Check if going back to home screen from chat detail
      if (previousScreen === 'MAIN_HOME' && currentScreen === 'MAIN_CHAT_DETAIL') {
        set({
          currentScreen: previousScreen,
          previousScreen: undefined,
          params: {},
          chatSessionUpdated: true,
        });
      } else {
        set({
          currentScreen: previousScreen,
          previousScreen: undefined,
          params: {},
        });
      }
    }
  },

  replace: (screen: ScreenName, params?: NavigationParams) => {
    set({
      currentScreen: screen,
      params: params || {},
    });
  },

  markChatSessionUpdated: () => {
    set({ chatSessionUpdated: true });
  },

  clearChatSessionUpdated: () => {
    set({ chatSessionUpdated: false });
  },
}));
