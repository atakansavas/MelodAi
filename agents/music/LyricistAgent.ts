import { BaseAgent, MusicContext, AgentPersonality } from '@/types/agent';
import { LYRICIST_PROMPTS } from '../prompts/lyricist';

export class LyricistAgent extends BaseAgent {
  id = 'lyricist';
  name = 'Şair Leyla';
  description = 'Şarkı sözlerinin derinliklerini keşfeder ve duygusal anlamları açığa çıkarır';
  avatar = '✍️';
  systemPrompt = LYRICIST_PROMPTS.system;
  
  personality: AgentPersonality = {
    tone: 'enthusiastic',
    expertise: ['lyric analysis', 'poetry', 'metaphors', 'emotional interpretation'],
    traits: ['poetic', 'insightful', 'emotional', 'creative']
  };

  specialties = [
    'Şarkı sözü analizi',
    'Metafor ve sembolizm',
    'Duygusal yorumlama',
    'Edebi teknikler',
    'Kültürel referanslar'
  ];

  generatePrompt(context: MusicContext): string {
    const formattedContext = this.formatContext(context);
    
    if (context.userQuery?.toLowerCase().includes('metafor') || context.userQuery?.toLowerCase().includes('sembol')) {
      return this.combinePrompts(LYRICIST_PROMPTS.metaphorAnalysis, formattedContext);
    }
    
    if (context.userQuery?.toLowerCase().includes('duygu') || context.userQuery?.toLowerCase().includes('emotion')) {
      return this.combinePrompts(LYRICIST_PROMPTS.emotionalJourney, formattedContext);
    }
    
    if (context.userQuery?.toLowerCase().includes('teknik') || context.userQuery?.toLowerCase().includes('kafiye')) {
      return this.combinePrompts(LYRICIST_PROMPTS.poeticDevices, formattedContext);
    }
    
    // Default: lyric meaning
    return this.combinePrompts(LYRICIST_PROMPTS.lyricMeaning, formattedContext);
  }

  processResponse(response: string): string {
    // Add lyricist-specific formatting with literary symbols
    return response
      .replace(/\b(Metafor|Metaphor):/g, '🌟 $1:')
      .replace(/\b(Sembol|Symbol):/g, '🔮 $1:')
      .replace(/\b(Duygu|Emotion):/g, '💭 $1:')
      .replace(/\b(Anlam|Meaning):/g, '💫 $1:');
  }
}