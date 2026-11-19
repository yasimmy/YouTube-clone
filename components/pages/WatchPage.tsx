'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CustomVideoPlayer } from '@/components/video/CustomVideoPlayer'
import { Video, Comment } from '@/types'
import { db } from '@/lib/db'
import { useStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  FiThumbsUp,
  FiThumbsDown,
  FiShare2,
  FiSave,
  FiMoreHorizontal,
  FiUserPlus,
  FiUserCheck,
  FiFlag,
} from 'react-icons/fi'
import { VideoComments } from '@/components/video/VideoComments'
import { VideoCard } from '@/components/video/VideoCard'
import { ReportVideo } from '@/components/video/ReportVideo'
import { ShareButton } from '@/components/shared/ShareButton'
import { AdventCalendar } from '@/components/seasonal/AdventCalendar'
import { getCurrentSeason } from '@/lib/season'
import styles from './WatchPage.module.scss'
import toast from 'react-hot-toast'

interface WatchPageProps {
  videoId: string
}

// Seasonal like icon component
function SeasonalLikeIcon({ season, isLiked }: { season: string; isLiked: boolean }) {
  const getLikeIcon = () => {
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
    <span 
      className={styles.seasonalLikeIcon}
      data-season={season}
      data-liked={isLiked}
    >
      {getLikeIcon()}
    </span>
  )
}

export function WatchPage({ videoId }: WatchPageProps) {
  const router = useRouter()
  const { user, addToHistory, addToFavorites, removeFromFavorites, favorites } = useStore()
  const [video, setVideo] = useState<Video | null>(null)
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [userLike, setUserLike] = useState<'like' | 'dislike' | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [season, setSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('spring')
  const [currentTime, setCurrentTime] = useState(0)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    setLoading(true)
    
    // Get current season
    const currentSeason = getCurrentSeason()
    const customSeason = typeof window !== 'undefined' ? localStorage.getItem('yt2-custom-season') : null
    setSeason((customSeason || currentSeason) as any)
    
    const videoData = db.videos.findById(videoId)
    if (!videoData) {
      router.push('/404')
      setLoading(false)
      return
    }

    setVideo(videoData)
    const updated = db.videos.incrementViews(videoId)
    if (updated && typeof window !== 'undefined') {
      // Check view milestones
      import('@/lib/currency-rewards').then(({ checkViewMilestones }) => {
        checkViewMilestones(videoId)
      })
    }

    // Get related videos using algorithm
    if (typeof window !== 'undefined') {
      import('@/lib/promotion-algorithm').then(({ getRelatedVideos }) => {
        const related = getRelatedVideos(videoId, 10)
        setRelatedVideos(related)
      }).catch(() => {
        // Fallback to simple category filter
        const allPublic = db.videos.getPublic()
        const related = allPublic
          .filter((v) => v.id !== videoId && v.category === videoData.category)
          .slice(0, 10)
        setRelatedVideos(related)
      })
    } else {
      // SSR fallback
      const allPublic = db.videos.getPublic()
      const related = allPublic
        .filter((v) => v.id !== videoId && v.category === videoData.category)
        .slice(0, 10)
      setRelatedVideos(related)
    }

    // Check subscription and like
    if (user) {
      setIsSubscribed(db.subscriptions.isSubscribed(user.id, videoData.userId))
      const like = db.likes.getUserLike(user.id, videoId)
      setUserLike(like?.type || null)
      addToHistory(videoData)
      
      // Check if video is saved
      const isInFavorites = favorites.some(v => v.id === videoId)
      setIsSaved(isInFavorites)
    }

    setLoading(false)
  }, [videoId, user, router, addToHistory, favorites])

  const handleSubscribe = () => {
    if (!user) {
      toast.error('Войдите, чтобы подписаться')
      return
    }

    if (!video) return

    // Prevent self-subscription
    if (user.id === video.userId) {
      toast.error('Вы не можете подписаться на свой канал')
      return
    }

    if (isSubscribed) {
      db.subscriptions.delete(user.id, video.userId)
      setIsSubscribed(false)
      toast.success('Отписка выполнена')
    } else {
      db.subscriptions.create({
        userId: user.id,
        channelId: video.userId,
      })
      setIsSubscribed(true)
      toast.success('Подписка оформлена')
      
      // Award currency to channel owner
      if (typeof window !== 'undefined') {
        import('@/lib/currency-rewards').then(({ rewardSubscriberToAuthor }) => {
          rewardSubscriberToAuthor(video.userId)
        })
      }
    }
  }

  const isOwnChannel = Boolean(user && video && user.id === video.userId)

  const handleLike = (type: 'like' | 'dislike') => {
    if (!user) {
      toast.error('Войдите, чтобы оценить видео')
      return
    }

    if (!video) return

    const wasLiked = userLike === 'like'
    const result = db.likes.toggle({
      userId: user.id,
      videoId: video.id,
      type,
    })

    if (result) {
      setUserLike(result.type)
      if (type === 'like') {
        addToFavorites(video)
        // Award currency to video author
        if (!wasLiked && typeof window !== 'undefined') {
          import('@/lib/currency-rewards').then(({ rewardLikeToAuthor }) => {
            rewardLikeToAuthor(video.id, user.id)
          })
        }
      }
    } else {
      setUserLike(null)
      if (type === 'like') {
        removeFromFavorites(video.id)
      }
    }

    // Update video likes/dislikes
    const updatedVideo = db.videos.findById(video.id)
    if (updatedVideo) {
      setVideo(updatedVideo)
      // Check view milestones
      if (typeof window !== 'undefined') {
        import('@/lib/currency-rewards').then(({ checkViewMilestones }) => {
          checkViewMilestones(video.id)
        })
      }
    }

    // Check seasonal events
    if (type === 'like' && user) {
      import('@/lib/seasonal-events').then(({ checkSeasonalEvents }) => {
        checkSeasonalEvents(user.id)
      })
    }
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}М`
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}К`
    }
    return views.toString()
  }

  if (loading || !video) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    )
  }

  // Video records keep an author snapshot; always render the current profile data.
  const author = db.users.findById(video.userId) || video.user

  return (
    <div className={`${styles.watchPage} ${styles[`season-${season}`]}`} data-season={season}>
      <div className={styles.main}>
        <div className={`${styles.player} ${styles[`player-${season}`]}`}>
          {season === 'winter' && (
            <div className={styles.winterGarland}>
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className={styles.garlandLight} style={{ animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
          )}
          <CustomVideoPlayer
            url={video.videoUrl}
            title={video.title}
            onNextVideo={() => {
              if (relatedVideos.length > 0) {
                router.push(`/watch/${relatedVideos[0].id}`)
              }
            }}
            onTimeUpdate={(seconds) => setCurrentTime(seconds)}
            onSeek={(seconds) => {
              // Seek function is handled internally by player
            }}
          />
        </div>

        <div className={styles.videoInfo}>
          <h1 className={styles.title}>{video.title}</h1>

          <div className={styles.actions}>
            <div className={styles.meta}>
              <span className={styles.views}>{formatViews(video.views)} просмотров</span>
              <span className={styles.date}>
                {formatDistanceToNow(new Date(video.createdAt), {
                  addSuffix: true,
                  locale: ru,
                })}
              </span>
            </div>

            <div className={styles.actionButtons}>
              <button
                className={`${styles.actionButton} ${userLike === 'like' ? styles.active : ''}`}
                onClick={() => handleLike('like')}
                style={{ position: 'relative' }}
              >
                <SeasonalLikeIcon season={season} isLiked={userLike === 'like'} />
                <span>{formatViews(video.likes)}</span>
              </button>
              <button
                className={`${styles.actionButton} ${userLike === 'dislike' ? styles.active : ''}`}
                onClick={() => handleLike('dislike')}
              >
                <FiThumbsDown />
                <span>{formatViews(video.dislikes)}</span>
              </button>
              <ShareButton 
                url={`/watch/${video.id}`} 
                title={video.title} 
                type="video"
                timestamp={currentTime}
              />
              <button 
                className={`${styles.actionButton} ${isSaved ? styles.saved : ''}`}
                onClick={() => {
                  if (!user) {
                    toast.error('Войдите, чтобы сохранить видео')
                    return
                  }
                  if (isSaved) {
                    removeFromFavorites(video.id)
                    setIsSaved(false)
                    toast.success('Видео удалено из сохраненных')
                  } else {
                    addToFavorites(video)
                    setIsSaved(true)
                    toast.success('Видео сохранено')
                  }
                }}
              >
                <FiSave />
                <span>{isSaved ? 'Сохранено' : 'Сохранить'}</span>
              </button>
              <button
                className={styles.actionButton}
                onClick={() => setShowReportModal(true)}
                title="Пожаловаться"
              >
                <FiFlag />
              </button>
            </div>
          </div>

          <div className={styles.channelInfo}>
            <Link href={`/channel/${video.userId}`} className={styles.channelAvatar}>
              {author.avatar ? (
                <img src={author.avatar} alt={author.username} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {author.username.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
            <div className={styles.channelDetails}>
              <Link href={`/channel/${video.userId}`} className={styles.channelName}>
                {author.username}
              </Link>
              <span className={styles.subscribers}>
                {formatViews(author.subscribersCount)} подписчиков
              </span>
            </div>
            <button
              className={`${styles.subscribeButton} ${isSubscribed ? styles.subscribed : ''} ${isOwnChannel ? styles.ownChannel : ''}`}
              onClick={handleSubscribe}
              disabled={isOwnChannel}
            >
              {isOwnChannel ? (
                <>
                  <FiUserCheck />
                  <span>Ваш канал</span>
                </>
              ) : isSubscribed ? (
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

          <div className={styles.description}>
            <div className={styles.descriptionText}>
              <p>{video.description || 'Описание отсутствует'}</p>
            </div>
          </div>

          <VideoComments 
            videoId={videoId} 
            onSeek={(seconds) => {
              // Use global seek function from video player
              if (typeof window !== 'undefined' && (window as any).__videoPlayerSeek) {
                (window as any).__videoPlayerSeek(seconds)
              }
            }}
          />
          
          {/* Advent Calendar - only in winter */}
          {season === 'winter' && (
            <div style={{ marginTop: '24px' }}>
              <AdventCalendar />
            </div>
          )}
        </div>
      </div>

      {showReportModal && (
        <ReportVideo videoId={videoId} onClose={() => setShowReportModal(false)} />
      )}

      <div className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Рекомендуемые</h2>
        <div className={styles.relatedVideos}>
          {relatedVideos.map((relatedVideo) => (
            <VideoCard key={relatedVideo.id} video={relatedVideo} />
          ))}
        </div>
      </div>
    </div>
  )
}

