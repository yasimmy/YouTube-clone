'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { db } from '@/lib/db'
import { User } from '@/types'
import { FiSearch, FiUser, FiShield } from 'react-icons/fi'
import styles from './UsersPage.module.scss'
import { UserAvatar } from '@/components/shared/UserAvatar'

export function UsersPage() {
  const router = useRouter()
  const { user } = useStore()
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
        <h1>Поиск пользователей</h1>
        <p>Найдите любого пользователя на платформе</p>
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
                <UserAvatar user={u} size={100} showBadges={false} showFrame />
              </div>
              <div className={styles.userInfo}>
                <div className={styles.usernameRow}>
                  <h3>{u.username}</h3>
                  {u.badges && Array.isArray(u.badges) && u.badges.length > 0 && (
                    <div className={styles.badgesContainer}>
                      {u.badges.slice(0, 3).map((badge, idx) => (
                        <span key={idx} className={styles.badgeIcon} title={badge}>
                          {badge === 'staff' && '👑'}
                          {badge === 'verified' && '✓'}
                          {badge === 'premium' && '⭐'}
                          {badge === 'partner' && '🤝'}
                          {badge === 'creator' && '🎨'}
                          {!['staff', 'verified', 'premium', 'partner', 'creator'].includes(badge) && '🏆'}
                        </span>
                      ))}
                      {u.badges.length > 3 && (
                        <span className={styles.badgeMore}>+{u.badges.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
                {u.role && u.role !== 'user' && (
                  <div className={styles.adminBadge}>
                    <FiShield />
                    <span>Администратор</span>
                  </div>
                )}
                <p className={styles.subscribers}>
                  {u.subscribersCount ? `${u.subscribersCount} подписчиков` : 'Нет подписчиков'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
