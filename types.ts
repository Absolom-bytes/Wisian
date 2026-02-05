export interface Artifact {
  id: string;
  styleName: string;
  html: string;
  status: 'streaming' | 'complete' | 'error';
}

export interface GroundingSource {
  title?: string;
  uri?: string;
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

export interface LabAsset {
  id: string;
  type: 'image';
  url: string;
  prompt: string;
  timestamp: number;
}