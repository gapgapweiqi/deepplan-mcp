export interface SearchResult {
  title: string;
  snippet: string;
  url?: string;
  relevanceScore?: number;
}

export interface SearchQuery {
  query: string;
  techStack?: string;
  maxResults?: number;
}

export interface SearchProvider {
  name: string;
  search(query: SearchQuery): Promise<SearchResult[]>;
  isAvailable(): Promise<boolean>;
}
