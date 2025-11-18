'use client'

import { useEffect, useState } from 'react'
import { Video } from '@/types'
import { db } from '@/lib/db'
import { VideoCard } from '@/components/video/VideoCard'
import styles from './CategoryPage.module.scss'

interface CategoryPageProps {
  category: string
}

export function CategoryPage({ category }: CategoryPageProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const allVideos = db.videos.getPublic()
    const filtered = allVideos.filter((v) => v.category === category)
    // Sort by promotion score within category
    import('@/lib/promotion-algorithm').then(({ calculateVideoScore }) => {
      const scored = filtered.map(v => ({ video: v, score: calculateVideoScore(v).score }))
      scored.sort((a, b) => b.score - a.score)
      setVideos(scored.map(s => s.video))
      setLoading(false)
    }).catch(() => {
      // Fallback to simple sort if algorithm fails
      const sorted = [...filtered].sort((a, b) => b.views - a.views)
      setVideos(sorted)
      setLoading(false)
    })
  }, [category])

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    )
  }

  return (
    <div className={styles.categoryPage}>
      <h1 className={styles.title}>{category}</h1>
      {videos.length === 0 ? (
        <div className={styles.empty}>
          <p>В этой категории пока нет видео</p>
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

