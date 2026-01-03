
export interface GroundingSource {
  title: string;
  uri: string;
}

export interface GeneratedContent {
  id: string;
  topic: string;
  title: string;
  summary: string;
  fullArticle: string;
  sources: GroundingSource[];
  timestamp: number;
  status: 'draft' | 'published';
  category: string;
}

export interface Trend {
  topic: string;
  relevance: number;
  description: string;
}

export type Category = 'Technology' | 'Artificial Intelligence' | 'Lifestyle' | 'Business' | 'Health';
