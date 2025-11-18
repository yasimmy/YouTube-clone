'use client'

import { useEffect, useState } from 'react'
import styles from './OfficialChannelWelcome.module.scss'

export function OfficialChannelWelcome() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <div className={styles.welcome}>
      <div className={styles.content}>
        <div className={styles.logo}>
          <span className={styles.you}>You</span>
          <span className={styles.tube}>Tube</span>
        </div>
        <div className={styles.text}>
          <h2>Добро пожаловать!</h2>
        </div>
        <div className={styles.subtext}>
          <p>Официальный канал платформы</p>
        </div>
      </div>
    </div>
  )
}
