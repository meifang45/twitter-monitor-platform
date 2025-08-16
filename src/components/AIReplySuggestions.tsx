'use client'

import { useState } from 'react'
import { 
  MessageCircle, 
  Sparkles, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  RefreshCw,
  Loader2,
  User,
  TrendingUp,
  Heart
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

interface ReplySuggestion {
  id: string
  content: string
  tone: 'professional' | 'casual' | 'friendly' | 'humorous'
  type: 'agreement' | 'question' | 'insight' | 'appreciation'
  confidence: number
}

interface AIReplySuggestionsProps {
  tweet: Tweet
  userContext?: {
    name: string
    role: string
    expertise: string[]
  }
}

export default function AIReplySuggestions({ tweet, userContext }: AIReplySuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ReplySuggestion[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTone, setSelectedTone] = useState<'professional' | 'casual' | 'friendly' | 'humorous'>('friendly')
  const [customPrompt, setCustomPrompt] = useState('')
  const [feedback, setFeedback] = useState<{ [key: string]: 'like' | 'dislike' | null }>({})

  // 模拟AI生成回复建议
  const generateReplySuggestions = async (): Promise<ReplySuggestion[]> => {
    await new Promise(resolve => setTimeout(resolve, 2000))

    const baseContent = {
      professional: [
        `感谢分享这个有价值的见解。基于我在${userContext?.expertise?.[0] || '该领域'}的经验，我认为这个观点很有深度。`,
        `这是一个很好的观点。我想补充一点：从实践角度来看，这种方法确实有效。`,
        `完全同意您的观点。在我们的工作中，我们也观察到了类似的趋势。`
      ],
      casual: [
        `哇，这个想法很棒！我之前也有类似的经历。`,
        `说得对！这让我想起了上个月发生的事情。`,
        `太有意思了，没想到还有这种角度。`
      ],
      friendly: [
        `很喜欢这个分享！🙂 这确实让人深思。`,
        `谢谢分享！这个观点很有启发性。`,
        `说得很好！我也有类似的想法。`
      ],
      humorous: [
        `哈哈，这个太真实了！就像我每次尝试新技术时的心路历程。😅`,
        `这个观点绝了！比我的咖啡机都更有逻辑。☕`,
        `说到点子上了！这比我上次的演讲还要精彩。😂`
      ]
    }

    const replyTypes = ['agreement', 'question', 'insight', 'appreciation'] as const
    const selectedContents = baseContent[selectedTone]

    return selectedContents.map((content, index) => ({
      id: `suggestion-${index + 1}`,
      content,
      tone: selectedTone,
      type: replyTypes[index % replyTypes.length],
      confidence: Math.floor(Math.random() * 20) + 80 // 80-100%
    }))
  }

  const handleGenerateSuggestions = async () => {
    setIsGenerating(true)
    try {
      const newSuggestions = await generateReplySuggestions()
      setSuggestions(newSuggestions)
    } catch (error) {
      console.error('生成失败:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopySuggestion = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const handleFeedback = (suggestionId: string, type: 'like' | 'dislike') => {
    setFeedback(prev => ({
      ...prev,
      [suggestionId]: prev[suggestionId] === type ? null : type
    }))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'agreement': return <ThumbsUp className="h-4 w-4 text-green-500" />
      case 'question': return <MessageCircle className="h-4 w-4 text-blue-500" />
      case 'insight': return <TrendingUp className="h-4 w-4 text-purple-500" />
      case 'appreciation': return <Heart className="h-4 w-4 text-red-500" />
      default: return <MessageCircle className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'agreement': return '表示赞同'
      case 'question': return '提出问题'
      case 'insight': return '分享见解'
      case 'appreciation': return '表达感谢'
      default: return '一般回复'
    }
  }

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'professional': return 'bg-blue-100 text-blue-800'
      case 'casual': return 'bg-green-100 text-green-800'
      case 'friendly': return 'bg-purple-100 text-purple-800'
      case 'humorous': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <MessageCircle className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-xl font-bold text-foreground">AI回复建议</h2>
          <p className="text-muted-foreground">智能生成个性化回复内容</p>
        </div>
      </div>

      {/* Original Tweet */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-3">原推文</h3>
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium text-foreground">@{tweet.author}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(tweet.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-foreground mb-3">{tweet.text}</p>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span className="flex items-center space-x-1">
                  <Heart className="h-3 w-3" />
                  <span>{tweet.metrics.likes}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <RefreshCw className="h-3 w-3" />
                  <span>{tweet.metrics.retweets}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>{tweet.metrics.replies}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-4">回复配置</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">回复语调</label>
            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value as 'professional' | 'casual' | 'friendly' | 'humorous')}
              className="w-full p-3 border border-border rounded-md bg-background text-foreground"
            >
              <option value="professional">🎯 专业正式</option>
              <option value="friendly">😊 友好亲切</option>
              <option value="casual">😎 轻松随意</option>
              <option value="humorous">😄 幽默风趣</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">自定义提示</label>
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="例如：强调数据支持..."
              className="w-full p-3 border border-border rounded-md bg-background text-foreground"
            />
          </div>
        </div>

        {userContext && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <h4 className="text-sm font-medium mb-2">用户信息</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>姓名:</strong> {userContext.name}</p>
              <p><strong>角色:</strong> {userContext.role}</p>
              <p><strong>专长:</strong> {userContext.expertise.join(', ')}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleGenerateSuggestions}
          disabled={isGenerating}
          className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>生成中...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>生成回复建议</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>AI回复建议</span>
            </h3>
          </div>

          <div className="p-4 space-y-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(suggestion.type)}
                    <span className="text-sm font-medium">{getTypeLabel(suggestion.type)}</span>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getToneColor(suggestion.tone)}`}>
                      {suggestion.tone === 'professional' ? '专业' :
                       suggestion.tone === 'friendly' ? '友好' :
                       suggestion.tone === 'casual' ? '随意' : '幽默'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      置信度: {suggestion.confidence}%
                    </span>
                    <button
                      onClick={() => handleCopySuggestion(suggestion.content)}
                      className="p-1 hover:bg-muted rounded"
                      title="复制回复"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-foreground mb-3 leading-relaxed">
                  {suggestion.content}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleFeedback(suggestion.id, 'like')}
                      className={`p-1 rounded transition-colors ${
                        feedback[suggestion.id] === 'like' 
                          ? 'text-green-600 bg-green-100' 
                          : 'text-muted-foreground hover:text-green-600'
                      }`}
                      title="喜欢这个建议"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleFeedback(suggestion.id, 'dislike')}
                      className={`p-1 rounded transition-colors ${
                        feedback[suggestion.id] === 'dislike' 
                          ? 'text-red-600 bg-red-100' 
                          : 'text-muted-foreground hover:text-red-600'
                      }`}
                      title="不喜欢这个建议"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <span className="text-xs text-muted-foreground">
                    点击复制按钮使用此回复
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-800 mb-2">💡 回复技巧</h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• 保持回复简洁有力，突出你的观点</li>
          <li>• 根据原推文的语调选择合适的回复风格</li>
          <li>• 添加个人经验或见解让回复更有价值</li>
          <li>• 适当使用emoji增加亲和力</li>
          <li>• 避免争论，保持建设性的讨论</li>
        </ul>
      </div>
    </div>
  )
}