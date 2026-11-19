'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/db'
import { User } from '@/types'
import { FiSearch, FiUser, FiShield, FiX, FiArrowUpRight, FiCheck, FiStar, FiAward, FiZap, FiHeart, FiSun } from 'react-icons/fi'
import { LuLeaf, LuSnowflake, LuSprout, LuFlower2 } from 'react-icons/lu'
import styles from './UsersPage.module.scss'
import { UserAvatar } from '@/components/shared/UserAvatar'

const badgeIcons: Record<string, React.ReactNode> = {
  staff: <FiShield />, verified: <FiCheck />, premium: <FiStar />, partner: <FiAward />, creator: <FiZap />,
  'golden-leaf': <LuLeaf />, santa: <FiAward />, 'ice-master': <LuSnowflake />, 'winter-king': <LuSnowflake />,
  'february-heart': <FiHeart />, sprout: <LuSprout />, blooming: <FiStar />, 'spring-keeper': <LuFlower2 />,
  'beach-goer': <FiSun />, 'sun-lord': <FiSun />, pumpkin: <FiStar />,
}

const badgeRarity: Record<string, string> = {
  staff: 'legendary', verified: 'epic', premium: 'epic', partner: 'legendary', creator: 'rare',
  'golden-leaf': 'rare', santa: 'rare', 'ice-master': 'epic', 'winter-king': 'legendary',
  'february-heart': 'rare', sprout: 'common', blooming: 'rare', 'spring-keeper': 'epic',
  'beach-goer': 'rare', 'sun-lord': 'legendary', pumpkin: 'common',
}

export function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    try {
      const allUsers = db.users.getAll()
      setUsers(allUsers)
      setLoading(false)
    } catch (error) {
      console.error('Error loading users:', error)
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      u.username.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    )
  })

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    )
  }

  return (
    <div className={styles.usersPage}>
      <div className={`${styles.header} ${styles.fadeInSlideDown}`}>
        <div className={styles.headerTop}>
          <div>
            <h1>Пользователи</h1>
            <p>Найдите канал и поймайте его волну.</p>
          </div>
          <span className={styles.resultCount}>{filteredUsers.length} каналов</span>
        </div>
      </div>

      <div className={`${styles.searchSection} ${styles.fadeInSlideUp}`}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Поиск по имени или email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && <button type="button" className={styles.clearSearch} onClick={() => setSearchQuery('')} aria-label="Очистить поиск"><FiX /></button>}
        </div>
      </div>

      <div className={`${styles.usersGrid} ${styles.fadeIn}`}>
        {filteredUsers.length === 0 ? (
          <div className={styles.empty}>
            <FiUser className={styles.emptyIcon} />
            <h3>Пользователи не найдены</h3>
            <p>Попробуйте изменить поисковый запрос</p>
          </div>
        ) : (
          filteredUsers.map((u, index) => (
            <div
              key={u.id}
              className={styles.userCard}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => router.push(`/channel/${u.id}`)}
            >
              <div className={styles.avatarWrapper}>
                <UserAvatar user={u} size={72} showBadges={false} showFrame />
              </div>
              <div className={styles.userInfo}>
                <div className={styles.usernameRow}>
                  <h3>{u.username}</h3>
                  {u.badges && Array.isArray(u.badges) && u.badges.length > 0 && (
                    <div className={styles.badgesContainer}>
                      {u.badges.slice(0, 3).map((badge, idx) => (
                        <span key={idx} className={styles.badgeIcon} data-rarity={badgeRarity[badge] || 'common'} title={badge}>
                          {badgeIcons[badge] || <FiStar />}
                        </span>
                      ))}
                      {u.badges.length > 3 && (
                        <span className={styles.badgeMore}>+{u.badges.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className={styles.profileMeta}>
                  {u.role && u.role !== 'user' && (
                    <span className={styles.adminBadge}>
                      <FiShield />
                      Администратор
                    </span>
                  )}
                  <span className={styles.subscribers}>{u.subscribersCount || 0} подписчиков</span>
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.openChannel}>Перейти в канал</span>
                  <FiArrowUpRight className={styles.openIcon} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
