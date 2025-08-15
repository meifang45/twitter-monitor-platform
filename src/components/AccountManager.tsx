'use client'

import { useState } from 'react'
import { MoreVertical, ExternalLink, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import { MonitoredAccount } from '@/types/twitter'
import { useRemoveAccount } from '@/hooks/useTwitterApi'

interface AccountManagerProps {
  account: MonitoredAccount
  onAccountRemoved: () => void
}

interface ConfirmDeleteModalProps {
  isOpen: boolean
  account: MonitoredAccount
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}

function ConfirmDeleteModal({ isOpen, account, onConfirm, onCancel, isLoading }: ConfirmDeleteModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Remove Account</h3>
              <p className="text-sm text-muted-foreground">This action cannot be undone</p>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-foreground mb-2">
              Are you sure you want to remove <strong>@{account.username}</strong> from monitoring?
            </p>
            <p className="text-xs text-muted-foreground">
              This will stop monitoring their tweets and remove all associated data from your dashboard.
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Removing...' : 'Remove Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AccountManager({ account, onAccountRemoved }: AccountManagerProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const { removeAccount, loading, error } = useRemoveAccount()

  const handleRemoveAccount = async () => {
    try {
      await removeAccount(account.id)
      setShowDeleteModal(false)
      setShowMenu(false)
      onAccountRemoved()
    } catch {
      // Error is handled by the hook
    }
  }

  const getAccountStatus = () => {
    if (!account.is_active) {
      return (
        <div className="flex items-center space-x-1 text-xs text-yellow-600">
          <AlertTriangle className="h-3 w-3" />
          <span>Inactive</span>
        </div>
      )
    }
    
    if (account.last_fetched_at) {
      const lastFetched = new Date(account.last_fetched_at)
      const now = new Date()
      const diffInMs = now.getTime() - lastFetched.getTime()
      const diffInMins = Math.floor(diffInMs / (1000 * 60))
      
      if (diffInMins <= 5) {
        return (
          <div className="flex items-center space-x-1 text-xs text-green-600">
            <CheckCircle className="h-3 w-3" />
            <span>Active</span>
          </div>
        )
      }
    }
    
    return (
      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
        <CheckCircle className="h-3 w-3" />
        <span>Monitoring</span>
      </div>
    )
  }

  const formatLastUpdated = () => {
    if (!account.last_fetched_at) return 'Never'
    
    const lastFetched = new Date(account.last_fetched_at)
    const now = new Date()
    const diffInMs = now.getTime() - lastFetched.getTime()
    const diffInMins = Math.floor(diffInMs / (1000 * 60))
    
    if (diffInMins < 1) return 'Just now'
    if (diffInMins < 60) return `${diffInMins}m ago`
    
    const diffInHours = Math.floor(diffInMins / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-muted rounded-md transition-colors"
          title={`Manage @${account.username}`}
        >
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50">
            <div className="p-3">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-muted-foreground/20 flex-shrink-0">
                  {account.profile_image_url ? (
                    <img 
                      src={account.profile_image_url} 
                      alt={account.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                      {account.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">{account.name}</p>
                  <p className="text-xs text-muted-foreground truncate">@{account.username}</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  {getAccountStatus()}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last updated:</span>
                  <span className="text-foreground">{formatLastUpdated()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Added:</span>
                  <span className="text-foreground">
                    {new Date(account.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {error && (
                <div className="mb-3 p-2 rounded bg-destructive/10 border border-destructive/20">
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}
              
              <div className="border-t border-border pt-2 space-y-1">
                <a
                  href={`https://twitter.com/${account.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 w-full px-2 py-1.5 text-xs text-foreground hover:bg-muted rounded transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>View on Twitter</span>
                </a>
                
                <button
                  onClick={() => {
                    setShowDeleteModal(true)
                    setShowMenu(false)
                  }}
                  className="flex items-center space-x-2 w-full px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Remove account</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Click outside to close */}
        {showMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
        )}
      </div>

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        account={account}
        onConfirm={handleRemoveAccount}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={loading}
      />
    </>
  )
}