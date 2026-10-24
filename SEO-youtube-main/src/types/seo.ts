export interface KeywordMetrics {
  estimatedVolume: string;
  competitionLevel: 'Thấp' | 'Trung bình' | 'Cao';
  competitionPercentage: number;
  seoOpportunityScore: number;
  trendStatus: string;
  strategicAdvice: string;
}

export interface KeywordAnalysisData {
  focusKeyword: string;
  mainKeywords: string[];
  secondaryKeywords: string[];
  metrics?: KeywordMetrics;
}

export interface YouTubeTitleItem {
  id: number;
  title: string;
  style: string;
  description?: string;
}

export interface DescriptionData {
  description: string;
  keywordCount: number;
  focusKeyword: string;
  threeHashtags: string[];
}

export interface ThumbnailPromptData {
  promptEnglish: string;
  promptVietnamese: string;
  visualConcept: string;
  recommendedText: string;
  colorPalette: string;
}

export interface AppState {
  topic: string;
  language: string;
  keywords: KeywordAnalysisData | null;
  selectedFocusKeyword: string;
  channelName: string;
  titles: YouTubeTitleItem[];
  selectedTitle: string;
  descriptionData: DescriptionData | null;
  thumbnailPromptData: ThumbnailPromptData | null;
  hashtagsData: string[];
  avatarUrl: string;
}
