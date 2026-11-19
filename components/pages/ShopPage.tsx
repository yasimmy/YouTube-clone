'use client'

import React, { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { getUserCurrency, spendCurrency, canAfford } from '@/lib/currency'
import { db } from '@/lib/db'
import {
  FiShoppingBag,
  FiStar,
  FiZap,
  FiAward,
  FiCheck,
  FiX,
  FiDollarSign,
} from 'react-icons/fi'
import { AvatarFrame, UserBadge } from '@/types'
import toast from 'react-hot-toast'
import styles from './ShopPage.module.scss'

interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  type: 'nickname-effect' | 'avatar-frame' | 'badge'
  value: string
  iconName: 'star' | 'zap' | 'award'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  preview?: string
  discount?: number
  isNew?: boolean
}

const shopItemsData: Omit<ShopItem, 'icon'>[] = [
  // Nickname effects
  {
    id: 'sparkles',
    name: 'Белые искры',
    description: 'Мерцающие искры вокруг ника',
    price: 100,
    type: 'nickname-effect',
    value: 'White Sparkles',
    iconName: 'star',
    rarity: 'rare',
  },
  {
    id: 'glow',
    name: 'Свечение',
    description: 'Мягкое свечение вокруг ника',
    price: 150,
    type: 'nickname-effect',
    value: 'Glow',
    iconName: 'zap',
    rarity: 'epic',
  },
  {
    id: 'gradient',
    name: 'Градиент',
    description: 'Радужный градиент для ника',
    price: 200,
    type: 'nickname-effect',
    value: 'Gradient',
    iconName: 'star',
    rarity: 'epic',
  },
  {
    id: 'neon',
    name: 'Неон',
    description: 'Неоновое свечение',
    price: 300,
    type: 'nickname-effect',
    value: 'Neon',
    iconName: 'zap',
    rarity: 'legendary',
  },
  
  // Avatar frames
  {
    id: 'frame-gold',
    name: 'Золотая рамка',
    description: 'Роскошная золотая рамка',
    price: 250,
    type: 'avatar-frame',
    value: 'gold',
    iconName: 'award',
    rarity: 'epic',
  },
  {
    id: 'frame-rainbow',
    name: 'Радужная рамка',
    description: 'Яркая радужная рамка',
    price: 350,
    type: 'avatar-frame',
    value: 'rainbow',
    iconName: 'star',
    rarity: 'legendary',
  },
  {
    id: 'frame-premium',
    name: 'Премиум рамка',
    description: 'Эксклюзивная премиум рамка',
    price: 500,
    type: 'avatar-frame',
    value: 'premium',
    iconName: 'award',
    rarity: 'legendary',
  },
  
  // Badges
  {
    id: 'badge-premium',
    name: 'Премиум значок',
    description: 'Эксклюзивный премиум значок',
    price: 400,
    type: 'badge',
    value: 'premium',
    iconName: 'award',
    rarity: 'epic',
  },
  {
    id: 'badge-partner',
    name: 'Партнерский значок',
    description: 'Значок партнера платформы',
    price: 600,
    type: 'badge',
    value: 'partner',
    iconName: 'star',
    rarity: 'legendary',
  },
]

const getIcon = (iconName: 'star' | 'zap' | 'award') => {
  switch (iconName) {
    case 'star': return FiStar
    case 'zap': return FiZap
    case 'award': return FiAward
    default: return FiStar
  }
}

export function ShopPage() {
  const { user, setUser } = useStore()
  const [currency, setCurrency] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'nickname-effect' | 'avatar-frame' | 'badge'>('all')
  const [purchasing, setPurchasing] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setCurrency(getUserCurrency(user.id))
    }
  }, [user])

  const handlePurchase = async (item: ShopItem) => {
    if (!user) {
      toast.error('Войдите, чтобы совершить покупку')
      return
    }

    const finalPrice = item.discount ? Math.floor(item.price * (1 - item.discount / 100)) : item.price

    if (!canAfford(user.id, finalPrice)) {
      toast.error('Недостаточно средств')
      return
    }

    setPurchasing(item.id)

    try {
      // Check if already owned
      if (item.type === 'nickname-effect') {
        if (user.nicknameHighlight === item.value) {
          toast.error('У вас уже есть этот эффект')
          setPurchasing(null)
          return
        }
      } else if (item.type === 'avatar-frame') {
        if (user.avatarFrame === item.value) {
          toast.error('У вас уже есть эта рамка')
          setPurchasing(null)
          return
        }
      } else if (item.type === 'badge') {
        if (user.badges?.includes(item.value as UserBadge)) {
          toast.error('У вас уже есть этот значок')
          setPurchasing(null)
          return
        }
      }

      // Spend currency
      const finalPrice = item.discount ? Math.floor(item.price * (1 - item.discount / 100)) : item.price
      const success = spendCurrency(user.id, finalPrice, `Покупка: ${item.name}`)
      if (!success) {
        toast.error('Ошибка при покупке')
        setPurchasing(null)
        return
      }

      // Update user
      const updates: any = {}
      if (item.type === 'nickname-effect') {
        updates.nicknameHighlight = item.value
      } else if (item.type === 'avatar-frame') {
        updates.avatarFrame = item.value as AvatarFrame
      } else if (item.type === 'badge') {
        const currentBadges = user.badges || []
        updates.badges = [...currentBadges, item.value as UserBadge]
      }

      const updated = db.users.update(user.id, updates)
      if (updated) {
        setUser(updated)
        setCurrency(getUserCurrency(user.id))
        toast.success(`Поздравляем! Вы приобрели "${item.name}"`)
      } else {
        toast.error('Ошибка при обновлении профиля')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      toast.error('Ошибка при покупке')
    } finally {
      setPurchasing(null)
    }
  }

  const filteredItems = selectedCategory === 'all'
    ? shopItemsData
    : shopItemsData.filter(item => item.type === selectedCategory)

  const isOwned = (item: ShopItem) => {
    if (!user) return false
    if (item.type === 'nickname-effect') return user.nicknameHighlight === item.value
    if (item.type === 'avatar-frame') return user.avatarFrame === item.value
    if (item.type === 'badge') return user.badges?.includes(item.value as UserBadge)
    return false
  }

  if (!user) {
    return (
      <div className={styles.shopPage}>
        <div className={styles.notLoggedIn}>
          <FiShoppingBag className={styles.icon} />
          <h2>Войдите, чтобы открыть магазин</h2>
          <p>Покупайте эксклюзивные эффекты и улучшения для вашего профиля</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.shopPage}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1>Магазин</h1>
          <div className={styles.currencyDisplay}>
            <FiDollarSign />
            <span>{currency.toLocaleString()}</span>
          </div>
        </div>
        <p>Покупайте эксклюзивные эффекты и улучшения</p>
      </div>

      <div className={styles.categories}>
        <button
          className={`${styles.categoryButton} ${selectedCategory === 'all' ? styles.active : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          Все
        </button>
        <button
          className={`${styles.categoryButton} ${selectedCategory === 'nickname-effect' ? styles.active : ''}`}
          onClick={() => setSelectedCategory('nickname-effect')}
        >
          Эффекты ника
        </button>
        <button
          className={`${styles.categoryButton} ${selectedCategory === 'avatar-frame' ? styles.active : ''}`}
          onClick={() => setSelectedCategory('avatar-frame')}
        >
          Рамки
        </button>
        <button
          className={`${styles.categoryButton} ${selectedCategory === 'badge' ? styles.active : ''}`}
          onClick={() => setSelectedCategory('badge')}
        >
          Значки
        </button>
      </div>

      <div className={styles.itemsGrid}>
        {filteredItems.map((item) => {
          const owned = isOwned(item)
          const finalPrice = item.discount ? Math.floor(item.price * (1 - item.discount / 100)) : item.price
          const affordable = canAfford(user.id, finalPrice)
          const IconComponent = getIcon(item.iconName)

          return (
            <div
              key={item.id}
              className={`${styles.itemCard} ${owned ? styles.owned : ''} ${item.isNew ? styles.newItem : ''}`}
              data-rarity={item.rarity}
            >
              {item.isNew && <div className={styles.newBadge}>Новинка</div>}
              {item.discount && <div className={styles.discountBadge}>-{item.discount}%</div>}
              
              <div className={styles.itemHeader}>
                <div className={styles.itemIcon}>
                  {IconComponent && React.createElement(IconComponent, {})}
                </div>
                <span className={styles.rarity}>
                  {item.rarity}
                </span>
              </div>

              <div className={styles.itemPreview} aria-label={`Предпросмотр: ${item.name}`}>
                {item.type === 'nickname-effect' && (
                  <span className={`${styles.previewNickname} ${styles[`preview-${item.value.toLowerCase().replace(' ', '-')}`]}`}>wave</span>
                )}
                {item.type === 'avatar-frame' && (
                  <div className={`${styles.previewAvatar} ${styles[`frame-${item.value}`]}`}>
                    <span>w</span>
                  </div>
                )}
                {item.type === 'badge' && (
                  <div className={styles.previewBadgeIcon}>
                    {IconComponent && React.createElement(IconComponent, {})}
                  </div>
                )}
              </div>

              <div className={styles.itemContent}>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </div>

              <div className={styles.itemFooter}>
                <div className={styles.price}>
                  {item.discount && (
                    <span className={styles.oldPrice}>{item.price.toLocaleString()}</span>
                  )}
                  <FiDollarSign />
                  <span>{finalPrice.toLocaleString()}</span>
                </div>
                {owned ? (
                  <div className={styles.ownedBadge}>
                    <FiCheck />
                    <span>Куплено</span>
                  </div>
                ) : (
                  <button
                    className={`${styles.buyButton} ${!affordable ? styles.disabled : ''}`}
                    onClick={() => handlePurchase({ ...item, price: finalPrice })}
                    disabled={!affordable || purchasing === item.id}
                  >
                    {purchasing === item.id ? 'Покупка...' : 'Купить'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

