'use client'

import { useEffect, useState } from 'react'
import { Video } from '@/types'
import { db } from '@/lib/db'
import { VideoCard } from '@/components/video/VideoCard'
import { FiFilter, FiX } from 'react-icons/fi'
import styles from './SearchPage.module.scss'

interface SearchPageProps {
  query: string
}

const categories = [
  'Музыка',
  'Фильмы',
  'Игры',
  'Новости',
  'Спорт',
  'Обучение',
  'Развлечения',
  'Технологии',
  'Путешествия',
  'Кулинария',
]

export function SearchPage({ query }: SearchPageProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (query) {
      const results = db.videos.search(query)
      setVideos(results)
      setFilteredVideos(results)
    } else {
      const allVideos = db.videos.getPublic()
      setVideos(allVideos)
      setFilteredVideos(allVideos)
    }
  }, [query])

  useEffect(() => {
    if (selectedCategory) {
      setFilteredVideos(videos.filter((v) => v.category === selectedCategory))
    } else {
      setFilteredVideos(videos)
    }
  }, [selectedCategory, videos])

  return (
    <div className={styles.searchPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {query ? `Результаты поиска: "${query}"` : 'Все видео'}
        </h1>
        <button
          className={styles.filterButton}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FiFilter />
          <span>Фильтры</span>
        </button>
      </div>

      {showFilters && (
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>Категория</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Все категории</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {selectedCategory && (
            <button
              className={styles.clearFilters}
              onClick={() => setSelectedCategory('')}
            >
              <FiX />
              <span>Очистить фильтры</span>
            </button>
          )}
        </div>
      )}

      <div className={styles.results}>
        {filteredVideos.length === 0 ? (
          <div className={styles.empty}>
            <h2>Ничего не найдено</h2>
            <p>Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <div className={styles.videoGrid}>
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

