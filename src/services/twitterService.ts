import { 
  TwitterUser, 
  Tweet,
  TweetWithUser, 
  TwitterApiResponse, 
  GetTweetsResponse,
  TwitterRateLimit,
  TwitterServiceConfig,
  CacheEntry
} from '@/types/twitter'
import { MockTwitterService, isMockEnabled } from './mockTwitterService'

// Rate limiting implementation
class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private readonly windowMs: number
  private readonly maxRequests: number

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  isAllowed(key: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(key) || []
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }
    
    validRequests.push(now)
    this.requests.set(key, validRequests)
    return true
  }

  getStatus(key: string): TwitterRateLimit {
    const now = Date.now()
    const requests = this.requests.get(key) || []
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    return {
      limit: this.maxRequests,
      remaining: Math.max(0, this.maxRequests - validRequests.length),
      reset: Math.floor((now + this.windowMs) / 1000)
    }
  }
}

// Simple in-memory cache
class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map()
  private defaultTtl: number = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    const expires_at = Date.now() + (ttl || this.defaultTtl)
    this.cache.set(key, {
      data,
      expires_at,
      created_at: Date.now()
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() > entry.expires_at) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    if (Date.now() > entry.expires_at) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }
}

// Main Twitter service
export class TwitterService {
  private static instance: TwitterService
  private config: TwitterServiceConfig
  private rateLimiter: RateLimiter
  private cache: MemoryCache
  private mockService: MockTwitterService

  constructor() {
    this.config = {
      bearer_token: process.env.TWITTER_BEARER_TOKEN,
      api_key: process.env.TWITTER_API_KEY,
      api_secret: process.env.TWITTER_API_SECRET,
      mock_enabled: isMockEnabled(),
      rate_limit_window: 15 * 60 * 1000, // 15 minutes
      max_requests_per_window: 75 // Conservative limit for Twitter API v2
    }

    this.rateLimiter = new RateLimiter(
      this.config.rate_limit_window,
      this.config.max_requests_per_window
    )
    this.cache = new MemoryCache()
    this.mockService = MockTwitterService.getInstance()
  }

  static getInstance(): TwitterService {
    if (!TwitterService.instance) {
      TwitterService.instance = new TwitterService()
    }
    return TwitterService.instance
  }

  // Check if we should use mock data
  private shouldUseMock(): boolean {
    return this.config.mock_enabled || !this.config.bearer_token
  }

  // Make authenticated request to Twitter API
  private async makeTwitterRequest<T>(url: string): Promise<TwitterApiResponse<T>> {
    if (!this.rateLimiter.isAllowed('twitter_api')) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }

    const headers = {
      'Authorization': `Bearer ${this.config.bearer_token}`,
      'Content-Type': 'application/json'
    }

    const response = await fetch(url, { headers })
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Twitter API rate limit exceeded')
      }
      if (response.status === 401) {
        throw new Error('Twitter API authentication failed')
      }
      if (response.status === 404) {
        throw new Error('Twitter user not found')
      }
      
      throw new Error(`Twitter API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Get user by username from Twitter API
  private async getTwitterUserByUsername(username: string): Promise<TwitterUser | null> {
    const url = `https://api.twitter.com/2/users/by/username/${username}?user.fields=id,name,username,profile_image_url,verified,public_metrics`
    
    try {
      const response: TwitterApiResponse<TwitterUser> = await this.makeTwitterRequest<TwitterUser>(url)
      return response.data || null
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return null
      }
      throw error
    }
  }

  // Get tweets by user ID from Twitter API
  private async getTwitterTweetsByUserId(userId: string, options: { max_results?: number; since_id?: string } = {}): Promise<TweetWithUser[]> {
    const params = new URLSearchParams({
      'tweet.fields': 'id,text,author_id,created_at,public_metrics,referenced_tweets,attachments,entities',
      'user.fields': 'id,name,username,profile_image_url,verified,public_metrics',
      'expansions': 'author_id',
      'max_results': String(Math.min(options.max_results || 10, 100))
    })

    if (options.since_id) {
      params.append('since_id', options.since_id)
    }

    const url = `https://api.twitter.com/2/users/${userId}/tweets?${params.toString()}`
    
    const response: TwitterApiResponse<Tweet[]> = await this.makeTwitterRequest<Tweet[]>(url)
    
    if (!response.data) {
      return []
    }

    // Combine tweets with user data
    const tweets: TweetWithUser[] = response.data.map(tweet => {
      const author = response.includes?.users?.find(user => user.id === tweet.author_id)
      return {
        ...tweet,
        author: author!
      }
    })

    return tweets
  }

  // Public method: Get user by username
  async getUserByUsername(username: string): Promise<TwitterUser | null> {
    const cacheKey = `user:${username.toLowerCase()}`
    
    // Check cache first
    const cached = this.cache.get<TwitterUser>(cacheKey)
    if (cached) {
      return cached
    }

    let user: TwitterUser | null = null

    if (this.shouldUseMock()) {
      user = await this.mockService.getUserByUsername(username)
    } else {
      user = await this.getTwitterUserByUsername(username)
    }

    // Cache the result (even if null, to avoid repeated failed requests)
    if (user) {
      this.cache.set(cacheKey, user, 10 * 60 * 1000) // Cache for 10 minutes
    }

    return user
  }

  // Public method: Get tweets by username
  async getTweetsByUsername(
    username: string, 
    options: { limit?: number; since_id?: string } = {}
  ): Promise<GetTweetsResponse> {
    const limit = Math.min(options.limit || 10, 25)
    const cacheKey = `tweets:${username.toLowerCase()}:${limit}:${options.since_id || 'latest'}`
    
    // Check cache first
    const cached = this.cache.get<GetTweetsResponse>(cacheKey)
    if (cached) {
      return {
        ...cached,
        cached: true,
        cache_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      }
    }

    if (this.shouldUseMock()) {
      const response = await this.mockService.getTweetsByUsername(username, { limit, since_id: options.since_id })
      this.cache.set(cacheKey, response, 2 * 60 * 1000) // Cache mock data for 2 minutes
      return response
    }

    // Real Twitter API flow
    const user = await this.getUserByUsername(username)
    if (!user) {
      throw new Error(`User @${username} not found`)
    }

    const tweets = await this.getTwitterTweetsByUserId(user.id, {
      max_results: limit,
      since_id: options.since_id
    })

    const response: GetTweetsResponse = {
      tweets,
      account: user,
      meta: {
        count: tweets.length,
        newest_id: tweets[0]?.id,
        oldest_id: tweets[tweets.length - 1]?.id
      },
      success: true,
      cached: false
    }

    // Cache the response
    this.cache.set(cacheKey, response, 5 * 60 * 1000) // Cache for 5 minutes
    
    return response
  }

  // Get rate limit status
  getRateLimitStatus(): TwitterRateLimit {
    return this.rateLimiter.getStatus('twitter_api')
  }

  // Clear cache (for testing/debugging)
  clearCache(): void {
    this.cache.clear()
  }

  // Get service configuration info
  getServiceInfo(): { mock_enabled: boolean; has_bearer_token: boolean; rate_limit: TwitterRateLimit } {
    return {
      mock_enabled: this.shouldUseMock(),
      has_bearer_token: !!this.config.bearer_token,
      rate_limit: this.getRateLimitStatus()
    }
  }
}

export default TwitterService