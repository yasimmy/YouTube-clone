'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { User, Video } from '@/types'
import { db } from '@/lib/db'
import { useStore } from '@/lib/store'
import { VideoCard } from '@/components/video/VideoCard'
import { FiUserPlus, FiUserCheck, FiSettings, FiVideo, FiCheck, FiAlertTriangle, FiShield, FiAward } from 'react-icons/fi'
import { ShareButton } from '@/components/shared/ShareButton'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { OfficialChannelWelcome } from '@/components/channel/OfficialChannelWelcome'
import { UserBadge } from '@/types'
import { FiHeart, FiSun, FiZap, FiStar } from 'react-icons/fi'
import { LuLeaf, LuSnowflake, LuSprout, LuFlower2 } from 'react-icons/lu'
import styles from './ChannelPage.module.scss'
import toast from 'react-hot-toast'

interface ChannelPageProps {
  channelId: string
}

export function ChannelPage({ channelId }: ChannelPageProps) {
  const { user } = useStore()
  const [channel, setChannel] = useState<User | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'videos' | 'badges'>('videos')

  useEffect(() => {
    setLoading(true)
    
    // Load channel data
    const channelData = db.users.findById(channelId)
    if (!channelData) {
      setLoading(false)
      return
    }

    setChannel(channelData)
    
    // Load videos
    const channelVideos = db.videos.findByUserId(channelId)
    
    // Filter videos based on privacy and ownership
    const isOwnChannel = user?.id === channelId
    const filteredVideos = channelVideos.filter((video) => {
      if (isOwnChannel) return true // Show all videos to owner
      if (video.privacy === 'public') return true
      if (video.privacy === 'subscribers' && user) {
        return db.subscriptions.isSubscribed(user.id, channelId)
      }
      return false
    })
    setVideos(filteredVideos)

    // Check subscription
    if (user) {
      setIsSubscribed(db.subscriptions.isSubscribed(user.id, channelId))
    } else {
      setIsSubscribed(false)
    }

    setLoading(false)
  }, [channelId, user])

  const handleSubscribe = () => {
    if (!user) {
      toast.error('Войдите, чтобы подписаться')
      return
    }

    if (!channel) return

    // Prevent self-subscription
    if (user.id === channel.id) {
      toast.error('Вы не можете подписаться на свой канал')
      return
    }

    if (isSubscribed) {
      db.subscriptions.delete(user.id, channel.id)
      setIsSubscribed(false)
      setChannel({ ...channel, subscribersCount: channel.subscribersCount - 1 })
      toast.success('Отписка выполнена')
    } else {
      db.subscriptions.create({
        userId: user.id,
        channelId: channel.id,
      })
      setIsSubscribed(true)
      setChannel({ ...channel, subscribersCount: channel.subscribersCount + 1 })
      toast.success('Подписка оформлена')
      
      // Award currency to channel owner
      if (typeof window !== 'undefined') {
        import('@/lib/currency-rewards').then(({ rewardSubscriberToAuthor }) => {
          rewardSubscriberToAuthor(channel.id)
        })
      }
    }
  }

  const formatSubscribers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}М подписчиков`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}К подписчиков`
    }
    return `${count} подписчиков`
  }

  if (loading || !channel) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    )
  }

  // Ensure channel has all required properties
  const safeChannel = {
    ...channel,
    isOfficial: channel.isOfficial || false,
    isBlocked: channel.isBlocked || false,
    warnings: channel.warnings || 0,
    subscribersCount: channel.subscribersCount || 0,
  }

  return (
    <div className={`${styles.channelPage} ${styles.fadeIn}`}>
      {safeChannel.isOfficial && <OfficialChannelWelcome />}
      <div className={`${styles.banner} ${styles.fadeInScale}`}>
        {safeChannel.banner ? (
          <img src={safeChannel.banner} alt={safeChannel.username} />
        ) : (
          <div className={styles.bannerPlaceholder}>
            <div className={styles.bannerGradient}></div>
          </div>
        )}
      </div>

      <div className={`${styles.channelInfo} ${styles.slideUp}`}>
        <div className={styles.avatarSection}>
          <UserAvatar user={safeChannel} size={120} showBadges showFrame />
        </div>

        <div className={styles.infoSection}>
          <h1 className={`${styles.channelName} ${safeChannel.isOfficial ? styles.official : ''} ${safeChannel.nicknameHighlight === 'White Sparkles' ? styles.sparkles : ''}`}>
            {safeChannel.username}
            {safeChannel.isOfficial && (
              <span className={styles.verifiedBadge} title="Официальный канал">
                <FiCheck />
              </span>
            )}
            {safeChannel.isBlocked && (
              <span className={styles.blockedBadge} title="Канал заблокирован">
                <FiShield />
              </span>
            )}
            {safeChannel.warnings && safeChannel.warnings > 0 && !safeChannel.isBlocked && (
              <span className={styles.warningBadge} title={`${safeChannel.warnings} предупреждений`}>
                <FiAlertTriangle />
                <span>{safeChannel.warnings > 0 ? safeChannel.warnings : ''}</span>
              </span>
            )}
          </h1>
          <div className={styles.stats}>
            <span className={styles.subscribers}>{formatSubscribers(safeChannel.subscribersCount)}</span>
            <span className={styles.videosCount}>{videos.length} видео</span>
            {safeChannel.isBlocked && safeChannel.blockedUntil && (
              <div className={styles.blockedNotice}>
                <div className={styles.blockedIcon}>
                  <FiShield />
                </div>
                <div className={styles.blockedInfo}>
                  <span className={styles.blockedTitle}>⚠ Канал заблокирован до</span>
                  <span className={styles.blockedDate}>
                    {new Date(safeChannel.blockedUntil).toLocaleDateString('ru-RU', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
          {safeChannel.description && 
           safeChannel.description.trim() !== '' && 
           safeChannel.description !== '0' && 
           safeChannel.description.trim() !== '0' &&
           !safeChannel.description.match(/^0+$/) && (
            <p className={styles.description}>{safeChannel.description}</p>
          )}
        </div>

        <div className={styles.actionsSection}>
          {user?.id === safeChannel.id ? (
            <Link href="/settings" className={styles.settingsButton}>
              <FiSettings />
              <span>Настройки канала</span>
            </Link>
          ) : (
            <>
              <div className={styles.subscribeButtonWrapper}>
                <button
                  className={`${styles.subscribeButton} ${isSubscribed ? styles.subscribed : ''}`}
                  onClick={handleSubscribe}
                  disabled={safeChannel.isBlocked}
                >
                  {isSubscribed ? (
                    <>
                      <FiUserCheck />
                      <span>Подписка оформлена</span>
                    </>
                  ) : (
                    <>
                      <FiUserPlus />
                      <span>Подписаться</span>
                    </>
                  )}
                </button>
              </div>
              <ShareButton url={`/channel/${safeChannel.id}`} title={safeChannel.username} type="channel" />
            </>
          )}
        </div>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'videos' ? styles.active : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          <FiVideo />
          <span>Видео</span>
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'badges' ? styles.active : ''}`}
          onClick={() => setActiveTab('badges')}
        >
          <FiAward />
          <span>Значки</span>
        </button>
      </div>

      {activeTab === 'videos' && (
      <div className={`${styles.videosSection} ${styles.fadeIn}`}>
        {videos.length === 0 ? (
          <div className={`${styles.empty} ${styles.fadeInScale}`}>
            <FiVideo className={styles.emptyIcon} />
            <h3>Нет загруженных видео</h3>
            {user?.id === safeChannel.id && (
              <Link href="/upload" className={styles.uploadLink}>
                Загрузить первое видео
              </Link>
            )}
          </div>
        ) : (
          <div className={styles.videoGrid}>
            {videos.map((video, index) => (
              <div key={video.id} className={styles.videoCardWrapper} style={{ animationDelay: `${index * 0.05}s` }}>
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {activeTab === 'badges' && (
        <div className={`${styles.badgesSection} ${styles.fadeIn}`}>
          <ChannelBadges user={safeChannel} />
        </div>
      )}
    </div>
  )
}

// Component to display all user badges
function ChannelBadges({ user }: { user: User }) {
  const badges = Array.isArray(user.badges) ? user.badges.filter((b): b is UserBadge => typeof b === 'string') : []
  
  // Auto-assign staff badge if user has admin role
  const allBadges: UserBadge[] = [...badges]
  if (user.role && user.role !== 'user') {
    if (!allBadges.includes('staff')) {
      allBadges.push('staff')
    }
  }

  if (allBadges.length === 0) {
    return (
      <div className={styles.empty}>
        <FiAward className={styles.emptyIcon} />
        <h3>Нет значков</h3>
        <p>У этого пользователя пока нет значков</p>
      </div>
    )
  }

  return (
    <div className={styles.badgesGrid}>
      {allBadges.map((badge) => (
        <BadgeCard key={badge} badge={badge} />
      ))}
    </div>
  )
}

// Badge rarity system
type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary'

const badgeRarity: Record<UserBadge, BadgeRarity> = {
  staff: 'legendary',
  verified: 'epic',
  premium: 'epic',
  partner: 'legendary',
  creator: 'rare',
  pumpkin: 'common',
  'golden-leaf': 'rare',
  santa: 'rare',
  'ice-master': 'epic',
  'winter-king': 'legendary',
  'february-heart': 'rare',
  sprout: 'common',
  blooming: 'rare',
  'spring-keeper': 'epic',
  'beach-goer': 'rare',
  'sun-lord': 'legendary',
}

const rarityColors: Record<BadgeRarity, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
}

const rarityLabels: Record<BadgeRarity, string> = {
  common: 'Обычный',
  rare: 'Редкий',
  epic: 'Эпический',
  legendary: 'Легендарный',
}

// Badge card component
function BadgeCard({ badge }: { badge: UserBadge }) {
  const badgeIcons: Partial<Record<UserBadge, React.ReactNode>> = {
    staff: <FiShield />,
    verified: <FiCheck />,
    premium: <FiStar />,
    partner: <FiAward />,
    creator: <FiZap />,
    pumpkin: <FiStar />,
    'golden-leaf': <LuLeaf />,
    santa: <FiAward />,
    'ice-master': <LuSnowflake />,
    'winter-king': <LuSnowflake />,
    'february-heart': <FiHeart />,
    sprout: <LuSprout />,
    blooming: <FiStar />,
    'spring-keeper': <LuFlower2 />,
    'beach-goer': <FiSun />,
    'sun-lord': <FiSun />,
  }

  const badgeLabels: Record<UserBadge, string> = {
    staff: 'Сотрудник YT',
    verified: 'Верифицированный',
    premium: 'Премиум',
    partner: 'Партнер',
    creator: 'Креатор',
    pumpkin: 'Тыквочка',
    'golden-leaf': 'Золотой лист',
    santa: 'Санта',
    'ice-master': 'Ледяной мастер',
    'winter-king': 'Король зимы',
    'february-heart': 'Февральское сердце',
    sprout: 'Росточек',
    blooming: 'Цветущий',
    'spring-keeper': 'Хранитель Весны',
    'beach-goer': 'Пляжник',
    'sun-lord': 'Повелитель солнца',
  }

  const badgeIcon = badgeIcons[badge] || <FiStar />
  const badgeLabel = badgeLabels[badge] || badge
  const rarity = badgeRarity[badge] || 'common'
  const rarityColor = rarityColors[rarity]
  const rarityLabel = rarityLabels[rarity]

  return (
    <div className={styles.badgeCard} data-rarity={rarity}>
      <div className={styles.rarityBadge} style={{ backgroundColor: rarityColor }}>
        {rarityLabel}
      </div>
      <div className={`${styles.badgeIcon} ${styles[`badge-${badge}`]}`} style={{ borderColor: rarityColor }}>
        {badgeIcon}
      </div>
      <h3>{badgeLabel}</h3>
      <div className={styles.badgeStats}>
        <span className={styles.statItem}>
          <FiStar />
          Редкость: {rarityLabel}
        </span>
      </div>
    </div>
  )
}
