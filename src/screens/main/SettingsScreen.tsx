import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import { MainLayout } from '../../components/Layout';

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  showArrow?: boolean;
}

function SettingItem({
  icon,
  title,
  subtitle,
  onPress,
  showSwitch = false,
  switchValue = false,
  onSwitchChange,
  showArrow = true,
  delay = 0,
}: SettingItemProps & { delay?: number }) {
  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{
        type: 'timing',
        duration: 400,
        delay,
      }}
    >
      <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={showSwitch}>
        <View style={styles.settingItemLeft}>
          <View style={styles.settingIcon}>
            <Feather name={icon as any} size={20} color="#fff" />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{title}</Text>
            {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        <View style={styles.settingItemRight}>
          {showSwitch ? (
            <Switch
              value={switchValue}
              onValueChange={onSwitchChange}
              trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#1DB954' }}
              thumbColor="#fff"
            />
          ) : (
            showArrow && (
              <Feather name="chevron-right" size={20} color="#fff" style={{ opacity: 0.5 }} />
            )
          )}
        </View>
      </TouchableOpacity>
    </MotiView>
  );
}

export default function SettingsScreen() {
  const [user] = useState({ display_name: 'User' }); // Placeholder user data
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // Get app version from Expo Constants
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const appName = Constants.expoConfig?.name || 'SpotSong';

  const handleProfilePress = () => {
    Alert.alert('Profil', 'Profil ayarları yakında eklenecek.', [
      { text: 'Tamam', style: 'default' },
    ]);
  };

  const handlePrivacyPress = () => {
    Alert.alert('Gizlilik', 'Gizlilik ayarları yakında eklenecek.', [
      { text: 'Tamam', style: 'default' },
    ]);
  };

  const handleAboutPress = () => {
    Alert.alert(
      'Hakkında',
      `${appName} v${appVersion}\n\nMüzik deneyiminizi AI ile zenginleştirin.`,
      [{ text: 'Tamam', style: 'default' }]
    );
  };

  const handleHelpPress = () => {
    Alert.alert('Yardım', 'Yardım ve destek yakında eklenecek.', [
      { text: 'Tamam', style: 'default' },
    ]);
  };

  const handleTermsPress = () => {
    Alert.alert('Kullanım Şartları', 'Kullanım şartları yakında eklenecek.', [
      { text: 'Tamam', style: 'default' },
    ]);
  };

  const handleNotificationsToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    // TODO: Implement actual notification settings
    console.log('Notifications enabled:', value);
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkModeEnabled(value);
    // TODO: Implement actual dark mode settings
    console.log('Dark mode enabled:', value);
  };

  const handleRateApp = () => {
    // TODO: Implement app store rating
    Alert.alert('Uygulamayı Değerlendir', 'Uygulama mağazası değerlendirmesi yakında eklenecek.', [
      { text: 'Tamam', style: 'default' },
    ]);
  };

  const handleShareApp = () => {
    // TODO: Implement share functionality
    Alert.alert('Uygulamayı Paylaş', 'Paylaşım özelliği yakında eklenecek.', [
      { text: 'Tamam', style: 'default' },
    ]);
  };

  return (
    <MainLayout title="Ayarlar" subtitle="Uygulama tercihlerinizi yönetin">
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: 'timing',
          duration: 600,
        }}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'timing',
              duration: 500,
              delay: 200,
            }}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Hesap</Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon="user"
                title="Profil"
                subtitle={user?.display_name || 'Kullanıcı'}
                onPress={handleProfilePress}
                delay={300}
              />
              <SettingItem
                icon="shield"
                title="Gizlilik"
                subtitle="Veri kullanımı ve gizlilik ayarları"
                onPress={handlePrivacyPress}
                delay={400}
              />
            </View>
          </MotiView>

          {/* Preferences Section */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'timing',
              duration: 500,
              delay: 300,
            }}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Tercihler</Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon="bell"
                title="Bildirimler"
                subtitle="Push bildirimleri"
                showSwitch={true}
                switchValue={notificationsEnabled}
                onSwitchChange={handleNotificationsToggle}
                showArrow={false}
                delay={400}
              />
              <SettingItem
                icon="moon"
                title="Karanlık Mod"
                subtitle="Karanlık tema"
                showSwitch={true}
                switchValue={darkModeEnabled}
                onSwitchChange={handleDarkModeToggle}
                showArrow={false}
                delay={500}
              />
            </View>
          </MotiView>

          {/* Support Section */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'timing',
              duration: 500,
              delay: 400,
            }}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Destek</Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon="help-circle"
                title="Yardım"
                subtitle="Sık sorulan sorular ve destek"
                onPress={handleHelpPress}
                delay={500}
              />
              <SettingItem
                icon="info"
                title="Hakkında"
                subtitle="Uygulama bilgileri"
                onPress={handleAboutPress}
                delay={600}
              />
              <SettingItem
                icon="file-text"
                title="Kullanım Şartları"
                subtitle="Yasal bilgiler"
                onPress={handleTermsPress}
                delay={700}
              />
            </View>
          </MotiView>

          {/* App Actions Section */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'timing',
              duration: 500,
              delay: 500,
            }}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Uygulama</Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon="star"
                title="Uygulamayı Değerlendir"
                subtitle="App Store'da değerlendirin"
                onPress={handleRateApp}
                delay={600}
              />
              <SettingItem
                icon="share-2"
                title="Uygulamayı Paylaş"
                subtitle="Arkadaşlarınızla paylaşın"
                onPress={handleShareApp}
                delay={700}
              />
            </View>
          </MotiView>

          {/* App Info */}
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'timing',
              duration: 400,
              delay: 800,
            }}
            style={styles.appInfo}
          >
            <Text style={styles.appInfoText}>
              {appName} v{appVersion}
            </Text>
            <Text style={styles.appInfoSubtext}>Müzik deneyiminizi AI ile zenginleştirin</Text>
          </MotiView>
        </ScrollView>
      </MotiView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    opacity: 0.8,
  },
  sectionContent: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.6,
  },
  settingItemRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    opacity: 0.6,
  },
  appInfoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  appInfoSubtext: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.7,
  },
});
