'use client'

import { useState } from 'react'
import { 
  Brain, 
  Sparkles, 
  FileText, 
  MessageSquare, 
  Hash, 
  TrendingUp, 
  Copy, 
  Download,
  Loader2,
  Check
} from 'lucide-react'

interface Tweet {
  id: string
  text: string
  author: string
  created_at: string
  metrics: {
    likes: number
    retweets: number
    replies: number
  }
}

interface AIProcessingResult {
  summary: string
  sentiment: 'positive' | 'negative' | 'neutral'
  topics: string[]
  keyInsights: string[]
  suggestedHashtags: string[]
  contentScore: number
}

interface AIContentProcessorProps {
  tweets: Tweet[]
  onProcessingComplete?: (result: AIProcessingResult) => void
}

export default function AIContentProcessor({ tweets, onProcessingComplete }: AIContentProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<AIProcessingResult | null>(null)
  const [selectedTweets, setSelectedTweets] = useState<string[]>([])
  const [processingStep, setProcessingStep] = useState<string>('')

  // 模拟AI处理过程
  const simulateAIProcessing = async (): Promise<AIProcessingResult> => {
    const steps = [
      "正在分析推文内容...",
      "运行情感分析模型...",
      "提取关键主题...",
      "生成智能摘要...",
      "推荐相关标签...",
      "计算内容质量分数..."
    ]

    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(steps[i])
      await new Promise(resolve => setTimeout(resolve, 800))
    }

    // 模拟AI分析结果

    const mockResult: AIProcessingResult = {
      summary: `分析了 ${selectedTweets.length} 条推文，发现主要讨论人工智能、技术创新和社交媒体趋势。内容整体呈现积极态度，用户对新技术展现出浓厚兴趣。推文中频繁提及AI工具的应用价值和未来发展潜力。`,
      sentiment: Math.random() > 0.3 ? 'positive' : Math.random() > 0.5 ? 'neutral' : 'negative',
      topics: ['人工智能', '技术创新', '社交媒体', 'AI工具', '数字化转型'],
      keyInsights: [
        '用户对AI技术的接受度正在快速提升',
        '社交媒体成为技术讨论的主要平台',
        '内容创作者越来越依赖AI辅助工具',
        '技术话题的互动率普遍较高'
      ],
      suggestedHashtags: ['#AI', '#TechInnovation', '#SocialMedia', '#DigitalTransformation', '#MachineLearning'],
      contentScore: Math.floor(Math.random() * 30) + 70 // 70-100分
    }

    return mockResult
  }

  const handleProcessTweets = async () => {
    if (selectedTweets.length === 0) {
      alert('请至少选择一条推文进行分析')
      return
    }

    setIsProcessing(true)
    setResult(null)

    try {
      const aiResult = await simulateAIProcessing()
      setResult(aiResult)
      onProcessingComplete?.(aiResult)
    } catch (error) {
      console.error('AI处理失败:', error)
    } finally {
      setIsProcessing(false)
      setProcessingStep('')
    }
  }

  const handleSelectTweet = (tweetId: string, checked: boolean) => {
    if (checked) {
      setSelectedTweets([...selectedTweets, tweetId])
    } else {
      setSelectedTweets(selectedTweets.filter(id => id !== tweetId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTweets(tweets.map(tweet => tweet.id))
    } else {
      setSelectedTweets([])
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportResults = () => {
    if (!result) return

    const exportData = {
      timestamp: new Date().toISOString(),
      analyzedTweets: selectedTweets.length,
      aiAnalysis: result
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-analysis-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100'
      case 'negative': return 'text-red-600 bg-red-100'
      case 'neutral': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-foreground">AI内容处理器</h2>
            <p className="text-muted-foreground">智能分析推文内容，生成深度见解</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-muted-foreground">
            已选择 {selectedTweets.length}/{tweets.length} 条推文
          </span>
          <button
            onClick={handleProcessTweets}
            disabled={isProcessing || selectedTweets.length === 0}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>分析中...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>开始AI分析</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            <span className="text-blue-800 font-medium">{processingStep}</span>
          </div>
          <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tweet Selection */}
        <div className="bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>选择推文</span>
              </h3>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedTweets.length === tweets.length && tweets.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded"
                />
                <span>全选</span>
              </label>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {tweets.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>暂无推文数据</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {tweets.map((tweet) => (
                  <div key={tweet.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedTweets.includes(tweet.id)}
                        onChange={(e) => handleSelectTweet(tweet.id, e.target.checked)}
                        className="rounded mt-1"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-foreground">@{tweet.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(tweet.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-foreground mb-2 line-clamp-3">{tweet.text}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>❤️ {tweet.metrics.likes}</span>
                          <span>🔄 {tweet.metrics.retweets}</span>
                          <span>💬 {tweet.metrics.replies}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Analysis Results */}
        <div className="bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI分析结果</span>
              </h3>
              {result && (
                <button
                  onClick={exportResults}
                  className="px-3 py-1 text-sm border border-border rounded hover:bg-muted"
                >
                  <Download className="h-3 w-3 mr-1 inline" />
                  导出
                </button>
              )}
            </div>
          </div>

          <div className="p-4">
            {!result ? (
              <div className="text-center text-muted-foreground py-12">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>选择推文并开始AI分析</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>智能摘要</span>
                    </h4>
                    <button
                      onClick={() => copyToClipboard(result.summary)}
                      className="p-1 hover:bg-muted rounded"
                      title="复制摘要"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg">
                    {result.summary}
                  </p>
                </div>

                {/* Sentiment & Score */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">情感分析</h4>
                    <span className={`inline-flex px-3 py-1 text-sm rounded-full ${getSentimentColor(result.sentiment)}`}>
                      {result.sentiment === 'positive' ? '😊 积极' : 
                       result.sentiment === 'negative' ? '😔 消极' : '😐 中性'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">内容质量</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xl font-bold ${getScoreColor(result.contentScore)}`}>
                        {result.contentScore}
                      </span>
                      <span className="text-sm text-muted-foreground">/100</span>
                    </div>
                  </div>
                </div>

                {/* Topics */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center space-x-2">
                    <Hash className="h-4 w-4" />
                    <span>主要话题</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Insights */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>关键见解</span>
                  </h4>
                  <ul className="space-y-2">
                    {result.keyInsights.map((insight, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggested Hashtags */}
                <div>
                  <h4 className="font-medium mb-2">推荐标签</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.suggestedHashtags.map((hashtag, index) => (
                      <button
                        key={index}
                        onClick={() => copyToClipboard(hashtag)}
                        className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors"
                        title="点击复制"
                      >
                        <span>{hashtag}</span>
                        <Copy className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}