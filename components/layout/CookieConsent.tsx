'use client'

import { useState, useEffect } from 'react'
import { FiInfo } from 'react-icons/fi'
import styles from './CookieConsent.module.scss'

export function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShow(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    setShow(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className={styles.cookieConsent}>
      <div className={styles.content}>
        <div className={styles.icon}>
          <FiInfo />
        </div>
        <div className={styles.text}>
          <h3>Мы используем cookies</h3>
          <p>
            Мы используем cookies для улучшения работы сайта, персонализации контента и анализа трафика.
            Продолжая использовать сайт, вы соглашаетесь с использованием cookies.
          </p>
        </div>
      </div>
      <div className={styles.actions}>
        <button onClick={handleDecline} className={styles.declineButton}>
          Отклонить
        </button>
        <button onClick={handleAccept} className={styles.acceptButton}>
          Принять
        </button>
      </div>
    </div>
  )
}

