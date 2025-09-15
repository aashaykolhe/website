import { GeneratedContent } from '../types';

/**
 * A simple in-memory cache for generated content.
 * This prevents re-fetching the same topic data from the Gemini API during a single session.
 */
class ContentCache {
  private cache: Map<string, GeneratedContent> = new Map();

  /**
   * Retrieves content from the cache.
   * @param topicId The ID of the topic.
   * @returns The cached content or null if not found.
   */
  get(topicId: string): GeneratedContent | null {
    return this.cache.get(topicId) || null;
  }

  /**
   * Stores content in the cache.
   * @param topicId The ID of the topic.
   * @param content The content to store.
   */
  set(topicId: string, content: GeneratedContent): void {
    this.cache.set(topicId, content);
  }
}

// Export a singleton instance of the cache.
export const contentCache = new ContentCache();
