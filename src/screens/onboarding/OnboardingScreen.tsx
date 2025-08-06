import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAppStore } from '../../../store';
import { useRouter } from '../../hooks/useRouter';

export default function OnboardingScreen() {
  const router = useRouter();
  const { setOnboardingCompleted } = useAppStore();

  const handleComplete = async () => {
    await setOnboardingCompleted(true);
    router.goToHome();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="musical-notes" size={48} color="#1DB954" />
            <Text style={styles.logoText}>Spot Song</Text>
          </View>
        </View>

        {/* Welcome */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome! 🎉</Text>
          <Text style={styles.welcomeSubtitle}>Chat with AI about your Spotify music</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="book-outline" size={24} color="#1DB954" />
            </View>
            <Text style={styles.featureText}>Song Stories</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="analytics-outline" size={24} color="#1DB954" />
            </View>
            <Text style={styles.featureText}>Music Analysis</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="create-outline" size={24} color="#1DB954" />
            </View>
            <Text style={styles.featureText}>Lyric Insights</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="heart-outline" size={24} color="#1DB954" />
            </View>
            <Text style={styles.featureText}>Mood Detection</Text>
          </View>
        </View>
      </ScrollView>

      {/* Start Button */}
      <View style={styles.bottomAction}>
        <TouchableOpacity style={styles.startButton} onPress={handleComplete}>
          <Text style={styles.startButtonText}>Start Exploring 🚀</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  header: {
    paddingTop: Constants.statusBarHeight + 40,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    marginLeft: 16,
    fontSize: 28,
    fontWeight: '800',
    color: '#1DB954',
    letterSpacing: -0.5,
  },
  welcomeSection: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1,
  },
  welcomeSubtitle: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.85,
    fontWeight: '400',
    lineHeight: 28,
  },
  featuresSection: {
    paddingHorizontal: 24,
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(29, 185, 84, 0.25)',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(29, 185, 84, 0.15)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  featureText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  startButton: {
    paddingVertical: 20,
    borderRadius: 16,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
