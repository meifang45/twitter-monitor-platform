'use client'

import EnterpriseLayout from '@/components/EnterpriseLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import UserAnalyticsDashboard from '@/components/UserAnalyticsDashboard'
import TopicTrendAnalysis from '@/components/TopicTrendAnalysis'
import { useState } from 'react'
import { Users, Hash } from 'lucide-react'

// Mock analytics data
const mockUserAnalytics = [
  {
    userId: '1',
    username: 'elonmusk',
    name: 'Elon Musk',
    dailyStats: [
      { date: '2024-01-10', tweetsCount: 12, likes: 89000, retweets: 15000, replies: 3200, followers: 150000000, engagement: 7.2 },
      { date: '2024-01-11', tweetsCount: 8, likes: 95000, retweets: 18000, replies: 4100, followers: 150020000, engagement: 8.1 },
      { date: '2024-01-12', tweetsCount: 15, likes: 120000, retweets: 22000, replies: 5000, followers: 150045000, engagement: 9.3 },
      { date: '2024-01-13', tweetsCount: 6, likes: 75000, retweets: 12000, replies: 2800, followers: 150050000, engagement: 6.8 },
      { date: '2024-01-14', tweetsCount: 10, likes: 105000, retweets: 19000, replies: 4500, followers: 150075000, engagement: 8.5 },
      { date: '2024-01-15', tweetsCount: 9, likes: 88000, retweets: 16000, replies: 3600, followers: 150085000, engagement: 7.6 },
      { date: '2024-01-16', tweetsCount: 11, likes: 92000, retweets: 17500, replies: 3900, followers: 150100000, engagement: 7.9 }
    ],
    topTweets: [
      { id: '1', text: 'Mars mission update: We are making incredible progress...', likes: 89000, retweets: 15000, replies: 3200, engagement: 9.3, date: '2024-01-12' },
      { id: '2', text: 'Tesla production numbers exceeded expectations this quarter...', likes: 75000, retweets: 12000, replies: 2800, engagement: 8.5, date: '2024-01-14' },
      { id: '3', text: 'AI development at xAI is accelerating beyond our initial projections...', likes: 92000, retweets: 17500, replies: 3900, engagement: 8.1, date: '2024-01-11' }
    ]
  },
  {
    userId: '2',
    username: 'sundarpichai',
    name: 'Sundar Pichai',
    dailyStats: [
      { date: '2024-01-10', tweetsCount: 3, likes: 12000, retweets: 2500, replies: 800, followers: 5200000, engagement: 4.2 },
      { date: '2024-01-11', tweetsCount: 2, likes: 15000, retweets: 3000, replies: 950, followers: 5205000, engagement: 5.1 },
      { date: '2024-01-12', tweetsCount: 4, likes: 18000, retweets: 3500, replies: 1200, followers: 5210000, engagement: 5.8 },
      { date: '2024-01-13', tweetsCount: 1, likes: 8000, retweets: 1500, replies: 400, followers: 5212000, engagement: 3.9 },
      { date: '2024-01-14', tweetsCount: 3, likes: 14000, retweets: 2800, replies: 900, followers: 5215000, engagement: 4.8 },
      { date: '2024-01-15', tweetsCount: 2, likes: 11000, retweets: 2200, replies: 700, followers: 5218000, engagement: 4.3 },
      { date: '2024-01-16', tweetsCount: 2, likes: 13000, retweets: 2600, replies: 850, followers: 5220000, engagement: 4.7 }
    ],
    topTweets: [
      { id: '4', text: 'Google AI breakthroughs continue to shape the future of technology...', likes: 18000, retweets: 3500, replies: 1200, engagement: 5.8, date: '2024-01-12' },
      { id: '5', text: 'Proud of our team achievements in quantum computing research...', likes: 15000, retweets: 3000, replies: 950, engagement: 5.1, date: '2024-01-11' },
      { id: '6', text: 'Sustainability initiatives at Google are making real impact...', likes: 14000, retweets: 2800, replies: 900, engagement: 4.8, date: '2024-01-14' }
    ]
  }
]

const mockTopicTrends = [
  {
    keyword: '#AI',
    type: 'hashtag' as const,
    mentions: 125000,
    sentiment: 'positive' as const,
    trend: 24.5,
    volume: [1200, 1350, 1450, 1600, 1750, 1900, 2100],
    relatedKeywords: ['machine learning', 'neural networks', 'automation', 'ChatGPT'],
    topTweets: [
      { id: '1', text: 'AI is revolutionizing healthcare with breakthrough diagnostic tools...', author: 'techexpert', engagement: 8.2, date: '2024-01-16' },
      { id: '2', text: 'New AI model achieves 99% accuracy in medical imaging...', author: 'medtech', engagement: 7.9, date: '2024-01-15' }
    ]
  },
  {
    keyword: '#Bitcoin',
    type: 'hashtag' as const,
    mentions: 89000,
    sentiment: 'neutral' as const,
    trend: 12.3,
    volume: [800, 850, 900, 920, 950, 980, 1000],
    relatedKeywords: ['cryptocurrency', 'blockchain', 'digital currency', 'investment'],
    topTweets: [
      { id: '3', text: 'Bitcoin adoption continues to grow among institutional investors...', author: 'cryptoanalyst', engagement: 6.5, date: '2024-01-16' }
    ]
  },
  {
    keyword: '#ClimateChange',
    type: 'hashtag' as const,
    mentions: 67000,
    sentiment: 'negative' as const,
    trend: -8.7,
    volume: [1100, 1050, 1000, 950, 900, 850, 800],
    relatedKeywords: ['global warming', 'carbon emissions', 'renewable energy', 'sustainability'],
    topTweets: [
      { id: '4', text: 'Urgent action needed to address rising global temperatures...', author: 'climatescientist', engagement: 5.8, date: '2024-01-15' }
    ]
  },
  {
    keyword: '#OpenAI',
    type: 'hashtag' as const,
    mentions: 78000,
    sentiment: 'positive' as const,
    trend: 45.2,
    volume: [500, 600, 700, 850, 1000, 1200, 1400],
    relatedKeywords: ['GPT', 'artificial intelligence', 'language model', 'ChatGPT'],
    topTweets: [
      { id: '5', text: 'OpenAI latest model shows remarkable improvements in reasoning...', author: 'airesearcher', engagement: 9.1, date: '2024-01-16' }
    ]
  }
]

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'topics'>('users')
  const [userPeriod, setUserPeriod] = useState<'7d' | '30d' | '90d'>('7d')
  const [topicPeriod, setTopicPeriod] = useState<'7d' | '30d' | '90d'>('7d')

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">数据分析中心</h1>
            <p className="text-muted-foreground">深度分析用户表现和话题趋势</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-muted rounded-lg p-1 mb-6 w-fit">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>用户分析</span>
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'topics'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Hash className="h-4 w-4" />
              <span>话题趋势</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'users' ? (
            <UserAnalyticsDashboard
              data={mockUserAnalytics}
              selectedPeriod={userPeriod}
              onPeriodChange={setUserPeriod}
            />
          ) : (
            <TopicTrendAnalysis
              data={mockTopicTrends}
              selectedPeriod={topicPeriod}
              onPeriodChange={setTopicPeriod}
            />
          )}
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  )
}