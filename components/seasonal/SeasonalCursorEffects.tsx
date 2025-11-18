'use client'

import { useEffect, useState } from 'react'
import { getCurrentSeason } from '@/lib/season'
import styles from './SeasonalCursorEffects.module.scss'

export function SeasonalCursorEffects() {
  const [season, setSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('spring')
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])

  useEffect(() => {
    const currentSeason = getCurrentSeason()
    const customSeason = typeof window !== 'undefined' ? localStorage.getItem('yt2-custom-season') : null
    setSeason((customSeason || currentSeason) as any)

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY })
    }

    const handleClick = (e: MouseEvent) => {
      if (season === 'winter') {
        // Create ice crack effect
        const newParticles: Array<{ id: number; x: number; y: number }> = []
        for (let i = 0; i < 5; i++) {
          newParticles.push({
            id: Date.now() + i,
            x: e.clientX + (Math.random() - 0.5) * 50,
            y: e.clientY + (Math.random() - 0.5) * 50,
          })
        }
        setParticles((prev) => [...prev, ...newParticles])
        setTimeout(() => {
          setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)))
        }, 1000)
      }
    }

    const handleMouseEnter = (e: MouseEvent) => {
      if (season === 'autumn') {
        // Create leaf scatter effect
        const target = e.target as HTMLElement
        if (target.classList.contains('leaf') || target.closest('.autumn-leaves')) {
          // Trigger leaf scatter animation
          const leaves = document.querySelectorAll('.leaf')
          leaves.forEach((leaf) => {
            const rect = leaf.getBoundingClientRect()
            const distance = Math.sqrt(
              Math.pow(e.clientX - (rect.left + rect.width / 2), 2) +
              Math.pow(e.clientY - (rect.top + rect.height / 2), 2)
            )
            if (distance < 100) {
              ;(leaf as HTMLElement).style.animation = 'leaf-scatter 0.5s ease-out'
              setTimeout(() => {
                ;(leaf as HTMLElement).style.animation = ''
              }, 500)
            }
          })
        }
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)
    window.addEventListener('mouseenter', handleMouseEnter, true)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
      window.removeEventListener('mouseenter', handleMouseEnter, true)
    }
  }, [season])

  if (season !== 'winter' && season !== 'autumn') return null

  return (
    <>
      {season === 'winter' && particles.map((particle) => (
        <div
          key={particle.id}
          className={styles.iceCrack}
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
          }}
        >
          ❄
        </div>
      ))}
    </>
  )
}

