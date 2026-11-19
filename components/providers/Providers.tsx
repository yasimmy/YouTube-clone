'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import { db } from '@/lib/db'
import { getCookie, deleteCookie } from '@/lib/cookies'
import { getCurrentSeason, getSeasonConfig, Season } from '@/lib/season'

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useStore((state) => state.theme)
  const setTheme = useStore((state) => state.setTheme)
  const setUser = useStore((state) => state.setUser)

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
    const sessionToken = getCookie('yt2_session')
    if (sessionToken) {
        db.users.getAll()
        const session = db.sessions.findByToken(sessionToken)
        const expired = session?.expiresAt && new Date(session.expiresAt).getTime() <= Date.now()
        const savedUser = session && !expired ? db.users.findById(session.userId) : undefined
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
          db.sessions.update(session!.id, { lastActivity: new Date().toISOString() })
          // Award daily login currency
          if (typeof window !== 'undefined') {
            import('@/lib/currency-rewards').then(({ rewardDailyLogin }) => {
              rewardDailyLogin(savedUser.id)
            })
          }
        } else {
          deleteCookie('yt2_session')
          setUser(null)
        }
    } else setUser(null)
  }, [setUser])

  return <>{children}</>
}

