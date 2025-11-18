'use client'

import { useEffect, useState } from 'react'
import { getCurrentSeason } from '@/lib/season'
import { useStore } from '@/lib/store'
import { AdventCalendar } from '@/components/seasonal/AdventCalendar'
import { FiGift } from 'react-icons/fi'
import { LuSnowflake } from 'react-icons/lu'
import styles from './AdventCalendarPage.module.scss'

export function AdventCalendarPage() {
  const { user } = useStore()
  const [season, setSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('spring')
  const [isWinter, setIsWinter] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const currentSeason = getCurrentSeason()
    const customSeason = typeof window !== 'undefined' ? localStorage.getItem('yt2-custom-season') : null
    const finalSeason = (customSeason || currentSeason) as any
    setSeason(finalSeason)
    setIsWinter(finalSeason === 'winter')
  }, [])

  if (!mounted) {
    return (
      <div className={styles.adventPage}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <FiGift />
          </div>
          <h1>Адвент-календарь</h1>
          <p>Ежедневные награды в зимний сезон</p>
        </div>
        <div className={styles.notAvailable}>
          <LuSnowflake className={styles.snowflakeIcon} />
          <h2>Загрузка...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.adventPage}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <FiGift />
        </div>
        <h1>Адвент-календарь</h1>
        <p>Ежедневные награды в зимний сезон</p>
      </div>

      {isWinter && user ? (
        <div className={styles.calendarContainer}>
          <AdventCalendar />
        </div>
      ) : !isWinter ? (
        <div className={styles.notAvailable}>
          <LuSnowflake className={styles.snowflakeIcon} />
          <h2>Адвент-календарь доступен только зимой</h2>
          <p>Вернитесь в декабре, январе или феврале, чтобы получить ежедневные награды!</p>
        </div>
      ) : (
        <div className={styles.notAvailable}>
          <LuSnowflake className={styles.snowflakeIcon} />
          <h2>Войдите, чтобы использовать адвент-календарь</h2>
          <p>Необходимо авторизоваться для получения наград</p>
        </div>
      )}
    </div>
  )
}

