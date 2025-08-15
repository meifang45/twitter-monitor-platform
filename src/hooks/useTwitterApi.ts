'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { TweetWithUser, MonitoredAccount, TwitterUser } from '@/types/twitter'

// Retry utility function
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      
      if (attempt === maxAttempts) {
        throw lastError
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)))
    }
  }
  
  throw lastError!
}

// Custom hook for fetching monitored accounts
export function useMonitoredAccounts() {
  const [accounts, setAccounts] = useState<MonitoredAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      await retryOperation(async () => {
        const response = await fetch('/api/accounts')
        const data = await response.json()
        
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch accounts')
        }
        
        if (data.success) {
          setAccounts(data.accounts)
        }
      })
      
      setRetryCount(0) // Reset retry count on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setRetryCount(prev => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  return { accounts, loading, error, retryCount, refetch: fetchAccounts }
}

// Custom hook for fetching tweets for a specific username
export function useTweets(username: string, options: { limit?: number; enabled?: boolean } = {}) {
  const [tweets, setTweets] = useState<TweetWithUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [account, setAccount] = useState<TwitterUser | null>(null)
  const [cached, setCached] = useState(false)

  const { limit = 10, enabled = true } = options

  const fetchTweets = useCallback(async () => {
    if (!username || !enabled) return

    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        limit: limit.toString()
      })
      
      const response = await fetch(`/api/tweets/${username}?${params}`)
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch tweets')
      }
      
      if (data.success) {
        setTweets(data.tweets)
        setAccount(data.account)
        setCached(data.cached || false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [username, limit, enabled])

  useEffect(() => {
    fetchTweets()
  }, [fetchTweets])

  return { tweets, account, loading, error, cached, refetch: fetchTweets }
}

// Custom hook for fetching multiple accounts' tweets
export function useMultipleAccountTweets(accounts: MonitoredAccount[]) {
  const [tweetsData, setTweetsData] = useState<Map<string, TweetWithUser[]>>(new Map())
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Map<string, string>>(new Map())
  const [retryCount, setRetryCount] = useState<Map<string, number>>(new Map())

  const fetchAllTweets = useCallback(async () => {
    if (accounts.length === 0) return

    setLoading(true)
    const newTweetsData = new Map<string, TweetWithUser[]>()
    const newErrors = new Map<string, string>()
    const newRetryCount = new Map<string, number>()

    // Fetch tweets for each account with retry logic
    await Promise.allSettled(
      accounts.map(async (account) => {
        try {
          await retryOperation(async () => {
            const response = await fetch(`/api/tweets/${account.username}?limit=5`)
            const data = await response.json()
            
            if (response.ok && data.success) {
              newTweetsData.set(account.username, data.tweets)
              newRetryCount.set(account.username, 0) // Reset retry count on success
            } else {
              throw new Error(data.error || 'Failed to fetch tweets')
            }
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Network error'
          newErrors.set(account.username, errorMessage)
          const currentCount = retryCount.get(account.username) || 0
          newRetryCount.set(account.username, currentCount + 1)
        }
      })
    )

    setTweetsData(newTweetsData)
    setErrors(newErrors)
    setRetryCount(newRetryCount)
    setLoading(false)
  }, [accounts, retryCount])

  useEffect(() => {
    fetchAllTweets()
  }, [fetchAllTweets])

  return { tweetsData, loading, errors, retryCount, refetch: fetchAllTweets }
}

// Custom hook for adding a new account
export function useAddAccount() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addAccount = async (username: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add account')
      }
      
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { addAccount, loading, error }
}

// Custom hook for removing an account
export function useRemoveAccount() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const removeAccount = async (accountId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove account')
      }
      
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { removeAccount, loading, error }
}

// Auto-refresh hook for managing periodic updates
export function useAutoRefresh(
  refreshFunction: () => Promise<void> | void,
  options: {
    interval?: number // in milliseconds
    enabled?: boolean
    onError?: (error: Error) => void
  } = {}
) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isEnabled, setIsEnabled] = useState(options.enabled ?? true)
  const [refreshInterval, setRefreshInterval] = useState(options.interval ?? 30000) // Default 30 seconds
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const enabledRef = useRef(isEnabled)
  const intervalValueRef = useRef(refreshInterval)
  const onErrorRef = useRef(options.onError)

  // Update refs when values change
  useEffect(() => {
    enabledRef.current = isEnabled
  }, [isEnabled])

  useEffect(() => {
    intervalValueRef.current = refreshInterval
  }, [refreshInterval])

  useEffect(() => {
    onErrorRef.current = options.onError
  }, [options.onError])

  const executeRefresh = useCallback(async () => {
    if (!enabledRef.current || isRefreshing) return

    try {
      setIsRefreshing(true)
      await refreshFunction()
    } catch (error) {
      onErrorRef.current?.(error instanceof Error ? error : new Error('Refresh failed'))
    } finally {
      setIsRefreshing(false)
    }
  }, [refreshFunction, isRefreshing])

  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (enabledRef.current && intervalValueRef.current > 0) {
      intervalRef.current = setInterval(executeRefresh, intervalValueRef.current)
    }
  }, [executeRefresh])

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Start/stop auto-refresh when enabled state or interval changes
  useEffect(() => {
    if (isEnabled) {
      startAutoRefresh()
    } else {
      stopAutoRefresh()
    }

    return stopAutoRefresh
  }, [isEnabled, refreshInterval, startAutoRefresh, stopAutoRefresh])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoRefresh()
    }
  }, [stopAutoRefresh])

  return {
    isRefreshing,
    isEnabled,
    interval: refreshInterval,
    setIsEnabled,
    setInterval: setRefreshInterval,
    manualRefresh: executeRefresh,
    startAutoRefresh,
    stopAutoRefresh
  }
}