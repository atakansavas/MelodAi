import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { agentRegistry } from '@agents/index';
import { useAppStore } from '@store/app';

import { useRouter } from '../../hooks/useRouter';

export default function OnboardingScreen() {
  const router = useRouter();
  const { setOnboardingCompleted } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  const agents = agentRegistry.getAllAgents();

  const onboardingSteps = [
    {
      title: 'Hoş Geldiniz! 🎉',
      description: 'Melodia ile müziğinizin hikayelerini keşfetmeye hazır mısınız?',
      content: (
        <View style={styles.welcomeContent}>
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
      ),
    },
    {
      title: 'AI Asistanlarımızla Tanışın 🤖',
      description: 'Hangi asistanlarla sohbet etmek istiyorsunuz?',
      content: (
        <ScrollView style={styles.agentsContainer}>
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
        </ScrollView>
      ),
    },
    {
      title: 'Hazırsınız! 🚀',
      description: 'Şimdi müziğinizin hikayelerini keşfetmeye başlayalım!',
      content: (
        <View style={styles.finalContent}>
          <Text style={styles.finalText}>
            Spotify dinleme geçmişinizden bir şarkı seçin ve seçtiğiniz AI asistanlarla sohbet
            etmeye başlayın.
          </Text>
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
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

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

  const isLastStep = currentStep === onboardingSteps.length - 1;
  const step = onboardingSteps[currentStep];

  if (!step) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.description}>{step.description}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        {onboardingSteps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentStep && styles.progressDotActive,
              index < currentStep && styles.progressDotCompleted,
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>{step.content}</View>

      {/* Actions */}
      <View style={styles.actions}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Text style={styles.backButtonText}>Geri</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nextButton, currentStep === 0 && styles.nextButtonFull]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>{isLastStep ? 'Başlayalım!' : 'Devam Et'}</Text>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#1DB954',
  },
  progressDotCompleted: {
    backgroundColor: '#1DB954',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
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
  agentsContainer: {
    flex: 1,
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
  finalContent: {
    flex: 1,
    justifyContent: 'center',
  },
  finalText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
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
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#333',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#1DB954',
    alignItems: 'center',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
