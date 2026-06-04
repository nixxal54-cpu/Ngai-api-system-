export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
}

export interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string | null;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export abstract class BaseProvider {
  /**
   * Generates a chat completion.
   * If `req.stream` is true, this function must return a ReadableStream or AsyncIterable
   * that yields Server-Sent Events strings or chunks.
   * Otherwise, it returns standard JSON.
   */
  abstract chatCompletion(req: ChatRequest, onChunk?: (chunk: string) => void): Promise<ChatResponse | void>;
}
