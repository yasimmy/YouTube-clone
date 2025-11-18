'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { db } from '@/lib/db'
import { UserBadge } from '@/types'
import { FiGift, FiLock, FiCheck } from 'react-icons/fi'
import styles from './AdventCalendar.module.scss'
import toast from 'react-hot-toast'
import { notifyBadgeEarned } from '@/lib/notifications'

interface AdventReward {
  day: number
  month: number
  reward: string
  type: 'frame' | 'background' | 'icon' | 'effect' | 'highlight' | 'badge'
  rarity?: 'common' | 'rare' | 'legendary'
}

const decemberRewards: AdventReward[] = [
  { day: 1, month: 12, reward: 'Рамка аватара "Мягкий снег"', type: 'frame' },
  { day: 2, month: 12, reward: 'Фон профиля "Зимний лес"', type: 'background' },
  { day: 3, month: 12, reward: 'Иконка профиля "Маленькая ёлочка 🎄"', type: 'icon' },
  { day: 4, month: 12, reward: 'Эффект профиля: падающие микроснежинки', type: 'effect' },
  { day: 5, month: 12, reward: 'Рамка аватара "Снежная полоска"', type: 'frame' },
  { day: 6, month: 12, reward: 'Подсветка ника "Лёгкое свечение льда" (5 месяцев)', type: 'highlight' },
  { day: 7, month: 12, reward: 'Фон "Северное сияние"', type: 'background' },
  { day: 8, month: 12, reward: 'Анимация аватарки: ледяная дымка', type: 'effect' },
  { day: 9, month: 12, reward: 'Иконка "Новогодний шарик"', type: 'icon' },
  { day: 10, month: 12, reward: 'Рамка аватара "Холодное стекло"', type: 'frame' },
  { day: 11, month: 12, reward: 'Эффект кнопок: морозные края', type: 'effect' },
  { day: 12, month: 12, reward: 'Фон "Снежный город ночью"', type: 'background' },
  { day: 13, month: 12, reward: 'Иконка "Звезда Вифлеема ✨"', type: 'icon' },
  { day: 14, month: 12, reward: 'Анимация профиля: мерцающие огоньки', type: 'effect' },
  { day: 15, month: 12, reward: 'Подсветка ника "Голубой лёд" (5 месяцев)', type: 'highlight' },
  { day: 16, month: 12, reward: 'Рамка аватара "Новогодняя гирлянда"', type: 'frame' },
  { day: 17, month: 12, reward: 'Фон "Ёлочные игрушки"', type: 'background' },
  { day: 18, month: 12, reward: 'Иконка "Подарочек 🎁"', type: 'icon' },
  { day: 19, month: 12, reward: 'Эффект профиля: снегопад из крупных хлопьев', type: 'effect' },
  { day: 20, month: 12, reward: 'Рамка аватара "Еловые ветки"', type: 'frame' },
  { day: 21, month: 12, reward: 'Анимация аватарки: мягкое сияние', type: 'effect' },
  { day: 22, month: 12, reward: 'Фон "Снежные холмы"', type: 'background' },
  { day: 23, month: 12, reward: 'Иконка "Колокольчик 🔔"', type: 'icon' },
  { day: 24, month: 12, reward: 'Рамка аватара "Рождественская свеча"', type: 'frame' },
  { day: 25, month: 12, reward: 'Подсветка ника "Сияние Севера" (5 месяцев)', type: 'highlight', rarity: 'rare' },
  { day: 26, month: 12, reward: 'Эффект: новогодние конфетти', type: 'effect' },
  { day: 27, month: 12, reward: 'Фон "Снежная деревня"', type: 'background' },
  { day: 28, month: 12, reward: 'Иконка "Карамельная трость 🍬"', type: 'icon' },
  { day: 29, month: 12, reward: 'Анимация профиля: морозный круг вокруг аватарки', type: 'effect' },
  { day: 30, month: 12, reward: 'Рамка аватара "Золото Нового года"', type: 'frame' },
  { day: 31, month: 12, reward: 'Значок "Король зимы"', type: 'badge', rarity: 'legendary' },
]

const januaryRewards: AdventReward[] = [
  { day: 1, month: 1, reward: 'Фон профиля "Ледяной замок"', type: 'background' },
  { day: 2, month: 1, reward: 'Рамка "Кристаллы льда"', type: 'frame' },
  { day: 3, month: 1, reward: 'Иконка "Снежинка ❄️"', type: 'icon' },
  { day: 4, month: 1, reward: 'Эффект: трещины льда по бокам профиля', type: 'effect' },
  { day: 5, month: 1, reward: 'Подсветка ника "Морозное сияние" (5 месяцев)', type: 'highlight' },
  { day: 6, month: 1, reward: 'Фон "Ледяная пустыня"', type: 'background' },
  { day: 7, month: 1, reward: 'Рамка "Замёрзшее стекло"', type: 'frame' },
  { day: 8, month: 1, reward: 'Иконка "Морозный кристалл"', type: 'icon' },
  { day: 9, month: 1, reward: 'Анимация: искры льда при открытии профиля', type: 'effect' },
  { day: 10, month: 1, reward: 'Фон "Зимние горы"', type: 'background' },
  { day: 11, month: 1, reward: 'Рамка "Супер-ледяная окантовка"', type: 'frame' },
  { day: 12, month: 1, reward: 'Эффект: снежный пар при наведении', type: 'effect' },
  { day: 13, month: 1, reward: 'Иконка "Пингвин 🐧"', type: 'icon' },
  { day: 14, month: 1, reward: 'Подсветка ника "Холодный ветер" (5 месяцев)', type: 'highlight' },
  { day: 15, month: 1, reward: 'Фон "Голубой лёд"', type: 'background' },
  { day: 16, month: 1, reward: 'Рамка "Кольцо инея"', type: 'frame' },
  { day: 17, month: 1, reward: 'Иконка "Лёд-кристалл"', type: 'icon' },
  { day: 18, month: 1, reward: 'Эффект аватарки: ледяная волна', type: 'effect' },
  { day: 19, month: 1, reward: 'Фон "Замёрзшее озеро"', type: 'background' },
  { day: 20, month: 1, reward: 'Рамка "Северный шторм"', type: 'frame' },
  { day: 21, month: 1, reward: 'Иконка "Снежный ком"', type: 'icon' },
  { day: 22, month: 1, reward: 'Анимация профиля: снег с боковой тенью', type: 'effect' },
  { day: 23, month: 1, reward: 'Фон "Утренняя стужа"', type: 'background' },
  { day: 24, month: 1, reward: 'Рамка "Синее сияние"', type: 'frame' },
  { day: 25, month: 1, reward: 'Иконка "Ледяная корона 👑"', type: 'icon' },
  { day: 26, month: 1, reward: 'Эффект: ледяные вспышки при клике', type: 'effect' },
  { day: 27, month: 1, reward: 'Фон "Город в морозе"', type: 'background' },
  { day: 28, month: 1, reward: 'Рамка "Январский лёд"', type: 'frame' },
  { day: 29, month: 1, reward: 'Подсветка ника "Ледяной луч" (5 месяцев)', type: 'highlight' },
  { day: 30, month: 1, reward: 'Анимация: снежная вспышка вокруг ника', type: 'effect' },
  { day: 31, month: 1, reward: 'Значок "Ледяной мастер"', type: 'badge', rarity: 'rare' },
]

const februaryRewards: AdventReward[] = [
  { day: 1, month: 2, reward: 'Фон "Розовый снег"', type: 'background' },
  { day: 2, month: 2, reward: 'Рамка "Снежное мерцание"', type: 'frame' },
  { day: 3, month: 2, reward: 'Иконка "Сердце в снегу 💗❄️"', type: 'icon' },
  { day: 4, month: 2, reward: 'Эффект: тающие снежинки', type: 'effect' },
  { day: 5, month: 2, reward: 'Подсветка ника "Зимняя нежность" (5 месяцев)', type: 'highlight' },
  { day: 6, month: 2, reward: 'Фон "Закат на снегу"', type: 'background' },
  { day: 7, month: 2, reward: 'Рамка "Розовый лёд"', type: 'frame' },
  { day: 8, month: 2, reward: 'Иконка "Снежная роза"', type: 'icon' },
  { day: 9, month: 2, reward: 'Анимация: тёплое сияние вокруг профиля', type: 'effect' },
  { day: 10, month: 2, reward: 'Фон "Февральская метель"', type: 'background' },
  { day: 11, month: 2, reward: 'Рамка "Последний снег"', type: 'frame' },
  { day: 12, month: 2, reward: 'Иконка "Лёд-сердце"', type: 'icon' },
  { day: 13, month: 2, reward: 'Подсветка ника "Февральское свечение" (5 месяцев)', type: 'highlight' },
  { day: 14, month: 2, reward: 'Значок "Февральское сердце 💖❄️"', type: 'badge', rarity: 'rare' },
  { day: 15, month: 2, reward: 'Фон "Снегопад на рассвете"', type: 'background' },
  { day: 16, month: 2, reward: 'Рамка "Мягкий иней"', type: 'frame' },
  { day: 17, month: 2, reward: 'Эффект: снежная дымка', type: 'effect' },
  { day: 18, month: 2, reward: 'Иконка "Зайчик в снегу 🐇"', type: 'icon' },
  { day: 19, month: 2, reward: 'Фон "Таяние снега"', type: 'background' },
  { day: 20, month: 2, reward: 'Рамка "Снежная кромка"', type: 'frame' },
  { day: 21, month: 2, reward: 'Иконка "Ледяная звезда"', type: 'icon' },
  { day: 22, month: 2, reward: 'Анимация аватарки: блёстки снега', type: 'effect' },
  { day: 23, month: 2, reward: 'Фон "Прозрачный лёд"', type: 'background' },
  { day: 24, month: 2, reward: 'Подсветка ника "Снеговая аура" (5 месяцев)', type: 'highlight' },
  { day: 25, month: 2, reward: 'Рамка "Лёгкий мороз"', type: 'frame' },
  { day: 26, month: 2, reward: 'Иконка "Кристалл-сердце"', type: 'icon' },
  { day: 27, month: 2, reward: 'Эффект: снег тает при прокрутке', type: 'effect' },
  { day: 28, month: 2, reward: 'Фон "Прощание со снегом"', type: 'background' },
]

export function AdventCalendar() {
  const { user } = useStore()
  const [currentMonth, setCurrentMonth] = useState(12)
  const [claimedDays, setClaimedDays] = useState<Set<string>>(new Set())
  const [currentDay, setCurrentDay] = useState(new Date().getDate())
  const [currentMonthNum, setCurrentMonthNum] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    if (!user) return

    // Load claimed days from localStorage
    const stored = localStorage.getItem(`advent_${user.id}`)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as string[]
        setClaimedDays(new Set(parsed))
      } catch (e) {
        // Ignore
      }
    }
  }, [user])

  const getRewardsForMonth = (month: number): AdventReward[] => {
    if (month === 12) return decemberRewards
    if (month === 1) return januaryRewards
    if (month === 2) return februaryRewards
    return []
  }

  const canClaim = (day: number, month: number): boolean => {
    const today = new Date()
    const currentDayNum = today.getDate()
    const currentMonthNum = today.getMonth() + 1

    // Can claim if it's the current day or earlier in the current month
    if (month === currentMonthNum) {
      return day <= currentDayNum
    }
    // Can claim past months
    if (month < currentMonthNum) {
      return true
    }
    return false
  }

  const isClaimed = (day: number, month: number): boolean => {
    return claimedDays.has(`${month}-${day}`)
  }

  const handleClaim = (reward: AdventReward) => {
    if (!user) {
      toast.error('Войдите, чтобы получить награду')
      return
    }

    if (isClaimed(reward.day, reward.month)) {
      toast.error('Награда уже получена')
      return
    }

    if (!canClaim(reward.day, reward.month)) {
      toast.error('Этот день еще не наступил')
      return
    }

    // Mark as claimed
    const newClaimed = new Set(claimedDays)
    newClaimed.add(`${reward.month}-${reward.day}`)
    setClaimedDays(newClaimed)
    localStorage.setItem(`advent_${user.id}`, JSON.stringify(Array.from(newClaimed)))

    // Apply reward
    if (reward.type === 'badge') {
      const currentBadges = Array.isArray(user.badges)
        ? user.badges.filter((b): b is UserBadge => typeof b === 'string')
        : []
      if (reward.reward.includes('Король зимы')) {
        if (!currentBadges.includes('winter-king')) {
          db.users.update(user.id, {
            badges: [...currentBadges, 'winter-king'],
          })
          notifyBadgeEarned(user.id, 'Король зимы')
        }
      } else if (reward.reward.includes('Ледяной мастер')) {
        if (!currentBadges.includes('ice-master')) {
          db.users.update(user.id, {
            badges: [...currentBadges, 'ice-master'],
          })
          notifyBadgeEarned(user.id, 'Ледяной мастер')
        }
      } else if (reward.reward.includes('Февральское сердце')) {
        if (!currentBadges.includes('february-heart')) {
          db.users.update(user.id, {
            badges: [...currentBadges, 'february-heart'],
          })
          notifyBadgeEarned(user.id, 'Февральское сердце')
        }
      }
    } else if (reward.type === 'frame') {
      // Extract frame name from reward text and apply
      const frameMap: Record<string, any> = {
        'мягкий снег': 'winter-snow',
        'снежная полоска': 'winter-snow',
        'холодное стекло': 'winter-frost',
        'новогодняя гирлянда': 'winter-holiday',
        'еловые ветки': 'winter-holiday',
        'рождественская свеча': 'winter-holiday',
        'золото нового года': 'gold',
      }
      const rewardLower = reward.reward.toLowerCase()
      const frameKey = Object.keys(frameMap).find(key => rewardLower.includes(key))
      if (frameKey) {
        const frame = frameMap[frameKey]
        db.users.update(user.id, { avatarFrame: frame })
      }
    }

    toast.success(`Получено: ${reward.reward}`)
  }

  const rewards = getRewardsForMonth(currentMonth)

  if (!user) return null

  // Only show in winter months
  const currentSeasonMonth = new Date().getMonth() + 1
  if (currentSeasonMonth < 12 && currentSeasonMonth > 2) {
    return null
  }

  return (
    <div className={styles.adventCalendar}>
      <h2 className={styles.title}>Адвент-календарь</h2>
      
      <div className={styles.monthSelector}>
        <button
          onClick={() => setCurrentMonth(12)}
          className={currentMonth === 12 ? styles.active : ''}
        >
          Декабрь
        </button>
        <button
          onClick={() => setCurrentMonth(1)}
          className={currentMonth === 1 ? styles.active : ''}
        >
          Январь
        </button>
        <button
          onClick={() => setCurrentMonth(2)}
          className={currentMonth === 2 ? styles.active : ''}
        >
          Февраль
        </button>
      </div>

      <div className={styles.calendarGrid}>
        {rewards.map((reward) => {
          const canClaimToday = canClaim(reward.day, reward.month)
          const claimed = isClaimed(reward.day, reward.month)
          const isToday = reward.day === currentDay && reward.month === currentMonthNum

          return (
            <div
              key={`${reward.month}-${reward.day}`}
              className={styles.dayWrapper}
            >
              <button
                className={`${styles.day} ${claimed ? styles.claimed : ''} ${!canClaimToday ? styles.locked : ''} ${isToday ? styles.today : ''} ${reward.rarity ? styles[reward.rarity] : ''}`}
                onClick={() => canClaimToday && !claimed && handleClaim(reward)}
                disabled={!canClaimToday || claimed}
              >
              <div className={styles.dayNumber}>{reward.day}</div>
              {claimed ? (
                <FiCheck className={styles.checkIcon} />
              ) : !canClaimToday ? (
                <FiLock className={styles.lockIcon} />
              ) : (
                <FiGift className={styles.giftIcon} />
              )}
              {claimed && (
                <div className={styles.rewardTooltip}>
                  {reward.reward}
                </div>
              )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

