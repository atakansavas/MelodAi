import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Easing } from 'react-native-reanimated';

import { useAuthStore } from '@store/auth';

import { useRouter } from '../../hooks/useRouter';
import { useNavigation } from '../../navigation/NavigationStore';

const { width } = Dimensions.get('screen');

const _spacing = 20;
const _icons = 60;
const _movingSize = _icons + _spacing * 2;
const _borderRadius = _icons / 2;
const _sideIconSize = _icons * 0.9;

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showChatInput?: boolean;
  onChatSubmit?: (input: string) => void;
}

export default function MainLayout({
  children,
  title,
  subtitle,
  showChatInput = false,
  onChatSubmit,
}: MainLayoutProps) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { currentScreen } = useNavigation();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [chatInput, setChatInput] = useState('');

  const handleLogout = async () => {
    await logout();
    router.goToLogin();
  };

  const handleMenuPress = (action: string) => {
    console.log('🚀 ~ handleMenuPress ~ action:', action);
    switch (action) {
      case 'home':
        router.goToHome();
        break;
      case 'search':
        router.goToSearch();
        break;
      case 'settings':
        router.goToSettings();
        break;
      case 'favorites':
        // TODO: Navigate to favorites
        console.log('Favorites pressed');
        break;
      case 'history':
        router.goToHistory();
        break;
      case 'logout':
        handleLogout();
        break;
    }
  };

  const handleChatSubmit = () => {
    if (chatInput.trim() && onChatSubmit) {
      onChatSubmit(chatInput);
      setChatInput('');
    }
  };

  const isCurrentScreen = (screenAction: string) => {
    switch (screenAction) {
      case 'home':
        return currentScreen === 'MAIN_HOME';
      case 'search':
        return currentScreen === 'MAIN_SEARCH';
      case 'history':
        return currentScreen === 'MAIN_HISTORY';
      case 'settings':
        return currentScreen === 'MAIN_SETTINGS';
      case 'chat':
        return currentScreen === 'MAIN_CHAT_DETAIL';
      default:
        return false;
    }
  };

  const drawerIcons = [
    { key: 'home', icon: 'home', action: 'home' },
    { key: 'search', icon: 'search', action: 'search' },
    { key: 'history', icon: 'clock', action: 'history' },
    { key: 'settings', icon: 'settings', action: 'settings' },
    { key: 'logout', icon: 'log-out', action: 'logout' },
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* Blurred Background */}
      <BlurView intensity={20} style={StyleSheet.absoluteFillObject}>
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(55, 24, 83, 1)' }]} />
      </BlurView>

      {/* Drawer Background */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(55, 24, 83)' }]}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              width: _icons,
              flex: 1,
              alignSelf: 'flex-end',
              alignItems: 'center',
              margin: _spacing,
              justifyContent: 'flex-end',
            }}
          >
            {drawerIcons.map((item) => {
              const isActive = isCurrentScreen(item.action);
              return (
                <Pressable key={item.key} onPress={() => handleMenuPress(item.action)}>
                  <View
                    style={{
                      borderRadius: _borderRadius / 2,
                      backgroundColor: isActive ? '#1DB954' : 'rgba(255,255,255,0.2)',
                      height: _sideIconSize,
                      width: _sideIconSize,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: _spacing,
                    }}
                  >
                    <Feather
                      name={item.icon as any}
                      size={24}
                      color="#fff"
                      style={{ opacity: isActive ? 1 : 0.5 }}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Chat Input in Footer */}
        {showChatInput && (
          <View
            style={{
              paddingHorizontal: _spacing,
              width: width - _movingSize,
              justifyContent: 'center',
              marginBottom: _icons - _spacing,
            }}
          >
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 20,
                height: _icons - _spacing,
                justifyContent: 'center',
                padding: _spacing / 2,
              }}
            >
              <TextInput
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 20,
                  height: _icons - _spacing * 2,
                  paddingHorizontal: 16,
                  color: '#000',
                  fontSize: 14,
                }}
                placeholder="Bir şarkı hakkında konuşun..."
                placeholderTextColor="#666"
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={handleChatSubmit}
                returnKeyType="send"
              />
            </View>
          </View>
        )}
      </View>

      {/* Main Content */}
      <View style={{ flex: 1 }}>
        <MotiView
          from={{
            translateY: 0,
            translateX: 0,
          }}
          animate={{
            translateX: isDrawerVisible ? -_movingSize : 0,
            translateY: isDrawerVisible ? -_movingSize : 0,
          }}
          transition={{
            type: 'timing',
            duration: 600,
            easing: Easing.elastic(1.1),
          }}
          style={{
            flex: 1,
            backgroundColor: 'rgba(92, 50, 129, 1)',
            borderRadius: _borderRadius,
          }}
        >
          {/* Header */}
          {(title || subtitle) && (
            <View style={styles.header}>
              <View>
                {title && <Text style={styles.title}>{title}</Text>}
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              </View>
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>{children}</View>
        </MotiView>

        {/* Drawer Toggle Button */}
        <TouchableOpacity
          onPress={() => {
            setIsDrawerVisible((isVisible) => !isVisible);
          }}
        >
          <>
            <MotiView
              animate={{
                scale: isDrawerVisible ? [2, 0] : 0,
                opacity: isDrawerVisible ? 0 : 1,
              }}
              transition={{
                type: 'timing',
                duration: 300,
              }}
              style={{
                position: 'absolute',
                width: _icons,
                height: _icons,
                borderRadius: _icons,
                backgroundColor: '#FE2A6B',
                alignItems: 'center',
                justifyContent: 'center',
                right: _spacing,
                bottom: _spacing,
              }}
            />
            <MotiView
              animate={{
                rotate: isDrawerVisible ? '180deg' : '0deg',
              }}
              transition={{
                type: 'timing',
                duration: 300,
              }}
              style={{
                width: _icons,
                height: _icons,
                borderRadius: _icons,
                backgroundColor: '#FE2A6B',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                right: _spacing,
                bottom: _spacing,
              }}
            >
              <Feather name={isDrawerVisible ? 'x' : 'menu'} size={24} color="#fff" />
            </MotiView>
          </>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.7,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
});
