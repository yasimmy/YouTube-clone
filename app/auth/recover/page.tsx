'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/db'
import { hashPassword, createSessionToken } from '@/lib/auth'
import { setCookie } from '@/lib/cookies'
import { useStore } from '@/lib/store'
import toast from 'react-hot-toast'
import styles from '@/components/auth/Auth.module.scss'

export default function RecoverAdminPage() {
  const router = useRouter()
  const setUser = useStore((state) => state.setUser)
  const [key, setKey] = useState('')
  const [password, setPassword] = useState('')
  const [account, setAccount] = useState<'admin' | 'official'>('admin')
  const [loading, setLoading] = useState(false)

  const recover = () => {
    if (!['localhost', '127.0.0.1'].includes(window.location.hostname)) {
      toast.error('Восстановление доступно только на localhost')
      return
    }
    const recoveryKey = process.env.NEXT_PUBLIC_WAVE_RECOVERY_KEY
    if (!recoveryKey || key !== recoveryKey) {
      toast.error('Неверный recovery key')
      return
    }
    if (password.length < 6) {
      toast.error('Пароль должен содержать минимум 6 символов')
      return
    }

    setLoading(true)
    const email = account === 'admin' ? 'admin@yt2.com' : 'officialchannel@youtube.com'
    const username = account === 'admin' ? 'admin' : 'Official Channel'
    let user = db.users.findByEmail(email) || db.users.findByUsername(username)
    if (!user) {
      user = db.users.create({
        email,
        username,
        passwordHash: hashPassword(password),
        emailVerified: true,
        role: account === 'admin' ? 'own' : 'user',
        isOfficial: account === 'official',
        badges: account === 'official' ? ['verified', 'staff'] : [],
      } as any)
    } else {
      user = db.users.update(user.id, {
        passwordHash: hashPassword(password),
        role: account === 'admin' ? 'own' : user.role,
        isBlocked: false,
        blockedUntil: undefined,
      }) || user
    }

    const sessionToken = createSessionToken()
    db.sessions.create({
      userId: user.id,
      sessionToken,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      userAgent: navigator.userAgent,
      device: 'Desktop',
      isCurrent: true,
    })
    setUser(user)
    setCookie('yt2_session', sessionToken, 7)
    toast.success('Пароль обновлён, вход выполнен')
    router.push(account === 'admin' ? '/admin' : '/')
    setLoading(false)
  }

  return (
    <main className={styles.authContainer}>
      <section className={styles.authCard}>
        <div className={styles.header}>
          <h1>Восстановление доступа</h1>
          <p>Только для локальной разработки wave</p>
        </div>
        <div className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="account">Аккаунт</label>
            <select id="account" value={account} onChange={(event) => setAccount(event.target.value as typeof account)}>
              <option value="admin">admin</option>
              <option value="official">Official Channel</option>
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="key">Recovery key</label>
            <input id="key" type="password" value={key} onChange={(event) => setKey(event.target.value)} autoComplete="off" />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Новый пароль</label>
            <input id="password" type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
          </div>
          <button type="button" className={styles.submitButton} onClick={recover} disabled={loading}>Обновить пароль и войти</button>
        </div>
      </section>
    </main>
  )
}
