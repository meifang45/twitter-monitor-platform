import { Tweet, TwitterUser, TweetsResponse, MonitoredAccount } from './types';

// Mock Twitter users
const mockUsers: TwitterUser[] = [
  {
    id: '1',
    username: 'technews',
    name: 'Tech News',
    profile_image_url: 'https://pbs.twimg.com/profile_images/1234567890/avatar.jpg',
    verified: true,
    public_metrics: {
      followers_count: 125000,
      following_count: 500,
      tweet_count: 15000,
    },
  },
  {
    id: '2',
    username: 'updates',
    name: 'Industry Updates',
    profile_image_url: 'https://pbs.twimg.com/profile_images/1234567891/avatar.jpg',
    verified: false,
    public_metrics: {
      followers_count: 50000,
      following_count: 200,
      tweet_count: 8000,
    },
  },
  {
    id: '3',
    username: 'dev',
    name: 'Developer News',
    profile_image_url: 'https://pbs.twimg.com/profile_images/1234567892/avatar.jpg',
    verified: true,
    public_metrics: {
      followers_count: 75000,
      following_count: 300,
      tweet_count: 12000,
    },
  },
];

// Mock tweets data
const generateMockTweets = (username: string, count: number = 10): Tweet[] => {
  const user = mockUsers.find(u => u.username === username) || mockUsers[0];
  const tweets: Tweet[] = [];

  const sampleTexts = [
    'Just released a new feature that will revolutionize how developers work with APIs. Check out the documentation and let us know what you think!',
    'Breaking: Major security vulnerability discovered in popular JavaScript library. Patch available now, update immediately.',
    'Excited to announce our partnership with @techcorp to bring better tooling to the developer community. More details coming soon.',
    'Tips for better code reviews: 1) Focus on logic, not style 2) Be constructive 3) Ask questions 4) Suggest alternatives 5) Celebrate good code',
    'The future of web development is looking bright with these new browser APIs. WebAssembly, Web Components, and Service Workers are game changers.',
    'Remember: The best code is code that doesn\'t need to be written. Sometimes the simplest solution is the best solution.',
    'New blog post: "10 Things I Wish I Knew When I Started Programming" - lessons learned from 10 years in software development.',
    'Conference season is here! Looking forward to sharing insights on modern web architecture and serverless deployment strategies.',
    'Open source contribution tip: Start small, read the contributing guidelines, and don\'t be afraid to ask questions. Community is everything.',
    'Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are not smart enough to debug it.',
  ];

  for (let i = 0; i < count; i++) {
    const hoursAgo = i * 2 + Math.floor(Math.random() * 4);
    const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
    
    tweets.push({
      id: `${Date.now()}_${i}_${username}`,
      text: sampleTexts[i % sampleTexts.length],
      created_at: createdAt,
      author_id: user.id,
      author: user,
      public_metrics: {
        retweet_count: Math.floor(Math.random() * 50),
        like_count: Math.floor(Math.random() * 200),
        reply_count: Math.floor(Math.random() * 25),
        quote_count: Math.floor(Math.random() * 15),
      },
      entities: {
        hashtags: Math.random() > 0.7 ? [
          {
            start: Math.floor(Math.random() * 20),
            end: Math.floor(Math.random() * 20) + 10,
            tag: ['javascript', 'webdev', 'programming', 'tech', 'opensource'][Math.floor(Math.random() * 5)],
          }
        ] : undefined,
      },
    });
  }

  return tweets;
};

// Mock service class
export class MockTwitterService {
  private static instance: MockTwitterService;
  private delay: number;

  private constructor(delay: number = 500) {
    this.delay = delay;
  }

  static getInstance(delay: number = 500): MockTwitterService {
    if (!MockTwitterService.instance) {
      MockTwitterService.instance = new MockTwitterService(delay);
    }
    return MockTwitterService.instance;
  }

  // Simulate API delay
  private async simulateDelay(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, this.delay));
  }

  async getUserByUsername(username: string): Promise<TwitterUser | null> {
    await this.simulateDelay();
    
    // Simulate occasional API errors
    if (Math.random() < 0.05) { // 5% chance of error
      throw new Error('Rate limit exceeded');
    }

    const user = mockUsers.find(u => u.username === username);
    return user || null;
  }

  async getTweetsByUsername(
    username: string,
    maxResults: number = 10
  ): Promise<TweetsResponse> {
    await this.simulateDelay();

    // Simulate occasional API errors
    if (Math.random() < 0.03) { // 3% chance of error
      throw new Error('Twitter API service temporarily unavailable');
    }

    const tweets = generateMockTweets(username, maxResults);
    
    // Sort by creation date (newest first)
    tweets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
      tweets,
      meta: {
        newest_id: tweets[0]?.id,
        oldest_id: tweets[tweets.length - 1]?.id,
        result_count: tweets.length,
      },
    };
  }

  async getUserTweets(userId: string, maxResults: number = 10): Promise<TweetsResponse> {
    await this.simulateDelay();

    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    return this.getTweetsByUsername(user.username, maxResults);
  }

  // Mock monitored accounts management
  getDefaultMonitoredAccounts(): MonitoredAccount[] {
    return [
      {
        id: '1',
        username: 'technews',
        displayName: 'Tech News',
        profileImage: 'https://pbs.twimg.com/profile_images/1234567890/avatar.jpg',
        isActive: true,
        lastFetched: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        addedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      },
      {
        id: '2',
        username: 'updates',
        displayName: 'Industry Updates',
        profileImage: 'https://pbs.twimg.com/profile_images/1234567891/avatar.jpg',
        isActive: true,
        lastFetched: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
        addedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      },
      {
        id: '3',
        username: 'dev',
        displayName: 'Developer News',
        profileImage: 'https://pbs.twimg.com/profile_images/1234567892/avatar.jpg',
        isActive: true,
        lastFetched: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
        addedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      },
    ];
  }
}

// Export singleton instance
export const mockTwitterService = MockTwitterService.getInstance();