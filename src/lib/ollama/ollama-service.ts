import { create } from 'z-ai-web-dev-sdk';

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  system?: string;
  context?: number[];
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    repeat_penalty?: number;
    predict?: number;
    num_predict?: number;
    seed?: number;
    num_ctx?: number;
    num_batch?: number;
    num_gpu?: number;
    main_gpu?: number;
    low_vram?: boolean;
    f16_kv?: boolean;
    vocab_only?: boolean;
    use_mmap?: boolean;
    use_mlock?: boolean;
    embedding_only?: boolean;
    rope_frequency_base?: number;
    rope_frequency_scale?: number;
    num_thread?: number;
  };
  format?: string;
  template?: string;
  stream?: boolean;
  raw?: boolean;
  keep_alive?: string;
}

export interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export class OllamaService {
  private baseUrl: string;
  private defaultModel: string;

  constructor(baseUrl: string = 'http://localhost:11434', defaultModel: string = 'phi-2') {
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Ollama connection check failed:', error);
      return false;
    }
  }

  async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to list models: ${response.statusText}`);
      }

      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Error listing models:', error);
      throw error;
    }
  }

  async pullModel(modelName: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.statusText}`);
      }

      // Handle streaming response for model download progress
      const reader = response.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.status) {
                console.log(`Model download: ${data.status}`);
              }
            } catch (e) {
              // Ignore parsing errors for partial chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Error pulling model:', error);
      throw error;
    }
  }

  async generate(request: OllamaGenerateRequest): Promise<OllamaGenerateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model || this.defaultModel,
          prompt: request.prompt,
          system: request.system,
          context: request.context,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40,
            repeat_penalty: 1.1,
            num_predict: 1000,
            num_ctx: 2048,
            ...request.options,
          },
          format: request.format,
          template: request.template,
          stream: request.stream || false,
          raw: request.raw || false,
          keep_alive: request.keep_alive || '5m',
        }),
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      if (request.stream) {
        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());
            
            for (const line of lines) {
              try {
                const data = JSON.parse(line);
                if (data.response) {
                  fullResponse += data.response;
                }
                if (data.done) {
                  return {
                    model: data.model || request.model || this.defaultModel,
                    created_at: data.created_at || new Date().toISOString(),
                    response: fullResponse,
                    done: true,
                    context: data.context,
                    total_duration: data.total_duration,
                    load_duration: data.load_duration,
                    prompt_eval_count: data.prompt_eval_count,
                    prompt_eval_duration: data.prompt_eval_duration,
                    eval_count: data.eval_count,
                    eval_duration: data.eval_duration,
                  };
                }
              } catch (e) {
                // Ignore parsing errors for partial chunks
              }
            }
          }
        }
      }

      // Non-streaming response
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }

  async chat(messages: Array<{role: string; content: string}>, model?: string): Promise<string> {
    try {
      // Convert chat messages to a single prompt
      const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
      const userMessages = messages.filter(m => m.role !== 'system');
      
      let prompt = '';
      if (systemPrompt) {
        prompt += `System: ${systemPrompt}\n\n`;
      }
      
      for (const message of userMessages) {
        const role = message.role === 'user' ? 'User' : 'Assistant';
        prompt += `${role}: ${message.content}\n\n`;
      }
      
      prompt += 'Assistant: ';

      const response = await this.generate({
        model: model || this.defaultModel,
        prompt,
        system: systemPrompt,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 1000,
        },
      });

      return response.response;
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  }

  async deleteModel(modelName: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete model: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting model:', error);
      throw error;
    }
  }

  async getModelInfo(modelName: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/show`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get model info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting model info:', error);
      throw error;
    }
  }

  // Fallback to ZAI SDK when Ollama is not available
  async generateWithFallback(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      // First try Ollama
      const isConnected = await this.checkConnection();
      if (isConnected) {
        const response = await this.generate({
          prompt,
          system: systemPrompt,
        });
        return response.response;
      }
    } catch (error) {
      console.warn('Ollama not available, falling back to ZAI SDK:', error);
    }

    // Fallback to ZAI SDK
    try {
      const zai = await create();
      const completion = await zai.chat.completions.create({
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    } catch (error) {
      console.error('ZAI SDK fallback failed:', error);
      throw error;
    }
  }
}

// Singleton instance
export const ollamaService = new OllamaService();