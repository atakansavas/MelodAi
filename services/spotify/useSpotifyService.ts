import { useMemo } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { SpotifyService } from './SpotifyService';
import { SpotifyServiceConfig } from './types';

export function useSpotifyService(config?: Partial<SpotifyServiceConfig>) {
  const { getSpotifyAccessToken, refreshSpotifyToken } = useAuth();

  const spotifyService = useMemo(() => {
    return new SpotifyService(getSpotifyAccessToken, refreshSpotifyToken, config);
  }, [getSpotifyAccessToken, refreshSpotifyToken, config]);

  return spotifyService;
}
