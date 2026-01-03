
export interface GroundingSource {
  title: string;
  uri: string;
}

export type PipelineStatus = 'discovering' | 'analyzing_seo' | 'drafting' | 'fact_checking' | 'review_required' | 'ready' | 'published';

export interface ContentMetrics {
  seoScore: number;
  aeoScore: number;
  readability: number;
  wordCount: number;
}

export interface GeneratedContent {
  id: string;
  topic: string;
  title: string;
  summary: string;
  fullArticle: string;
  faq: { question: string; answer: string }[];
  sources: GroundingSource[];
  timestamp: number;
  status: PipelineStatus;
  category: string;
  metrics: ContentMetrics;
}

export interface Trend {
  topic: string;
  relevance: number;
  description: string;
  searchVolume?: string;
  competition?: 'Low' | 'Medium' | 'High';
}

export type Category = 'Technology' | 'Artificial Intelligence' | 'Lifestyle' | 'Business' | 'Health';
