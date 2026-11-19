'use client'

import Link from 'next/link'
import { Video } from '@/types'
import { db } from '@/lib/db'
import { useStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { FiEye, FiClock, FiPlay } from 'react-icons/fi'
import styles from './VideoCard.module.scss'

interface VideoCardProps {
  video: Video
}

export function VideoCard({ video }: VideoCardProps) {
  // Videos can contain a snapshot of the author from upload time.
  // Resolve the current user so avatar and username changes are reflected immediately.
  const { user: currentUser } = useStore()
  const author = currentUser?.id === video.userId
    ? currentUser
    : db.users.findById(video.userId) || video.user
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}М просмотров`
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}К просмотров`
    }
    return `${views} просмотров`
  }

  return (
    <div className={styles.videoCard}>
      <Link href={`/watch/${video.id}`} className={styles.thumbnailLink}>
        <div className={styles.thumbnail}>
          {video.thumbnailUrl ? (
            <img src={video.thumbnailUrl} alt={video.title} />
          ) : (
            <div className={styles.thumbnailPlaceholder}>
              <FiClock />
            </div>
          )}
          <div className={styles.thumbnailShade} />
          <span className={styles.playHint} aria-hidden="true"><FiPlay /></span>
          <div className={styles.duration}>{formatDuration(video.duration)}</div>
        </div>
      </Link>

      <div className={styles.info}>
        <Link href={`/channel/${video.userId}`} className={styles.avatar}>
          {author.avatar ? (
            <img src={author.avatar} alt={author.username} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {author.username.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        <div className={styles.details}>
          <Link href={`/watch/${video.id}`} className={styles.title}>
            {video.title}
          </Link>
          <div className={styles.channelRow}>
            <Link href={`/channel/${video.userId}`} className={styles.channel}>
              <span className={styles.channelDot} />
              {author.username}
            </Link>
            <div className={styles.meta}>
              <span className={styles.views}>
                <FiEye /> {formatViews(video.views)}
              </span>
              <span className={styles.date}>
                {formatDistanceToNow(new Date(video.createdAt), {
                  addSuffix: true,
                  locale: ru,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
