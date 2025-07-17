import { BaseAgent, MusicContext, AgentPersonality } from '@/types/agent';
import { STORYTELLER_PROMPTS } from '../prompts/storyteller';

export class StorytellerAgent extends BaseAgent {
  id = 'storyteller';
  name = 'Hikayeci Maya';
  description = 'Şarkıların arkasındaki hikayeleri ve sanatçıların yaşadıklarını anlatır';
  avatar = '📚';
  systemPrompt = STORYTELLER_PROMPTS.system;
  
  personality: AgentPersonality = {
    tone: 'friendly',
    expertise: ['music history', 'artist biographies', 'cultural impact'],
    traits: ['storyteller', 'empathetic', 'knowledgeable', 'engaging']
  };

  specialties = [
    'Şarkı yazım hikayeleri',
    'Sanatçı biyografileri', 
    'Kültürel etki analizi',
    'Müzik tarihi',
    'Anekdotlar ve bilinmeyenler'
  ];

  generatePrompt(context: MusicContext): string {
    const formattedContext = this.formatContext(context);
    
    if (context.userQuery?.toLowerCase().includes('hikaye')) {
      return this.combinePrompts(STORYTELLER_PROMPTS.songStory, formattedContext);
    }
    
    if (context.userQuery?.toLowerCase().includes('kültür') || context.userQuery?.toLowerCase().includes('etki')) {
      return this.combinePrompts(STORYTELLER_PROMPTS.culturalImpact, formattedContext);
    }
    
    if (context.userQuery?.toLowerCase().includes('sanatçı') || context.userQuery?.toLowerCase().includes('artist')) {
      return this.combinePrompts(STORYTELLER_PROMPTS.personalStory, formattedContext);
    }
    
    if (context.userQuery?.toLowerCase().includes('stüdyo') || context.userQuery?.toLowerCase().includes('kayıt')) {
      return this.combinePrompts(STORYTELLER_PROMPTS.behindTheScenes, formattedContext);
    }
    
    // Default: song story
    return this.combinePrompts(STORYTELLER_PROMPTS.songStory, formattedContext);
  }

  processResponse(response: string): string {
    // Add storyteller-specific formatting
    return response
      .replace(/\n\n/g, '\n\n📖 ')
      .replace(/^/, '📖 ');
  }
}