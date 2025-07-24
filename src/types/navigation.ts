export type ScreenName = 'AUTH_LOGIN' | 'ONBOARDING' | 'MAIN_HOME' | 'MAIN_CHAT' | 'MAIN_SETTINGS';

export interface NavigationState {
  currentScreen: ScreenName;
  previousScreen?: ScreenName;
  params?: Record<string, any>;
}

export interface NavigationParams {
  trackId?: string;
  [key: string]: any;
}
