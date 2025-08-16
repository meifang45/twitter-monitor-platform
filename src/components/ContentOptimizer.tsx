'use client'

import { useState } from 'react'
import { 
  Target, 
  TrendingUp, 
  Clock, 
  BarChart3,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Copy,
  Download
} from 'lucide-react'

interface ContentAnalysis {
  score: number
  readability: number
  engagement_potential: number
  seo_score: number
  sentiment_score: number
}

interface Recommendation {
  id: string
  type: 'critical' | 'improvement' | 'suggestion'
  category: 'structure' | 'language' | 'engagement' | 'timing' | 'hashtags'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  effort: 'low' | 'medium' | 'high'
  before?: string
  after?: string
}

interface OptimizedContent {
  original: string
  optimized: string
  improvements: string[]
  hashtags: string[]
  best_time: string
  audience_match: number
}

interface ContentOptimizerProps {
  content: string
  onOptimizationComplete?: (result: OptimizedContent) => void
}

export default function ContentOptimizer({ content, onOptimizationComplete }: ContentOptimizerProps) {
  const [inputContent, setInputContent] = useState(content || '')
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [optimizedContent, setOptimizedContent] = useState<OptimizedContent | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // 模拟AI内容分析
  const analyzeContent = async (): Promise<{ analysis: ContentAnalysis, recommendations: Recommendation[] }> => {
    await new Promise(resolve => setTimeout(resolve, 2000))

    const mockAnalysis: ContentAnalysis = {
      score: Math.floor(Math.random() * 30) + 70, // 70-100
      readability: Math.floor(Math.random() * 25) + 75, // 75-100
      engagement_potential: Math.floor(Math.random() * 40) + 60, // 60-100
      seo_score: Math.floor(Math.random() * 35) + 65, // 65-100
      sentiment_score: Math.floor(Math.random() * 20) + 80 // 80-100
    }

    const mockRecommendations: Recommendation[] = [
      {
        id: '1',
        type: 'critical',
        category: 'structure',
        title: '优化开头吸引力',
        description: '当前开头过于平淡，建议添加引人注目的钩子来吸引读者注意力。',
        impact: 'high',
        effort: 'low',
        before: '今天我想分享一些关于...',
        after: '🚀 你知道吗？这个简单的技巧可以让你的效率提升50%...'
      },
      {
        id: '2',
        type: 'improvement',
        category: 'hashtags',
        title: '增加相关标签',
        description: '添加热门相关标签可以提高内容的可发现性和传播范围。',
        impact: 'medium',
        effort: 'low'
      },
      {
        id: '3',
        type: 'suggestion',
        category: 'engagement',
        title: '添加互动元素',
        description: '在内容中加入问题或号召行动，鼓励用户参与讨论。',
        impact: 'medium',
        effort: 'medium'
      },
      {
        id: '4',
        type: 'improvement',
        category: 'timing',
        title: '优化发布时间',
        description: '根据目标受众的活跃时间调整发布时间，可以获得更好的传播效果。',
        impact: 'high',
        effort: 'low'
      },
      {
        id: '5',
        type: 'suggestion',
        category: 'language',
        title: '简化表达方式',
        description: '使用更简洁明了的语言，提高内容的可读性和理解度。',
        impact: 'medium',
        effort: 'medium'
      }
    ]

    return { analysis: mockAnalysis, recommendations: mockRecommendations }
  }

  // 模拟AI内容优化
  const optimizeContent = async (): Promise<OptimizedContent> => {
    await new Promise(resolve => setTimeout(resolve, 3000))

    return {
      original: inputContent,
      optimized: `🚀 想要快速提升工作效率？这里有5个被验证有效的方法！

💡 第一个技巧就让我的团队效率提升了40%...

你们有什么提升效率的小技巧吗？在评论区分享一下！

#效率提升 #工作技巧 #生产力 #职场成长`,
      improvements: [
        '添加了吸引人的开头emoji和问题',
        '使用了具体的数据支撑（40%提升）',
        '加入了互动号召行动',
        '优化了标签选择和布局',
        '改善了内容结构和可读性'
      ],
      hashtags: ['#效率提升', '#工作技巧', '#生产力', '#职场成长', '#时间管理'],
      best_time: '周二 9:00 AM 或 周四 2:00 PM',
      audience_match: 92
    }
  }

  const handleAnalyze = async () => {
    if (!inputContent.trim()) {
      alert('请输入内容进行分析')
      return
    }

    setIsAnalyzing(true)
    try {
      const { analysis: newAnalysis, recommendations: newRecommendations } = await analyzeContent()
      setAnalysis(newAnalysis)
      setRecommendations(newRecommendations)
    } catch (error) {
      console.error('分析失败:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleOptimize = async () => {
    if (!inputContent.trim()) {
      alert('请输入内容进行优化')
      return
    }

    setIsOptimizing(true)
    try {
      const optimized = await optimizeContent()
      setOptimizedContent(optimized)
      onOptimizationComplete?.(optimized)
    } catch (error) {
      console.error('优化失败:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'bg-green-100'
    if (score >= 70) return 'bg-blue-100'
    if (score >= 50) return 'bg-orange-100'
    return 'bg-red-100'
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'improvement': return <TrendingUp className="h-4 w-4 text-blue-500" />
      case 'suggestion': return <Lightbulb className="h-4 w-4 text-yellow-500" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-orange-600 bg-orange-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.category === selectedCategory)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportOptimization = () => {
    if (!optimizedContent || !analysis) return

    const exportData = {
      timestamp: new Date().toISOString(),
      originalContent: optimizedContent.original,
      optimizedContent: optimizedContent.optimized,
      analysis,
      recommendations: recommendations.slice(0, 5),
      improvements: optimizedContent.improvements
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `content-optimization-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Target className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-xl font-bold text-foreground">内容优化助手</h2>
          <p className="text-muted-foreground">AI驱动的智能内容分析和优化建议</p>
        </div>
      </div>

      {/* Content Input */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4">内容输入</h3>
        <textarea
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
          placeholder="请输入您要优化的内容..."
          className="w-full p-4 border border-border rounded-md bg-background text-foreground resize-none"
          rows={6}
        />
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted-foreground">
            {inputContent.length} 字符
          </span>
          <div className="flex space-x-3">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !inputContent.trim()}
              className="px-6 py-2 border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? '分析中...' : '分析内容'}
            </button>
            <button
              onClick={handleOptimize}
              disabled={isOptimizing || !inputContent.trim()}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOptimizing ? '优化中...' : 'AI优化'}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4 flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>内容分析报告</span>
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className={`p-4 rounded-lg ${getScoreBackground(analysis.score)}`}>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}
                </div>
                <div className="text-sm text-muted-foreground mt-1">总体评分</div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${getScoreBackground(analysis.readability)}`}>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(analysis.readability)}`}>
                  {analysis.readability}
                </div>
                <div className="text-sm text-muted-foreground mt-1">可读性</div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${getScoreBackground(analysis.engagement_potential)}`}>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(analysis.engagement_potential)}`}>
                  {analysis.engagement_potential}
                </div>
                <div className="text-sm text-muted-foreground mt-1">互动潜力</div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${getScoreBackground(analysis.seo_score)}`}>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(analysis.seo_score)}`}>
                  {analysis.seo_score}
                </div>
                <div className="text-sm text-muted-foreground mt-1">SEO评分</div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${getScoreBackground(analysis.sentiment_score)}`}>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(analysis.sentiment_score)}`}>
                  {analysis.sentiment_score}
                </div>
                <div className="text-sm text-muted-foreground mt-1">情感倾向</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>优化建议</span>
              </h3>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 text-sm border border-border rounded-md bg-background"
              >
                <option value="all">全部建议</option>
                <option value="structure">内容结构</option>
                <option value="language">语言表达</option>
                <option value="engagement">互动性</option>
                <option value="timing">发布时机</option>
                <option value="hashtags">标签优化</option>
              </select>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {filteredRecommendations.map((rec) => (
              <div key={rec.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getRecommendationIcon(rec.type)}
                    <span className="font-medium">{rec.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getImpactColor(rec.impact)}`}>
                      {rec.impact === 'high' ? '高影响' : rec.impact === 'medium' ? '中影响' : '低影响'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {rec.effort === 'low' ? '易实现' : rec.effort === 'medium' ? '中等难度' : '需要努力'}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>

                {rec.before && rec.after && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <h5 className="text-xs font-medium text-red-600 mb-1">优化前:</h5>
                      <div className="text-sm bg-red-50 p-2 rounded text-red-800">
                        {rec.before}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-green-600 mb-1">优化后:</h5>
                      <div className="text-sm bg-green-50 p-2 rounded text-green-800">
                        {rec.after}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optimized Content */}
      {optimizedContent && (
        <div className="bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <span>AI优化结果</span>
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  受众匹配度: {optimizedContent.audience_match}%
                </span>
                <button
                  onClick={exportOptimization}
                  className="px-3 py-1 text-sm border border-border rounded hover:bg-muted"
                >
                  <Download className="h-3 w-3 mr-1 inline" />
                  导出
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Before/After */}
              <div>
                <h4 className="font-medium mb-2 text-red-600">原始内容:</h4>
                <div className="bg-red-50 p-4 rounded-lg text-sm text-red-800">
                  {optimizedContent.original}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-green-600">优化后内容:</h4>
                  <button
                    onClick={() => copyToClipboard(optimizedContent.optimized)}
                    className="p-1 hover:bg-muted rounded"
                    title="复制优化内容"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-sm text-green-800">
                  {optimizedContent.optimized}
                </div>
              </div>
            </div>

            {/* Improvements */}
            <div className="mt-6">
              <h4 className="font-medium mb-3">改进要点:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <ul className="space-y-2">
                    {optimizedContent.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium mb-1">推荐标签:</h5>
                      <div className="flex flex-wrap gap-1">
                        {optimizedContent.hashtags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200"
                            onClick={() => copyToClipboard(tag)}
                            title="点击复制"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium mb-1">最佳发布时间:</h5>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{optimizedContent.best_time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}