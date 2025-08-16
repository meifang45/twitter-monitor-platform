'use client'

import { useState, useMemo } from 'react'
import { Hash, TrendingUp, BarChart3, Globe, MessageSquare, Heart, Filter, Download } from 'lucide-react'

interface TopicTrendData {
  keyword: string
  type: 'hashtag' | 'mention' | 'phrase'
  mentions: number
  sentiment: 'positive' | 'negative' | 'neutral'
  trend: number // percentage change
  volume: number[] // daily volume for chart
  relatedKeywords: string[]
  topTweets: {
    id: string
    text: string
    author: string
    engagement: number
    date: string
  }[]
}

interface TopicTrendAnalysisProps {
  data: TopicTrendData[]
  selectedPeriod: '7d' | '30d' | '90d'
  onPeriodChange: (period: '7d' | '30d' | '90d') => void
}

export default function TopicTrendAnalysis({ data, selectedPeriod, onPeriodChange }: TopicTrendAnalysisProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>(data[0]?.keyword || '')
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'hashtag' | 'mention' | 'phrase'>('all')

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSentiment = sentimentFilter === 'all' || item.sentiment === sentimentFilter
      const matchesType = typeFilter === 'all' || item.type === typeFilter
      return matchesSentiment && matchesType
    })
  }, [data, sentimentFilter, typeFilter])

  const currentTopicData = useMemo(() => {
    return data.find(item => item.keyword === selectedTopic)
  }, [data, selectedTopic])

  const topTrendingTopics = useMemo(() => {
    return [...filteredData]
      .sort((a, b) => b.trend - a.trend)
      .slice(0, 10)
  }, [filteredData])

  const sentimentStats = useMemo(() => {
    const positive = filteredData.filter(item => item.sentiment === 'positive').length
    const negative = filteredData.filter(item => item.sentiment === 'negative').length
    const neutral = filteredData.filter(item => item.sentiment === 'neutral').length
    const total = positive + negative + neutral

    return {
      positive: { count: positive, percentage: total > 0 ? (positive / total) * 100 : 0 },
      negative: { count: negative, percentage: total > 0 ? (negative / total) * 100 : 0 },
      neutral: { count: neutral, percentage: total > 0 ? (neutral / total) * 100 : 0 }
    }
  }, [filteredData])

  const handleExportData = () => {
    const exportData = {
      period: selectedPeriod,
      filters: { sentiment: sentimentFilter, type: typeFilter },
      summary: {
        totalTopics: filteredData.length,
        sentimentDistribution: sentimentStats,
        topTrending: topTrendingTopics.slice(0, 5)
      },
      detailedData: filteredData
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `topic-trends-${selectedPeriod}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hashtag': return <Hash className="h-4 w-4 text-blue-500" />
      case 'mention': return <MessageSquare className="h-4 w-4 text-green-500" />
      case 'phrase': return <Globe className="h-4 w-4 text-purple-500" />
      default: return <Hash className="h-4 w-4" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100'
      case 'negative': return 'text-red-600 bg-red-100'
      case 'neutral': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600'
    if (trend < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">话题趋势分析</h2>
          <p className="text-muted-foreground">追踪热门话题和关键词趋势变化</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Period Selector */}
          <div className="flex bg-muted rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((period) => (
              <button
                key={period}
                onClick={() => onPeriodChange(period)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  selectedPeriod === period
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {period === '7d' ? '7天' : period === '30d' ? '30天' : '90天'}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleExportData}
            className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
          >
            <Download className="h-4 w-4 mr-2 inline" />
            导出
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">筛选：</span>
        </div>
        
        <select
          value={sentimentFilter}
          onChange={(e) => setSentimentFilter(e.target.value as 'all' | 'positive' | 'negative' | 'neutral')}
          className="px-3 py-1 text-sm border border-border rounded-md bg-background"
        >
          <option value="all">全部情感</option>
          <option value="positive">正面</option>
          <option value="negative">负面</option>
          <option value="neutral">中性</option>
        </select>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as 'all' | 'hashtag' | 'mention' | 'phrase')}
          className="px-3 py-1 text-sm border border-border rounded-md bg-background"
        >
          <option value="all">全部类型</option>
          <option value="hashtag">标签</option>
          <option value="mention">提及</option>
          <option value="phrase">短语</option>
        </select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">监控话题</p>
              <p className="text-2xl font-bold text-foreground">{filteredData.length}</p>
            </div>
            <Hash className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {filteredData.filter(item => item.trend > 0).length} 个上升趋势
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">正面情感</p>
              <p className="text-2xl font-bold text-green-600">{sentimentStats.positive.percentage.toFixed(1)}%</p>
            </div>
            <Heart className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {sentimentStats.positive.count} 个话题
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">总提及量</p>
              <p className="text-2xl font-bold text-foreground">
                {filteredData.reduce((sum, item) => sum + item.mentions, 0).toLocaleString()}
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            跨所有监控话题
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">热门话题</p>
              <p className="text-2xl font-bold text-foreground">
                {topTrendingTopics[0]?.keyword || '-'}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {topTrendingTopics[0] ? `+${topTrendingTopics[0].trend.toFixed(1)}% 增长` : '暂无数据'}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trending Topics List */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>热门趋势</span>
              </h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              <div className="divide-y divide-border">
                {topTrendingTopics.map((topic, index) => (
                  <div
                    key={topic.keyword}
                    className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedTopic === topic.keyword ? 'bg-muted/30' : ''
                    }`}
                    onClick={() => setSelectedTopic(topic.keyword)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <span className="text-sm font-bold text-muted-foreground">
                          #{index + 1}
                        </span>
                        {getTypeIcon(topic.type)}
                        <span className="font-medium text-foreground truncate">
                          {topic.keyword}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${getTrendColor(topic.trend)}`}>
                          {topic.trend > 0 ? '+' : ''}{topic.trend.toFixed(1)}%
                        </span>
                        {topic.trend > 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : topic.trend < 0 ? (
                          <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
                        ) : null}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {topic.mentions.toLocaleString()} 提及
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getSentimentColor(topic.sentiment)}`}>
                        {topic.sentiment === 'positive' ? '正面' : topic.sentiment === 'negative' ? '负面' : '中性'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Topic Detail */}
        <div className="lg:col-span-2">
          {currentTopicData ? (
            <div className="space-y-6">
              {/* Topic Overview */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(currentTopicData.type)}
                    <h3 className="text-xl font-bold text-foreground">{currentTopicData.keyword}</h3>
                    <span className={`inline-flex px-3 py-1 text-sm rounded-full ${getSentimentColor(currentTopicData.sentiment)}`}>
                      {currentTopicData.sentiment === 'positive' ? '正面' : currentTopicData.sentiment === 'negative' ? '负面' : '中性'}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getTrendColor(currentTopicData.trend)}`}>
                      {currentTopicData.trend > 0 ? '+' : ''}{currentTopicData.trend.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">趋势变化</div>
                  </div>
                </div>

                {/* Volume Chart */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">提及量趋势</h4>
                  <div className="h-24 flex items-end justify-between space-x-1">
                    {currentTopicData.volume.map((volume, index) => {
                      const maxVolume = Math.max(...currentTopicData.volume)
                      const height = maxVolume > 0 ? (volume / maxVolume) * 100 : 0
                      
                      return (
                        <div
                          key={index}
                          className="flex-1 bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                          style={{ height: `${Math.max(2, height)}%` }}
                          title={`第${index + 1}天: ${volume} 提及`}
                        ></div>
                      )
                    })}
                  </div>
                </div>

                {/* Related Keywords */}
                <div>
                  <h4 className="text-sm font-medium mb-2">相关关键词</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentTopicData.relatedKeywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="inline-flex px-2 py-1 text-xs bg-muted text-muted-foreground rounded-md"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Tweets */}
              <div className="bg-card border border-border rounded-lg">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>热门推文</span>
                  </h3>
                </div>
                
                <div className="divide-y divide-border">
                  {currentTopicData.topTweets.slice(0, 3).map((tweet, index) => (
                    <div key={tweet.id} className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground mb-2">{tweet.text}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-medium">@{tweet.author}</span>
                            <div className="flex items-center space-x-4">
                              <span>互动率: {tweet.engagement.toFixed(2)}%</span>
                              <span>{new Date(tweet.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <Hash className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground">选择一个话题查看详细分析</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}