// User/Account related types
export interface TwitterUser {
  id: string
  username: string
  name: string
  profile_image_url?: string
  verified?: boolean
  public_metrics?: {
    followers_count: number
    following_count: number
    tweet_count: number
  }
}

// Tweet related types
export interface Tweet {
  id: string
  text: string
  author_id: string
  author?: TwitterUser
  created_at: string
  public_metrics?: {
    retweet_count: number
    like_count: number
    reply_count: number
    quote_count: number
  }
  referenced_tweets?: ReferencedTweet[]
  attachments?: {
    media_keys?: string[]
  }
  entities?: {
    urls?: UrlEntity[]
    hashtags?: HashtagEntity[]
    mentions?: MentionEntity[]
  }
}

export interface ReferencedTweet {
  type: 'retweeted' | 'quoted' | 'replied_to'
  id: string
}

export interface UrlEntity {
  start: number
  end: number
  url: string
  expanded_url: string
  display_url: string
}

export interface HashtagEntity {
  start: number
  end: number
  tag: string
}

export interface MentionEntity {
  start: number
  end: number
  username: string
  id: string
}

// API Response types
export interface TwitterApiResponse<T> {
  data?: T
  includes?: {
    users?: TwitterUser[]
    tweets?: Tweet[]
  }
  meta?: {
    oldest_id?: string
    newest_id?: string
    result_count?: number
    next_token?: string
  }
  errors?: TwitterApiError[]
}

export interface TwitterApiError {
  detail: string
  title: string
  resource_type?: string
  parameter?: string
  value?: string
  type?: string
}

// Application specific types
export interface MonitoredAccount {
  id: string
  username: string
  name: string
  profile_image_url?: string
  created_at: string
  updated_at: string
  is_active: boolean
  last_fetched_at?: string
  user_id?: string // Associated with authenticated user
}

export interface TweetWithUser extends Omit<Tweet, 'author'> {
  author: TwitterUser
}

// API Request/Response types for our endpoints
export interface GetTweetsRequest {
  username: string
  limit?: number
  since_id?: string
  until_id?: string
}

export interface GetTweetsResponse {
  tweets: TweetWithUser[]
  account: TwitterUser
  meta: {
    count: number
    next_token?: string
    oldest_id?: string
    newest_id?: string
  }
  success: boolean
  cached?: boolean
  cache_expires_at?: string
  error?: string
}

export interface GetAccountsResponse {
  accounts: MonitoredAccount[]
  success: boolean
  error?: string
}

export interface AddAccountRequest {
  username: string
}

export interface AddAccountResponse {
  account: MonitoredAccount
  success: boolean
  message?: string
}

// Error response type
export interface ApiErrorResponse {
  success: false
  error: string
  details?: string
  code?: string
}

// Cache types
export interface CacheEntry<T> {
  data: T
  expires_at: number
  created_at: number
}

export interface TwitterRateLimit {
  limit: number
  remaining: number
  reset: number
}

// Service configuration types
export interface TwitterServiceConfig {
  bearer_token?: string
  api_key?: string
  api_secret?: string
  mock_enabled: boolean
  rate_limit_window: number
  max_requests_per_window: number
}