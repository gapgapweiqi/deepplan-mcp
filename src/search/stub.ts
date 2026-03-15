import type { SearchProvider, SearchQuery, SearchResult } from "./types.js";

export class StubSearchProvider implements SearchProvider {
  name = "stub";

  async search(_query: SearchQuery): Promise<SearchResult[]> {
    return [];
  }

  async isAvailable(): Promise<boolean> {
    return false;
  }
}
