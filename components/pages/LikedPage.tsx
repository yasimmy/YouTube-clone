'use client'

import { useStore } from '@/lib/store'
import { VideoCard } from '@/components/video/VideoCard'
import { FiThumbsUp } from 'react-icons/fi'
import styles from './LikedPage.module.scss'
import Link from 'next/link'

export function LikedPage() {
  const favorites = useStore((state) => state.favorites)

  return (
    <div className={styles.likedPage}>
      <div className={styles.header}>
        <FiThumbsUp className={styles.icon} />
        <h1>Понравившиеся видео</h1>
      </div>

      {favorites.length === 0 ? (
        <div className={styles.empty}>
          <h2>Нет понравившихся видео</h2>
          <p>Видео, которые вам понравились, появятся здесь</p>
          <Link href="/" className={styles.browseButton}>
            Найти видео
          </Link>
        </div>
      ) : (
        <div className={styles.videoGrid}>
          {favorites.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}

