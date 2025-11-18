'use client'

import { useEffect, useState } from 'react'
import { getCurrentSeason } from '@/lib/season'
import styles from './SeasonalLikes.module.scss'

interface SeasonalLikesProps {
  onLike: () => void
  isLiked: boolean
}

export function SeasonalLikes({ onLike, isLiked }: SeasonalLikesProps) {
  const [season, setSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('spring')
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])

  useEffect(() => {
    const currentSeason = getCurrentSeason()
    const customSeason = typeof window !== 'undefined' ? localStorage.getItem('yt2-custom-season') : null
    setSeason((customSeason || currentSeason) as any)
  }, [])

  const handleLike = () => {
    onLike()
    
    // Create seasonal particles
    const newParticles: Array<{ id: number; x: number; y: number }> = []
    for (let i = 0; i < 5; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      })
    }
    setParticles(newParticles)
    
    // Clear particles after animation
    setTimeout(() => setParticles([]), 2000)
  }

  const getLikeEmoji = () => {
    switch (season) {
      case 'autumn':
        return '🍁'
      case 'winter':
        return '❄️'
      case 'spring':
        return '🌸'
      case 'summer':
        return '☀️'
      default:
        return '👍'
    }
  }

  return (
    <div className={styles.seasonalLikes} data-season={season}>
      <button
        className={`${styles.likeButton} ${isLiked ? styles.active : ''}`}
        onClick={handleLike}
        data-season={season}
      >
        <span className={styles.likeEmoji}>{getLikeEmoji()}</span>
      </button>
      
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={styles.particle}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          data-season={season}
        >
          {getLikeEmoji()}
        </div>
      ))}
    </div>
  )
}

