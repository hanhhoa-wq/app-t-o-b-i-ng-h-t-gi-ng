
export interface SeedInput {
  seedName: string;
  price: string;
  strongPoints: string;
  harvestTime: string;
  suitableSpace: string;
  purchaseLink: string;
  recommendedCombos?: string;
  customImagePrompt?: string;
  seoKeywords?: string;
}

export interface GeneratedContent {
  postContent: string;
  imagePrompt: string;
  imageBase64?: string;
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  data: GeneratedContent | null;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  input: SeedInput;
  result: GeneratedContent;
}

export interface SavedPost {
  id: string;
  timestamp: number;
  content: GeneratedContent;
}
