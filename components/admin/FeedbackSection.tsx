'use client'

import { useState, useEffect } from 'react'
import { Feedback } from '@/types/feedback'
import { db } from '@/lib/db'
import { FiMessageSquare, FiCheck, FiX, FiClock, FiSend } from 'react-icons/fi'
import styles from './AdminPage.module.scss'
import toast from 'react-hot-toast'

export function FeedbackSection() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [message, setMessage] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all')

  useEffect(() => {
    loadFeedbacks()
  }, [])

  const loadFeedbacks = () => {
    if (typeof window === 'undefined') return
    
    try {
      const storage = localStorage.getItem('yt2-feedback')
      const allFeedbacks = storage ? JSON.parse(storage) : []
      setFeedbacks(allFeedbacks)
    } catch (e) {
      console.error('Failed to load feedbacks:', e)
    }
  }

  const filteredFeedbacks = filter === 'all' 
    ? feedbacks 
    : feedbacks.filter(f => f.status === filter)

  const handleStatusChange = (feedbackId: string, status: Feedback['status']) => {
    try {
      const storage = localStorage.getItem('yt2-feedback')
      const allFeedbacks: Feedback[] = storage ? JSON.parse(storage) : []
      const updated = allFeedbacks.map(f => 
        f.id === feedbackId ? { ...f, status, resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined } : f
      )
      localStorage.setItem('yt2-feedback', JSON.stringify(updated))
      loadFeedbacks()
      toast.success('Статус обновлен')
    } catch (e) {
      toast.error('Ошибка обновления статуса')
    }
  }

  const handleSendMessage = () => {
    if (!selectedFeedback || !message.trim()) return

    try {
      const storage = localStorage.getItem('yt2-feedback-messages')
      const messages = storage ? JSON.parse(storage) : []
      messages.push({
        id: Date.now().toString(),
        feedbackId: selectedFeedback.id,
        userId: 'admin',
        message: message.trim(),
        createdAt: new Date().toISOString(),
        isAdmin: true,
      })
      localStorage.setItem('yt2-feedback-messages', JSON.stringify(messages))
      
      // Update feedback status
      handleStatusChange(selectedFeedback.id, 'in-progress')
      
      setMessage('')
      toast.success('Сообщение отправлено')
    } catch (e) {
      toast.error('Ошибка отправки сообщения')
    }
  }

  const getFeedbackMessages = (feedbackId: string) => {
    if (typeof window === 'undefined') return []
    try {
      const storage = localStorage.getItem('yt2-feedback-messages')
      const messages = storage ? JSON.parse(storage) : []
      return messages.filter((m: any) => m.feedbackId === feedbackId)
    } catch {
      return []
    }
  }

  return (
    <div className={styles.feedbackSection}>
      <div className={styles.feedbackFilters}>
        <button 
          className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          Все ({feedbacks.length})
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'pending' ? styles.active : ''}`}
          onClick={() => setFilter('pending')}
        >
          Ожидают ({feedbacks.filter(f => f.status === 'pending').length})
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'in-progress' ? styles.active : ''}`}
          onClick={() => setFilter('in-progress')}
        >
          В работе ({feedbacks.filter(f => f.status === 'in-progress').length})
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'resolved' ? styles.active : ''}`}
          onClick={() => setFilter('resolved')}
        >
          Решены ({feedbacks.filter(f => f.status === 'resolved').length})
        </button>
      </div>

      <div className={styles.feedbackLayout}>
        <div className={styles.feedbackList}>
          {filteredFeedbacks.length === 0 ? (
            <div className={styles.empty}>Нет отзывов</div>
          ) : (
            filteredFeedbacks.map((feedback) => {
              const user = db.users.findById(feedback.userId)
              return (
                <div
                  key={feedback.id}
                  className={`${styles.feedbackItem} ${selectedFeedback?.id === feedback.id ? styles.selected : ''}`}
                  onClick={() => setSelectedFeedback(feedback)}
                >
                  <div className={styles.feedbackHeader}>
                    <h4>{feedback.title}</h4>
                    <span className={`${styles.statusBadge} ${styles[`status-${feedback.status}`]}`}>
                      {feedback.status === 'pending' ? 'Ожидает' : 
                       feedback.status === 'in-progress' ? 'В работе' : 
                       feedback.status === 'resolved' ? 'Решено' : 'Отклонено'}
                    </span>
                  </div>
                  <p className={styles.feedbackMeta}>
                    {user?.username} • {new Date(feedback.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                  <p className={styles.feedbackPreview}>{feedback.message.substring(0, 100)}...</p>
                </div>
              )
            })
          )}
        </div>

        {selectedFeedback && (
          <div className={styles.feedbackDetail}>
            <div className={styles.feedbackDetailHeader}>
              <h3>{selectedFeedback.title}</h3>
              <div className={styles.feedbackActions}>
                <button
                  className={styles.statusButton}
                  onClick={() => handleStatusChange(selectedFeedback.id, 'in-progress')}
                >
                  <FiClock /> В работу
                </button>
                <button
                  className={styles.statusButton}
                  onClick={() => handleStatusChange(selectedFeedback.id, 'resolved')}
                >
                  <FiCheck /> Решено
                </button>
                <button
                  className={styles.statusButton}
                  onClick={() => handleStatusChange(selectedFeedback.id, 'rejected')}
                >
                  <FiX /> Отклонить
                </button>
              </div>
            </div>

            <div className={styles.feedbackContent}>
              <p>{selectedFeedback.message}</p>
              {selectedFeedback.rating && (
                <div className={styles.rating}>
                  Оценка: {'⭐'.repeat(selectedFeedback.rating)}
                </div>
              )}
            </div>

            <div className={styles.feedbackChat}>
              <h4>Чат с пользователем</h4>
              <div className={styles.messages}>
                {getFeedbackMessages(selectedFeedback.id).map((msg: any) => (
                  <div key={msg.id} className={`${styles.message} ${msg.isAdmin ? styles.adminMessage : ''}`}>
                    <p>{msg.message}</p>
                    <span className={styles.messageTime}>
                      {new Date(msg.createdAt).toLocaleString('ru-RU')}
                    </span>
                  </div>
                ))}
              </div>
              <div className={styles.messageInput}>
                <input
                  type="text"
                  placeholder="Написать сообщение..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage}>
                  <FiSend />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

