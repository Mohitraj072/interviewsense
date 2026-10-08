import { createContext, useContext, useState, useEffect, useRef } from 'react'
import axios from 'axios'

const ApiStatusContext = createContext({
  isWakingUp: false,
  elapsedSeconds: 0,
  activeRequests: 0,
  startManualSlowTracker: () => () => {},
})

export function ApiStatusProvider({ children }) {
  const [isWakingUp, setIsWakingUp] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const activeCountRef = useRef(0)
  const wakeTimerRef = useRef(null)
  const elapsedIntervalRef = useRef(null)

  // Clear timers helper
  const clearTimers = () => {
    if (wakeTimerRef.current) {
      clearTimeout(wakeTimerRef.current)
      wakeTimerRef.current = null
    }
    if (elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current)
      elapsedIntervalRef.current = null
    }
  }

  const handleRequestStart = () => {
    activeCountRef.current += 1

    // If this is the first active request, start the 3-second wake timer
    if (activeCountRef.current === 1) {
      clearTimers()
      wakeTimerRef.current = setTimeout(() => {
        setIsWakingUp(true)
        setElapsedSeconds(3)
        elapsedIntervalRef.current = setInterval(() => {
          setElapsedSeconds((prev) => prev + 1)
        }, 1000)
      }, 3000)
    }
  }

  const handleRequestEnd = () => {
    activeCountRef.current = Math.max(0, activeCountRef.current - 1)
    if (activeCountRef.current === 0) {
      clearTimers()
      setIsWakingUp(false)
      setElapsedSeconds(0)
    }
  }

  // Setup Axios interceptors
  useEffect(() => {
    const reqInterceptor = axios.interceptors.request.use(
      (config) => {
        // Only track backend API calls
        const url = config.url || ''
        if (url.includes('/api/') || url.includes('/health')) {
          handleRequestStart()
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    const resInterceptor = axios.interceptors.response.use(
      (response) => {
        const url = response.config?.url || ''
        if (url.includes('/api/') || url.includes('/health')) {
          handleRequestEnd()
        }
        return response
      },
      (error) => {
        const url = error.config?.url || ''
        if (url.includes('/api/') || url.includes('/health')) {
          handleRequestEnd()
        }
        return Promise.reject(error)
      }
    )

    return () => {
      axios.interceptors.request.eject(reqInterceptor)
      axios.interceptors.response.eject(resInterceptor)
      clearTimers()
    }
  }, [])

  // Manual slow tracker for custom operations or fallback
  const startManualSlowTracker = () => {
    handleRequestStart()
    return () => {
      handleRequestEnd()
    }
  }

  return (
    <ApiStatusContext.Provider
      value={{
        isWakingUp,
        elapsedSeconds,
        activeRequests: activeCountRef.current,
        startManualSlowTracker,
      }}
    >
      {children}
    </ApiStatusContext.Provider>
  )
}

export function useApiStatus() {
  return useContext(ApiStatusContext)
}
