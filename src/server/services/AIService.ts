import { BaseProvider, ChatRequest, ChatResponse } from '../providers/BaseProvider';
import { PuterProvider } from '../providers/PuterProvider';

export class AIService {
  private static instance: AIService;
  private providers: Map<string, BaseProvider> = new Map();
  private defaultProvider: BaseProvider;

  private constructor() {
    // Pluggable providers architecture
    const puterProvider = new PuterProvider();
    
    this.providers.set('puter', puterProvider);
    // You can add OpenAIProvider, GeminiProvider here in the future
    
    // Set standard provider fallback
    this.defaultProvider = puterProvider;
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public async getChatCompletion(req: ChatRequest, onChunk?: (chunk: string) => void): Promise<ChatResponse | void> {
    // In the future, this can route based on the requested model
    return await this.defaultProvider.chatCompletion(req, onChunk);
  }
}
