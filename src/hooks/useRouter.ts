import { useCallback, useMemo } from 'react';

import { useNavigation } from '../navigation/NavigationStore';
import { NavigationParams, ScreenName } from '../types/navigation';

export const useRouter = () => {
  const { navigate, goBack, replace, params } = useNavigation();

  const goToLogin = useCallback(() => replace('AUTH_LOGIN'), [replace]);
  const goToOnboarding = useCallback(() => replace('ONBOARDING'), [replace]);
  const goToHome = useCallback(() => replace('MAIN_HOME'), [replace]);
  const goToSearch = useCallback(() => navigate('MAIN_SEARCH'), [navigate]);
  const goToChatDetail = useCallback(
    (params?: {
      trackId?: string;
      trackName?: string;
      artistName?: string;
      initialMessage?: string;
    }) => navigate('MAIN_CHAT_DETAIL', params),
    [navigate]
  );
  const goToSettings = useCallback(() => navigate('MAIN_SETTINGS'), [navigate]);
  const goToHistory = useCallback(() => navigate('MAIN_HISTORY'), [navigate]);

  const router = useMemo(
    () => ({
      navigate: (screen: ScreenName, routeParams?: NavigationParams) => {
        navigate(screen, routeParams);
      },

      goBack: () => {
        goBack();
      },

      replace: (screen: ScreenName, routeParams?: NavigationParams) => {
        replace(screen, routeParams);
      },

      params: params || {},

      // Helper methods for common navigation patterns
      goToLogin,
      goToOnboarding,
      goToHome,
      goToSearch,
      goToChatDetail,
      goToSettings,
      goToHistory,
    }),
    [
      navigate,
      goBack,
      replace,
      params,
      goToLogin,
      goToOnboarding,
      goToHome,
      goToSearch,
      goToChatDetail,
      goToSettings,
      goToHistory,
    ]
  );

  return router;
};
