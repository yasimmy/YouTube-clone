'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { db } from '@/lib/db'
import toast from 'react-hot-toast'
import { FiFlag, FiX } from 'react-icons/fi'
import styles from './ReportVideo.module.scss'

interface ReportVideoProps {
  videoId: string
  onClose: () => void
}

const reportReasons = [
  'Нарушение авторских прав',
  'Спам или вводящий в заблуждение контент',
  'Ненавистнический контент',
  'Жестокость или насилие',
  'Неприемлемый контент',
  'Мошенничество или обман',
  'Другое',
]

export function ReportVideo({ videoId, onClose }: ReportVideoProps) {
  const { user } = useStore()
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('Войдите, чтобы отправить жалобу')
      return
    }

    if (!reason) {
      toast.error('Выберите причину жалобы')
      return
    }

    setSubmitting(true)

    try {
      // Get video to report channel if needed
      const video = db.videos.findById(videoId)
      db.reports.create({
        videoId,
        channelId: video?.userId,
        userId: user.id,
        reason,
        description: description || undefined,
      })

      toast.success('Жалоба отправлена. Спасибо за обратную связь!')
      onClose()
    } catch (error) {
      toast.error('Ошибка отправки жалобы')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>
            <FiFlag />
            Пожаловаться на видео
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Причина жалобы *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            >
              <option value="">Выберите причину</option>
              {reportReasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>Дополнительная информация (опционально)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите проблему подробнее..."
              rows={4}
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className={styles.submitButton} disabled={submitting}>
              {submitting ? 'Отправка...' : 'Отправить жалобу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

