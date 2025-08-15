// Twitter API Data Models

export interface TwitterUser {
  id: string;
  username: string;
  name: string;
  profile_image_url?: string;
  verified?: boolean;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
}

export interface Tweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  author?: TwitterUser;
  public_metrics?: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
  };
  entities?: {
    urls?: Array<{
      start: number;
      end: number;
      url: string;
      expanded_url: string;
      display_url: string;
    }>;
    hashtags?: Array<{
      start: number;
      end: number;
      tag: string;
    }>;
    mentions?: Array<{
      start: number;
      end: number;
      username: string;
      id: string;
    }>;
  };
  referenced_tweets?: Array<{
    type: 'retweeted' | 'quoted' | 'replied_to';
    id: string;
  }>;
}

export interface MonitoredAccount {
  id: string;
  username: string;
  displayName: string;
  profileImage?: string;
  isActive: boolean;
  lastFetched?: string;
  addedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TweetsResponse {
  tweets: Tweet[];
  nextToken?: string;
  meta: {
    newest_id?: string;
    oldest_id?: string;
    result_count: number;
  };
}

export interface AccountsResponse {
  accounts: MonitoredAccount[];
  total: number;
}

// API Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface TwitterApiError {
  title: string;
  detail: string;
  type: string;
  status?: number;
}

// Request Types
export interface FetchTweetsParams {
  username: string;
  maxResults?: number;
  sinceId?: string;
  untilId?: string;
  exclude?: string[];
}

export interface AddAccountRequest {
  username: string;
  displayName?: string;
}

// Cache Types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  key?: string;
}

// Dashboard Types
export interface DashboardColumn {
  id: string;
  title: string;
  username: string;
  tweets?: Tweet[];
  loading?: boolean;
  error?: string;
}