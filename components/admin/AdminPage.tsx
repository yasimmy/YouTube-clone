'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { db } from '@/lib/db'
import { Video, User, AdminRole, UserBadge } from '@/types'
import { Report } from '@/types/admin'
import {
  FiUsers,
  FiVideo,
  FiFlag,
  FiEye,
  FiThumbsUp,
  FiTrash2,
  FiCheck,
  FiX,
  FiShield,
  FiKey,
  FiLock,
  FiUnlock,
  FiUserX,
  FiClock,
  FiActivity,
  FiSearch,
} from 'react-icons/fi'
import styles from './AdminPage.module.scss'
import toast from 'react-hot-toast'
import { getAdminPermissions } from '@/lib/admin-permissions'
import { AssignRoleModal } from './AssignRoleModal'
import { getCurrentSeason, getSeasonConfig, getAllSeasons, Season } from '@/lib/season'
import { notifyBadgeEarned } from '@/lib/notifications'
import { FeedbackSection } from './FeedbackSection'
import { LogsSection } from './LogsSection'

export function AdminPage() {
  const router = useRouter()
  const { user } = useStore()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVideos: 0,
    totalReports: 0,
    pendingReports: 0,
    totalViews: 0,
    totalLikes: 0,
  })
  const [reports, setReports] = useState<Report[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'videos' | 'users' | 'seasons' | 'badges' | 'feedback' | 'logs'>('dashboard')
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [assignRoleModal, setAssignRoleModal] = useState<{ isOpen: boolean; userId: string; currentRole?: string }>({
    isOpen: false,
    userId: '',
  })
  const [assignBadgeModal, setAssignBadgeModal] = useState<{ isOpen: boolean; userId: string }>({
    isOpen: false,
    userId: '',
  })
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  
  const permissions = user ? getAdminPermissions(user.role) : getAdminPermissions(undefined)

  useEffect(() => {
    // Check if user is admin
    if (!user) {
      toast.error('Войдите, чтобы получить доступ')
      router.push('/auth/login')
      return
    }

    // Check if user has admin role
    const adminRoles = ['own', 'admin1', 'admin2', 'admin3', 'admin4', 'admin5', 'admin6', 'admin7', 'admin8', 'admin9', 'admin10', 'admin', 'tech-admin']
    if (!adminRoles.includes(user.role || '')) {
      toast.error('Доступ запрещен')
      router.push('/')
      return
    }

    loadData()
  }, [user, router])

  const loadData = () => {
    try {
      // Ensure DB is initialized before loading
      if (typeof window !== 'undefined') {
        // Force initialization by accessing localStorage directly
        const storage = localStorage.getItem('yt2-storage')
        if (storage) {
          try {
            const parsed = JSON.parse(storage)
            if (parsed.state?.users) {
              // Force reload from storage
              db.users.getAll()
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
      
      const allUsers = db.users.getAll()
      const allVideos = db.videos.getAll()
      const allReports = db.reports.getAll()
      const pendingReports = db.reports.getPending()

      const totalViews = allVideos.reduce((sum, v) => sum + v.views, 0)
      const totalLikes = allVideos.reduce((sum, v) => sum + v.likes, 0)

      setStats({
        totalUsers: allUsers.length,
        totalVideos: allVideos.length,
        totalReports: allReports.length,
        pendingReports: pendingReports.length,
        totalViews,
        totalLikes,
      })

      setReports(allReports)
      setVideos(allVideos)
      setUsers(allUsers)
    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Ошибка загрузки данных')
    }
  }

  // Add storage event listener for cross-tab synchronization
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'yt2-storage') {
        // Reload data when storage changes
        loadData()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteVideo = (videoId: string) => {
    if (!permissions?.deleteVideos) {
      toast.error('У вас нет прав на удаление видео')
      return
    }

    if (!confirm('Вы уверены, что хотите удалить это видео?')) return

    db.videos.delete(videoId)
    toast.success('Видео удалено')
    loadData()
  }

  const handleDeleteUser = (userId: string) => {
    if (!permissions?.manageUsers) {
      toast.error('У вас нет прав на управление пользователями')
      return
    }

    if (userId === user?.id) {
      toast.error('Вы не можете удалить свой аккаунт')
      return
    }

    const targetUser = db.users.findById(userId)
    if (!targetUser) {
      toast.error('Пользователь не найден')
      return
    }

    if (!confirm(`Вы уверены, что хотите ПОЛНОСТЬЮ удалить аккаунт пользователя "${targetUser.username}"?\n\nЭто действие удалит:\n- Все видео пользователя\n- Все комментарии\n- Все подписки\n- Всю историю просмотров\n- Все плейлисты\n- Все лайки\n- Все сессии\n- Всю историю входов\n\nЭто действие необратимо!`)) {
      return
    }

    try {
      // Initialize DB if needed
      if (typeof window !== 'undefined') {
        db.users.getAll() // This initializes the DB
      }

      // Delete all comments by user first (including replies)
      const allComments = db.comments.getAll()
      const commentsToDelete: string[] = []
      
      // Find all comments by user and their replies
      allComments.forEach((comment) => {
        if (comment.userId === userId) {
          commentsToDelete.push(comment.id)
          // Find all replies to this comment
          const replies = allComments.filter((c) => c.parentId === comment.id)
          replies.forEach((reply) => {
            if (!commentsToDelete.includes(reply.id)) {
              commentsToDelete.push(reply.id)
            }
          })
        }
      })

      // Delete all found comments
      commentsToDelete.forEach((commentId) => {
        db.comments.delete(commentId)
      })

      // Delete user's videos (and comments on them)
      const userVideos = db.videos.findByUserId(userId)
      userVideos.forEach((video) => {
        // Delete all comments on user's videos
        const videoComments = db.comments.findByVideoId(video.id)
        videoComments.forEach((comment) => {
          // Delete replies to comments
          const allCommentsForReplies = db.comments.getAll()
          const replies = allCommentsForReplies.filter((c) => c.parentId === comment.id)
          replies.forEach((reply) => {
            db.comments.delete(reply.id)
          })
          db.comments.delete(comment.id)
        })
        db.videos.delete(video.id)
      })

      // Delete all subscriptions (user's subscriptions and subscriptions to user's channel)
      const allSubscriptions = db.subscriptions.getAll()
      allSubscriptions.forEach((sub) => {
        if (sub.userId === userId || sub.channelId === userId) {
          db.subscriptions.delete(sub.userId, sub.channelId)
        }
      })

      // Delete all likes by user
      const allLikes = db.likes.getAll()
      allLikes.forEach((like) => {
        if (like.userId === userId) {
          db.likes.delete(like.id)
        }
      })

      // Delete all playlists by user
      const allPlaylists = db.playlists.getAll()
      allPlaylists.forEach((playlist) => {
        if (playlist.userId === userId) {
          db.playlists.delete(playlist.id)
        }
      })

      // Delete watch history
      const allWatchHistory = db.watchHistory.getAll()
      allWatchHistory.forEach((history) => {
        if (history.userId === userId) {
          db.watchHistory.delete(history.id)
        }
      })

      // Delete active sessions
      db.sessions.deleteAll(userId)

      // Delete login history
      const allLoginHistory = db.loginHistory.getAll()
      allLoginHistory.forEach((history) => {
        if (history.userId === userId) {
          db.loginHistory.delete(history.id)
        }
      })

      // Finally, delete the user
      const deleted = db.users.delete(userId)
      
      if (deleted) {
        toast.success(`Аккаунт пользователя "${targetUser.username}" полностью удален`)
        loadData()
      } else {
        toast.error('Ошибка при удалении пользователя')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Ошибка при удалении пользователя')
    }
  }

  const handleBlockChannel = (channelId: string, days: number = 0) => {
    if (!permissions?.blockChannels || !user) {
      toast.error('У вас нет прав на блокировку каналов')
      return
    }

    if (channelId === user?.id) {
      toast.error('Вы не можете заблокировать свой аккаунт')
      return
    }

    const channel = db.users.findById(channelId)
    if (!channel) return

    const blockedUntil = days > 0 
      ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
      : undefined

    db.users.update(channelId, {
      isBlocked: true,
      blockedUntil,
    })

    // Log violation
    import('@/lib/logging').then(({ log }) => {
      log('warning', 'violation', `Пользователь ${channel.username} заблокирован`, {
        days,
        blockedUntil,
      }, channelId, user.id, channelId, 'block', user.id)
    })

    // Add activity
    import('@/lib/user-activity').then(({ addUserActivity }) => {
      addUserActivity({
        userId: channelId,
        type: 'block',
        description: days > 0 ? `Заблокирован на ${days} дней` : 'Заблокирован навсегда',
        adminId: user.id,
        details: { days, blockedUntil },
      })
    })

    toast.success(days > 0 ? `Канал заблокирован на ${days} дней` : 'Канал заблокирован навсегда')
    loadData()
  }

  const handleUnblockChannel = (channelId: string) => {
    if (!permissions?.blockChannels || !user) {
      toast.error('У вас нет прав на разблокировку каналов')
      return
    }

    const channel = db.users.findById(channelId)
    if (!channel) return

    db.users.update(channelId, {
      isBlocked: false,
      blockedUntil: undefined,
    })

    // Log unblock
    import('@/lib/logging').then(({ log }) => {
      log('info', 'violation', `Пользователь ${channel.username} разблокирован`, {}, channelId, user.id, channelId, 'unblock', user.id)
    })

    // Add activity
    import('@/lib/user-activity').then(({ addUserActivity }) => {
      addUserActivity({
        userId: channelId,
        type: 'unblock',
        description: 'Канал разблокирован',
        adminId: user.id,
      })
    })

    toast.success('Канал разблокирован')
    loadData()
  }

  const handleIssueWarning = (channelId: string) => {
    if (!permissions?.issueWarnings || !user) {
      toast.error('У вас нет прав на выдачу предупреждений')
      return
    }

    const channel = db.users.findById(channelId)
    if (!channel) return

    const newWarnings = (channel.warnings || 0) + 1
    db.users.update(channelId, {
      warnings: newWarnings,
    })

    // Log violation
    import('@/lib/logging').then(({ log }) => {
      log('warning', 'violation', `Выдано предупреждение пользователю ${channel.username}`, {
        warnings: newWarnings,
      }, channelId, user.id, channelId, 'warning', user.id)
    })

    // Add activity
    import('@/lib/user-activity').then(({ addUserActivity }) => {
      addUserActivity({
        userId: channelId,
        type: 'warning',
        description: `Выдано предупреждение (${newWarnings}/3)`,
        adminId: user.id,
      })
    })

    // Auto-block after 3 warnings
    if (newWarnings >= 3) {
      db.users.update(channelId, {
        isBlocked: true,
        blockedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })
      toast.success(`Выдано предупреждение (${newWarnings}/3). Канал автоматически заблокирован на 7 дней`)
    } else {
      toast.success(`Выдано предупреждение (${newWarnings}/3)`)
    }

    loadData()
  }

  const handleRemoveWarning = (channelId: string) => {
    if (!permissions?.issueWarnings || !user) {
      toast.error('У вас нет прав на снятие предупреждений')
      return
    }

    const channel = db.users.findById(channelId)
    if (!channel) return

    const currentWarnings = channel.warnings || 0
    if (currentWarnings <= 0) {
      toast.error('У канала нет предупреждений')
      return
    }

    const newWarnings = Math.max(0, currentWarnings - 1)
    db.users.update(channelId, {
      warnings: newWarnings,
    })

    // Log violation removal
    import('@/lib/logging').then(({ log }) => {
      log('info', 'violation', `Предупреждение снято у пользователя ${channel.username}`, {
        warnings: newWarnings,
      }, channelId, user.id, channelId, 'warning_removed', user.id)
    })

    // Add activity
    import('@/lib/user-activity').then(({ addUserActivity }) => {
      addUserActivity({
        userId: channelId,
        type: 'warning_removed',
        description: `Предупреждение снято (${newWarnings}/3)`,
        adminId: user.id,
      })
    })

    toast.success(`Предупреждение снято (${newWarnings}/3)`)
    loadData()
  }

  const handleAssignRole = (userId: string, newRole: AdminRole | 'user') => {
    if (!permissions?.assignAdminRoles || !user) {
      toast.error('У вас нет прав на назначение ролей')
      return
    }

    if (userId === user?.id) {
      toast.error('Вы не можете изменить свою роль')
      return
    }

    try {
      const targetUser = db.users.findById(userId)
      if (!targetUser) {
        toast.error('Пользователь не найден')
        return
      }

      const finalRole = newRole === 'user' ? 'user' : newRole
      const updated = db.users.update(userId, { role: finalRole })
      
      if (updated) {
        // Log role change
        import('@/lib/logging').then(({ log }) => {
          log('info', 'admin', `Роль пользователя ${targetUser.username} изменена на ${finalRole}`, {
            oldRole: targetUser.role,
            newRole: finalRole,
          }, userId, user.id, userId, 'role_change', user.id)
        })

        // Add activity
        import('@/lib/user-activity').then(({ addUserActivity }) => {
          addUserActivity({
            userId,
            type: 'role_change',
            description: `Роль изменена на ${finalRole === 'user' ? 'Обычный пользователь' : finalRole}`,
            adminId: user.id,
            details: { oldRole: targetUser.role, newRole: finalRole },
          })
        })

        toast.success(`Роль обновлена: ${finalRole === 'user' ? 'Обычный пользователь' : finalRole}`)
        loadData()
        setAssignRoleModal({ isOpen: false, userId: '' })
      } else {
        toast.error('Ошибка при обновлении роли')
      }
    } catch (error) {
      console.error('Error assigning role:', error)
      toast.error('Ошибка при обновлении роли')
    }
  }

  const handleAssignBadge = (userId: string, badges: UserBadge[]) => {
    const targetUser = db.users.findById(userId)
    if (!targetUser) return

    const currentBadges = Array.isArray(targetUser.badges) 
      ? targetUser.badges.filter((b): b is UserBadge => typeof b === 'string')
      : []
    
    // Filter out badges that user already has
    const newBadges = badges.filter(badge => !currentBadges.includes(badge))
    
    if (newBadges.length === 0) {
      toast.error('У пользователя уже есть все выбранные значки')
      return
    }

    const updatedBadges = [...currentBadges, ...newBadges]
    db.users.update(userId, {
      badges: updatedBadges,
    })

    // Notify user for each new badge
    newBadges.forEach(badge => {
      notifyBadgeEarned(userId, badge)
    })

    toast.success(`Выдано значков: ${newBadges.length}`)
    loadData()
    setAssignBadgeModal({ isOpen: false, userId: '' })
  }

  const handleResetPassword = async (userId: string) => {
    if (!permissions?.manageUsers || !user) {
      toast.error('У вас нет прав на сброс пароля')
      return
    }

    const targetUser = db.users.findById(userId)
    if (!targetUser) return

    const isAdmin = targetUser.email === 'admin@yt2.com' || targetUser.username === 'admin'
    const message = isAdmin 
      ? `Сбросить пароль админа на "admin" и разблокировать аккаунт?`
      : `Сбросить пароль для пользователя ${targetUser.username}?`

    if (confirm(message)) {
      try {
        const { resetUserPassword } = await import('@/lib/user-management')
        const success = await resetUserPassword(userId, user.id)
        if (success) {
          if (isAdmin) {
            toast.success('Пароль админа сброшен на "admin". Аккаунт разблокирован.')
          } else {
            toast.success('Пароль сброшен. Новый пароль отправлен пользователю.')
          }
          loadData()
        } else {
          toast.error('Ошибка при сбросе пароля')
        }
      } catch (error) {
        console.error('Password reset error:', error)
        toast.error('Ошибка при сбросе пароля')
      }
    }
  }

  const handleFreezeAccount = (userId: string) => {
    if (!permissions?.manageUsers || !user) {
      toast.error('У вас нет прав на заморозку аккаунта')
      return
    }

    const targetUser = db.users.findById(userId)
    if (!targetUser) return

    const reason = prompt('Причина заморозки (необязательно):')
    if (reason !== null) {
      import('@/lib/user-management').then(({ freezeAccount }) => {
        const success = freezeAccount(userId, user.id, reason || undefined)
        if (success) {
          toast.success('Аккаунт заморожен')
          loadData()
        } else {
          toast.error('Ошибка при заморозке аккаунта')
        }
      })
    }
  }

  const handleUnfreezeAccount = (userId: string) => {
    if (!permissions?.manageUsers || !user) {
      toast.error('У вас нет прав на разморозку аккаунта')
      return
    }

    import('@/lib/user-management').then(({ unfreezeAccount }) => {
      const success = unfreezeAccount(userId, user.id)
      if (success) {
        toast.success('Аккаунт разморожен')
        loadData()
      } else {
        toast.error('Ошибка при разморозке аккаунта')
      }
    })
  }

  const handleRemoveBadge = (userId: string, badge: UserBadge) => {
    const targetUser = db.users.findById(userId)
    if (!targetUser) return

    const currentBadges = Array.isArray(targetUser.badges)
      ? targetUser.badges.filter((b): b is UserBadge => typeof b === 'string')
      : []
    db.users.update(userId, {
      badges: currentBadges.filter((b) => b !== badge),
    })

    toast.success('Значок удален')
    loadData()
  }

  const openAssignRoleModal = (userId: string, currentRole?: string) => {
    setAssignRoleModal({ isOpen: true, userId, currentRole })
  }

  const handleReportAction = (reportId: string, action: 'resolve' | 'reject' | 'delete_video' | 'block_channel' | 'warn_channel') => {
    if (!user) return

    const report = db.reports.findById(reportId)
    if (!report) return

    if (action === 'delete_video' && report.videoId) {
      if (!permissions?.deleteVideos) {
        toast.error('У вас нет прав на удаление видео')
        return
      }
      db.videos.delete(report.videoId)
      db.reports.update(reportId, {
        status: 'resolved',
        reviewedBy: user.id,
        action: 'delete_video',
      })
      // Notify reporter
      import('@/lib/notifications').then(({ createNotification }) => {
        createNotification(report.userId, 'info', 'Ваша жалоба рассмотрена. Видео удалено за нарушение правил сообщества.', `/reports/${reportId}`)
      })
      toast.success('Видео удалено')
    } else if (action === 'block_channel' && report.channelId) {
      if (!permissions?.blockChannels) {
        toast.error('У вас нет прав на блокировку каналов')
        return
      }
      handleBlockChannel(report.channelId, 7)
      db.reports.update(reportId, {
        status: 'resolved',
        reviewedBy: user.id,
        action: 'block_channel',
      })
      // Notify reporter
      import('@/lib/notifications').then(({ createNotification }) => {
        createNotification(report.userId, 'info', 'Ваша жалоба рассмотрена. Канал заблокирован за нарушение правил сообщества.', `/reports/${reportId}`)
      })
    } else if (action === 'warn_channel' && report.channelId) {
      if (!permissions?.issueWarnings) {
        toast.error('У вас нет прав на выдачу предупреждений')
        return
      }
      handleIssueWarning(report.channelId)
      db.reports.update(reportId, {
        status: 'resolved',
        reviewedBy: user.id,
        action: 'warn_channel',
      })
      // Notify reporter
      import('@/lib/notifications').then(({ createNotification }) => {
        createNotification(report.userId, 'info', 'Ваша жалоба рассмотрена. Автору выдано предупреждение.', `/reports/${reportId}`)
      })
    } else if (action === 'resolve') {
      db.reports.update(reportId, {
        status: 'resolved',
        reviewedBy: user.id,
        action: 'none',
      })
      // Notify reporter
      import('@/lib/notifications').then(({ createNotification }) => {
        createNotification(report.userId, 'info', 'Ваша жалоба рассмотрена.', `/reports/${reportId}`)
      })
      toast.success('Жалоба разрешена')
    } else if (action === 'reject') {
      db.reports.update(reportId, {
        status: 'rejected',
        reviewedBy: user.id,
        action: 'none',
      })
      // Notify reporter
      import('@/lib/notifications').then(({ createNotification }) => {
        createNotification(report.userId, 'info', 'Ваша жалоба рассмотрена. Оснований для принятия мер не обнаружено.', `/reports/${reportId}`)
      })
      toast.success('Жалоба отклонена')
    }

    loadData()
  }

  const handleDeleteReport = (reportId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту жалобу?')) return
    
    const success = db.reports.delete(reportId)
    if (success) {
      toast.success('Жалоба удалена')
      loadData()
    } else {
      toast.error('Ошибка при удалении жалобы')
    }
  }

  const handleReportActionWithTemplate = (reportId: string, template: any) => {
    if (!user) return

    const report = db.reports.findById(reportId)
    if (!report) return

    // Execute template action
    if (template.action === 'delete_video' && report.videoId) {
      handleReportAction(reportId, 'delete_video')
    } else if (template.action === 'block_channel' && report.channelId) {
      handleReportAction(reportId, 'block_channel')
    } else if (template.action === 'warn_channel' && report.channelId) {
      handleReportAction(reportId, 'warn_channel')
    } else if (template.action === 'none') {
      handleReportAction(reportId, 'reject')
    }

    // Send auto response to user
    if (template.autoResponse) {
      import('@/lib/notifications').then(({ createNotification }) => {
        createNotification(report.userId, 'info', template.autoResponse, `/reports/${reportId}`)
      })
    }
  }

  if (!user || !permissions) {
    return null
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <FiShield className={styles.icon} />
          <h1>Админ панель</h1>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'dashboard' ? styles.active : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Дашборд
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'reports' ? styles.active : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Жалобы ({stats.pendingReports})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'videos' ? styles.active : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          Видео
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'users' ? styles.active : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Пользователи
        </button>
        {permissions?.assignAdminRoles && (
          <>
            <button
              className={`${styles.tab} ${activeTab === 'seasons' ? styles.active : ''}`}
              onClick={() => setActiveTab('seasons')}
            >
              Сезоны
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'badges' ? styles.active : ''}`}
              onClick={() => setActiveTab('badges')}
            >
              Значки
            </button>
          </>
        )}
        <button
          className={`${styles.tab} ${activeTab === 'feedback' ? styles.active : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          Отзывы
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'logs' ? styles.active : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          Логи
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'monitoring' ? styles.active : ''}`}
          onClick={() => setActiveTab('monitoring')}
        >
          Мониторинг
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'database' ? styles.active : ''}`}
          onClick={() => setActiveTab('database')}
        >
          База данных
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className={styles.dashboard}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <FiUsers className={styles.statIcon} />
              <div className={styles.statContent}>
                <h3>Пользователи</h3>
                <p className={styles.statValue}>{stats.totalUsers}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <FiVideo className={styles.statIcon} />
              <div className={styles.statContent}>
                <h3>Видео</h3>
                <p className={styles.statValue}>{stats.totalVideos}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <FiFlag className={styles.statIcon} />
              <div className={styles.statContent}>
                <h3>Жалобы</h3>
                <p className={styles.statValue}>
                  {stats.pendingReports} / {stats.totalReports}
                </p>
              </div>
            </div>
            <div className={styles.statCard}>
              <FiEye className={styles.statIcon} />
              <div className={styles.statContent}>
                <h3>Просмотры</h3>
                <p className={styles.statValue}>{stats.totalViews.toLocaleString()}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <FiThumbsUp className={styles.statIcon} />
              <div className={styles.statContent}>
                <h3>Лайки</h3>
                <p className={styles.statValue}>{stats.totalLikes.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className={styles.reports}>
          {reports.length === 0 ? (
            <div className={styles.empty}>Нет жалоб</div>
          ) : (
            <div className={styles.reportsList}>
              {reports.map((report) => {
                const video = report.videoId ? db.videos.findById(report.videoId) : null
                const channel = report.channelId ? db.users.findById(report.channelId) : null
                const reporter = db.users.findById(report.userId)
                return (
                  <div key={report.id} className={styles.reportCard}>
                    <div className={styles.reportHeader}>
                      <div>
                        <h3>
                          {video && `Жалоба на видео: ${video.title}`}
                          {channel && `Жалоба на канал: ${channel.username}`}
                          {!video && !channel && 'Жалоба'}
                        </h3>
                        <p className={styles.reportMeta}>
                          От: {reporter?.username || 'Неизвестно'} •{' '}
                          {new Date(report.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <span className={`${styles.status} ${styles[report.status]}`}>
                        {report.status === 'pending' && 'Ожидает'}
                        {report.status === 'resolved' && 'Разрешено'}
                        {report.status === 'rejected' && 'Отклонено'}
                        {report.status === 'reviewed' && 'Рассмотрено'}
                      </span>
                    </div>
                    <div className={styles.reportBody}>
                      <p>
                        <strong>Причина:</strong> {report.reason}
                      </p>
                      {report.description && (
                        <p>
                          <strong>Описание:</strong> {report.description}
                        </p>
                      )}
                      {video && (
                        <a
                          href={`/watch/${video.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.videoLink}
                        >
                          Открыть видео →
                        </a>
                      )}
                      {channel && (
                        <a
                          href={`/channel/${channel.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.videoLink}
                        >
                          Открыть канал →
                        </a>
                      )}
                      {report.action && report.action !== 'none' && (
                        <p className={styles.actionTaken}>
                          <strong>Действие:</strong>{' '}
                          {report.action === 'delete_video' && 'Видео удалено'}
                          {report.action === 'block_channel' && 'Канал заблокирован'}
                          {report.action === 'warn_channel' && 'Выдано предупреждение'}
                        </p>
                      )}
                      {(report.status === 'resolved' || report.status === 'rejected' || report.status === 'reviewed') && (
                        <div className={styles.resolvedReportActions}>
                          <button
                            className={styles.deleteReportButton}
                            onClick={() => handleDeleteReport(report.id)}
                            title="Удалить жалобу"
                          >
                            <FiTrash2 />
                            <span>Удалить</span>
                          </button>
                        </div>
                      )}
                    </div>
                    {report.status === 'pending' && (
                      <div className={styles.reportActions}>
                        <div className={styles.templatesSection}>
                          <label>Шаблоны решений:</label>
                          <select
                            className={styles.templateSelect}
                            onChange={(e) => {
                              if (e.target.value) {
                                import('@/lib/report-templates').then(({ getTemplateById }) => {
                                  const template = getTemplateById(e.target.value)
                                  if (template) {
                                    handleReportActionWithTemplate(report.id, template)
                                  }
                                })
                                e.target.value = ''
                              }
                            }}
                          >
                            <option value="">Выберите шаблон...</option>
                            <option value="spam-1">Спам контент</option>
                            <option value="harassment-1">Травля и оскорбления</option>
                            <option value="copyright-1">Нарушение авторских прав</option>
                            <option value="inappropriate-1">Неприемлемый контент</option>
                            <option value="reject-1">Жалоба отклонена</option>
                          </select>
                        </div>
                        {video && permissions?.deleteVideos && (
                          <button
                            className={styles.deleteButton}
                            onClick={() => handleReportAction(report.id, 'delete_video')}
                          >
                            <FiTrash2 />
                            Удалить видео
                          </button>
                        )}
                        {channel && permissions?.blockChannels && (
                          <button
                            className={styles.blockButton}
                            onClick={() => handleReportAction(report.id, 'block_channel')}
                          >
                            <FiShield />
                            Заблокировать канал
                          </button>
                        )}
                        {channel && permissions?.issueWarnings && (
                          <button
                            className={styles.warnButton}
                            onClick={() => handleReportAction(report.id, 'warn_channel')}
                          >
                            <FiShield />
                            Выдать предупреждение
                          </button>
                        )}
                        <button
                          className={styles.resolveButton}
                          onClick={() => handleReportAction(report.id, 'resolve')}
                        >
                          <FiCheck />
                          Разрешить
                        </button>
                        <button
                          className={styles.rejectButton}
                          onClick={() => handleReportAction(report.id, 'reject')}
                        >
                          <FiX />
                          Отклонить
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'videos' && (
        <div className={styles.videos}>
          {videos.length === 0 ? (
            <div className={styles.empty}>Нет видео</div>
          ) : (
            <div className={styles.videosList}>
              {videos.map((video) => {
                const videoUser = db.users.findById(video.userId)
                return (
                  <div key={video.id} className={styles.videoCard}>
                    <div className={styles.videoInfo}>
                      <h3>{video.title}</h3>
                      <p className={styles.videoMeta}>
                        Автор: {videoUser?.username} • Просмотры: {video.views} • Лайки: {video.likes}
                      </p>
                    </div>
                    <div className={styles.videoActions}>
                      <a
                        href={`/watch/${video.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.viewButton}
                      >
                        Открыть
                      </a>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDeleteVideo(video.id)}
                      >
                        <FiTrash2 />
                        Удалить
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className={styles.users}>
          <div className={styles.searchSection}>
            <div className={styles.searchInputWrapper}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Поиск по имени пользователя, email или ID..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              {userSearchQuery && (
                <button
                  className={styles.clearSearch}
                  onClick={() => setUserSearchQuery('')}
                >
                  <FiX />
                </button>
              )}
            </div>
            <div className={styles.searchStats}>
              Найдено: {users.filter(u => {
                if (!userSearchQuery) return true
                const query = userSearchQuery.toLowerCase()
                return u.username.toLowerCase().includes(query) ||
                       u.email.toLowerCase().includes(query) ||
                       u.id.toLowerCase().includes(query)
              }).length} из {users.length}
            </div>
          </div>
          {users.length === 0 ? (
            <div className={styles.empty}>Нет пользователей</div>
          ) : (
            <div className={styles.usersList}>
              {users.filter(u => {
                if (!userSearchQuery) return true
                const query = userSearchQuery.toLowerCase()
                return u.username.toLowerCase().includes(query) ||
                       u.email.toLowerCase().includes(query) ||
                       u.id.toLowerCase().includes(query)
              }).map((u) => {
                const userVideos = db.videos.findByUserId(u.id)
                return (
                  <div key={u.id} className={styles.userCardEnhanced}>
                    <div className={styles.userCardHeader}>
                      <div className={styles.userAvatar}>
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.username} />
                        ) : (
                          <div className={styles.avatarPlaceholder}>
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className={styles.userCardInfo}>
                        <h3>{u.username}</h3>
                        <p className={styles.userEmail}>{u.email}</p>
                        <div className={styles.userStats}>
                          <span>👥 {u.subscribersCount || 0}</span>
                          <span>📹 {userVideos.length}</span>
                          {u.warnings && u.warnings > 0 && (
                            <span className={styles.warningCount}>⚠ {u.warnings}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={styles.userCardActions}>
                      <a
                        href={`/channel/${u.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.actionButton}
                      >
                        <FiEye /> Профиль
                      </a>
                      {u.id !== user?.id && (
                        <>
                          {permissions?.assignAdminRoles && (
                            <button
                              className={styles.actionButton}
                              onClick={() => openAssignRoleModal(u.id, u.role)}
                            >
                              <FiShield /> Роль
                            </button>
                          )}
                          {permissions?.blockChannels && (
                            <>
                              {u.isBlocked ? (
                                <button
                                  className={`${styles.actionButton} ${styles.successButton}`}
                                  onClick={() => handleUnblockChannel(u.id)}
                                >
                                  <FiCheck /> Разблокировать
                                </button>
                              ) : (
                                <button
                                  className={`${styles.actionButton} ${styles.dangerButton}`}
                                  onClick={() => handleBlockChannel(u.id, 7)}
                                >
                                  <FiX /> Заблокировать
                                </button>
                              )}
                            </>
                          )}
                          {permissions?.issueWarnings && (
                            <>
                              <button
                                className={`${styles.actionButton} ${styles.warningButton}`}
                                onClick={() => handleIssueWarning(u.id)}
                              >
                                ⚠ Предупреждение
                              </button>
                              {u.warnings && u.warnings > 0 && (
                                <button
                                  className={`${styles.actionButton} ${styles.removeWarnButton}`}
                                  onClick={() => handleRemoveWarning(u.id)}
                                  title="Снять предупреждение"
                                >
                                  ✓ Снять
                                </button>
                              )}
                            </>
                          )}
                          {permissions?.manageUsers && (
                            <>
                              <button
                                className={styles.actionButton}
                                onClick={() => handleResetPassword(u.id)}
                                title="Сбросить пароль"
                              >
                                <FiKey /> Сброс пароля
                              </button>
                              {u.isBlocked ? (
                                <button
                                  className={styles.actionButton}
                                  onClick={() => handleUnfreezeAccount(u.id)}
                                  title="Разморозить аккаунт"
                                >
                                  <FiUnlock /> Разморозить
                                </button>
                              ) : (
                                <button
                                  className={styles.actionButton}
                                  onClick={() => handleFreezeAccount(u.id)}
                                  title="Заморозить аккаунт"
                                >
                                  <FiLock /> Заморозить
                                </button>
                              )}
                              <button
                                className={`${styles.actionButton} ${styles.dangerButton}`}
                                onClick={() => handleDeleteUser(u.id)}
                              >
                                <FiTrash2 /> Удалить
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}


      {activeTab === 'seasons' && permissions?.assignAdminRoles && (
        <div className={styles.seasons}>
          <div className={styles.seasonsInfo}>
            <h2>Управление сезонами</h2>
            <p>Измените текущий сезон для всего сайта</p>
          </div>
          <SeasonSelector />
        </div>
      )}

      {activeTab === 'badges' && permissions?.assignAdminRoles && (
        <div className={styles.badges}>
          <div className={styles.badgesInfo}>
            <h2>Управление значками</h2>
            <p>Выдавайте значки пользователям</p>
          </div>
          <div className={styles.usersList}>
            {users.map((u) => (
              <div key={u.id} className={styles.userCard}>
                <div className={styles.userInfo}>
                  <h3>{u.username}</h3>
                  <p className={styles.userMeta}>
                    {u.email} • Значки: {u.badges?.length || 0}
                  </p>
                  {u.badges && Array.isArray(u.badges) && u.badges.length > 0 && (
                    <div className={styles.userBadges}>
                      {u.badges.filter((b): b is UserBadge => typeof b === 'string').map((badge) => (
                        <span key={badge} className={styles.badge}>
                          {badge}
                          <button
                            className={styles.removeBadge}
                            onClick={() => handleRemoveBadge(u.id, badge)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className={styles.badgeActions}>
                  <button
                    className={styles.assignBadgeButton}
                    onClick={() => setAssignBadgeModal({ isOpen: true, userId: u.id })}
                  >
                    Выдать значок
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className={styles.feedback}>
          <FeedbackSection />
        </div>
      )}

      {activeTab === 'logs' && (
        <div className={styles.logs}>
          <LogsSection />
        </div>
      )}

      {activeTab === 'monitoring' && (
        <div className={styles.monitoring}>
          <h2>Live-мониторинг нагрузки</h2>
          <div className={styles.monitoringGrid}>
            <div className={styles.monitorCard}>
              <h3>Активные пользователи</h3>
              <div className={styles.monitorValue}>{users.filter(u => u).length}</div>
              <div className={styles.monitorTrend}>↗ +12% за час</div>
            </div>
            <div className={styles.monitorCard}>
              <h3>Запросов/сек</h3>
              <div className={styles.monitorValue}>{Math.floor(Math.random() * 50 + 100)}</div>
              <div className={styles.monitorTrend}>↗ Стабильно</div>
            </div>
            <div className={styles.monitorCard}>
              <h3>Нагрузка CPU</h3>
              <div className={styles.monitorValue}>{Math.floor(Math.random() * 20 + 30)}%</div>
              <div className={styles.monitorTrend}>→ Норма</div>
            </div>
            <div className={styles.monitorCard}>
              <h3>Память</h3>
              <div className={styles.monitorValue}>{Math.floor(Math.random() * 10 + 45)}%</div>
              <div className={styles.monitorTrend}>→ Норма</div>
            </div>
          </div>
          <div className={styles.monitoringChart}>
            <h3>График нагрузки (последние 24 часа)</h3>
            <div className={styles.chartPlaceholder}>
              <p>График загрузки системы</p>
              <div className={styles.chartBars}>
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className={styles.chartBar}
                    style={{ height: `${Math.random() * 60 + 20}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'database' && (
        <div className={styles.database}>
          <h2>Графики базы данных</h2>
          <div className={styles.dbStats}>
            <div className={styles.dbStatCard}>
              <h3>Пользователи</h3>
              <div className={styles.dbStatValue}>{stats.totalUsers}</div>
              <div className={styles.dbStatChart}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className={styles.dbBar} style={{ height: `${Math.random() * 80 + 10}%` }} />
                ))}
              </div>
            </div>
            <div className={styles.dbStatCard}>
              <h3>Видео</h3>
              <div className={styles.dbStatValue}>{stats.totalVideos}</div>
              <div className={styles.dbStatChart}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className={styles.dbBar} style={{ height: `${Math.random() * 80 + 10}%` }} />
                ))}
              </div>
            </div>
            <div className={styles.dbStatCard}>
              <h3>Комментарии</h3>
              <div className={styles.dbStatValue}>{db.comments.getAll().length}</div>
              <div className={styles.dbStatChart}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className={styles.dbBar} style={{ height: `${Math.random() * 80 + 10}%` }} />
                ))}
              </div>
            </div>
          </div>
          <div className={styles.dbOperations}>
            <h3>Операции с БД</h3>
            <div className={styles.dbOpsList}>
              <div className={styles.dbOp}>
                <span>SELECT users</span>
                <span className={styles.dbOpTime}>2.3ms</span>
              </div>
              <div className={styles.dbOp}>
                <span>SELECT videos</span>
                <span className={styles.dbOpTime}>1.8ms</span>
              </div>
              <div className={styles.dbOp}>
                <span>INSERT comment</span>
                <span className={styles.dbOpTime}>0.9ms</span>
              </div>
            </div>
          </div>
        </div>
      )}


      <AssignRoleModal
        isOpen={assignRoleModal.isOpen}
        onClose={() => setAssignRoleModal({ isOpen: false, userId: '' })}
        userId={assignRoleModal.userId}
        currentRole={assignRoleModal.currentRole}
        onAssign={handleAssignRole}
      />

      {assignBadgeModal.isOpen && (
        <BadgeModal
          isOpen={assignBadgeModal.isOpen}
          onClose={() => setAssignBadgeModal({ isOpen: false, userId: '' })}
          userId={assignBadgeModal.userId}
          onAssign={handleAssignBadge}
        />
      )}

      {showUserDetails && selectedUserId && (
        <UserDetailsModal
          isOpen={showUserDetails}
          onClose={() => {
            setShowUserDetails(false)
            setSelectedUserId(null)
          }}
          userId={selectedUserId}
        />
      )}
    </div>
  )
}

// User Details Modal Component
function UserDetailsModal({ isOpen, onClose, userId }: { isOpen: boolean; onClose: () => void; userId: string }) {
  const [activities, setActivities] = useState<any[]>([])
  const [authLogs, setAuthLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const user = db.users.findById(userId)

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true)
      Promise.all([
        import('@/lib/user-activity').then(m => m.getUserActivities(userId, 100)),
        import('@/lib/user-activity').then(m => m.getUserAuthLogs(userId, 100)),
      ]).then(([acts, logs]) => {
        setActivities(acts)
        setAuthLogs(logs)
        setLoading(false)
      })
    }
  }, [isOpen, userId])

  if (!isOpen || !user) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>История активности: {user.username}</h2>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.activitySection}>
            <h3>История активности</h3>
            {loading ? (
              <div>Загрузка...</div>
            ) : activities.length === 0 ? (
              <div className={styles.empty}>Нет активности</div>
            ) : (
              <div className={styles.activityList}>
                {activities.map((activity) => (
                  <div key={activity.id} className={styles.activityItem}>
                    <div className={styles.activityType}>{activity.type}</div>
                    <div className={styles.activityDescription}>{activity.description}</div>
                    <div className={styles.activityDate}>
                      {new Date(activity.timestamp).toLocaleString('ru-RU')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={styles.authSection}>
            <h3>Журнал авторизации</h3>
            {loading ? (
              <div>Загрузка...</div>
            ) : authLogs.length === 0 ? (
              <div className={styles.empty}>Нет записей</div>
            ) : (
              <div className={styles.authList}>
                {authLogs.map((log) => (
                  <div key={log.id} className={`${styles.authItem} ${log.suspicious ? styles.suspicious : ''}`}>
                    <div className={styles.authInfo}>
                      <span className={styles.authSuccess}>{log.success ? '✓' : '✗'}</span>
                      <span>{log.device} • {log.ip}</span>
                    </div>
                    <div className={styles.authDate}>
                      {new Date(log.timestamp).toLocaleString('ru-RU')}
                    </div>
                    {log.suspicious && <span className={styles.suspiciousBadge}>Подозрительно</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function BadgeModal({
  isOpen,
  onClose,
  userId,
  onAssign,
}: {
  isOpen: boolean
  onClose: () => void
  userId: string
  onAssign: (userId: string, badges: UserBadge[]) => void
}) {
  const [selectedBadges, setSelectedBadges] = useState<UserBadge[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      setSelectedBadges([])
    }
  }, [isOpen])

  const badges: UserBadge[] = [
    'staff',
    'verified',
    'premium',
    'partner',
    'creator',
    'pumpkin',
    'golden-leaf',
    'santa',
    'ice-master',
    'winter-king',
    'february-heart',
    'sprout',
    'blooming',
    'spring-keeper',
    'beach-goer',
    'sun-lord',
  ]

  const toggleBadge = (badge: UserBadge) => {
    setSelectedBadges(prev => 
      prev.includes(badge)
        ? prev.filter(b => b !== badge)
        : [...prev, badge]
    )
  }

  const handleAssign = () => {
    if (selectedBadges.length === 0) {
      toast.error('Выберите хотя бы один значок')
      return
    }
    onAssign(userId, selectedBadges)
    setSelectedBadges([])
  }

  if (!isOpen && !mounted) return null

  return (
    <div 
      className={`${styles.modalOverlay} ${isOpen ? styles.overlayVisible : ''}`}
      onClick={onClose}
    >
      <div 
        className={`${styles.modal} ${isOpen ? styles.modalVisible : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2>Выдать значки</h2>
          <button className={styles.closeIcon} onClick={onClose}>
            <FiX />
          </button>
        </div>
        <p className={styles.modalDescription}>
          Выберите один или несколько значков для выдачи. Выбрано: {selectedBadges.length}
        </p>
        <div className={styles.badgesGrid}>
          {badges.map((badge) => {
            const isSelected = selectedBadges.includes(badge)
            return (
              <button
                key={badge}
                className={`${styles.badgeOption} ${isSelected ? styles.selected : ''}`}
                onClick={() => toggleBadge(badge)}
              >
                {isSelected && <FiCheck className={styles.checkIcon} />}
                {badge}
              </button>
            )
          })}
        </div>
        <div className={styles.modalActions}>
          <button className={styles.cancelButton} onClick={onClose}>
            Отмена
          </button>
          <button 
            className={styles.assignButton} 
            onClick={handleAssign}
            disabled={selectedBadges.length === 0}
          >
            Выдать ({selectedBadges.length})
          </button>
        </div>
      </div>
    </div>
  )
}

function SeasonSelector() {
  const [currentSeason, setCurrentSeason] = useState<Season>(getCurrentSeason())
  const [customSeason, setCustomSeason] = useState<Season | null>(null)
  const seasons = getAllSeasons()

  useEffect(() => {
    // Check if there's a custom season set
    const savedSeason = localStorage.getItem('yt2-custom-season') as Season | null
    if (savedSeason && Object.keys(seasons).includes(savedSeason)) {
      setCustomSeason(savedSeason)
      setCurrentSeason(savedSeason)
    }
  }, [])

  const handleSeasonChange = (season: Season) => {
    setCustomSeason(season)
    setCurrentSeason(season)
    localStorage.setItem('yt2-custom-season', season)
    
    // Apply season to document
    document.documentElement.setAttribute('data-season', season)
    const seasonConfig = getSeasonConfig(season)
    
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.style.setProperty('--season-primary', seasonConfig.colors.primary)
      root.style.setProperty('--season-secondary', seasonConfig.colors.secondary)
      root.style.setProperty('--season-accent', seasonConfig.colors.accent)
      root.style.setProperty('--season-gradient', seasonConfig.colors.gradient)
    }
    
    toast.success(`Сезон изменен на ${seasonConfig.name} ${seasonConfig.emoji}`)
  }

  const handleResetSeason = () => {
    setCustomSeason(null)
    localStorage.removeItem('yt2-custom-season')
    const autoSeason = getCurrentSeason()
    setCurrentSeason(autoSeason)
    
    document.documentElement.setAttribute('data-season', autoSeason)
    const seasonConfig = getSeasonConfig(autoSeason)
    
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.style.setProperty('--season-primary', seasonConfig.colors.primary)
      root.style.setProperty('--season-secondary', seasonConfig.colors.secondary)
      root.style.setProperty('--season-accent', seasonConfig.colors.accent)
      root.style.setProperty('--season-gradient', seasonConfig.colors.gradient)
    }
    
    toast.success('Сезон сброшен на автоматический')
  }

  return (
    <div className={styles.seasonSelector}>
      <div className={styles.currentSeason}>
        <h3>Текущий сезон</h3>
        <div className={styles.seasonCard}>
          <div className={styles.seasonEmoji}>{seasons[currentSeason].emoji}</div>
          <div className={styles.seasonInfo}>
            <h4>{seasons[currentSeason].name}</h4>
            <p>{customSeason ? 'Установлен вручную' : 'Автоматический (по дате)'}</p>
          </div>
        </div>
      </div>

      <div className={styles.seasonOptions}>
        <h3>Выберите сезон</h3>
        <div className={styles.seasonsGrid}>
          {(Object.keys(seasons) as Season[]).map((season) => {
            const config = seasons[season]
            const isActive = currentSeason === season
            return (
              <button
                key={season}
                className={`${styles.seasonOption} ${isActive ? styles.active : ''}`}
                onClick={() => handleSeasonChange(season)}
                style={{
                  background: isActive ? config.colors.gradient : 'var(--bg-secondary)',
                  borderColor: isActive ? config.colors.accent : 'var(--border-color)',
                }}
              >
                <div className={styles.seasonOptionEmoji}>{config.emoji}</div>
                <div className={styles.seasonOptionName}>{config.name}</div>
                {isActive && <div className={styles.seasonActiveBadge}>Активен</div>}
              </button>
            )
          })}
        </div>
        {customSeason && (
          <button className={styles.resetButton} onClick={handleResetSeason}>
            Сбросить на автоматический
          </button>
        )}
      </div>
    </div>
  )
}

