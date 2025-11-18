'use client'

import { useState } from 'react'
import Link from 'next/link'
import { seedDatabase } from '@/lib/seed'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { FiCheckCircle, FiAlertCircle, FiHome } from 'react-icons/fi'
import styles from './seed.module.scss'

export default function SeedPage() {
  const router = useRouter()
  const [seeded, setSeeded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSeed = () => {
    setLoading(true)
    setError(null)
    
    try {
      seedDatabase()
      setSeeded(true)
      toast.success('База данных заполнена тестовыми данными!')
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка'
      setError(errorMessage)
      toast.error('Ошибка заполнения базы данных')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.seedPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Заполнение базы данных</h1>
        <p className={styles.description}>
          Эта страница создаст тестовые данные для демонстрации функционала Yt 2.0:
        </p>

        <ul className={styles.list}>
          <li>2 тестовых пользователя</li>
          <li>5 демонстрационных видео</li>
          <li>Различные категории и теги</li>
        </ul>

        {seeded ? (
          <div className={styles.success}>
            <FiCheckCircle className={styles.icon} />
            <h2>База данных успешно заполнена!</h2>
            <p>Перенаправление на главную страницу...</p>
            <Link href="/" className={styles.button}>
              <FiHome />
              <span>Перейти на главную</span>
            </Link>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <FiAlertCircle className={styles.icon} />
            <h2>Ошибка</h2>
            <p>{error}</p>
            <button onClick={handleSeed} className={styles.button}>
              Попробовать снова
            </button>
          </div>
        ) : (
          <div className={styles.actions}>
            <button
              onClick={handleSeed}
              className={styles.seedButton}
              disabled={loading}
            >
              {loading ? 'Заполнение...' : 'Заполнить базу данных'}
            </button>
            <Link href="/" className={styles.cancelButton}>
              Отмена
            </Link>
          </div>
        )}

        <div className={styles.note}>
          <p>
            <strong>Примечание:</strong> База данных использует in-memory хранилище, 
            поэтому данные будут сброшены при перезапуске сервера разработки.
          </p>
        </div>
      </div>
    </div>
  )
}

