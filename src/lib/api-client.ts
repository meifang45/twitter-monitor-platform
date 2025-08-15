import { ApiResponse, TweetsResponse, AccountsResponse, MonitoredAccount } from './types';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Generic API fetch function with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        success: false,
        error: 'Network Error',
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      
      return errorData;
    }

    return await response.json();
  } catch (error) {
    console.error('API fetch error:', error);
    return {
      success: false,
      error: 'Network Error',
      message: 'Failed to connect to the server. Please check your internet connection.',
    };
  }
}

// Twitter API functions
export const twitterApi = {
  // Get tweets for a specific username
  async getTweetsByUsername(
    username: string,
    options: {
      maxResults?: number;
      sinceId?: string;
      untilId?: string;
      exclude?: string[];
    } = {}
  ): Promise<ApiResponse<TweetsResponse>> {
    const searchParams = new URLSearchParams();
    
    if (options.maxResults) searchParams.set('maxResults', options.maxResults.toString());
    if (options.sinceId) searchParams.set('sinceId', options.sinceId);
    if (options.untilId) searchParams.set('untilId', options.untilId);
    if (options.exclude?.length) searchParams.set('exclude', options.exclude.join(','));

    const queryString = searchParams.toString();
    const endpoint = `/api/tweets/${encodeURIComponent(username)}${queryString ? `?${queryString}` : ''}`;
    
    return fetchApi<TweetsResponse>(endpoint);
  },

  // Get all monitored accounts
  async getMonitoredAccounts(options: {
    active?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<ApiResponse<AccountsResponse>> {
    const searchParams = new URLSearchParams();
    
    if (options.active !== undefined) searchParams.set('active', options.active.toString());
    if (options.limit) searchParams.set('limit', options.limit.toString());
    if (options.offset) searchParams.set('offset', options.offset.toString());

    const queryString = searchParams.toString();
    const endpoint = `/api/accounts${queryString ? `?${queryString}` : ''}`;
    
    return fetchApi<AccountsResponse>(endpoint);
  },

  // Add a new monitored account
  async addMonitoredAccount(username: string, displayName?: string): Promise<ApiResponse<MonitoredAccount>> {
    return fetchApi<MonitoredAccount>('/api/accounts', {
      method: 'POST',
      body: JSON.stringify({ username, displayName }),
    });
  },

  // Update a monitored account
  async updateMonitoredAccount(
    id: string, 
    updates: { displayName?: string; isActive?: boolean }
  ): Promise<ApiResponse<MonitoredAccount>> {
    return fetchApi<MonitoredAccount>(`/api/accounts/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Remove a monitored account
  async removeMonitoredAccount(id: string): Promise<ApiResponse<MonitoredAccount>> {
    return fetchApi<MonitoredAccount>(`/api/accounts/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

// Utility functions
export const apiUtils = {
  // Check if an API response is successful
  isSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true; data: T } {
    return response.success && response.data !== undefined;
  },

  // Get error message from API response
  getErrorMessage<T>(response: ApiResponse<T>): string {
    return response.message || response.error || 'An unknown error occurred';
  },

  // Retry function for failed API calls
  async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }
    
    throw lastError!;
  },
};