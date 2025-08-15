import { 
  Tweet, 
  TwitterUser, 
  TweetsResponse, 
  FetchTweetsParams, 
  CacheEntry, 
  CacheOptions 
} from './types';
import { mockTwitterService } from './mock-twitter-service';

// Simple in-memory cache
class SimpleCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, options?: CacheOptions): void {
    const ttl = options?.ttl || this.defaultTTL;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Rate limiter
class RateLimiter {
  private requests = new Map<string, number[]>();
  private windowSize: number;
  private maxRequests: number;

  constructor(maxRequests: number = 100, windowSizeMs: number = 15 * 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowSize = windowSizeMs;
  }

  canMakeRequest(key: string = 'default'): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowSize);
    this.requests.set(key, validRequests);

    return validRequests.length < this.maxRequests;
  }

  recordRequest(key: string = 'default'): void {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    requests.push(now);
    this.requests.set(key, requests);
  }

  getRemainingRequests(key: string = 'default'): number {
    const requests = this.requests.get(key) || [];
    const now = Date.now();
    const validRequests = requests.filter(time => now - time < this.windowSize);
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

export class TwitterService {
  private static instance: TwitterService;
  private cache: SimpleCache;
  private rateLimiter: RateLimiter;
  private bearerToken: string | null;
  private mockMode: boolean;

  private constructor() {
    this.cache = new SimpleCache();
    this.rateLimiter = new RateLimiter(100, 15 * 60 * 1000); // 100 requests per 15 minutes
    this.bearerToken = process.env.TWITTER_BEARER_TOKEN || null;
    this.mockMode = process.env.MOCK_DATA_ENABLED === 'true' || !this.bearerToken;
  }

  static getInstance(): TwitterService {
    if (!TwitterService.instance) {
      TwitterService.instance = new TwitterService();
    }
    return TwitterService.instance;
  }

  private buildTwitterApiUrl(endpoint: string, params: Record<string, string> = {}): string {
    const baseUrl = 'https://api.twitter.com/2';
    const url = new URL(`${baseUrl}${endpoint}`);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });

    return url.toString();
  }

  private async makeTwitterApiRequest<T>(url: string): Promise<T> {
    if (!this.bearerToken) {
      throw new Error('Twitter Bearer Token not configured');
    }

    if (!this.rateLimiter.canMakeRequest()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    this.rateLimiter.recordRequest();

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Twitter API Error: ${response.status} - ${errorData.detail || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Twitter API request failed:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<TwitterUser | null> {
    // Check cache first
    const cacheKey = `user:${username}`;
    const cached = this.cache.get<TwitterUser>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      if (this.mockMode) {
        const user = await mockTwitterService.getUserByUsername(username);
        if (user) {
          this.cache.set(cacheKey, user, { ttl: 10 * 60 * 1000 }); // 10 minutes
        }
        return user;
      }

      const url = this.buildTwitterApiUrl(`/users/by/username/${username}`, {
        'user.fields': 'id,username,name,profile_image_url,verified,public_metrics',
      });

      const response = await this.makeTwitterApiRequest<{ data: TwitterUser }>(url);
      const user = response.data;
      
      if (user) {
        this.cache.set(cacheKey, user, { ttl: 10 * 60 * 1000 }); // 10 minutes
      }

      return user;
    } catch (error) {
      console.error(`Failed to fetch user ${username}:`, error);
      
      // Fallback to mock data on error
      if (!this.mockMode) {
        console.log('Falling back to mock data due to API error');
        return await mockTwitterService.getUserByUsername(username);
      }
      
      throw error;
    }
  }

  async getTweetsByUsername(params: FetchTweetsParams): Promise<TweetsResponse> {
    const { username, maxResults = 10, sinceId, untilId, exclude = [] } = params;
    
    // Check cache first
    const cacheKey = `tweets:${username}:${maxResults}:${sinceId || 'none'}:${untilId || 'none'}`;
    const cached = this.cache.get<TweetsResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      if (this.mockMode) {
        const response = await mockTwitterService.getTweetsByUsername(username, maxResults);
        this.cache.set(cacheKey, response, { ttl: 2 * 60 * 1000 }); // 2 minutes for tweets
        return response;
      }

      // First get the user to get their ID
      const user = await this.getUserByUsername(username);
      if (!user) {
        throw new Error(`User ${username} not found`);
      }

      const urlParams: Record<string, string> = {
        'tweet.fields': 'id,text,created_at,author_id,public_metrics,entities,referenced_tweets',
        'user.fields': 'id,username,name,profile_image_url,verified,public_metrics',
        'expansions': 'author_id',
        'max_results': maxResults.toString(),
      };

      if (sinceId) urlParams['since_id'] = sinceId;
      if (untilId) urlParams['until_id'] = untilId;
      if (exclude.length > 0) urlParams['exclude'] = exclude.join(',');

      const url = this.buildTwitterApiUrl(`/users/${user.id}/tweets`, urlParams);

      interface TwitterApiResponse {
        data: Tweet[];
        includes?: {
          users: TwitterUser[];
        };
        meta: {
          newest_id?: string;
          oldest_id?: string;
          result_count: number;
          next_token?: string;
        };
      }

      const response = await this.makeTwitterApiRequest<TwitterApiResponse>(url);
      
      // Enhance tweets with user data
      const tweets = response.data.map(tweet => ({
        ...tweet,
        author: response.includes?.users.find(u => u.id === tweet.author_id) || user,
      }));

      const result: TweetsResponse = {
        tweets,
        nextToken: response.meta.next_token,
        meta: response.meta,
      };

      this.cache.set(cacheKey, result, { ttl: 2 * 60 * 1000 }); // 2 minutes for tweets
      return result;

    } catch (error) {
      console.error(`Failed to fetch tweets for ${username}:`, error);
      
      // Fallback to mock data on error
      if (!this.mockMode) {
        console.log('Falling back to mock data due to API error');
        const response = await mockTwitterService.getTweetsByUsername(username, maxResults);
        this.cache.set(cacheKey, response, { ttl: 2 * 60 * 1000 });
        return response;
      }
      
      throw error;
    }
  }

  // Get multiple users' tweets efficiently
  async getMultipleUsersTweets(usernames: string[], maxResults: number = 10): Promise<Record<string, TweetsResponse>> {
    const results: Record<string, TweetsResponse> = {};
    
    // Fetch tweets for each user
    const promises = usernames.map(async (username) => {
      try {
        const tweets = await this.getTweetsByUsername({ username, maxResults });
        results[username] = tweets;
      } catch (error) {
        console.error(`Failed to fetch tweets for ${username}:`, error);
        // Return empty result for failed requests
        results[username] = {
          tweets: [],
          meta: { result_count: 0 },
        };
      }
    });

    await Promise.all(promises);
    return results;
  }

  // Utility methods
  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size();
  }

  getRemainingApiRequests(): number {
    return this.rateLimiter.getRemainingRequests();
  }

  isMockMode(): boolean {
    return this.mockMode;
  }

  setMockMode(enabled: boolean): void {
    this.mockMode = enabled;
  }
}

// Export singleton instance
export const twitterService = TwitterService.getInstance();