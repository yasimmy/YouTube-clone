'use client'

import { useStore } from '@/lib/store'
import { VideoCard } from '@/components/video/VideoCard'
import { FiRotateCw } from 'react-icons/fi'
import styles from './HistoryPage.module.scss'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function HistoryPage() {
  const watchHistory = useStore((state) => state.watchHistory)

  return (
    <motion.div
      className={styles.historyPage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={styles.header}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <FiRotateCw className={styles.icon} />
        <h1>История просмотров</h1>
      </motion.div>

      {watchHistory.length === 0 ? (
        <motion.div
          className={styles.empty}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2>История пуста</h2>
          <p>Видео, которые вы смотрите, появятся здесь</p>
          <Link href="/" className={styles.browseButton}>
            Найти видео
          </Link>
        </motion.div>
      ) : (
        <motion.div
          className={styles.videoGrid}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {watchHistory.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <VideoCard video={video} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

