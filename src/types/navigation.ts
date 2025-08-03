export type ScreenName =
  | 'AUTH_LOGIN'
  | 'ONBOARDING'
  | 'MAIN_HOME'
  | 'MAIN_SEARCH'
  | 'MAIN_CHAT_DETAIL'
  | 'MAIN_SETTINGS'
  | 'MAIN_HISTORY';

export interface NavigationState {
  currentScreen: ScreenName;
  previousScreen?: ScreenName;
  params?: Record<string, any>;
}

export interface NavigationParams {
  trackId?: string;
  trackName?: string;
  artistName?: string;
  initialMessage?: string;
  sessionId?: string;
  [key: string]: any;
}
