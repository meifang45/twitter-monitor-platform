'use client'

import { useState, memo, useCallback } from 'react'
import { Plus, RefreshCw, Clock, ExternalLink } from 'lucide-react'
import { useMonitoredAccounts, useMultipleAccountTweets, useAddAccount, useAutoRefresh } from '@/hooks/useTwitterApi'
import { TweetWithUser } from '@/types/twitter'
import AutoRefreshSettings from './AutoRefreshSettings'
import AccountManager from './AccountManager'
import ErrorState from './ErrorState'
import ProgressiveLoader from './ProgressiveLoader'

// Tweet component for displaying individual tweets
const TweetCard = memo(function TweetCard({ tweet }: { tweet: TweetWithUser }) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMins = Math.floor(diffInMs / (1000 * 60))
      return `${diffInMins}m`
    } else if (diffInHours < 24) {
      return `${diffInHours}h`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d`
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  // Enhanced text formatting for links, hashtags, and mentions
  const formatTweetText = (text: string) => {
    // This is a simplified version - in production you'd want more robust URL/mention/hashtag detection
    let formattedText = text

    // Format URLs
    formattedText = formattedText.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-600 underline">$1</a>'
    )

    // Format hashtags
    formattedText = formattedText.replace(
      /#(\w+)/g,
      '<span class="text-blue-500 font-medium">#$1</span>'
    )

    // Format mentions
    formattedText = formattedText.replace(
      /@(\w+)/g,
      '<span class="text-blue-500 font-medium">@$1</span>'
    )

    return formattedText
  }

  const getTweetTypeIndicator = () => {
    if (tweet.referenced_tweets?.some(ref => ref.type === 'retweeted')) {
      return (
        <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-1">
          <RefreshCw className="h-3 w-3" />
          <span>Retweeted</span>
        </div>
      )
    }
    if (tweet.referenced_tweets?.some(ref => ref.type === 'quoted')) {
      return (
        <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-1">
          <RefreshCw className="h-3 w-3" />
          <span>Quote Tweet</span>
        </div>
      )
    }
    if (tweet.referenced_tweets?.some(ref => ref.type === 'replied_to')) {
      return (
        <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-1">
          <RefreshCw className="h-3 w-3" />
          <span>Reply</span>
        </div>
      )
    }
    return null
  }

  return (
    <div className="p-4 bg-muted/50 rounded-lg border border-border/50 hover:bg-muted/70 transition-all duration-200 hover:shadow-sm animate-fade-in hover-lift">
      {getTweetTypeIndicator()}
      
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted-foreground/20 flex-shrink-0">
          {tweet.author.profile_image_url ? (
            <img 
              src={tweet.author.profile_image_url} 
              alt={tweet.author.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
              {tweet.author.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-semibold text-foreground truncate">
              {tweet.author.name}
            </span>
            {tweet.author.verified && (
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L5.53 12.7L4.12 14.11L9 19L21 7L19.59 5.59L9 16.17Z"/>
                </svg>
              </div>
            )}
            <span className="text-muted-foreground truncate">
              @{tweet.author.username}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground flex-shrink-0" title={new Date(tweet.created_at).toLocaleString()}>
              {formatTimeAgo(tweet.created_at)}
            </span>
          </div>
          
          <div 
            className="mt-2 text-sm text-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatTweetText(tweet.text) }}
          />
          
          {tweet.public_metrics && (
            <div className="mt-3 flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1 hover:text-blue-500 transition-colors cursor-pointer group">
                <div className="p-1 rounded-full group-hover:bg-blue-500/10 transition-colors">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <span className="font-medium">{formatNumber(tweet.public_metrics.reply_count)}</span>
              </div>
              
              <div className="flex items-center space-x-1 hover:text-green-500 transition-colors cursor-pointer group">
                <div className="p-1 rounded-full group-hover:bg-green-500/10 transition-colors">
                  <RefreshCw className="h-4 w-4" />
                </div>
                <span className="font-medium">{formatNumber(tweet.public_metrics.retweet_count)}</span>
              </div>
              
              <div className="flex items-center space-x-1 hover:text-red-500 transition-colors cursor-pointer group">
                <div className="p-1 rounded-full group-hover:bg-red-500/10 transition-colors">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </div>
                <span className="font-medium">{formatNumber(tweet.public_metrics.like_count)}</span>
              </div>
              
              {tweet.public_metrics.quote_count > 0 && (
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
                  </svg>
                  <span className="font-medium">{formatNumber(tweet.public_metrics.quote_count)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

// Loading skeleton component
const TweetSkeleton = memo(function TweetSkeleton() {
  return (
    <div className="p-4 bg-muted/50 rounded-lg border border-border/50 animate-fade-in">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-muted-foreground/20 rounded-full animate-pulse"></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-muted-foreground/30 rounded w-24 animate-pulse"></div>
            <div className="h-4 bg-muted-foreground/20 rounded w-20 animate-pulse"></div>
            <div className="h-4 bg-muted-foreground/20 rounded w-8 animate-pulse"></div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-4 bg-muted-foreground/40 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-muted-foreground/40 rounded w-4/5 animate-pulse"></div>
            <div className="h-4 bg-muted-foreground/40 rounded w-3/5 animate-pulse"></div>
          </div>
          <div className="mt-4 flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <div className="h-8 w-8 bg-muted-foreground/20 rounded-full animate-pulse"></div>
              <div className="h-3 bg-muted-foreground/20 rounded w-6 animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-8 w-8 bg-muted-foreground/20 rounded-full animate-pulse"></div>
              <div className="h-3 bg-muted-foreground/20 rounded w-6 animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-8 w-8 bg-muted-foreground/20 rounded-full animate-pulse"></div>
              <div className="h-3 bg-muted-foreground/20 rounded w-6 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

// Add Account Modal Component
function AddAccountModal({ isOpen, onClose, onAdd }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onAdd: (username: string) => Promise<void>;
}) {
  const [username, setUsername] = useState('')
  const { addAccount, loading, error } = useAddAccount()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    try {
      await addAccount(username.trim())
      await onAdd(username.trim())
      setUsername('')
      onClose()
    } catch {
      // Error is handled by the hook
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md animate-scale-in">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Add Twitter Account
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (without @)"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={loading}
              />
            </div>
            
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-smooth focus-ring-improved"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth focus-ring-improved hover-lift"
              >
                {loading ? 'Adding...' : 'Add Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { accounts, loading: accountsLoading, error: accountsError, refetch: refetchAccounts } = useMonitoredAccounts()
  const { tweetsData, loading: tweetsLoading, errors: tweetsErrors, refetch: refetchTweets } = useMultipleAccountTweets(accounts)

  // Auto-refresh functionality
  const autoRefresh = useAutoRefresh(
    async () => {
      await refetchTweets()
    },
    {
      interval: 30000, // Default 30 seconds
      enabled: true,
      onError: (error) => {
        console.error('Auto-refresh failed:', error)
      }
    }
  )

  const handleAddAccount = useCallback(async () => {
    await refetchAccounts()
    await refetchTweets()
  }, [refetchAccounts, refetchTweets])

  const handleRemoveAccount = useCallback(async () => {
    await refetchAccounts()
    await refetchTweets()
  }, [refetchAccounts, refetchTweets])

  const handleRefresh = useCallback(async () => {
    await refetchTweets()
  }, [refetchTweets])

  if (accountsLoading) {
    return (
      <main className="flex-1 overflow-hidden">
        <div className="h-full p-2 sm:p-4">
          <div className="flex items-center justify-center h-full">
            <ProgressiveLoader 
              message="Loading your dashboard..."
              className="text-center"
            />
          </div>
        </div>
      </main>
    )
  }

  if (accountsError) {
    return (
      <main className="flex-1 overflow-hidden">
        <div className="h-full p-2 sm:p-4">
          <div className="flex items-center justify-center h-full">
            <ErrorState
              error={accountsError}
              onRetry={refetchAccounts}
              type={accountsError.includes('network') || accountsError.includes('fetch') ? 'network' : 'api'}
              showRetry={true}
            />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-hidden">
      <div className="h-full p-2 sm:p-4">
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">
              Twitter Dashboard
            </h1>
            {(tweetsLoading || autoRefresh.isRefreshing) && (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {autoRefresh.isRefreshing ? 'Auto-refreshing...' : 'Refreshing...'}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <AutoRefreshSettings
              isEnabled={autoRefresh.isEnabled}
              interval={autoRefresh.interval}
              isRefreshing={autoRefresh.isRefreshing}
              onToggle={autoRefresh.setIsEnabled}
              onIntervalChange={autoRefresh.setInterval}
              onManualRefresh={autoRefresh.manualRefresh}
            />
            <button
              onClick={handleRefresh}
              disabled={tweetsLoading || autoRefresh.isRefreshing}
              className="inline-flex items-center space-x-2 px-3 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-smooth disabled:opacity-50 touch-manipulation focus-ring-improved"
            >
              <RefreshCw className={`h-4 w-4 ${(tweetsLoading || autoRefresh.isRefreshing) ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-smooth touch-manipulation focus-ring-improved hover-lift"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>

        {accounts.length === 0 ? (
          /* Empty State */
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted-foreground/20 rounded-full flex items-center justify-center">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Accounts Added</h3>
              <p className="text-muted-foreground mb-4">Start monitoring Twitter accounts by adding your first account.</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Add Your First Account
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile: Stack columns vertically with improved touch interactions */}
            <div className="block sm:hidden space-y-4 stagger-children">
              {accounts.slice(0, 3).map((account, index) => {
                const tweets = tweetsData.get(account.username) || []
                const error = tweetsErrors.get(account.username)
                
                return (
                  <div 
                    key={account.id} 
                    className="bg-card border border-border rounded-lg shadow-sm touch-manipulation animate-slide-in-right hover-lift transition-smooth"
                    style={{ '--stagger-delay': index } as React.CSSProperties}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border">
                      <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-semibold text-foreground truncate">
                          {account.name}
                        </h2>
                        <p className="text-sm text-muted-foreground truncate">
                          @{account.username}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {account.last_fetched_at && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span className="hidden xs:inline">Updated</span>
                          </div>
                        )}
                        <AccountManager 
                          account={account} 
                          onAccountRemoved={handleRemoveAccount}
                        />
                      </div>
                    </div>
                    
                    {/* Column Content */}
                    <div className="h-80 overflow-y-auto overscroll-contain p-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                      <div className="space-y-4">
                        {error ? (
                          <ErrorState
                            error={error}
                            onRetry={() => refetchTweets()}
                            type={error.includes('network') || error.includes('fetch') ? 'network' : 'api'}
                            showRetry={true}
                          />
                        ) : tweets.length > 0 ? (
                          tweets.map((tweet) => (
                            <TweetCard key={tweet.id} tweet={tweet} />
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground">
                            <p className="text-sm">No recent tweets</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop/Tablet: Horizontal scrolling columns with improved responsiveness */}
            <div className="hidden sm:flex h-full gap-3 md:gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain stagger-children" style={{ WebkitOverflowScrolling: 'touch' }}>
              {accounts.map((account, index) => {
                const tweets = tweetsData.get(account.username) || []
                const error = tweetsErrors.get(account.username)
                
                return (
                  <div 
                    key={account.id} 
                    className="flex-none w-80 md:w-80 lg:w-96 xl:w-[400px] min-w-0 bg-card border border-border rounded-lg shadow-sm touch-manipulation animate-slide-in-right hover-lift transition-smooth"
                    style={{ '--stagger-delay': index } as React.CSSProperties}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border">
                      <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-semibold text-foreground truncate">
                          {account.name}
                        </h2>
                        <p className="text-sm text-muted-foreground truncate">
                          @{account.username}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <a
                          href={`https://twitter.com/${account.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-muted rounded-md transition-colors touch-manipulation"
                          title={`View @${account.username} on Twitter`}
                        >
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                        <AccountManager 
                          account={account} 
                          onAccountRemoved={handleRemoveAccount}
                        />
                      </div>
                    </div>
                    
                    {/* Column Content */}
                    <div className="h-[calc(100vh-180px)] sm:h-[calc(100vh-160px)] overflow-y-auto overscroll-contain p-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                      <div className="space-y-4">
                        {error ? (
                          <ErrorState
                            error={error}
                            onRetry={() => refetchTweets()}
                            type={error.includes('network') || error.includes('fetch') ? 'network' : 'api'}
                            showRetry={true}
                          />
                        ) : tweets.length > 0 ? (
                          tweets.map((tweet) => (
                            <TweetCard key={tweet.id} tweet={tweet} />
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground">
                            <p className="text-sm">No recent tweets</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {/* Add Column Placeholder */}
              <div 
                className="hidden lg:flex flex-none w-80 xl:w-[400px] bg-card/50 border border-dashed border-border rounded-lg items-center justify-center min-h-[400px] cursor-pointer hover:bg-card/70 transition-colors touch-manipulation"
                onClick={() => setIsAddModalOpen(true)}
              >
                <div className="text-center text-muted-foreground">
                  <div className="w-12 h-12 mx-auto mb-4 bg-muted-foreground/20 rounded-full flex items-center justify-center">
                    <Plus className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium">Add Account</p>
                  <p className="text-xs mt-1">Monitor more accounts</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Account Modal */}
      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddAccount}
      />
    </main>
  )
}