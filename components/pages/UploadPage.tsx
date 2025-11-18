'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useStore } from '@/lib/store'
import { db } from '@/lib/db'
import { notifyNewVideo } from '@/lib/notifications'
import toast from 'react-hot-toast'
import { FiUpload, FiImage, FiX } from 'react-icons/fi'
import styles from './UploadPage.module.scss'
import { motion } from 'framer-motion'

const uploadSchema = z.object({
  title: z.string().min(1, 'Введите заголовок'),
  description: z.string().optional(),
  tags: z.string().optional(),
  category: z.string().min(1, 'Выберите категорию'),
  privacy: z.enum(['public', 'unlisted', 'subscribers']),
})

type UploadForm = z.infer<typeof uploadSchema>

const categories = [
  'Музыка',
  'Фильмы',
  'Игры',
  'Новости',
  'Спорт',
  'Обучение',
  'Развлечения',
  'Технологии',
  'Путешествия',
  'Кулинария',
]

export function UploadPage() {
  const router = useRouter()
  const { user } = useStore()
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UploadForm>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      privacy: 'public',
      category: '',
    },
  })

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!['video/mp4', 'video/mov', 'video/webm'].includes(file.type)) {
        toast.error('Поддерживаются только MP4, MOV и WebM')
        return
      }
      setVideoFile(file)
      const url = URL.createObjectURL(file)
      setVideoPreview(url)
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Выберите изображение')
        return
      }
      setThumbnailFile(file)
      const url = URL.createObjectURL(file)
      setThumbnailPreview(url)
    }
  }

  const onSubmit = async (data: UploadForm) => {
    if (!user) {
      toast.error('Войдите, чтобы загрузить видео')
      return
    }

    if (!videoFile) {
      toast.error('Выберите видео')
      return
    }

    setUploading(true)

    try {
      // Sanitize inputs
      if (typeof window !== 'undefined') {
        const { sanitizeInput, sanitizeHTML } = await import('@/lib/security')
        data.title = sanitizeInput(data.title)
        data.description = sanitizeHTML(data.description || '')
        if (data.tags) {
          data.tags = data.tags.split(',').map(tag => sanitizeInput(tag.trim())).filter(Boolean).join(',')
        }
      }
      
      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Save thumbnail if provided
      let thumbnailUrl = thumbnailPreview || videoPreview || ''
      if (thumbnailFile) {
        const { saveThumbnail } = await import('@/lib/file-persistence')
        const videoId = Date.now().toString()
        thumbnailUrl = await saveThumbnail(videoId, thumbnailFile)
      }

      // In production, upload files to storage (S3, Cloudinary, etc.)
      const videoUrl = URL.createObjectURL(videoFile)

      // Get video duration (simulated)
      const duration = 120 // In production, extract from video file

      const tags = data.tags
        ? data.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : []

      const video = db.videos.create({
        title: data.title,
        description: data.description || '',
        videoUrl,
        thumbnailUrl,
        duration,
        category: data.category,
        tags,
        privacy: data.privacy,
        userId: user.id,
      })

      // Award currency for video upload
      if (typeof window !== 'undefined') {
        const { addCurrency, CURRENCY_RULES } = await import('@/lib/currency')
        addCurrency(user.id, CURRENCY_RULES.VIDEO_UPLOAD, 'Загрузка видео')
      }

      // Notify subscribers about new video
      if (video.privacy === 'public') {
        const subscriptions = db.subscriptions.findByChannelId(user.id)
        subscriptions.forEach((sub) => {
          notifyNewVideo(sub.userId, video.title, video.id, user.username)
        })
      }

      // Check seasonal events
      import('@/lib/seasonal-events').then(({ checkSeasonalEvents }) => {
        checkSeasonalEvents(user.id)
      })

      toast.success('Видео загружено успешно!')
      router.push(`/watch/${video.id}`)
    } catch (error) {
      toast.error('Ошибка загрузки видео')
    } finally {
      setUploading(false)
    }
  }

  if (!user) {
    return (
      <div className={styles.notAuth}>
        <h2>Войдите, чтобы загрузить видео</h2>
      </div>
    )
  }

  return (
    <div className={styles.uploadPage}>
      <motion.div
        className={styles.uploadCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className={styles.title}>Загрузить видео</h1>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.uploadSection}>
            <div className={styles.videoUpload}>
              {videoPreview ? (
                <div className={styles.preview}>
                  <video src={videoPreview} controls className={styles.videoPreview} />
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => {
                      setVideoFile(null)
                      setVideoPreview(null)
                    }}
                  >
                    <FiX />
                  </button>
                </div>
              ) : (
                <label className={styles.uploadArea}>
                  <input
                    type="file"
                    accept="video/mp4,video/mov,video/webm"
                    onChange={handleVideoChange}
                    className={styles.fileInput}
                  />
                  <FiUpload className={styles.uploadIcon} />
                  <span>Выберите видео (MP4, MOV, WebM)</span>
                </label>
              )}
            </div>

            <div className={styles.thumbnailUpload}>
              {thumbnailPreview ? (
                <div className={styles.preview}>
                  <img src={thumbnailPreview} alt="Thumbnail" className={styles.thumbnailPreview} />
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => {
                      setThumbnailFile(null)
                      setThumbnailPreview(null)
                    }}
                  >
                    <FiX />
                  </button>
                </div>
              ) : (
                <label className={styles.uploadArea}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className={styles.fileInput}
                  />
                  <FiImage className={styles.uploadIcon} />
                  <span>Выберите миниатюру (опционально)</span>
                </label>
              )}
            </div>
          </div>

          <div className={styles.formFields}>
            <div className={styles.field}>
              <label htmlFor="title">Заголовок *</label>
              <input
                id="title"
                type="text"
                placeholder="Введите заголовок видео"
                {...register('title')}
              />
              {errors.title && <span className={styles.error}>{errors.title.message}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="description">Описание</label>
              <textarea
                id="description"
                placeholder="Расскажите о вашем видео"
                rows={4}
                {...register('description')}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="tags">Теги (через запятую)</label>
              <input
                id="tags"
                type="text"
                placeholder="технологии, программирование, обучение"
                {...register('tags')}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="category">Категория *</label>
              <select id="category" {...register('category')}>
                <option value="">Выберите категорию</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span className={styles.error}>{errors.category.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="privacy">Приватность</label>
              <select id="privacy" {...register('privacy')}>
                <option value="public">Публичное</option>
                <option value="unlisted">Непубличное</option>
                <option value="subscribers">Только для подписчиков</option>
              </select>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => router.back()}
              disabled={uploading}
            >
              Отмена
            </button>
            <button type="submit" className={styles.submitButton} disabled={uploading}>
              {uploading ? 'Загрузка...' : 'Опубликовать'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

