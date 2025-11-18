'use client'

import Link from 'next/link'
import { Video } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { FiEye, FiClock } from 'react-icons/fi'
import styles from './VideoCard.module.scss'

interface VideoCardProps {
  video: Video
}

export function VideoCard({ video }: VideoCardProps) {
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
          <div className={styles.duration}>{formatDuration(video.duration)}</div>
        </div>
      </Link>

      <div className={styles.info}>
        <Link href={`/channel/${video.userId}`} className={styles.avatar}>
          {video.user.avatar ? (
            <img src={video.user.avatar} alt={video.user.username} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {video.user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        <div className={styles.details}>
          <Link href={`/watch/${video.id}`} className={styles.title}>
            {video.title}
          </Link>
          <Link href={`/channel/${video.userId}`} className={styles.channel}>
            {video.user.username}
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
  )
}
