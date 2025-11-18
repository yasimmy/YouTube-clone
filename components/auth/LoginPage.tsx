'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useStore } from '@/lib/store'
import { db } from '@/lib/db'
import { setCookie } from '@/lib/cookies'
import toast from 'react-hot-toast'
import styles from './Auth.module.scss'
import { motion } from 'framer-motion'

const loginSchema = z.object({
  email: z.string().min(1, 'Введите email или логин'),
  password: z.string().min(1, 'Введите пароль'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const router = useRouter()
  const setUser = useStore((state) => state.setUser)
  const [loading, setLoading] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [twoFACode, setTwoFACode] = useState('')
  const [pendingUser, setPendingUser] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const completeLogin = async (user: any) => {
    // Get device info
    const userAgent = typeof window !== 'undefined' ? navigator.userAgent : ''
    const device = typeof window !== 'undefined' 
      ? /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
      : 'Unknown'
    
    // Generate session token
    const sessionToken = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Create session
    db.sessions.create({
      userId: user.id,
      sessionToken,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      userAgent,
      device,
      isCurrent: true,
    })
    
    // Log login history
    db.loginHistory.create({
      userId: user.id,
      timestamp: new Date().toISOString(),
      userAgent,
      device,
      success: true,
    })
    
    // Mark other sessions as not current
    const userSessions = db.sessions.findByUserId(user.id)
    userSessions.forEach(session => {
      if (session.sessionToken !== sessionToken) {
        db.sessions.update(session.id, { isCurrent: false })
      }
    })
    
    setUser(user)
    // Set cookie for session
    setCookie('yt2_session', sessionToken, 7)
    
    // Award daily login currency
    if (typeof window !== 'undefined') {
      import('@/lib/currency-rewards').then(({ rewardDailyLogin }) => {
        rewardDailyLogin(user.id)
      })
    }
    
    toast.success('Вход выполнен успешно!')
    router.push('/')
  }

  const handle2FASubmit = async () => {
    if (!twoFACode || twoFACode.length !== 6) {
      toast.error('Введите 6-значный код')
      return
    }
    
    if (!pendingUser) {
      toast.error('Ошибка: пользователь не найден')
      return
    }
    
    setLoading(true)
    try {
      // Verify 2FA code
      const { verifyTOTP } = await import('@/lib/2fa')
      if (!verifyTOTP(twoFACode, (pendingUser as any).twoFactorSecret)) {
        toast.error('Неверный код двухфакторной аутентификации')
        setTwoFACode('')
        setLoading(false)
        return
      }
      
      // Complete login
      setShow2FA(false)
      setTwoFACode('')
      await completeLogin(pendingUser)
      setPendingUser(null)
    } catch (error) {
      toast.error('Ошибка при проверке кода')
      setLoading(false)
    }
  }

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Check for admin login
      if (data.email === 'admin' && data.password === 'admin') {
        let admin = db.users.findByEmail('admin@yt2.com') || db.users.findByUsername('admin')
        if (!admin) {
          // Create admin if doesn't exist with 'own' role
          admin = db.users.create({
            email: 'admin@yt2.com',
            username: 'admin',
            role: 'own',
            emailVerified: true,
          })
        } else {
          // Update role if user exists but doesn't have admin role
          if (!admin.role || admin.role === 'user') {
            admin = db.users.update(admin.id, { role: 'own' }) || admin
          }
          // Unblock admin if blocked
          if (admin.isBlocked) {
            admin = db.users.update(admin.id, { 
              isBlocked: false, 
              blockedUntil: undefined 
            }) || admin
          }
        }
        await completeLogin(admin)
        return
      }

      // Check for official channel login
      if ((data.email === 'officialchannel' || data.email === 'officialchannel@youtube.com') && data.password === 'officialchannel1') {
        let official = db.users.findByEmail('officialchannel@youtube.com') || db.users.findByUsername('Official Channel')
        if (!official) {
          // Create official channel if doesn't exist
          official = db.users.create({
            email: 'officialchannel@youtube.com',
            username: 'Official Channel',
            password: 'officialchannel1',
            description: 'Официальный канал платформы YouTube',
            emailVerified: true,
            role: 'user',
            isOfficial: true,
            avatarFrame: 'official-gold',
            nicknameHighlight: 'White Sparkles',
            badges: ['verified', 'staff'],
          })
        }
        setUser(official)
        setCookie('yt2_session', official.id, 7)
        
        // Award daily login currency
        if (typeof window !== 'undefined') {
          import('@/lib/currency-rewards').then(({ rewardDailyLogin }) => {
            rewardDailyLogin(official.id)
          })
        }
        
        toast.success('Вход выполнен успешно!')
        router.push('/')
        return
      }

      // Try to find user by email or username
      let user = db.users.findByEmail(data.email)
      if (!user) {
        user = db.users.findByUsername(data.email)
      }
      if (!user) {
        toast.error('Пользователь не найден')
        return
      }

      // Check if user is blocked (except admin)
      const isAdmin = user.email === 'admin@yt2.com' || user.username === 'admin'
      if (user.isBlocked && !isAdmin) {
        if (user.blockedUntil && new Date(user.blockedUntil) > new Date()) {
          toast.error('Ваш аккаунт заблокирован')
          return
        } else {
          // Unblock if time expired
          db.users.update(user.id, { isBlocked: false, blockedUntil: undefined })
          user = db.users.findById(user.id) || user
        }
      } else if (user.isBlocked && isAdmin) {
        // Always unblock admin
        db.users.update(user.id, { isBlocked: false, blockedUntil: undefined })
        user = db.users.findById(user.id) || user
      }

      // In production, verify password with bcrypt
      
      // Check if 2FA is enabled
      if ((user as any).twoFactorEnabled && (user as any).twoFactorSecret) {
        // Store user and show 2FA modal
        setPendingUser(user)
        setShow2FA(true)
        setLoading(false)
        return
      }
      
      // Complete login
      completeLogin(user)
    } catch (error) {
      toast.error('Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.authContainer}>
      <motion.div
        className={styles.authCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.header}>
          <h1>Вход в Yt 2.0</h1>
          <p>Продолжите, чтобы войти в свой аккаунт</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">Email или логин</label>
            <input
              id="email"
              type="text"
              placeholder="your@email.com или admin"
              {...register('email')}
            />
            {errors.email && <span className={styles.error}>{errors.email.message}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && (
              <span className={styles.error}>{errors.password.message}</span>
            )}
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Нет аккаунта? <Link href="/auth/register">Зарегистрироваться</Link>
          </p>
        </div>
      </motion.div>

      {show2FA && (
        <div className={styles.modalOverlay} onClick={() => {}}>
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Двухфакторная аутентификация</h2>
            <p className={styles.modalDescription}>
              Введите 6-значный код из приложения Google Authenticator
            </p>
            <div className={styles.field}>
              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                className={styles.twoFAInput}
                autoFocus
              />
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => {
                  setShow2FA(false)
                  setTwoFACode('')
                  setPendingUser(null)
                  setLoading(false)
                }}
              >
                Отмена
              </button>
              <button
                type="button"
                className={styles.submitButton}
                onClick={handle2FASubmit}
                disabled={loading || twoFACode.length !== 6}
              >
                {loading ? 'Проверка...' : 'Подтвердить'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

