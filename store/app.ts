import { create } from 'zustand';
import { STORAGE_KEYS } from '@/constants/config';
import * as SecureStore from 'expo-secure-store';

interface AppStore {
  isOnboardingCompleted: boolean;
  isLoading: boolean;
  
  setOnboardingCompleted: (completed: boolean) => Promise<void>;
  checkOnboardingStatus: () => Promise<boolean>;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  isOnboardingCompleted: false,
  isLoading: false,

  setOnboardingCompleted: async (completed: boolean) => {
    set({ isOnboardingCompleted: completed });
    await SecureStore.setItemAsync(STORAGE_KEYS.ONBOARDING_COMPLETED, completed.toString());
  },

  checkOnboardingStatus: async () => {
    try {
      const completed = await SecureStore.getItemAsync(STORAGE_KEYS.ONBOARDING_COMPLETED);
      const isCompleted = completed === 'true';
      console.log('Onboarding check - completed:', isCompleted);
      set({ isOnboardingCompleted: isCompleted });
      return isCompleted;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));