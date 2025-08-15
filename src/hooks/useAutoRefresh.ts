'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseAutoRefreshOptions {
  onRefresh: () => void | Promise<void>
  interval?: number // in milliseconds
  enabled?: boolean
  immediate?: boolean // whether to call onRefresh immediately
}

interface UseAutoRefreshReturn {
  isRunning: boolean
  start: () => void
  stop: () => void
  toggle: () => void
  setInterval: (newInterval: number) => void
  remainingTime: number
}

export function useAutoRefresh({
  onRefresh,
  interval = 30000, // default 30 seconds
  enabled = true,
  immediate = false
}: UseAutoRefreshOptions): UseAutoRefreshReturn {
  const [isRunning, setIsRunning] = useState(enabled)
  const [currentInterval, setCurrentInterval] = useState(interval)
  const [remainingTime, setRemainingTime] = useState(interval)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
  }, [])

  // Start the refresh cycle
  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true)
    }
  }, [isRunning])

  // Stop the refresh cycle
  const stop = useCallback(() => {
    setIsRunning(false)
    clearTimers()
    setRemainingTime(currentInterval)
  }, [clearTimers, currentInterval])

  // Toggle the refresh cycle
  const toggle = useCallback(() => {
    if (isRunning) {
      stop()
    } else {
      start()
    }
  }, [isRunning, start, stop])

  // Set new interval
  const setIntervalValue = useCallback((newInterval: number) => {
    setCurrentInterval(newInterval)
    setRemainingTime(newInterval)
    
    // If currently running, restart with new interval
    if (isRunning) {
      stop()
      // Use setTimeout to avoid immediate restart
      setTimeout(() => start(), 0)
    }
  }, [isRunning, start, stop])

  // Execute refresh function
  const executeRefresh = useCallback(async () => {
    try {
      await onRefresh()
    } catch (error) {
      console.error('Auto-refresh failed:', error)
    }
  }, [onRefresh])

  // Main effect for managing the auto-refresh
  useEffect(() => {
    if (!isRunning) {
      clearTimers()
      return
    }

    // Execute immediately if requested and not already running
    if (immediate && !intervalRef.current) {
      executeRefresh()
    }

    // Set up the refresh interval
    startTimeRef.current = Date.now()
    setRemainingTime(currentInterval)

    intervalRef.current = setInterval(() => {
      executeRefresh()
      startTimeRef.current = Date.now()
      setRemainingTime(currentInterval)
    }, currentInterval)

    // Set up countdown timer for remaining time display
    countdownRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const remaining = Math.max(0, currentInterval - elapsed)
      setRemainingTime(remaining)
      
      if (remaining === 0) {
        setRemainingTime(currentInterval)
      }
    }, 1000)

    return clearTimers
  }, [isRunning, currentInterval, executeRefresh, immediate, clearTimers])

  // Effect for handling enabled prop changes
  useEffect(() => {
    if (enabled && !isRunning) {
      start()
    } else if (!enabled && isRunning) {
      stop()
    }
  }, [enabled, isRunning, start, stop])

  // Cleanup on unmount
  useEffect(() => {
    return clearTimers
  }, [clearTimers])

  return {
    isRunning,
    start,
    stop,
    toggle,
    setInterval: setIntervalValue,
    remainingTime
  }
}

// Predefined intervals for common use cases
export const AUTO_REFRESH_INTERVALS = {
  FAST: 15000,      // 15 seconds
  NORMAL: 30000,    // 30 seconds  
  SLOW: 60000,      // 1 minute
  VERY_SLOW: 300000 // 5 minutes
} as const

// Format remaining time for display
export function formatRemainingTime(ms: number): string {
  const seconds = Math.ceil(ms / 1000)
  
  if (seconds < 60) {
    return `${seconds}s`
  }
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (remainingSeconds === 0) {
    return `${minutes}m`
  }
  
  return `${minutes}m ${remainingSeconds}s`
}