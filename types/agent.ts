import { SpotifyTrack, SpotifyArtist, SpotifyAlbum } from './spotify';

export interface MusicContext {
  track: SpotifyTrack;
  artist: SpotifyArtist;
  album: SpotifyAlbum;
  userQuery?: string;
  additionalInfo?: Record<string, any>;
}

export interface AgentPersonality {
  tone: 'friendly' | 'professional' | 'casual' | 'enthusiastic' | 'academic';
  expertise: string[];
  traits: string[];
}

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  avatar: string;
  systemPrompt: string;
  personality: AgentPersonality;
  specialties: string[];
  generatePrompt(context: MusicContext): string;
  processResponse?(response: string): string;
}

export abstract class BaseAgent implements AIAgent {
  abstract id: string;
  abstract name: string;
  abstract description: string;
  abstract avatar: string;
  abstract systemPrompt: string;
  abstract personality: AgentPersonality;
  abstract specialties: string[];

  abstract generatePrompt(context: MusicContext): string;

  protected combinePrompts(base: string, context: string): string {
    return `${this.systemPrompt}\n\nContext: ${context}\n\nTask: ${base}`;
  }

  protected formatContext(context: MusicContext): string {
    return `
Song: "${context.track.name}"
Artist: ${context.artist.name}
Album: ${context.album.name}
Release Date: ${context.album.release_date}
Genre: ${context.artist.genres.join(', ') || 'Unknown'}
Popularity: ${context.track.popularity}/100
${context.userQuery ? `User Question: ${context.userQuery}` : ''}
    `.trim();
  }

  processResponse?(response: string): string {
    return response;
  }
}