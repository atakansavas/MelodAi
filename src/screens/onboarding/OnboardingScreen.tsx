import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { agentRegistry } from '@agents/index';
import { useAppStore } from '@store/app';

import { useRouter } from '../../hooks/useRouter';

export default function OnboardingScreen() {
  const router = useRouter();
  const { setOnboardingCompleted } = useAppStore();
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  const agents = agentRegistry.getAllAgents();

  const handleComplete = async () => {
    if (selectedAgents.length === 0) {
      Alert.alert(
        'Asistan Seçimi',
        'En az bir asistan seçmelisiniz. Varsayılan olarak tüm asistanlar seçilsin mi?',
        [
          { text: 'Geri Dön', style: 'cancel' },
          {
            text: 'Tümünü Seç',
            onPress: () => {
              setSelectedAgents(agents.map((agent) => agent.id));
              completeOnboarding();
            },
          },
        ]
      );
      return;
    }

    completeOnboarding();
  };

  const completeOnboarding = async () => {
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
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Hoş Geldiniz! 🎉</Text>
          <Text style={styles.welcomeSubtitle}>
            Melodia ile müziğinizin hikayelerini keşfetmeye hazır mısınız?
          </Text>

          <Text style={styles.welcomeText}>
            Spotify dinleme geçmişinizdeki şarkılarla AI asistanlarımız ile sohbet edebileceksiniz.
            Her şarkının kendine özgü bir hikayesi var ve biz bu hikayeleri sizinle paylaşacağız.
          </Text>

          <View style={styles.benefitsList}>
            <Text style={styles.benefitItem}>🎵 Şarkılarınızın hikayelerini öğrenin</Text>
            <Text style={styles.benefitItem}>🧠 Müziğin duygusal etkilerini keşfedin</Text>
            <Text style={styles.benefitItem}>📚 Sanatçıların yaşadıklarını anlayın</Text>
            <Text style={styles.benefitItem}>✍️ Şarkı sözlerinin derinliklerini görün</Text>
          </View>
        </View>

        {/* Agent Selection Section */}
        <View style={styles.agentsSection}>
          <Text style={styles.agentsTitle}>AI Asistanlarımızla Tanışın 🤖</Text>
          <Text style={styles.agentsSubtitle}>Hangi asistanlarla sohbet etmek istiyorsunuz?</Text>

          <View style={styles.agentsContainer}>
            {agents.map((agent) => (
              <TouchableOpacity
                key={agent.id}
                style={[
                  styles.agentCard,
                  selectedAgents.includes(agent.id) && styles.agentCardSelected,
                ]}
                onPress={() => {
                  if (selectedAgents.includes(agent.id)) {
                    setSelectedAgents(selectedAgents.filter((id) => id !== agent.id));
                  } else {
                    setSelectedAgents([...selectedAgents, agent.id]);
                  }
                }}
              >
                <Text style={styles.agentAvatar}>{agent.avatar}</Text>
                <View style={styles.agentInfo}>
                  <Text style={styles.agentName}>{agent.name}</Text>
                  <Text style={styles.agentDescription}>{agent.description}</Text>
                  <View style={styles.agentSpecialties}>
                    {agent.specialties.slice(0, 2).map((specialty, index) => (
                      <Text key={index} style={styles.agentSpecialty}>
                        {specialty}
                      </Text>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Selected Agents Preview */}
          <View style={styles.selectedAgentsPreview}>
            <Text style={styles.selectedAgentsTitle}>Seçtiğiniz asistanlar:</Text>
            {selectedAgents.length === 0 ? (
              <Text style={styles.noAgentsText}>Henüz bir asistan seçmediniz</Text>
            ) : (
              <View style={styles.selectedAgentsList}>
                {selectedAgents.map((agentId) => {
                  const agent = agentRegistry.getAgent(agentId);
                  return agent ? (
                    <View key={agentId} style={styles.selectedAgentItem}>
                      <Text style={styles.selectedAgentAvatar}>{agent.avatar}</Text>
                      <Text style={styles.selectedAgentName}>{agent.name}</Text>
                    </View>
                  ) : null;
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity style={styles.startButton} onPress={handleComplete}>
          <Text style={styles.startButtonText}>Başlayalım! 🚀</Text>
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
    paddingBottom: 100, // Space for bottom action
  },
  welcomeSection: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    opacity: 0.8,
  },
  benefitsList: {
    paddingHorizontal: 16,
  },
  benefitItem: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
    opacity: 0.9,
  },
  agentsSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  agentsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  agentsSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 32,
  },
  agentsContainer: {
    marginBottom: 32,
  },
  agentCard: {
    flexDirection: 'row',
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  agentCardSelected: {
    borderColor: '#1DB954',
    backgroundColor: '#1DB954',
  },
  agentAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  agentDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.7,
    marginBottom: 8,
  },
  agentSpecialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  agentSpecialty: {
    fontSize: 12,
    color: '#fff',
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
    opacity: 0.8,
  },
  selectedAgentsPreview: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 12,
  },
  selectedAgentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  noAgentsText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.6,
    textAlign: 'center',
  },
  selectedAgentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedAgentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedAgentAvatar: {
    fontSize: 16,
    marginRight: 6,
  },
  selectedAgentName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  startButton: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#1DB954',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
