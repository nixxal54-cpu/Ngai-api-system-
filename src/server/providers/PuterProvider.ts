import { BaseProvider, ChatRequest, ChatResponse } from './BaseProvider.js';
import { v4 as uuidv4 } from 'uuid';

export class PuterProvider extends BaseProvider {
  private apiKey: string;
  private endpoint: string = 'https://api.puter.com/puterai/openai/v1/chat/completions'; // Puter endpoint

  constructor() {
    super();
    this.apiKey = process.env.PUTER_API_KEY || '';
  }

  async chatCompletion(req: ChatRequest, onChunk?: (chunk: string) => void): Promise<ChatResponse | void> {
    const model = req.model || 'qwen-max';
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Only send the header if the server administrator provided a key
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model,
        messages: req.messages,
        stream: req.stream || false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Puter API Error (${response.status}): ${errorText}`);
    }

    if (req.stream && onChunk && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        onChunk(chunk);
      }
      return;
    } else {
      const data = await response.json();
      return data;
    }
  }
}
