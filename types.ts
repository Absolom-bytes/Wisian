export interface Artifact {
  id: string;
  styleName: string;
  html: string;
  status: 'streaming' | 'complete' | 'error';
}

export interface Session {
    id: string;
    prompt: string;
    timestamp: number;
    artifacts: Artifact[];
}

export interface ToolConfig {
  id: string;
  categoryId: string;
  name: string;
  basePrompt: string;
  examplePrompt: string;
  description: string;
  isCustom?: boolean;
}