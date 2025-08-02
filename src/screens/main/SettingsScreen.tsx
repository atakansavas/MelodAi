import { Feather } from '@expo/vector-icons';
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

  const handleProfilePress = () => {
    // TODO: Navigate to profile
    console.log('Profile pressed');
  };

  const handlePrivacyPress = () => {
    // TODO: Navigate to privacy settings
    console.log('Privacy pressed');
  };

  const handleAboutPress = () => {
    Alert.alert('Hakkında', 'Spoti v1.0.0\n\nMüzik deneyiminizi AI ile zenginleştirin.', [
      { text: 'Tamam', style: 'default' },
    ]);
  };

  const handleHelpPress = () => {
    // TODO: Navigate to help
    console.log('Help pressed');
  };

  const handleTermsPress = () => {
    // TODO: Navigate to terms
    console.log('Terms pressed');
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
            <Text style={styles.appInfoText}>Spoti v1.0.0</Text>
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
