'use client'

import EnterpriseLayout from '@/components/EnterpriseLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import BatchUserManager from '@/components/BatchUserManager'
import { useState } from 'react'

// Define types to match the component interface
interface User {
  id: string
  username: string
  name: string
  verified: boolean
  followerCount: number
  status: 'active' | 'paused' | 'error'
  addedAt: string
}

// Mock data for demonstration
const initialUsers: User[] = [
  {
    id: '1',
    username: 'elonmusk',
    name: 'Elon Musk',
    verified: true,
    followerCount: 150000000,
    status: 'active',
    addedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2', 
    username: 'sundarpichai',
    name: 'Sundar Pichai',
    verified: true,
    followerCount: 5200000,
    status: 'active',
    addedAt: '2024-01-16T14:20:00Z'
  },
  {
    id: '3',
    username: 'satyanadella', 
    name: 'Satya Nadella',
    verified: true,
    followerCount: 2800000,
    status: 'paused',
    addedAt: '2024-01-17T09:15:00Z'
  }
]

export default function UserMonitoringPage() {
  const [users, setUsers] = useState<User[]>(initialUsers)

  return (
    <ProtectedRoute>
      <EnterpriseLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">用户监控管理</h1>
            <p className="text-muted-foreground">批量管理和监控Twitter用户账号</p>
          </div>
          
          <BatchUserManager 
            users={users}
            onUsersChange={setUsers}
          />
        </div>
      </EnterpriseLayout>
    </ProtectedRoute>
  )
}