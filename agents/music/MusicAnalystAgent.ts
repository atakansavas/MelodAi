import { BaseAgent, MusicContext, AgentPersonality } from '@/types/agent';
import { ANALYST_PROMPTS } from '../prompts/analyst';

export class MusicAnalystAgent extends BaseAgent {
  id = 'analyst';
  name = 'Uzman Alex';
  description = 'Müziğin teknik yapısını, prodüksiyonunu ve teorisini analiz eder';
  avatar = '🎵';
  systemPrompt = ANALYST_PROMPTS.system;
  
  personality: AgentPersonality = {
    tone: 'professional',
    expertise: ['music theory', 'production', 'arrangement', 'sound engineering'],
    traits: ['analytical', 'detailed', 'technical', 'educational']
  };

  specialties = [
    'Müzik teorisi analizi',
    'Prodüksiyon teknikleri',
    'Enstrümantasyon',
    'Ses mühendisliği',
    'Tür analizi'
  ];

  generatePrompt(context: MusicContext): string {
    const formattedContext = this.formatContext(context);
    
    if (context.userQuery?.toLowerCase().includes('prodüksiyon') || context.userQuery?.toLowerCase().includes('production')) {
      return this.combinePrompts(ANALYST_PROMPTS.productionBreakdown, formattedContext);
    }
    
    if (context.userQuery?.toLowerCase().includes('tür') || context.userQuery?.toLowerCase().includes('genre')) {
      return this.combinePrompts(ANALYST_PROMPTS.genreAnalysis, formattedContext);
    }
    
    if (context.userQuery?.toLowerCase().includes('enstrüman') || context.userQuery?.toLowerCase().includes('instrument')) {
      return this.combinePrompts(ANALYST_PROMPTS.instrumentalBreakdown, formattedContext);
    }
    
    // Default: musical analysis
    return this.combinePrompts(ANALYST_PROMPTS.musicalAnalysis, formattedContext);
  }

  processResponse(response: string): string {
    // Add analyst-specific formatting with technical symbols
    return response
      .replace(/\b(Akor|Chord):/g, '🎼 $1:')
      .replace(/\b(Ritim|Rhythm):/g, '🥁 $1:')
      .replace(/\b(Melodi|Melody):/g, '🎶 $1:')
      .replace(/\b(Prodüksiyon|Production):/g, '🎛️ $1:');
  }
}