'use client'

import { useEffect, useState } from 'react'
import { Notification } from '@/types'
import { useStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { FiBell, FiX, FiVideo, FiTrash2, FiAlertTriangle, FiShield, FiAward, FiCalendar, FiStar } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Notifications.module.scss'
import { db } from '@/lib/db'
import toast from 'react-hot-toast'

export function Notifications() {
  const { user } = useStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return

    // Load notifications from localStorage (will be replaced with API)
    const loadNotifications = () => {
      try {
        const stored = localStorage.getItem(`notifications_${user.id}`)
        if (stored) {
          const parsed = JSON.parse(stored) as Notification[]
          setNotifications(parsed)
          setUnreadCount(parsed.filter(n => !n.read).length)
        }
      } catch (e) {
        console.error('Error loading notifications:', e)
      }
    }

    loadNotifications()

    // Check for new notifications periodically
    const interval = setInterval(loadNotifications, 5000)
    return () => clearInterval(interval)
  }, [user])

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    )
    setNotifications(updated)
    setUnreadCount(updated.filter(n => !n.read).length)
    
    if (user) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated))
    }
  }

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotifications(updated)
    setUnreadCount(0)
    
    if (user) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated))
    }
  }

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id)
    setNotifications(updated)
    setUnreadCount(updated.filter(n => !n.read).length)
    
    if (user) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated))
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_video':
      case 'subscription':
        return <FiVideo />
      case 'video_deleted':
        return <FiTrash2 />
      case 'warning':
        return <FiAlertTriangle />
      case 'channel_blocked':
        return <FiShield />
      case 'badge_earned':
        return <FiAward />
      case 'season_changed':
        return <FiCalendar />
      case 'new_feature':
        return <FiStar />
      default:
        return <FiBell />
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'new_video':
      case 'subscription':
        return '#4CAF50'
      case 'video_deleted':
        return '#f44336'
      case 'warning':
        return '#ff9800'
      case 'channel_blocked':
        return '#f44336'
      case 'badge_earned':
        return '#ffd700'
      case 'season_changed':
        return '#9c27b0'
      case 'new_feature':
        return '#2196F3'
      default:
        return '#757575'
    }
  }

  if (!user) return null

  return (
    <div className={styles.notificationsContainer}>
      <button
        className={styles.notificationsButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Уведомления"
      >
        <FiBell />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.notificationsDropdown}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.notificationsHeader}>
              <h3>Уведомления</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className={styles.markAllRead}>
                  Отметить все как прочитанные
                </button>
              )}
            </div>

            <div className={styles.notificationsList}>
              {notifications.length === 0 ? (
                <div className={styles.empty}>Нет уведомлений</div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                    onClick={() => {
                      markAsRead(notification.id)
                      if (notification.link) {
                        window.location.href = notification.link
                      }
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={styles.notificationIcon}
                      style={{ color: getNotificationColor(notification.type) }}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className={styles.notificationContent}>
                      <div className={styles.notificationTitle}>{notification.title}</div>
                      {notification.message && (
                        <div className={styles.notificationMessage}>{notification.message}</div>
                      )}
                      <div className={styles.notificationTime}>
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: ru,
                        })}
                      </div>
                    </div>
                    <button
                      className={styles.deleteButton}
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                    >
                      <FiX />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


