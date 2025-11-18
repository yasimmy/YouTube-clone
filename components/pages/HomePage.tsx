'use client'

import { useEffect, useState } from 'react'
import { VideoCard } from '@/components/video/VideoCard'
import { useStore } from '@/lib/store'
import { getRecommendedVideos, getPromotedVideos } from '@/lib/promotion-algorithm'
import { Video } from '@/types'
import styles from './HomePage.module.scss'

export function HomePage() {
  const { user } = useStore()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Use recommendation algorithm for logged users, trending for guests
    const recommended = user 
      ? getRecommendedVideos(user.id, 20)
      : getPromotedVideos(20)
    setVideos(recommended)
    setLoading(false)
  }, [user])

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>Пока нет видео</h2>
        <p>Будьте первым, кто загрузит видео!</p>
      </div>
    )
  }

  return (
    <div className={styles.homePage}>
      <div className={styles.videoGrid}>
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  )
}

