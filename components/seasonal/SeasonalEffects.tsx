'use client'

import { useEffect, useState } from 'react'
import { getCurrentSeason, getSeasonConfig } from '@/lib/season'
import styles from './SeasonalEffects.module.scss'

export function SeasonalEffects() {
  const [currentSeason, setCurrentSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('spring')

  useEffect(() => {
    const season = getCurrentSeason()
    const config = getSeasonConfig(season)
    
    // Apply season to document
    document.documentElement.setAttribute('data-season', season)
    
    // Apply CSS variables
    const root = document.documentElement
    root.style.setProperty('--season-primary', config.colors.primary)
    root.style.setProperty('--season-secondary', config.colors.secondary)
    root.style.setProperty('--season-accent', config.colors.accent)
    root.style.setProperty('--season-gradient', config.colors.gradient)

    // Check for custom season
    const customSeason = typeof window !== 'undefined' ? localStorage.getItem('yt2-custom-season') : null
    if (customSeason && ['spring', 'summer', 'autumn', 'winter'].includes(customSeason)) {
      const customConfig = getSeasonConfig(customSeason as any)
      document.documentElement.setAttribute('data-season', customSeason)
      root.style.setProperty('--season-primary', customConfig.colors.primary)
      root.style.setProperty('--season-secondary', customConfig.colors.secondary)
      root.style.setProperty('--season-accent', customConfig.colors.accent)
      root.style.setProperty('--season-gradient', customConfig.colors.gradient)
      setCurrentSeason(customSeason as any)
    } else {
      setCurrentSeason(season)
    }
  }, [])

  return (
    <div className={styles.seasonalEffects} data-season={currentSeason}>
      {/* Autumn - Falling leaves */}
      {currentSeason === 'autumn' && (
        <div className={styles.autumnLeaves}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className={`${styles.leaf} leaf`}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`,
              }}
            >🍂</div>
          ))}
          {/* Autumn haze gradient */}
          <div className={styles.autumnHaze}></div>
        </div>
      )}

      {/* Winter - Snow */}
      {currentSeason === 'winter' && (
        <div className={styles.snow}>
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} className={styles.snowflake} style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 5}s`,
            }}>❄</div>
          ))}
        </div>
      )}

      {/* Spring - Cherry blossoms and pollen */}
      {currentSeason === 'spring' && (
        <>
          <div className={styles.cherryBlossoms}>
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className={styles.petal} style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 4}s`,
              }}>🌸</div>
            ))}
          </div>
          <div className={styles.springPollen}>
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className={styles.pollen} style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${6 + Math.random() * 4}s`,
              }}></div>
            ))}
          </div>
        </>
      )}

      {/* Summer - Bubbles and sun rays */}
      {currentSeason === 'summer' && (
        <>
          <div className={styles.summerRays}></div>
          <div className={styles.bubbles}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={styles.bubble} style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 4}s`,
              }}></div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}


