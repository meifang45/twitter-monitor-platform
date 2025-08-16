'use client'

import { useState, useMemo } from 'react'
import { 
  History, 
  Brain, 
  MessageSquare, 
  Sparkles, 
  Target,
  Calendar,
  Search,
  Download,
  Trash2,
  Star,
  Copy,
  Eye
} from 'lucide-react'

interface AIProcessingRecord {
  id: string
  timestamp: string
  type: 'content_analysis' | 'thread_generation' | 'reply_suggestion' | 'content_optimization'
  input: string
  output: Record<string, unknown>
  status: 'completed' | 'failed' | 'processing'
  rating?: number
  notes?: string
  tags: string[]
}

interface AIHistoryManagerProps {
  records?: AIProcessingRecord[]
  onRecordSelect?: (record: AIProcessingRecord) => void
}

export default function AIHistoryManager({ records = [], onRecordSelect }: AIHistoryManagerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'timestamp' | 'rating' | 'type'>('timestamp')
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  // 模拟历史记录数据
  const mockRecords: AIProcessingRecord[] = [
    {
      id: '1',
      timestamp: '2024-01-16T10:30:00Z',
      type: 'content_analysis',
      input: '今天分享一个关于AI工具的使用心得...',
      output: {
        summary: 'AI工具使用心得分享，包含实践经验和建议',
        sentiment: 'positive',
        topics: ['AI工具', '使用心得', '实践经验'],
        score: 85
      },
      status: 'completed',
      rating: 4,
      tags: ['AI工具', '分析']
    },
    {
      id: '2',
      timestamp: '2024-01-16T09:15:00Z',
      type: 'thread_generation',
      input: '关于提升工作效率的方法',
      output: {
        posts: [
          '🧵 提升工作效率的5个实用方法 👇',
          '1/ 时间块管理：将工作分成专注的时间块...',
          '2/ 优先级排序：使用重要紧急四象限...'
        ]
      },
      status: 'completed',
      rating: 5,
      tags: ['效率', '线程生成']
    },
    {
      id: '3',
      timestamp: '2024-01-15T16:45:00Z',
      type: 'reply_suggestion',
      input: '@user 的推文：AI的发展太快了，有点担心...',
      output: {
        suggestions: [
          '我理解您的担忧，技术发展确实很快。重要的是我们要学会适应和善用这些工具。',
          '这种担心很正常，关键是保持学习的心态，让AI成为我们的助手而不是替代品。'
        ]
      },
      status: 'completed',
      rating: 3,
      tags: ['回复建议', 'AI话题']
    },
    {
      id: '4',
      timestamp: '2024-01-15T14:20:00Z',
      type: 'content_optimization',
      input: '分享一下今天学到的新技能',
      output: {
        optimized: '💡 今天学会了一个超实用的技能！分享给大家，希望对你们也有帮助 👇\n\n你们还有什么好用的技能想分享吗？\n\n#技能分享 #学习笔记',
        improvements: ['添加吸引人的开头', '增加互动元素', '优化标签']
      },
      status: 'completed',
      rating: 4,
      tags: ['内容优化', '技能分享']
    },
    {
      id: '5',
      timestamp: '2024-01-15T11:30:00Z',
      type: 'content_analysis',
      input: '讨论最新的科技趋势和发展方向',
      output: {
        summary: '科技趋势分析，涵盖AI、区块链、元宇宙等领域',
        sentiment: 'neutral',
        topics: ['科技趋势', 'AI', '区块链', '元宇宙'],
        score: 78
      },
      status: 'completed',
      tags: ['科技', '趋势分析']
    }
  ]

  const filteredRecords = useMemo(() => {
    const allRecordsData = [...records, ...mockRecords]
    const filtered = allRecordsData.filter(record => {
      const matchesSearch = searchTerm === '' || 
        record.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesType = selectedType === 'all' || record.type === selectedType
      
      return matchesSearch && matchesType
    })

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'timestamp':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'type':
          return a.type.localeCompare(b.type)
        default:
          return 0
      }
    })

    return filtered
  }, [records, searchTerm, selectedType, sortBy])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content_analysis': return <Brain className="h-4 w-4 text-blue-500" />
      case 'thread_generation': return <MessageSquare className="h-4 w-4 text-green-500" />
      case 'reply_suggestion': return <Sparkles className="h-4 w-4 text-purple-500" />
      case 'content_optimization': return <Target className="h-4 w-4 text-orange-500" />
      default: return <History className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'content_analysis': return '内容分析'
      case 'thread_generation': return '线程生成'
      case 'reply_suggestion': return '回复建议'
      case 'content_optimization': return '内容优化'
      default: return '未知类型'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'processing': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleSelectRecord = (recordId: string, checked: boolean) => {
    if (checked) {
      setSelectedRecords([...selectedRecords, recordId])
    } else {
      setSelectedRecords(selectedRecords.filter(id => id !== recordId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecords(filteredRecords.map(record => record.id))
    } else {
      setSelectedRecords([])
    }
  }

  const handleDeleteSelected = () => {
    if (selectedRecords.length === 0) return
    if (confirm(`确定要删除 ${selectedRecords.length} 条记录吗？`)) {
      // 这里应该调用删除API
      setSelectedRecords([])
    }
  }

  const handleExportHistory = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      total_records: filteredRecords.length,
      filters: { search: searchTerm, type: selectedType, sort: sortBy },
      records: filteredRecords
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-history-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const renderStars = (rating?: number) => {
    if (!rating) return null
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <History className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-foreground">AI处理历史</h2>
            <p className="text-muted-foreground">管理和复用您的AI处理记录</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {filteredRecords.length} 条记录
          </span>
          <button
            onClick={handleExportHistory}
            className="px-4 py-2 border border-border rounded-md hover:bg-muted text-sm"
          >
            <Download className="h-4 w-4 mr-1 inline" />
            导出
          </button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索内容或标签..."
              className="w-full pl-10 pr-3 py-2 border border-border rounded-md bg-background text-foreground"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="all">全部类型</option>
            <option value="content_analysis">内容分析</option>
            <option value="thread_generation">线程生成</option>
            <option value="reply_suggestion">回复建议</option>
            <option value="content_optimization">内容优化</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'timestamp' | 'rating' | 'type')}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="timestamp">按时间排序</option>
            <option value="rating">按评分排序</option>
            <option value="type">按类型排序</option>
          </select>

          {/* View Mode */}
          <div className="flex border border-border rounded-md">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              列表
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              网格
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedRecords.length > 0 && (
          <div className="mt-4 flex items-center justify-between bg-muted/50 p-3 rounded-lg">
            <span className="text-sm font-medium">
              已选择 {selectedRecords.length} 条记录
            </span>
            <button
              onClick={handleDeleteSelected}
              className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
            >
              <Trash2 className="h-3 w-3 mr-1 inline" />
              删除选中
            </button>
          </div>
        )}
      </div>

      {/* Records List */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">处理记录</h3>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={selectedRecords.length === filteredRecords.length && filteredRecords.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded"
              />
              <span>全选</span>
            </label>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无处理记录</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="divide-y divide-border">
              {filteredRecords.map((record) => (
                <div key={record.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedRecords.includes(record.id)}
                      onChange={(e) => handleSelectRecord(record.id, e.target.checked)}
                      className="rounded mt-1"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        {getTypeIcon(record.type)}
                        <span className="font-medium text-foreground">
                          {getTypeLabel(record.type)}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(record.status)}`}>
                          {record.status === 'completed' ? '已完成' : 
                           record.status === 'failed' ? '失败' : '处理中'}
                        </span>
                        {renderStars(record.rating)}
                      </div>

                      <p className="text-sm text-foreground mb-2 line-clamp-2">
                        {record.input}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(record.timestamp).toLocaleString()}</span>
                          </span>
                          {record.tags.length > 0 && (
                            <div className="flex space-x-1">
                              {record.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => copyToClipboard(record.input)}
                            className="p-1 hover:bg-muted rounded"
                            title="复制输入内容"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => onRecordSelect?.(record)}
                            className="p-1 hover:bg-muted rounded"
                            title="查看详情"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecords.map((record) => (
                <div key={record.id} className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(record.type)}
                      <span className="text-sm font-medium">{getTypeLabel(record.type)}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedRecords.includes(record.id)}
                      onChange={(e) => handleSelectRecord(record.id, e.target.checked)}
                      className="rounded"
                    />
                  </div>

                  <p className="text-sm text-foreground mb-3 line-clamp-3">
                    {record.input}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(record.status)}`}>
                      {record.status === 'completed' ? '已完成' : 
                       record.status === 'failed' ? '失败' : '处理中'}
                    </span>
                    {renderStars(record.rating)}
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">
                    {new Date(record.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}