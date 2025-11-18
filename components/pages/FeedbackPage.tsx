'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { db } from '@/lib/db'
import { FiSend, FiMessageSquare, FiStar, FiAlertCircle } from 'react-icons/fi'
import styles from './FeedbackPage.module.scss'
import toast from 'react-hot-toast'

export function FeedbackPage() {
  const { user } = useStore()
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'suggestion' | 'other'>('suggestion')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [rating, setRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !message.trim()) {
      toast.error('Заполните все обязательные поля')
      return
    }

    if (!user) {
      toast.error('Войдите, чтобы отправить отзыв')
      return
    }

    setSubmitting(true)

    try {
      // Сохраняем отзыв в базу данных
      const feedback = {
        id: Date.now().toString(),
        userId: user.id,
        type: feedbackType,
        title: title.trim(),
        message: message.trim(),
        rating,
        createdAt: new Date().toISOString(),
        status: 'pending' as const,
      }

      // Сохраняем в localStorage и логируем
      const storage = localStorage.getItem('yt2-feedback')
      const feedbacks = storage ? JSON.parse(storage) : []
      feedbacks.push(feedback)
      localStorage.setItem('yt2-feedback', JSON.stringify(feedbacks))

      // Log feedback submission
      if (typeof window !== 'undefined') {
        import('@/lib/logging').then(({ log }) => {
          log('info', 'feedback', `Новый отзыв: ${feedback.title}`, { feedbackId: feedback.id, type: feedback.type }, user.id)
        })
      }

      toast.success('Спасибо за ваш отзыв! Мы обязательно его рассмотрим.')
      setTitle('')
      setMessage('')
      setRating(0)
      setFeedbackType('suggestion')
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('Ошибка при отправке отзыва')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.feedbackPage}>
      <div className={styles.header}>
        <h1>Отправить отзыв</h1>
        <p>Ваше мнение важно для нас! Помогите улучшить платформу</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.section}>
          <label className={styles.label}>Тип отзыва</label>
          <div className={styles.typeButtons}>
            <button
              type="button"
              className={`${styles.typeButton} ${feedbackType === 'bug' ? styles.active : ''}`}
              onClick={() => setFeedbackType('bug')}
            >
              <FiAlertCircle />
              <span>Ошибка</span>
            </button>
            <button
              type="button"
              className={`${styles.typeButton} ${feedbackType === 'feature' ? styles.active : ''}`}
              onClick={() => setFeedbackType('feature')}
            >
              <FiStar />
              <span>Новая функция</span>
            </button>
            <button
              type="button"
              className={`${styles.typeButton} ${feedbackType === 'suggestion' ? styles.active : ''}`}
              onClick={() => setFeedbackType('suggestion')}
            >
              <FiMessageSquare />
              <span>Предложение</span>
            </button>
            <button
              type="button"
              className={`${styles.typeButton} ${feedbackType === 'other' ? styles.active : ''}`}
              onClick={() => setFeedbackType('other')}
            >
              <FiMessageSquare />
              <span>Другое</span>
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <label htmlFor="title" className={styles.label}>
            Заголовок <span className={styles.required}>*</span>
          </label>
          <input
            id="title"
            type="text"
            className={styles.input}
            placeholder="Краткое описание..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
          />
        </div>

        <div className={styles.section}>
          <label htmlFor="message" className={styles.label}>
            Сообщение <span className={styles.required}>*</span>
          </label>
          <textarea
            id="message"
            className={styles.textarea}
            placeholder="Опишите подробнее..."
            rows={8}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            maxLength={2000}
          />
          <div className={styles.charCount}>{message.length} / 2000</div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Оценка платформы (необязательно)</label>
          <div className={styles.rating}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`${styles.starButton} ${rating >= star ? styles.active : ''}`}
                onClick={() => setRating(star)}
              >
                <FiStar />
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={submitting || !title.trim() || !message.trim()}
        >
          <FiSend />
          <span>{submitting ? 'Отправка...' : 'Отправить отзыв'}</span>
        </button>
      </form>
    </div>
  )
}

