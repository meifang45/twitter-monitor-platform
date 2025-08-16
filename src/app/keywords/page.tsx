'use client'

import EnterpriseLayout from '@/components/EnterpriseLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import KeywordMonitorManager from '@/components/KeywordMonitorManager'
import { useState } from 'react'

// Define types to match the component interface
interface Keyword {
  id: string
  keyword: string
  type: 'hashtag' | 'mention' | 'phrase'
  group: string
  status: 'active' | 'paused'
  mentionCount: number
  sentiment: 'positive' | 'negative' | 'neutral'
  trending: boolean
  addedAt: string
}

interface KeywordGroup {
  id: string
  name: string
  color: string
  keywordCount: number
}

// Mock data for demonstration
const initialKeywords: Keyword[] = [
  {
    id: '1',
    keyword: '#AI',
    type: 'hashtag',
    group: 'AI & Technology',
    status: 'active',
    mentionCount: 2847,
    sentiment: 'positive',
    trending: true,
    addedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    keyword: '#Bitcoin',
    type: 'hashtag',
    group: 'Cryptocurrency',
    status: 'active',
    mentionCount: 1923,
    sentiment: 'neutral',
    trending: false,
    addedAt: '2024-01-16T14:20:00Z'
  },
  {
    id: '3',
    keyword: '#OpenAI',
    type: 'hashtag',
    group: 'AI & Technology',
    status: 'active',
    mentionCount: 1456,
    sentiment: 'positive',
    trending: true,
    addedAt: '2024-01-17T09:15:00Z'
  },
  {
    id: '4',
    keyword: '#ClimateChange',
    type: 'hashtag',
    group: 'Climate Change',
    status: 'paused',
    mentionCount: 892,
    sentiment: 'negative',
    trending: false,
    addedAt: '2024-01-18T16:45:00Z'
  }
]

const initialGroups: KeywordGroup[] = [
  {
    id: '1',
    name: 'AI & Technology',
    color: 'bg-blue-500',
    keywordCount: 12
  },
  {
    id: '2',
    name: 'Cryptocurrency',
    color: 'bg-orange-500',
    keywordCount: 8
  },
  {
    id: '3',
    name: 'Climate Change',
    color: 'bg-green-500',
    keywordCount: 6
  }
]

export default function KeywordMonitoringPage() {
  const [keywords, setKeywords] = useState<Keyword[]>(initialKeywords)
  const [groups] = useState<KeywordGroup[]>(initialGroups)

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">关键词监控管理</h1>
            <p className="text-muted-foreground">监控热门标签、提及和关键短语</p>
          </div>
          
          <KeywordMonitorManager 
            keywords={keywords}
            groups={groups}
            onKeywordsChange={setKeywords}
          />
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  )
}