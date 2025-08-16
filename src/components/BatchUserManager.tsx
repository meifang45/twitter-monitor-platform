'use client'

import { useState, useCallback } from 'react'
import { Plus, Trash2, Users, Upload, Download, Search, Filter } from 'lucide-react'

interface User {
  id: string
  username: string
  name: string
  verified: boolean
  followerCount: number
  status: 'active' | 'paused' | 'error'
  addedAt: string
}

interface BatchUserManagerProps {
  users: User[]
  onUsersChange: (users: User[]) => void
}

export default function BatchUserManager({ users, onUsersChange }: BatchUserManagerProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [bulkUsername, setBulkUsername] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'error'>('all')

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleBulkAdd = useCallback(() => {
    const usernames = bulkUsername.split(/[,\n\r]/)
      .map(u => u.trim().replace('@', ''))
      .filter(u => u.length > 0)
    
    const newUsers: User[] = usernames.map((username, index) => ({
      id: `bulk_${Date.now()}_${index}`,
      username,
      name: username,
      verified: false,
      followerCount: 0,
      status: 'active' as const,
      addedAt: new Date().toISOString()
    }))

    onUsersChange([...users, ...newUsers])
    setBulkUsername('')
  }, [bulkUsername, users, onUsersChange])

  const handleBulkDelete = useCallback(() => {
    const newUsers = users.filter(user => !selectedUsers.includes(user.id))
    onUsersChange(newUsers)
    setSelectedUsers([])
  }, [users, selectedUsers, onUsersChange])

  const handleBulkStatusChange = useCallback((status: 'active' | 'paused') => {
    const newUsers = users.map(user => 
      selectedUsers.includes(user.id) ? { ...user, status } : user
    )
    onUsersChange(newUsers)
    setSelectedUsers([])
  }, [users, selectedUsers, onUsersChange])

  const handleExport = useCallback(() => {
    const exportData = users.map(user => ({
      username: user.username,
      name: user.name,
      verified: user.verified,
      followerCount: user.followerCount,
      status: user.status,
      addedAt: user.addedAt
    }))
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `twitter-users-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [users])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'paused': return 'text-orange-600 bg-orange-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Bulk Add Section */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>批量添加用户</span>
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              用户名 (每行一个或用逗号分隔)
            </label>
            <textarea
              value={bulkUsername}
              onChange={(e) => setBulkUsername(e.target.value)}
              placeholder="elonmusk, sundarpichai, satyanadella
或者每行一个用户名..."
              className="w-full p-3 border border-border rounded-md bg-background text-foreground resize-none"
              rows={4}
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleBulkAdd}
              disabled={!bulkUsername.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-2 inline" />
              批量添加
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 border border-border rounded-md hover:bg-muted"
            >
              <Download className="h-4 w-4 mr-2 inline" />
              导出列表
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索用户名或名称..."
            className="w-full pl-10 pr-3 py-2 border border-border rounded-md bg-background text-foreground"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'paused' | 'error')}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="all">全部状态</option>
            <option value="active">活跃</option>
            <option value="paused">暂停</option>
            <option value="error">错误</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              已选择 {selectedUsers.length} 个用户
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

      {/* User List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>监控用户列表 ({filteredUsers.length})</span>
            </h3>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded"
              />
              <span>全选</span>
            </label>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>没有找到匹配的用户</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                      className="rounded"
                    />
                    
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-foreground">@{user.username}</span>
                        {user.verified && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L5.53 12.7L4.12 14.11L9 19L21 7L19.59 5.59L9 16.17Z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.followerCount.toLocaleString()} 关注者
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(user.status)}`}>
                        {user.status === 'active' ? '活跃' : user.status === 'paused' ? '暂停' : '错误'}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(user.addedAt).toLocaleDateString()}
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