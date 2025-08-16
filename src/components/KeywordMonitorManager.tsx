'use client'

import { useState, useCallback } from 'react'
import { Search, Hash, Plus, Trash2, Filter, Download, TrendingUp } from 'lucide-react'

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

interface KeywordMonitorManagerProps {
  keywords: Keyword[]
  groups: KeywordGroup[]
  onKeywordsChange: (keywords: Keyword[]) => void
  onGroupsChange?: (groups: KeywordGroup[]) => void
}

export default function KeywordMonitorManager({ 
  keywords, 
  groups, 
  onKeywordsChange
}: KeywordMonitorManagerProps) {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [newKeyword, setNewKeyword] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [keywordType, setKeywordType] = useState<'hashtag' | 'mention' | 'phrase'>('hashtag')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all')
  const [groupFilter, setGroupFilter] = useState<string>('all')

  const filteredKeywords = keywords.filter(keyword => {
    const matchesSearch = keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || keyword.status === statusFilter
    const matchesGroup = groupFilter === 'all' || keyword.group === groupFilter
    return matchesSearch && matchesStatus && matchesGroup
  })

  const handleAddKeyword = useCallback(() => {
    if (!newKeyword.trim() || !selectedGroup) return

    const keyword: Keyword = {
      id: `keyword_${Date.now()}`,
      keyword: newKeyword.trim(),
      type: keywordType,
      group: selectedGroup,
      status: 'active',
      mentionCount: 0,
      sentiment: 'neutral',
      trending: false,
      addedAt: new Date().toISOString()
    }

    onKeywordsChange([...keywords, keyword])
    setNewKeyword('')
  }, [newKeyword, keywordType, selectedGroup, keywords, onKeywordsChange])

  const handleBulkDelete = useCallback(() => {
    const newKeywords = keywords.filter(keyword => !selectedKeywords.includes(keyword.id))
    onKeywordsChange(newKeywords)
    setSelectedKeywords([])
  }, [keywords, selectedKeywords, onKeywordsChange])

  const handleBulkStatusChange = useCallback((status: 'active' | 'paused') => {
    const newKeywords = keywords.map(keyword => 
      selectedKeywords.includes(keyword.id) ? { ...keyword, status } : keyword
    )
    onKeywordsChange(newKeywords)
    setSelectedKeywords([])
  }, [keywords, selectedKeywords, onKeywordsChange])

  const handleSelectKeyword = (keywordId: string, checked: boolean) => {
    if (checked) {
      setSelectedKeywords([...selectedKeywords, keywordId])
    } else {
      setSelectedKeywords(selectedKeywords.filter(id => id !== keywordId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedKeywords(filteredKeywords.map(keyword => keyword.id))
    } else {
      setSelectedKeywords([])
    }
  }

  const handleExport = useCallback(() => {
    const exportData = keywords.map(keyword => ({
      keyword: keyword.keyword,
      type: keyword.type,
      group: keyword.group,
      status: keyword.status,
      mentionCount: keyword.mentionCount,
      sentiment: keyword.sentiment,
      addedAt: keyword.addedAt
    }))
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `keywords-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [keywords])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hashtag': return <Hash className="h-4 w-4 text-blue-500" />
      case 'mention': return <Search className="h-4 w-4 text-green-500" />
      case 'phrase': return <Search className="h-4 w-4 text-purple-500" />
      default: return <Search className="h-4 w-4" />
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'paused': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getGroupColor = (groupName: string) => {
    const group = groups.find(g => g.name === groupName)
    return group?.color || 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Add New Keyword Section */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>添加关键词监控</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">关键词</label>
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="输入关键词..."
              className="w-full p-2 border border-border rounded-md bg-background text-foreground"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">类型</label>
            <select
              value={keywordType}
              onChange={(e) => setKeywordType(e.target.value as 'hashtag' | 'mention' | 'phrase')}
              className="w-full p-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="hashtag">标签 (#)</option>
              <option value="mention">提及 (@)</option>
              <option value="phrase">短语</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">分组</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="">选择分组</option>
              {groups.map((group) => (
                <option key={group.id} value={group.name}>{group.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleAddKeyword}
              disabled={!newKeyword.trim() || !selectedGroup}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-2 inline" />
              添加
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索关键词..."
            className="w-full pl-10 pr-3 py-2 border border-border rounded-md bg-background text-foreground"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'paused')}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="all">全部状态</option>
            <option value="active">活跃</option>
            <option value="paused">暂停</option>
          </select>
          
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="all">全部分组</option>
            {groups.map((group) => (
              <option key={group.id} value={group.name}>{group.name}</option>
            ))}
          </select>
          
          <button
            onClick={handleExport}
            className="px-3 py-2 border border-border rounded-md hover:bg-muted"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedKeywords.length > 0 && (
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              已选择 {selectedKeywords.length} 个关键词
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkStatusChange('active')}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                启用
              </button>
              <button
                onClick={() => handleBulkStatusChange('paused')}
                className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                暂停
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
              >
                <Trash2 className="h-3 w-3 mr-1 inline" />
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keywords List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>关键词列表 ({filteredKeywords.length})</span>
            </h3>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={selectedKeywords.length === filteredKeywords.length && filteredKeywords.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded"
              />
              <span>全选</span>
            </label>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredKeywords.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>没有找到匹配的关键词</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredKeywords.map((keyword) => (
                <div key={keyword.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedKeywords.includes(keyword.id)}
                      onChange={(e) => handleSelectKeyword(keyword.id, e.target.checked)}
                      className="rounded"
                    />
                    
                    {getTypeIcon(keyword.type)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-foreground">{keyword.keyword}</span>
                        {keyword.trending && (
                          <TrendingUp className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className={`w-3 h-3 rounded-full ${getGroupColor(keyword.group)}`}></div>
                        <span className="text-sm text-muted-foreground">{keyword.group}</span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-medium">{keyword.mentionCount}</div>
                      <div className="text-xs text-muted-foreground">提及次数</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex space-x-1 mb-2">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getSentimentColor(keyword.sentiment)}`}>
                          {keyword.sentiment === 'positive' ? '正面' : keyword.sentiment === 'negative' ? '负面' : '中性'}
                        </span>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(keyword.status)}`}>
                          {keyword.status === 'active' ? '活跃' : '暂停'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(keyword.addedAt).toLocaleDateString()}
                      </p>
                    </div>
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