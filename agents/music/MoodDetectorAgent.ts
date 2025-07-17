import { BaseAgent, MusicContext, AgentPersonality } from '@/types/agent';
import { MOOD_PROMPTS } from '../prompts/mood';

export class MoodDetectorAgent extends BaseAgent {
  id = 'mood';
  name = 'Terapi Uzmanı Deniz';
  description = 'Müziğin ruh haline etkilerini analiz eder ve duygusal rehberlik sunar';
  avatar = '🧠';
  systemPrompt = MOOD_PROMPTS.system;
  
  personality: AgentPersonality = {
    tone: 'casual',
    expertise: ['psychology', 'music therapy', 'emotional analysis', 'mental health'],
    traits: ['supportive', 'understanding', 'wise', 'caring']
  };

  specialties = [
    'Ruh hali analizi',
    'Müzik terapisi',
    'Duygusal etki değerlendirmesi',
    'Kişilik uyumu',
    'Psikolojik fayda analizi'
  ];

  generatePrompt(context: MusicContext): string {
    const formattedContext = this.formatContext(context);
    
    if (context.userQuery?.toLowerCase().includes('ihtiyaç') || context.userQuery?.toLowerCase().includes('need')) {
      return this.combinePrompts(MOOD_PROMPTS.emotionalNeeds, formattedContext);
    }
    
    if (context.userQuery?.toLowerCase().includes('terapi') || context.userQuery?.toLowerCase().includes('therapy')) {
      return this.combinePrompts(MOOD_PROMPTS.therapeuticValue, formattedContext);
    }
    
    if (context.userQuery?.toLowerCase().includes('kişilik') || context.userQuery?.toLowerCase().includes('personality')) {
      return this.combinePrompts(MOOD_PROMPTS.personalityFit, formattedContext);
    }
    
    // Default: mood analysis
    return this.combinePrompts(MOOD_PROMPTS.moodAnalysis, formattedContext);
  }

  processResponse(response: string): string {
    // Add mood-specific formatting with emotional symbols
    return response
      .replace(/\b(Ruh hali|Mood):/g, '🌈 $1:')
      .replace(/\b(Duygu|Feeling):/g, '💝 $1:')
      .replace(/\b(Etki|Effect):/g, '✨ $1:')
      .replace(/\b(Öneriler|Suggestions):/g, '💡 $1:');
  }
}