'use client'

import EnterpriseLayout from '@/components/EnterpriseLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import AIContentProcessor from '@/components/AIContentProcessor'
import TwitterThreadGenerator from '@/components/TwitterThreadGenerator'
import AIReplySuggestions from '@/components/AIReplySuggestions'
import ContentOptimizer from '@/components/ContentOptimizer'
import AIHistoryManager from '@/components/AIHistoryManager'
import { useState } from 'react'
import { 
  Brain, 
  MessageSquare, 
  Sparkles, 
  Target, 
  History,
  Zap
} from 'lucide-react'

// Mock tweet data for demos
const mockTweets = [
  {
    id: '1',
    text: '今天探索了一些很有趣的AI工具，发现它们在提升工作效率方面真的很有帮助。特别是在内容创作和数据分析方面，AI已经成为不可或缺的助手。',
    author: 'tech_enthusiast',
    created_at: '2024-01-16T10:30:00Z',
    metrics: { likes: 142, retweets: 28, replies: 15 }
  },
  {
    id: '2', 
    text: 'AI的发展速度令人惊叹，但我们也要思考如何更好地与AI协作，而不是被AI取代。关键在于学会如何利用AI来增强我们的能力。',
    author: 'ai_researcher',
    created_at: '2024-01-16T09:15:00Z',
    metrics: { likes: 89, retweets: 16, replies: 12 }
  },
  {
    id: '3',
    text: '分享一个使用ChatGPT的小技巧：在提问时要尽可能具体和详细，这样能得到更准确和有用的回答。上下文很重要！',
    author: 'productivity_guru',
    created_at: '2024-01-16T08:45:00Z',
    metrics: { likes: 234, retweets: 45, replies: 23 }
  }
]

const mockUserContext = {
  name: 'AI专家',
  role: '技术顾问',
  expertise: ['人工智能', '机器学习', '数据分析']
}

export default function AIToolsPage() {
  const [activeTab, setActiveTab] = useState<'processor' | 'thread' | 'reply' | 'optimizer' | 'history'>('processor')

  const tools = [
    {
      id: 'processor',
      title: 'AI内容处理器',
      description: '智能分析推文内容，生成深度见解',
      icon: Brain,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'thread',
      title: '线程生成器',
      description: 'AI驱动的推特线程创作工具',
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 'reply',
      title: '回复建议',
      description: '智能生成个性化回复内容',
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'optimizer',
      title: '内容优化',
      description: 'AI驱动的内容分析和优化建议',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      id: 'history',
      title: '处理历史',
      description: '管理和复用AI处理记录',
      icon: History,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    }
  ] as const

  const currentTool = tools.find(tool => tool.id === activeTab)

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">AI工具中心</h1>
            </div>
            <p className="text-muted-foreground">
              强大的AI驱动工具集，提升您的内容创作和分析效率
            </p>
          </div>

          {/* Tool Navigation */}
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {tools.map((tool) => {
                const Icon = tool.icon
                const isActive = activeTab === tool.id
                
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTab(tool.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      isActive 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-md ${tool.bgColor}`}>
                        <Icon className={`h-4 w-4 ${tool.color}`} />
                      </div>
                      <span className={`font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                        {tool.title}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {tool.description}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Current Tool Header */}
          {currentTool && (
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${currentTool.bgColor}`}>
                  <currentTool.icon className={`h-6 w-6 ${currentTool.color}`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{currentTool.title}</h2>
                  <p className="text-muted-foreground">{currentTool.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tool Content */}
          <div className="bg-card border border-border rounded-lg">
            <div className="p-6">
              {activeTab === 'processor' && (
                <AIContentProcessor 
                  tweets={mockTweets}
                  onProcessingComplete={(result) => {
                    console.log('Processing completed:', result)
                  }}
                />
              )}
              
              {activeTab === 'thread' && (
                <TwitterThreadGenerator 
                  topic="AI工具的应用实践"
                />
              )}
              
              {activeTab === 'reply' && (
                <AIReplySuggestions 
                  tweet={mockTweets[0]}
                  userContext={mockUserContext}
                />
              )}
              
              {activeTab === 'optimizer' && (
                <ContentOptimizer 
                  content="分享一些关于AI工具使用的心得体会"
                  onOptimizationComplete={(result) => {
                    console.log('Optimization completed:', result)
                  }}
                />
              )}
              
              {activeTab === 'history' && (
                <AIHistoryManager 
                  onRecordSelect={(record) => {
                    console.log('Record selected:', record)
                  }}
                />
              )}
            </div>
          </div>

          {/* Usage Tips */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">💡 使用提示</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <h4 className="font-medium mb-1">内容处理器</h4>
                <p>• 选择多条相关推文进行批量分析</p>
                <p>• 结合分析结果优化您的内容策略</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">线程生成器</h4>
                <p>• 明确主题和目标受众</p>
                <p>• 选择合适的语调和长度</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">回复建议</h4>
                <p>• 根据原推文语调选择回复风格</p>
                <p>• 添加个人见解增加价值</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">内容优化</h4>
                <p>• 关注分析报告中的关键指标</p>
                <p>• 实施建议并测试效果</p>
              </div>
            </div>
          </div>
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  )
}