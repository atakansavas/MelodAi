import { AIAgent } from '../types/agent';

import { LyricistAgent } from './music/LyricistAgent';
import { MoodDetectorAgent } from './music/MoodDetectorAgent';
import { MusicAnalystAgent } from './music/MusicAnalystAgent';
import { StorytellerAgent } from './music/StorytellerAgent';

export class AgentRegistry {
  private static instance: AgentRegistry;
  private agents: Map<string, AIAgent> = new Map();

  private constructor() {
    this.registerDefaultAgents();
  }

  static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  private registerDefaultAgents(): void {
    const defaultAgents = [
      new StorytellerAgent(),
      new MusicAnalystAgent(),
      new LyricistAgent(),
      new MoodDetectorAgent(),
    ];

    defaultAgents.forEach((agent) => {
      this.agents.set(agent.id, agent);
    });
  }

  registerAgent(agent: AIAgent): void {
    this.agents.set(agent.id, agent);
  }

  getAgent(id: string): AIAgent | undefined {
    return this.agents.get(id);
  }

  getAllAgents(): AIAgent[] {
    return Array.from(this.agents.values());
  }

  getAgentsBySpecialty(specialty: string): AIAgent[] {
    return this.getAllAgents().filter((agent) =>
      agent.specialties.some((s) => s.toLowerCase().includes(specialty.toLowerCase()))
    );
  }

  getDefaultAgent(): AIAgent {
    return this.getAgent('storyteller') || this.getAllAgents()[0]!;
  }

  removeAgent(id: string): boolean {
    return this.agents.delete(id);
  }
}

// Export agent instances for direct usage
export const agentRegistry = AgentRegistry.getInstance();
export * from './music/LyricistAgent';
export * from './music/MoodDetectorAgent';
export * from './music/MusicAnalystAgent';
export * from './music/StorytellerAgent';
