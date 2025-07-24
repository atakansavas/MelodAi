import { Feather } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SpotifyApiService } from '@services/spotify';

import { SpotifyTrack } from '../../../types/spotify';
import { MainLayout } from '../../components/Layout';
import { useRouter } from '../../hooks/useRouter';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const spotifyApi = SpotifyApiService.getInstance();

  const searchTracks = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setHasSearched(false);
        return;
      }

      try {
        setIsLoading(true);
        setHasSearched(true);
        const response = await spotifyApi.searchTracks(query, 20);
        setSearchResults(response.tracks?.items || []);
      } catch (error) {
        console.error('Error searching tracks:', error);
        Alert.alert('Hata', 'Şarkı arama sırasında bir hata oluştu.');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [spotifyApi]
  );

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchTracks(searchQuery);
      } else {
        setSearchResults([]);
        setHasSearched(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchTracks]);

  const handleTrackPress = (track: SpotifyTrack) => {
    router.goToChatDetail({
      trackId: track.id,
      trackName: track.name,
      artistName: track.artists.map((artist) => artist.name).join(', '),
    });
  };

  const renderTrackItem = ({ item }: { item: SpotifyTrack }) => (
    <TouchableOpacity style={styles.trackItem} onPress={() => handleTrackPress(item)}>
      <Image
        source={{ uri: item.album.images[0]?.url }}
        style={styles.trackImage}
        defaultSource={require('../../../assets/images/icon.png')}
      />
      <View style={styles.trackInfo}>
        <Text style={styles.trackName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.artistName} numberOfLines={1}>
          {item.artists.map((artist) => artist.name).join(', ')}
        </Text>
        <Text style={styles.albumName} numberOfLines={1}>
          {item.album.name}
        </Text>
      </View>
      <Feather name="message-circle" size={20} color="#1DB954" style={styles.chatIcon} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={styles.emptyStateText}>Şarkılar aranıyor...</Text>
        </View>
      );
    }

    if (hasSearched && searchResults.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Feather name="search" size={48} color="#666" />
          <Text style={styles.emptyStateText}>Sonuç bulunamadı</Text>
          <Text style={styles.emptyStateSubtext}>Farklı anahtar kelimeler deneyin</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Feather name="music" size={48} color="#666" />
        <Text style={styles.emptyStateText}>Şarkı aramaya başlayın</Text>
        <Text style={styles.emptyStateSubtext}>Şarkı adı, sanatçı veya albüm adı yazın</Text>
      </View>
    );
  };

  return (
    <MainLayout title="Şarkı Ara" subtitle="Spotify'dan şarkı arayın ve sohbet başlatın">
      <View style={styles.container}>
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Şarkı, sanatçı veya albüm ara..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Feather name="x" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Results */}
        <FlatList
          data={searchResults}
          renderItem={renderTrackItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
        />
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  listContainer: {
    flexGrow: 1,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  trackImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
    color: '#1DB954',
    marginBottom: 2,
  },
  albumName: {
    fontSize: 12,
    color: '#ccc',
  },
  chatIcon: {
    marginLeft: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
