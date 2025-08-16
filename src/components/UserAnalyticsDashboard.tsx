'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, Users, Heart, MessageCircle, Repeat2, BarChart3, Calendar, Download } from 'lucide-react'

interface AnalyticsData {
  userId: string
  username: string
  name: string
  dailyStats: {
    date: string
    tweetsCount: number
    likes: number
    retweets: number
    replies: number
    followers: number
    engagement: number
  }[]
  topTweets: {
    id: string
    text: string
    likes: number
    retweets: number
    replies: number
    engagement: number
    date: string
  }[]
}

interface UserAnalyticsDashboardProps {
  data: AnalyticsData[]
  selectedPeriod: '7d' | '30d' | '90d'
  onPeriodChange: (period: '7d' | '30d' | '90d') => void
}

export default function UserAnalyticsDashboard({ data, selectedPeriod, onPeriodChange }: UserAnalyticsDashboardProps) {
  const [selectedUser, setSelectedUser] = useState<string>(data[0]?.userId || '')

  const currentUserData = useMemo(() => {
    return data.find(user => user.userId === selectedUser)
  }, [data, selectedUser])

  const aggregatedStats = useMemo(() => {
    if (!currentUserData) return null

    const stats = currentUserData.dailyStats
    const totalTweets = stats.reduce((sum, day) => sum + day.tweetsCount, 0)
    const totalLikes = stats.reduce((sum, day) => sum + day.likes, 0)
    const totalRetweets = stats.reduce((sum, day) => sum + day.retweets, 0)
    const totalReplies = stats.reduce((sum, day) => sum + day.replies, 0)
    const avgEngagement = stats.reduce((sum, day) => sum + day.engagement, 0) / stats.length
    
    const firstDay = stats[0]
    const lastDay = stats[stats.length - 1]
    const followerGrowth = lastDay ? lastDay.followers - (firstDay?.followers || 0) : 0
    const followerGrowthPercent = firstDay?.followers ? (followerGrowth / firstDay.followers) * 100 : 0

    return {
      totalTweets,
      totalLikes,
      totalRetweets,
      totalReplies,
      avgEngagement,
      followerGrowth,
      followerGrowthPercent,
      currentFollowers: lastDay?.followers || 0
    }
  }, [currentUserData])

  const chartData = useMemo(() => {
    if (!currentUserData) return []
    
    return currentUserData.dailyStats.map(day => ({
      date: new Date(day.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      engagement: day.engagement,
      followers: day.followers,
      tweets: day.tweetsCount,
      likes: day.likes
    }))
  }, [currentUserData])

  const handleExportData = () => {
    if (!currentUserData) return
    
    const exportData = {
      user: {
        username: currentUserData.username,
        name: currentUserData.name
      },
      period: selectedPeriod,
      summary: aggregatedStats,
      dailyStats: currentUserData.dailyStats,
      topTweets: currentUserData.topTweets
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${currentUserData.username}-${selectedPeriod}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!currentUserData || !aggregatedStats) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>暂无分析数据</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">用户数据分析</h2>
          <p className="text-muted-foreground">深度分析用户表现和互动数据</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* User Selector */}
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            {data.map((user) => (
              <option key={user.userId} value={user.userId}>
                @{user.username}
              </option>
            ))}
          </select>
          
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">总推文数</p>
              <p className="text-2xl font-bold text-foreground">{aggregatedStats.totalTweets}</p>
            </div>
            <MessageCircle className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            平均 {Math.round(aggregatedStats.totalTweets / parseInt(selectedPeriod))} 条/天
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">总互动数</p>
              <p className="text-2xl font-bold text-foreground">
                {(aggregatedStats.totalLikes + aggregatedStats.totalRetweets + aggregatedStats.totalReplies).toLocaleString()}
              </p>
            </div>
            <Heart className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            平均互动率 {aggregatedStats.avgEngagement.toFixed(2)}%
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">粉丝增长</p>
              <p className="text-2xl font-bold text-foreground">
                {aggregatedStats.followerGrowth >= 0 ? '+' : ''}{aggregatedStats.followerGrowth.toLocaleString()}
              </p>
            </div>
            {aggregatedStats.followerGrowthPercent >= 0 ? (
              <TrendingUp className="h-8 w-8 text-green-500" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {aggregatedStats.followerGrowthPercent >= 0 ? '+' : ''}{aggregatedStats.followerGrowthPercent.toFixed(2)}% 增长率
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">当前粉丝</p>
              <p className="text-2xl font-bold text-foreground">{aggregatedStats.currentFollowers.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            总关注者数量
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Trend Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>互动率趋势</span>
          </h3>
          
          <div className="h-64 flex items-end justify-between space-x-1">
            {chartData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-muted rounded-t relative" style={{ height: '200px' }}>
                  <div
                    className="w-full bg-blue-500 rounded-t absolute bottom-0 transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${Math.max(5, (data.engagement / 10) * 100)}%` }}
                    title={`${data.date}: ${data.engagement.toFixed(2)}%`}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground mt-2 transform -rotate-45 origin-center">
                  {data.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Follower Growth Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>粉丝增长趋势</span>
          </h3>
          
          <div className="h-64 flex items-end justify-between space-x-1">
            {chartData.map((data, index) => {
              const maxFollowers = Math.max(...chartData.map(d => d.followers))
              const height = (data.followers / maxFollowers) * 100
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-muted rounded-t relative" style={{ height: '200px' }}>
                    <div
                      className="w-full bg-green-500 rounded-t absolute bottom-0 transition-all duration-300 hover:bg-green-600"
                      style={{ height: `${Math.max(5, height)}%` }}
                      title={`${data.date}: ${data.followers.toLocaleString()}`}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground mt-2 transform -rotate-45 origin-center">
                    {data.date}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Top Tweets */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>热门推文排行</span>
          </h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {currentUserData.topTweets.slice(0, 5).map((tweet, index) => (
              <div key={tweet.id} className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground mb-2 line-clamp-2">{tweet.text}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <Heart className="h-3 w-3" />
                      <span>{tweet.likes.toLocaleString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Repeat2 className="h-3 w-3" />
                      <span>{tweet.retweets.toLocaleString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{tweet.replies.toLocaleString()}</span>
                    </span>
                    <span className="ml-auto">
                      {new Date(tweet.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-semibold text-foreground">{tweet.engagement.toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground">互动率</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Stats Table */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>每日数据详情</span>
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">推文数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">点赞数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">转发数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">回复数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">粉丝数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">互动率</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {currentUserData.dailyStats.slice().reverse().map((day) => (
                <tr key={day.date} className="hover:bg-muted/20">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {new Date(day.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{day.tweetsCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{day.likes.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{day.retweets.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{day.replies.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{day.followers.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      day.engagement >= 5 ? 'bg-green-100 text-green-800' :
                      day.engagement >= 2 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {day.engagement.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}