import { create } from 'zustand';

import { ScreenName, NavigationState, NavigationParams } from '../types/navigation';

interface NavigationStore extends NavigationState {
  navigate: (screen: ScreenName, params?: NavigationParams) => void;
  goBack: () => void;
  replace: (screen: ScreenName, params?: NavigationParams) => void;
}

export const useNavigation = create<NavigationStore>((set, get) => ({
  currentScreen: 'AUTH_LOGIN',
  previousScreen: undefined,
  params: undefined,

  navigate: (screen: ScreenName, params?: NavigationParams) => {
    const currentState = get();
    set({
      currentScreen: screen,
      previousScreen: currentState.currentScreen,
      params: params || {},
    });
  },

  goBack: () => {
    const { previousScreen } = get();
    if (previousScreen) {
      set({
        currentScreen: previousScreen,
        previousScreen: undefined,
        params: {},
      });
    }
  },

  replace: (screen: ScreenName, params?: NavigationParams) => {
    set({
      currentScreen: screen,
      params: params || {},
    });
  },
}));