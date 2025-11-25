export interface OllamaStatus {
  connected: boolean;
  models: string[];
  baseUrl: string;
  error?: string;
}
