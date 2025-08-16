'use client'

import { useState } from 'react'
import { 
  MessageSquare, 
  Sparkles, 
  Copy, 
  RotateCcw, 
  Plus, 
  Trash2,
  Loader2,
  Check
} from 'lucide-react'

interface ThreadPost {
  id: string
  content: string
  order: number
}

interface ThreadGeneratorProps {
  topic?: string
  initialContent?: string
}

export default function TwitterThreadGenerator({ topic }: ThreadGeneratorProps) {
  const [threadTopic, setThreadTopic] = useState(topic || '')
  const [targetAudience, setTargetAudience] = useState('')
  const [threadStyle, setThreadStyle] = useState<'educational' | 'story' | 'tips' | 'analysis'>('educational')
  const [threadLength, setThreadLength] = useState<3 | 5 | 7 | 10>(5)
  const [posts, setPosts] = useState<ThreadPost[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState('')

  // 模拟AI生成推特线程
  const generateThreadContent = async (): Promise<ThreadPost[]> => {
    const steps = [
      "分析主题内容...",
      "构建线程结构...", 
      "生成吸引人的开头...",
      "创建核心内容...",
      "优化表达方式...",
      "添加行动号召..."
    ]

    for (let i = 0; i < steps.length; i++) {
      setGenerationStep(steps[i])
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // 根据主题和风格生成模拟内容
    const templates = {
      educational: [
        `🧵 关于${threadTopic}，你需要知道的${threadLength}个要点 👇`,
        `1/ 首先，让我们了解${threadTopic}的基本概念。这是一个正在快速发展的领域，影响着我们的日常生活。`,
        `2/ ${threadTopic}的核心原理是什么？简单来说，它通过创新的方法解决了传统的问题。`,
        `3/ 实际应用中，${threadTopic}已经在多个行业得到验证，包括科技、金融和教育等领域。`,
        `4/ 对于${targetAudience || '普通用户'}来说，理解${threadTopic}可以帮助我们更好地适应未来的变化。`,
        `5/ 最后，${threadTopic}的发展前景非常广阔，值得我们持续关注和学习。`
      ],
      story: [
        `🧵 一个关于${threadTopic}的真实故事，改变了我的看法 👇`,
        `1/ 几个月前，我对${threadTopic}还一无所知。直到遇到了一个意外的情况...`,
        `2/ 当时我面临着一个挑战，传统的方法都行不通。朋友推荐我尝试${threadTopic}的方法。`,
        `3/ 起初我很怀疑，但经过深入了解后，我发现${threadTopic}确实有其独特之处。`,
        `4/ 实施过程中遇到了一些困难，但最终结果超出了我的预期。`,
        `5/ 现在我成为${threadTopic}的坚定支持者，并且想与${targetAudience || '大家'}分享这个经验。`
      ],
      tips: [
        `🧵 ${threadLength}个关于${threadTopic}的实用技巧，立即可用 💡`,
        `1/ 技巧一：从基础开始。掌握${threadTopic}的基本概念是成功的关键。建议先学习核心原理。`,
        `2/ 技巧二：实践是最好的老师。不要只停留在理论层面，动手尝试${threadTopic}的应用。`,
        `3/ 技巧三：保持学习的心态。${threadTopic}领域发展很快，需要持续更新知识。`,
        `4/ 技巧四：加入相关社区。与其他${threadTopic}爱好者交流可以快速提升你的水平。`,
        `5/ 技巧五：记录你的进步。定期回顾和总结有助于更好地掌握${threadTopic}。`
      ],
      analysis: [
        `🧵 深度分析：${threadTopic}的现状与未来趋势 📊`,
        `1/ 现状分析：目前${threadTopic}市场规模正在快速增长，预计未来几年将保持强劲势头。`,
        `2/ 主要驱动因素包括技术进步、用户需求增长以及政策支持等多个方面。`,
        `3/ 挑战与机遇：虽然${threadTopic}面临一些挑战，但机遇远大于风险。`,
        `4/ 对${targetAudience || '从业者'}的影响：这个趋势将如何改变我们的工作和生活方式？`,
        `5/ 未来展望：基于当前趋势，我们可以预测${threadTopic}在未来5年的发展方向。`
      ]
    }

    const selectedTemplate = templates[threadStyle]
    return selectedTemplate.slice(0, threadLength).map((content, index) => ({
      id: `post-${index + 1}`,
      content,
      order: index + 1
    }))
  }

  const handleGenerateThread = async () => {
    if (!threadTopic.trim()) {
      alert('请输入主题内容')
      return
    }

    setIsGenerating(true)
    try {
      const generatedPosts = await generateThreadContent()
      setPosts(generatedPosts)
    } catch (error) {
      console.error('生成失败:', error)
    } finally {
      setIsGenerating(false)
      setGenerationStep('')
    }
  }

  const handleAddPost = () => {
    const newPost: ThreadPost = {
      id: `post-${posts.length + 1}`,
      content: '',
      order: posts.length + 1
    }
    setPosts([...posts, newPost])
  }

  const handleDeletePost = (postId: string) => {
    const updatedPosts = posts
      .filter(post => post.id !== postId)
      .map((post, index) => ({ ...post, order: index + 1 }))
    setPosts(updatedPosts)
  }

  const handlePostContentChange = (postId: string, content: string) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, content } : post
    ))
  }

  const copyThread = () => {
    const threadText = posts.map(post => post.content).join('\n\n')
    navigator.clipboard.writeText(threadText)
  }

  const copyPost = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const clearThread = () => {
    setPosts([])
  }

  const getCharacterCount = (text: string) => {
    return text.length
  }

  const getCharacterCountColor = (count: number) => {
    if (count > 280) return 'text-red-600'
    if (count > 240) return 'text-orange-600'
    return 'text-muted-foreground'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <MessageSquare className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-xl font-bold text-foreground">Twitter线程生成器</h2>
          <p className="text-muted-foreground">AI驱动的智能推特线程创作工具</p>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4">线程配置</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">主题内容</label>
            <textarea
              value={threadTopic}
              onChange={(e) => setThreadTopic(e.target.value)}
              placeholder="请输入您想要创作的主题内容..."
              className="w-full p-3 border border-border rounded-md bg-background text-foreground resize-none"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">目标受众</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="例如：开发者、创业者、学生..."
              className="w-full p-3 border border-border rounded-md bg-background text-foreground"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-2">线程风格</label>
            <select
              value={threadStyle}
              onChange={(e) => setThreadStyle(e.target.value as 'educational' | 'story' | 'tips' | 'analysis')}
              className="w-full p-3 border border-border rounded-md bg-background text-foreground"
            >
              <option value="educational">📚 教育科普</option>
              <option value="story">📖 故事叙述</option>
              <option value="tips">💡 实用技巧</option>
              <option value="analysis">📊 深度分析</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">线程长度</label>
            <select
              value={threadLength}
              onChange={(e) => setThreadLength(Number(e.target.value) as 3 | 5 | 7 | 10)}
              className="w-full p-3 border border-border rounded-md bg-background text-foreground"
            >
              <option value={3}>3条推文</option>
              <option value={5}>5条推文</option>
              <option value={7}>7条推文</option>
              <option value={10}>10条推文</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-4 mt-6">
          <button
            onClick={handleGenerateThread}
            disabled={isGenerating || !threadTopic.trim()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>生成中...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>AI生成线程</span>
              </>
            )}
          </button>
          
          {posts.length > 0 && (
            <>
              <button
                onClick={copyThread}
                className="px-4 py-2 border border-border rounded-md hover:bg-muted flex items-center space-x-2"
              >
                <Copy className="h-4 w-4" />
                <span>复制全部</span>
              </button>
              
              <button
                onClick={clearThread}
                className="px-4 py-2 text-red-600 border border-red-200 rounded-md hover:bg-red-50 flex items-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>清空</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Generation Status */}
      {isGenerating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            <span className="text-blue-800 font-medium">{generationStep}</span>
          </div>
          <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      )}

      {/* Generated Thread */}
      {posts.length > 0 && (
        <div className="bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>生成的推特线程</span>
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  共 {posts.length} 条推文
                </span>
                <button
                  onClick={handleAddPost}
                  className="p-1 hover:bg-muted rounded"
                  title="添加推文"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      {post.order}
                    </span>
                    <span className="text-sm font-medium">
                      推文 {post.order}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs ${getCharacterCountColor(getCharacterCount(post.content))}`}>
                      {getCharacterCount(post.content)}/280
                    </span>
                    <button
                      onClick={() => copyPost(post.content)}
                      className="p-1 hover:bg-muted rounded"
                      title="复制这条推文"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1 hover:bg-muted rounded text-red-600"
                      title="删除这条推文"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                
                <textarea
                  value={post.content}
                  onChange={(e) => handlePostContentChange(post.id, e.target.value)}
                  className="w-full p-3 border border-border rounded-md bg-background text-foreground resize-none"
                  rows={3}
                  placeholder="编辑推文内容..."
                />
                
                {getCharacterCount(post.content) > 280 && (
                  <div className="mt-2 flex items-center space-x-2 text-red-600 text-xs">
                    <Check className="h-3 w-3" />
                    <span>超出推特字符限制，请精简内容</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">💡 创作提示</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 第一条推文要有吸引力，包含钩子吸引读者继续阅读</li>
          <li>• 每条推文保持在280字符以内，确保完整显示</li>
          <li>• 使用数字、emoji和分段让内容更容易阅读</li>
          <li>• 最后一条推文可以包含行动号召，如点赞、转发或关注</li>
          <li>• 添加相关标签提高可发现性</li>
        </ul>
      </div>
    </div>
  )
}