import { useCallback, useMemo } from 'react';

import { useNavigation } from '../navigation/NavigationStore';
import { ScreenName, NavigationParams } from '../types/navigation';

export const useRouter = () => {
  const { navigate, goBack, replace, params } = useNavigation();

  const goToLogin = useCallback(() => replace('AUTH_LOGIN'), [replace]);
  const goToOnboarding = useCallback(() => replace('ONBOARDING'), [replace]);
  const goToHome = useCallback(() => replace('MAIN_HOME'), [replace]);
  const goToChat = useCallback((trackId: string) => navigate('MAIN_CHAT', { trackId }), [navigate]);

  const router = useMemo(() => ({
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
    goToChat,
  }), [navigate, goBack, replace, params, goToLogin, goToOnboarding, goToHome, goToChat]);

  return router;
};