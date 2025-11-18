'use client'

import { useEffect, useState } from 'react'
import { Video } from '@/types'
import { getPromotedVideos } from '@/lib/promotion-algorithm'
import { VideoCard } from '@/components/video/VideoCard'
import styles from './TrendingPage.module.scss'

export function TrendingPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Use promotion algorithm for trending
    const promoted = getPromotedVideos(30)
    setVideos(promoted)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    )
  }

  return (
    <div className={styles.trendingPage}>
      <h1 className={styles.title}>В тренде</h1>
      {videos.length === 0 ? (
        <div className={styles.empty}>
          <p>Пока нет популярных видео</p>
        </div>
      ) : (
        <div className={styles.videoGrid}>
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}

