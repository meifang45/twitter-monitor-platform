import { TwitterUser, TweetWithUser, GetTweetsResponse, MonitoredAccount } from '@/types/twitter'

// Mock Twitter users
const mockUsers: TwitterUser[] = [
  {
    id: '1',
    username: 'technews',
    name: 'Tech News',
    profile_image_url: 'https://via.placeholder.com/40x40/1da1f2/ffffff?text=TN',
    verified: true,
    public_metrics: {
      followers_count: 125000,
      following_count: 500,
      tweet_count: 15000
    }
  },
  {
    id: '2', 
    username: 'updates',
    name: 'Industry Updates',
    profile_image_url: 'https://via.placeholder.com/40x40/1da1f2/ffffff?text=IU',
    verified: false,
    public_metrics: {
      followers_count: 45000,
      following_count: 200,
      tweet_count: 8500
    }
  },
  {
    id: '3',
    username: 'dev',
    name: 'Development',
    profile_image_url: 'https://via.placeholder.com/40x40/1da1f2/ffffff?text=DEV',
    verified: true,
    public_metrics: {
      followers_count: 89000,
      following_count: 150,
      tweet_count: 12000
    }
  },
  {
    id: '4',
    username: 'ai_research',
    name: 'AI Research Updates',
    profile_image_url: 'https://via.placeholder.com/40x40/1da1f2/ffffff?text=AI',
    verified: true,
    public_metrics: {
      followers_count: 67000,
      following_count: 300,
      tweet_count: 9500
    }
  }
]

// Generate realistic mock tweets
const generateMockTweets = (user: TwitterUser, count: number = 10): TweetWithUser[] => {
  const tweetTemplates = [
    `🚀 Exciting breakthrough in ${user.name.toLowerCase()}: New research shows promising results in quantum computing applications.`,
    `Breaking: Major tech company announces $2B investment in sustainable technology. This could change everything! 🌱`,
    `📊 Latest industry report reveals surprising trends in developer productivity. Thread 1/5`,
    `Hot take: The future of web development lies in server-side rendering. Here's why... 🔥`,
    `🔧 Just released: New open-source tool that automates CI/CD pipelines. Check it out!`,
    `Market update: Tech stocks showing strong recovery after recent volatility. Key insights below 📈`,
    `💡 Innovation spotlight: How machine learning is revolutionizing data analysis workflows`,
    `Quick tip: Always validate your inputs, sanitize your outputs, and never trust user data. Security first! 🔒`,
    `🎯 Productivity hack: Using automated testing saved our team 20+ hours this week. What's your favorite tool?`,
    `Industry news: New privacy regulations coming into effect next quarter. Compliance checklist inside 📋`
  ]

  const tweets: TweetWithUser[] = []
  
  for (let i = 0; i < count; i++) {
    const now = new Date()
    const createdAt = new Date(now.getTime() - (i * 2 * 60 * 60 * 1000)) // 2 hours apart
    
    const tweet: TweetWithUser = {
      id: `${user.id}_${i + 1}`,
      text: tweetTemplates[i % tweetTemplates.length],
      author_id: user.id,
      author: user,
      created_at: createdAt.toISOString(),
      public_metrics: {
        retweet_count: Math.floor(Math.random() * 100),
        like_count: Math.floor(Math.random() * 500),
        reply_count: Math.floor(Math.random() * 50),
        quote_count: Math.floor(Math.random() * 25)
      },
      entities: {
        hashtags: [
          { start: 0, end: 0, tag: 'tech' },
          { start: 0, end: 0, tag: 'innovation' }
        ]
      }
    }
    
    tweets.push(tweet)
  }
  
  return tweets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// Mock data service
export class MockTwitterService {
  private static instance: MockTwitterService
  private mockData: Map<string, TweetWithUser[]> = new Map()
  
  constructor() {
    // Initialize mock data for each user
    mockUsers.forEach(user => {
      this.mockData.set(user.username, generateMockTweets(user, 15))
    })
  }
  
  static getInstance(): MockTwitterService {
    if (!MockTwitterService.instance) {
      MockTwitterService.instance = new MockTwitterService()
    }
    return MockTwitterService.instance
  }
  
  async getUserByUsername(username: string): Promise<TwitterUser | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const normalizedUsername = username.toLowerCase()
    
    // Check if user already exists in mock data
    const existingUser = mockUsers.find(user => user.username.toLowerCase() === normalizedUsername)
    if (existingUser) {
      return existingUser
    }
    
    // Create a new mock user for any username
    const newUser: TwitterUser = {
      id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: normalizedUsername,
      name: username.charAt(0).toUpperCase() + username.slice(1), // Capitalize first letter
      profile_image_url: `https://via.placeholder.com/40x40/1da1f2/ffffff?text=${username.charAt(0).toUpperCase()}`,
      verified: Math.random() > 0.7, // 30% chance of being verified
      public_metrics: {
        followers_count: Math.floor(Math.random() * 100000) + 1000, // 1K-100K followers
        following_count: Math.floor(Math.random() * 2000) + 100,
        tweet_count: Math.floor(Math.random() * 10000) + 500
      }
    }
    
    // Add to mock users for future reference
    mockUsers.push(newUser)
    
    return newUser
  }
  
  async getTweetsByUsername(
    username: string, 
    options: { limit?: number; since_id?: string } = {}
  ): Promise<GetTweetsResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const user = await this.getUserByUsername(username)
    if (!user) {
      throw new Error(`User @${username} not found`)
    }
    
    let tweets = this.mockData.get(username) || []
    
    // If no tweets exist for this user, generate some
    if (tweets.length === 0) {
      tweets = generateMockTweets(user, 10)
      this.mockData.set(username, tweets)
    }
    
    // Filter by since_id if provided
    if (options.since_id) {
      const sinceIndex = tweets.findIndex(tweet => tweet.id === options.since_id)
      if (sinceIndex !== -1) {
        tweets = tweets.slice(0, sinceIndex)
      }
    }
    
    // Apply limit
    const limit = Math.min(options.limit || 10, 25)
    tweets = tweets.slice(0, limit)
    
    return {
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
  }
  
  async getMultipleUserTweets(usernames: string[]): Promise<Map<string, TweetWithUser[]>> {
    const results = new Map<string, TweetWithUser[]>()
    
    for (const username of usernames) {
      try {
        const response = await this.getTweetsByUsername(username, { limit: 5 })
        results.set(username, response.tweets)
      } catch {
        // Skip users that don't exist
        results.set(username, [])
      }
    }
    
    return results
  }
  
  getAvailableUsers(): TwitterUser[] {
    return [...mockUsers]
  }
  
  // Add new user to mock data (for testing account addition)
  addMockUser(user: TwitterUser): void {
    mockUsers.push(user)
    this.mockData.set(user.username, generateMockTweets(user, 10))
  }
}

// Export mock monitored accounts
export const mockMonitoredAccounts: MonitoredAccount[] = mockUsers.slice(0, 3).map((user, index) => ({
  id: `account_${user.id}`,
  username: user.username,
  name: user.name,
  profile_image_url: user.profile_image_url,
  created_at: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString(),
  updated_at: new Date().toISOString(),
  is_active: true,
  last_fetched_at: new Date(Date.now() - (index * 30 * 60 * 1000)).toISOString(),
  user_id: '1' // Demo user ID
}))

// Utility function to check if mock mode is enabled
export const isMockEnabled = (): boolean => {
  return process.env.MOCK_DATA_ENABLED === 'true' || !process.env.TWITTER_BEARER_TOKEN
}

export default MockTwitterService