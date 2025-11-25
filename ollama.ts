import { AgentResponse } from '@/types';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
  };
}

export interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export class OllamaClient {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl?: string, model?: string) {
    this.baseUrl = baseUrl || OLLAMA_BASE_URL;
    this.model = model || DEFAULT_MODEL;
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  }

  async generate(prompt: string, options?: { temperature?: number }): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          options: {
            temperature: options?.temperature || 0.7,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data: OllamaGenerateResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Ollama generate error:', error);
      throw error;
    }
  }

  async generateStream(
    prompt: string,
    onChunk: (chunk: string) => void,
    options?: { temperature?: number }
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: true,
          options: {
            temperature: options?.temperature || 0.7,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('n').filter((line) => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              fullResponse += data.response;
              onChunk(data.response);
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }

      return fullResponse;
    } catch (error) {
      console.error('Ollama stream error:', error);
      throw error;
    }
  }

  parseAgentResponse(response: string): AgentResponse {
    // Check for SEARCH: pattern
    const searchMatch = response.match(/SEARCH:s*(.+?)(?=n|$)/i);
    if (searchMatch) {
      return {
        type: 'search',
        content: response,
        searchQuery: searchMatch[1].trim(),
      };
    }

    // Check for ANSWER: pattern
    const answerMatch = response.match(/ANSWER:s*([sS]+)/i);
    if (answerMatch) {
      return {
        type: 'answer',
        content: answerMatch[1].trim(),
      };
    }

    // Default to thinking
    return {
      type: 'thinking',
      content: response,
    };
  }
}

export const ollamaClient = new OllamaClient();
