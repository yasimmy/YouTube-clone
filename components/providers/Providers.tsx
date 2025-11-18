'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import { db } from '@/lib/db'
import { getCookie, setCookie } from '@/lib/cookies'
import { getCurrentSeason, getSeasonConfig, Season } from '@/lib/season'

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useStore((state) => state.theme)
  const setTheme = useStore((state) => state.setTheme)
  const setUser = useStore((state) => state.setUser)
  const user = useStore((state) => state.user)

  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('yt2-storage')
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme)
        if (parsed.state?.theme) {
          setTheme(parsed.state.theme)
        }
      } catch (e) {
        // Ignore
      }
    }
    document.documentElement.setAttribute('data-theme', theme)

    // Initialize season
    let season = getCurrentSeason()
    // Check if there's a custom season set
    if (typeof window !== 'undefined') {
      const savedSeason = localStorage.getItem('yt2-custom-season') as Season | null
      if (savedSeason && ['spring', 'summer', 'autumn', 'winter'].includes(savedSeason)) {
        season = savedSeason
      }
    }
    const seasonConfig = getSeasonConfig(season)
    document.documentElement.setAttribute('data-season', season)
    
    // Apply season colors as CSS variables
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.style.setProperty('--season-primary', seasonConfig.colors.primary)
      root.style.setProperty('--season-secondary', seasonConfig.colors.secondary)
      root.style.setProperty('--season-accent', seasonConfig.colors.accent)
      root.style.setProperty('--season-gradient', seasonConfig.colors.gradient)
    }
  }, [theme, setTheme])

  useEffect(() => {
    // Restore user from localStorage first (faster)
    if (!user && typeof window !== 'undefined') {
      try {
        const storage = localStorage.getItem('yt2-storage')
        if (storage) {
          const parsed = JSON.parse(storage)
          if (parsed.state?.user) {
            // User found in localStorage, restore it
            setUser(parsed.state.user)
            // Also set cookie for consistency
            setCookie('yt2_session', parsed.state.user.id, 7)
            return
          }
        }
      } catch (e) {
        console.error('Error reading user from localStorage:', e)
      }
    }

    // Restore user from cookie if not in store
    if (!user) {
      const sessionId = getCookie('yt2_session')
      if (sessionId) {
        // Ensure DB is initialized
        if (typeof window !== 'undefined') {
          db.users.getAll() // This initializes the DB
        }
        const savedUser = db.users.findById(sessionId)
        if (savedUser) {
          // Check if user is blocked
          if (savedUser.isBlocked && savedUser.blockedUntil) {
            if (new Date(savedUser.blockedUntil) > new Date()) {
              // Still blocked
              return
            } else {
              // Unblock
              db.users.update(savedUser.id, { isBlocked: false, blockedUntil: undefined })
            }
          }
          setUser(savedUser)
          
          // Award daily login currency
          if (typeof window !== 'undefined') {
            import('@/lib/currency-rewards').then(({ rewardDailyLogin }) => {
              rewardDailyLogin(savedUser.id)
            })
          }
        } else {
          // Cookie exists but user not found - clear cookie
          if (typeof window !== 'undefined') {
            document.cookie = 'yt2_session=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;'
          }
        }
      }
    } else if (user) {
      // Sync user to cookie and localStorage
      if (typeof window !== 'undefined') {
        const sessionId = getCookie('yt2_session')
        if (sessionId !== user.id) {
          setCookie('yt2_session', user.id, 7)
        }
        // Also ensure user is in localStorage
        try {
          const storage = localStorage.getItem('yt2-storage')
          if (storage) {
            const parsed = JSON.parse(storage)
            parsed.state.user = user
            localStorage.setItem('yt2-storage', JSON.stringify(parsed))
          }
        } catch (e) {
          // Ignore
        }
      }
    }
  }, [user, setUser])

  return <>{children}</>
}

