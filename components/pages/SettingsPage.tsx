'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useStore } from '@/lib/store'
import { db } from '@/lib/db'
import { AvatarFrame } from '@/types'
import toast from 'react-hot-toast'
import { generateSecret, generateQRCodeUrl, verifyTOTP, generateBackupCodes } from '@/lib/2fa'
import bcrypt from 'bcryptjs'
import { FiUser, FiImage, FiGlobe, FiSave, FiEdit2, FiTrash2, FiAward, FiChevronDown, FiChevronUp, FiShield, FiLock, FiKey, FiCopy, FiCheck, FiActivity, FiClock, FiX, FiLogOut, FiMonitor, FiSmartphone } from 'react-icons/fi'
import styles from './SettingsPage.module.scss'

const settingsSchema = z.object({
  username: z.string().min(3, 'Имя пользователя должно быть не менее 3 символов'),
  description: z.string().optional(),
  youtube: z.string().url('Некорректный URL').optional().or(z.literal('')),
  twitter: z.string().url('Некорректный URL').optional().or(z.literal('')),
  instagram: z.string().url('Некорректный URL').optional().or(z.literal('')),
  website: z.string().url('Некорректный URL').optional().or(z.literal('')),
})

type SettingsForm = z.infer<typeof settingsSchema>

export function SettingsPage() {
  const router = useRouter()
  const { user, setUser } = useStore()
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [selectedFrame, setSelectedFrame] = useState<AvatarFrame>('none')
  const [saving, setSaving] = useState(false)
  const [framesExpanded, setFramesExpanded] = useState(false)
  const [securityExpanded, setSecurityExpanded] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null)
  const [twoFactorQR, setTwoFactorQR] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [enabling2FA, setEnabling2FA] = useState(false)
  const [avatarDeleted, setAvatarDeleted] = useState(false)
  const [bannerDeleted, setBannerDeleted] = useState(false)
  const [showLoginHistory, setShowLoginHistory] = useState(false)
  const [showSessions, setShowSessions] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
  })

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        description: user.description || '',
        youtube: user.socialLinks?.youtube || '',
        twitter: user.socialLinks?.twitter || '',
        instagram: user.socialLinks?.instagram || '',
        website: user.socialLinks?.website || '',
      })
      setAvatarPreview(user.avatar || null)
      setBannerPreview(user.banner || null)
      setSelectedFrame(user.avatarFrame || 'none')
      setTwoFactorEnabled(!!(user as any).twoFactorEnabled)
      setTwoFactorSecret((user as any).twoFactorSecret || null)
    }
  }, [user, reset])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Выберите изображение')
        return
      }
      setAvatarFile(file)
      const url = URL.createObjectURL(file)
      setAvatarPreview(url)
    }
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Выберите изображение')
        return
      }
      setBannerFile(file)
      const url = URL.createObjectURL(file)
      setBannerPreview(url)
    }
  }

  const onSubmit = async (data: SettingsForm) => {
    if (!user) {
      toast.error('Войдите, чтобы изменить настройки')
      return
    }

    setSaving(true)

    try {
      let avatarUrl = user.avatar
      let bannerUrl = user.banner

      // Handle deleted avatar/banner - return to default (undefined)
      if (avatarDeleted) {
        avatarUrl = undefined
        setAvatarDeleted(false)
      } else if (avatarFile) {
        // Save avatar if changed
        const { saveAvatar } = await import('@/lib/file-persistence')
        avatarUrl = await saveAvatar(user.id, avatarFile)
      } else if (!avatarPreview) {
        // If no preview and not deleted, keep current
        avatarUrl = user.avatar
      } else {
        avatarUrl = avatarPreview
      }

      if (bannerDeleted) {
        bannerUrl = undefined
        setBannerDeleted(false)
      } else if (bannerFile) {
        // Save banner if changed
        const { saveBanner } = await import('@/lib/file-persistence')
        bannerUrl = await saveBanner(user.id, bannerFile)
      } else if (!bannerPreview) {
        // If no preview and not deleted, keep current
        bannerUrl = user.banner
      } else {
        bannerUrl = bannerPreview
      }

      const updatedUser = db.users.update(user.id, {
        username: data.username,
        description: data.description || '',
        avatar: avatarUrl,
        banner: bannerUrl,
        avatarFrame: selectedFrame,
        socialLinks: {
          youtube: data.youtube || undefined,
          twitter: data.twitter || undefined,
          instagram: data.instagram || undefined,
          website: data.website || undefined,
        },
      })

      if (updatedUser) {
        // Update in store
        setUser(updatedUser)
        // Update in localStorage
        const storage = localStorage.getItem('yt2-storage')
        if (storage) {
          try {
            const parsed = JSON.parse(storage)
            parsed.state.user = updatedUser
            localStorage.setItem('yt2-storage', JSON.stringify(parsed))
          } catch (e) {
            // Ignore
          }
        }
        toast.success('Настройки сохранены!')
        router.push(`/channel/${user.id}`)
      }
    } catch (error) {
      toast.error('Ошибка сохранения настроек')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className={styles.notAuth}>
        <h2>Войдите, чтобы изменить настройки</h2>
      </div>
    )
  }

  return (
    <div className={styles.settingsPage}>
      <div className={`${styles.settingsCard} ${styles.fadeInUp}`}>
        <h1 className={styles.title}>Настройки канала</h1>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <FiImage />
              <span>Изображения</span>
            </h2>

            <div className={styles.imageUploads}>
              <div className={styles.imageUpload}>
                <label>Баннер канала</label>
                {bannerPreview ? (
                  <div className={styles.preview}>
                    <img src={bannerPreview} alt="Banner" />
                    <div className={styles.previewActions}>
                      <label className={styles.changeButton}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBannerChange}
                          className={styles.fileInput}
                        />
                        <FiEdit2 />
                        Сменить
                      </label>
                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => {
                          setBannerFile(null)
                          setBannerPreview(null)
                          setBannerDeleted(true)
                          toast.success('Баннер будет сброшен при сохранении')
                        }}
                      >
                        <FiTrash2 />
                        Удалить
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className={styles.uploadArea}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerChange}
                      className={styles.fileInput}
                    />
                    <span>Загрузить баннер</span>
                  </label>
                )}
              </div>

              <div className={styles.imageUpload}>
                <label>Аватар</label>
                {avatarPreview ? (
                  <div className={styles.preview}>
                    <img src={avatarPreview} alt="Avatar" className={styles.avatarPreview} />
                    <div className={styles.previewActions}>
                      <label className={styles.changeButton}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className={styles.fileInput}
                        />
                        <FiEdit2 />
                        Сменить
                      </label>
                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => {
                          setAvatarFile(null)
                          setAvatarPreview(null)
                          setAvatarDeleted(true)
                          toast.success('Аватар будет сброшен при сохранении')
                        }}
                      >
                        <FiTrash2 />
                        Удалить
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className={styles.uploadArea}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className={styles.fileInput}
                    />
                    <span>Загрузить аватар</span>
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 
              className={styles.sectionTitle}
              onClick={() => setFramesExpanded(!framesExpanded)}
              style={{ cursor: 'pointer' }}
            >
              <FiAward />
              <span>Рамка аватара</span>
              {framesExpanded ? <FiChevronUp /> : <FiChevronDown />}
            </h2>

            {framesExpanded && (
              <div className={styles.frameSelector}>
                <p className={styles.frameDescription}>
                  Выберите рамку для вашего аватара. Рамки могут быть получены через сезонные ивенты или выданы администратором.
                </p>
                <div className={styles.framesGrid}>
                  {([
                    'none',
                    'gold',
                    'silver',
                    'bronze',
                    'rainbow',
                    'premium',
                    'autumn-leaves',
                    'autumn-gold',
                    'autumn-pumpkin',
                    'winter-snow',
                    'winter-frost',
                    'winter-holiday',
                    'spring-flowers',
                    'spring-petals',
                    'spring-bloom',
                    'summer-waves',
                    'summer-sun',
                    'summer-beach',
                    ...(user?.isOfficial ? ['official-gold'] : []),
                  ] as AvatarFrame[]).map((frame) => {
                    const isOfficialOnly = frame === 'official-gold'
                    const canUse = !isOfficialOnly || user?.isOfficial
                    
                    return (
                      <button
                        key={frame}
                        type="button"
                        className={`${styles.frameOption} ${selectedFrame === frame ? styles.active : ''} ${!canUse ? styles.disabled : ''}`}
                        onClick={() => {
                          if (canUse) {
                            setSelectedFrame(frame)
                          } else {
                            toast.error('Эта рамка доступна только для официального канала')
                          }
                        }}
                        data-frame={frame}
                        disabled={!canUse}
                        title={!canUse ? 'Доступно только для официального канала' : undefined}
                      >
                        <div className={styles.framePreview}>
                          <div className={`${styles.frameAvatar} ${styles[`frame-${frame}`]}`}>
                            {avatarPreview ? (
                              <img src={avatarPreview} alt="Avatar" />
                            ) : (
                              <div className={styles.framePlaceholder}>
                                {user?.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className={styles.frameName}>
                          {frame === 'none' ? 'Без рамки' : frame.replace(/-/g, ' ')}
                        </span>
                        {isOfficialOnly && !user?.isOfficial && (
                          <span className={styles.officialOnlyBadge}>Official Only</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <FiUser />
              <span>Основная информация</span>
            </h2>

            <div className={styles.field}>
              <label htmlFor="username">Имя пользователя</label>
              <input
                id="username"
                type="text"
                placeholder="username"
                {...register('username')}
              />
              {errors.username && (
                <span className={styles.error}>{errors.username.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="description">Описание канала</label>
              <textarea
                id="description"
                placeholder="Расскажите о вашем канале"
                rows={4}
                {...register('description')}
              />
            </div>
          </div>

          <div className={styles.section}>
            <h2 
              className={styles.sectionTitle}
              onClick={() => setSecurityExpanded(!securityExpanded)}
              style={{ cursor: 'pointer' }}
            >
              <FiShield />
              <span>Безопасность</span>
              {securityExpanded ? <FiChevronUp /> : <FiChevronDown />}
            </h2>

            {securityExpanded && (
              <div className={styles.securityContent}>
                {/* Change Password */}
                <div className={styles.securitySubsection}>
                  <h3 className={styles.subsectionTitle}>
                    <FiLock />
                    <span>Изменить пароль</span>
                  </h3>
                  <div className={styles.field}>
                    <label htmlFor="oldPassword">Текущий пароль</label>
                    <input
                      id="oldPassword"
                      type="password"
                      placeholder="Введите текущий пароль"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="newPassword">Новый пароль</label>
                    <input
                      id="newPassword"
                      type="password"
                      placeholder="Введите новый пароль"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="confirmPassword">Подтвердите пароль</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="Повторите новый пароль"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.changePasswordButton}
                    onClick={async () => {
                      if (!oldPassword || !newPassword || !confirmPassword) {
                        toast.error('Заполните все поля')
                        return
                      }
                      if (newPassword.length < 6) {
                        toast.error('Пароль должен быть не менее 6 символов')
                        return
                      }
                      if (newPassword !== confirmPassword) {
                        toast.error('Пароли не совпадают')
                        return
                      }
                      setChangingPassword(true)
                      try {
                        // Verify old password
                        const currentUser = db.users.findById(user!.id)
                        if (!currentUser) {
                          toast.error('Пользователь не найден')
                          return
                        }
                        
                        // Check if user has a password (for existing users)
                        if (currentUser.password) {
                          const isOldPasswordValid = await bcrypt.compare(oldPassword, currentUser.password)
                          if (!isOldPasswordValid) {
                            toast.error('Неверный текущий пароль')
                            setChangingPassword(false)
                            return
                          }
                        } else {
                          // For users without password (created via admin), allow any old password
                          // In production, you might want to require setting a password first
                        }
                        
                        // Hash and save new password
                        const hashedPassword = await bcrypt.hash(newPassword, 10)
                        const updated = db.users.update(user!.id, { password: hashedPassword })
                        
                        if (updated) {
                          toast.success('Пароль успешно изменен')
                          setOldPassword('')
                          setNewPassword('')
                          setConfirmPassword('')
                          // Update user in store
                          setUser(updated)
                        } else {
                          toast.error('Ошибка при обновлении пароля')
                        }
                      } catch (error) {
                        console.error('Password change error:', error)
                        toast.error('Ошибка при изменении пароля')
                      } finally {
                        setChangingPassword(false)
                      }
                    }}
                    disabled={changingPassword}
                  >
                    <FiKey />
                    <span>{changingPassword ? 'Изменение...' : 'Изменить пароль'}</span>
                  </button>
                </div>

                {/* Additional Security Settings */}
                <div className={styles.securitySubsection}>
                  <h3 className={styles.subsectionTitle}>
                    <FiShield />
                    <span>Дополнительные настройки безопасности</span>
                  </h3>
                  <div className={styles.securityOptions}>
                    <div className={styles.securityOption}>
                      <div className={styles.optionInfo}>
                        <h4>История входов</h4>
                        <p>Просмотр последних входов в аккаунт</p>
                      </div>
                      <button
                        type="button"
                        className={styles.viewHistoryButton}
                        onClick={() => {
                          setShowLoginHistory(true)
                        }}
                      >
                        <FiActivity />
                        <span>Просмотреть</span>
                      </button>
                    </div>
                    <div className={styles.securityOption}>
                      <div className={styles.optionInfo}>
                        <h4>Активные сессии</h4>
                        <p>Управление активными сессиями на других устройствах</p>
                      </div>
                      <button
                        type="button"
                        className={styles.viewSessionsButton}
                        onClick={() => {
                          setShowSessions(true)
                        }}
                      >
                        <FiClock />
                        <span>Управление</span>
                      </button>
                    </div>
                    <div className={styles.securityOption}>
                      <div className={styles.optionInfo}>
                        <h4>Резервные коды 2FA</h4>
                        <p>Просмотр и генерация новых резервных кодов</p>
                      </div>
                      <button
                        type="button"
                        className={styles.regenerateCodesButton}
                        onClick={() => {
                          if (!twoFactorEnabled) {
                            toast.error('Сначала включите 2FA')
                            return
                          }
                          const codes = generateBackupCodes()
                          db.users.update(user!.id, { backupCodes: codes } as any)
                          setBackupCodes(codes)
                          setShowBackupCodes(true)
                          toast.success('Новые резервные коды сгенерированы!')
                        }}
                        disabled={!twoFactorEnabled}
                      >
                        <FiKey />
                        <span>Обновить коды</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className={styles.securitySubsection}>
                  <h3 className={styles.subsectionTitle}>
                    <FiShield />
                    <span>Двухфакторная аутентификация</span>
                  </h3>
                  {!twoFactorEnabled ? (
                    <div>
                      <p className={styles.securityDescription}>
                        Добавьте дополнительный уровень защиты для вашего аккаунта с помощью Google Authenticator.
                      </p>
                      {!twoFactorSecret ? (
                        <button
                          type="button"
                          className={styles.enable2FAButton}
                          onClick={() => {
                            const secret = generateSecret()
                            const qrUrl = generateQRCodeUrl(secret, user!.email)
                            setTwoFactorSecret(secret)
                            setTwoFactorQR(qrUrl)
                          }}
                        >
                          <FiShield />
                          <span>Включить 2FA</span>
                        </button>
                      ) : (
                        <div className={styles.twoFactorSetup}>
                          <p className={styles.setupInstructions}>
                            1. Отсканируйте QR-код в приложении Google Authenticator
                          </p>
                          <div className={styles.qrCodeContainer}>
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(twoFactorQR!)}`}
                              alt="QR Code"
                              className={styles.qrCode}
                            />
                          </div>
                          <p className={styles.setupInstructions}>
                            2. Введите 6-значный код из приложения
                          </p>
                          <div className={styles.field}>
                            <input
                              type="text"
                              placeholder="000000"
                              maxLength={6}
                              value={twoFactorCode}
                              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                              className={styles.twoFactorInput}
                            />
                          </div>
                          <div className={styles.twoFactorActions}>
                            <button
                              type="button"
                              className={styles.confirm2FAButton}
                              onClick={async () => {
                                if (twoFactorCode.length !== 6) {
                                  toast.error('Введите 6-значный код')
                                  return
                                }
                                setEnabling2FA(true)
                                try {
                                  // Verify code
                                  if (verifyTOTP(twoFactorCode, twoFactorSecret)) {
                                    const codes = generateBackupCodes()
                                    db.users.update(user!.id, { 
                                      twoFactorEnabled: true,
                                      twoFactorSecret: twoFactorSecret,
                                      backupCodes: codes
                                    } as any)
                                    setTwoFactorEnabled(true)
                                    setBackupCodes(codes)
                                    setShowBackupCodes(true)
                                    toast.success('2FA успешно включена!')
                                  } else {
                                    toast.error('Неверный код')
                                  }
                                } catch (error) {
                                  toast.error('Ошибка при включении 2FA')
                                } finally {
                                  setEnabling2FA(false)
                                }
                              }}
                              disabled={enabling2FA || twoFactorCode.length !== 6}
                            >
                              <FiCheck />
                              <span>Подтвердить</span>
                            </button>
                            <button
                              type="button"
                              className={styles.cancel2FAButton}
                              onClick={() => {
                                setTwoFactorSecret(null)
                                setTwoFactorQR(null)
                                setTwoFactorCode('')
                              }}
                            >
                              Отмена
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className={styles.twoFactorStatus}>
                        <span className={styles.statusBadge}>✓ 2FA включена</span>
                      </div>
                      {showBackupCodes && backupCodes.length > 0 && (
                        <div className={styles.backupCodesContainer}>
                          <p className={styles.backupCodesWarning}>
                            ⚠️ Сохраните эти резервные коды в безопасном месте. Они понадобятся, если вы потеряете доступ к приложению.
                          </p>
                          <div className={styles.backupCodes}>
                            {backupCodes.map((code, i) => (
                              <div key={i} className={styles.backupCode}>{code}</div>
                            ))}
                          </div>
                          <button
                            type="button"
                            className={styles.copyCodesButton}
                            onClick={() => {
                              navigator.clipboard.writeText(backupCodes.join('\n'))
                              toast.success('Коды скопированы!')
                            }}
                          >
                            <FiCopy />
                            <span>Копировать все коды</span>
                          </button>
                        </div>
                      )}
                      <button
                        type="button"
                        className={styles.disable2FAButton}
                        onClick={() => {
                          if (confirm('Вы уверены, что хотите отключить 2FA?')) {
                            db.users.update(user!.id, { 
                              twoFactorEnabled: false,
                              twoFactorSecret: null,
                              backupCodes: []
                            } as any)
                            setTwoFactorEnabled(false)
                            setTwoFactorSecret(null)
                            setBackupCodes([])
                            setShowBackupCodes(false)
                            toast.success('2FA отключена')
                          }
                        }}
                      >
                        Отключить 2FA
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <FiGlobe />
              <span>Социальные сети</span>
            </h2>

            <div className={styles.field}>
              <label htmlFor="youtube">YouTube</label>
              <input
                id="youtube"
                type="url"
                placeholder="https://youtube.com/@channel"
                {...register('youtube')}
              />
              {errors.youtube && (
                <span className={styles.error}>{errors.youtube.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="twitter">Twitter</label>
              <input
                id="twitter"
                type="url"
                placeholder="https://twitter.com/username"
                {...register('twitter')}
              />
              {errors.twitter && (
                <span className={styles.error}>{errors.twitter.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="instagram">Instagram</label>
              <input
                id="instagram"
                type="url"
                placeholder="https://instagram.com/username"
                {...register('instagram')}
              />
              {errors.instagram && (
                <span className={styles.error}>{errors.instagram.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="website">Веб-сайт</label>
              <input
                id="website"
                type="url"
                placeholder="https://example.com"
                {...register('website')}
              />
              {errors.website && (
                <span className={styles.error}>{errors.website.message}</span>
              )}
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => router.back()}
              disabled={saving}
            >
              Отмена
            </button>
            <button type="submit" className={styles.saveButton} disabled={saving}>
              <FiSave />
              <span>{saving ? 'Сохранение...' : 'Сохранить'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Login History Modal */}
      {showLoginHistory && (
        <div className={styles.modalOverlay} onClick={() => setShowLoginHistory(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>История входов</h2>
              <button
                className={styles.modalClose}
                onClick={() => setShowLoginHistory(false)}
              >
                <FiX />
              </button>
            </div>
            <div className={styles.modalContent}>
              {user && db.loginHistory.findByUserId(user.id).length === 0 ? (
                <div className={styles.emptyState}>
                  <FiActivity />
                  <p>История входов пуста</p>
                </div>
              ) : (
                <div className={styles.historyList}>
                  {user && db.loginHistory.findByUserId(user.id).slice(0, 50).map((entry) => (
                    <div key={entry.id} className={styles.historyItem}>
                      <div className={styles.historyIcon}>
                        {entry.success ? (
                          <FiCheck className={styles.successIcon} />
                        ) : (
                          <FiX className={styles.errorIcon} />
                        )}
                      </div>
                      <div className={styles.historyInfo}>
                        <div className={styles.historyMain}>
                          <span className={styles.historyStatus}>
                            {entry.success ? 'Успешный вход' : `Неудачная попытка: ${entry.failureReason || 'Неизвестная ошибка'}`}
                          </span>
                          <span className={styles.historyTime}>
                            {new Date(entry.timestamp).toLocaleString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className={styles.historyDetails}>
                          {entry.device && (
                            <span className={styles.historyDetail}>
                              {entry.device === 'Mobile' ? <FiSmartphone /> : <FiMonitor />}
                              {entry.device}
                            </span>
                          )}
                          {entry.location && (
                            <span className={styles.historyDetail}>
                              📍 {entry.location}
                            </span>
                          )}
                          {entry.ip && (
                            <span className={styles.historyDetail}>
                              IP: {entry.ip}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Sessions Modal */}
      {showSessions && (
        <div className={styles.modalOverlay} onClick={() => setShowSessions(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Активные сессии</h2>
              <button
                className={styles.modalClose}
                onClick={() => setShowSessions(false)}
              >
                <FiX />
              </button>
            </div>
            <div className={styles.modalContent}>
              {user && db.sessions.findByUserId(user.id).length === 0 ? (
                <div className={styles.emptyState}>
                  <FiClock />
                  <p>Нет активных сессий</p>
                </div>
              ) : (
                <>
                  <div className={styles.sessionsList}>
                    {user && db.sessions.findByUserId(user.id).map((session) => (
                      <div key={session.id} className={styles.sessionItem}>
                        <div className={styles.sessionIcon}>
                          {session.device === 'Mobile' ? <FiSmartphone /> : <FiMonitor />}
                        </div>
                        <div className={styles.sessionInfo}>
                          <div className={styles.sessionMain}>
                            <span className={styles.sessionDevice}>
                              {session.device || 'Unknown Device'}
                              {session.isCurrent && (
                                <span className={styles.currentBadge}>Текущая сессия</span>
                              )}
                            </span>
                            <span className={styles.sessionTime}>
                              Последняя активность: {new Date(session.lastActivity).toLocaleString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div className={styles.sessionDetails}>
                            {session.location && (
                              <span className={styles.sessionDetail}>
                                📍 {session.location}
                              </span>
                            )}
                            {session.ip && (
                              <span className={styles.sessionDetail}>
                                IP: {session.ip}
                              </span>
                            )}
                            <span className={styles.sessionDetail}>
                              Создана: {new Date(session.createdAt).toLocaleString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                        {!session.isCurrent && (
                          <button
                            className={styles.sessionDelete}
                            onClick={() => {
                              db.sessions.delete(session.id)
                              toast.success('Сессия завершена')
                              setShowSessions(false)
                              setTimeout(() => setShowSessions(true), 100)
                            }}
                            title="Завершить сессию"
                          >
                            <FiLogOut />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {user && db.sessions.findByUserId(user.id).filter(s => !s.isCurrent).length > 0 && (
                    <button
                      className={styles.terminateAllButton}
                      onClick={() => {
                        const currentSession = db.sessions.findByUserId(user!.id).find(s => s.isCurrent)
                        db.sessions.deleteAll(user!.id, currentSession?.id)
                        toast.success('Все другие сессии завершены')
                        setShowSessions(false)
                        setTimeout(() => setShowSessions(true), 100)
                      }}
                    >
                      <FiLogOut />
                      Завершить все другие сессии
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

