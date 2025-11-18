'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { db } from '@/lib/db'
import { Video, Comment, Playlist } from '@/types'
import { getUserCurrency, getTransactions } from '@/lib/currency'
import {
  FiVideo,
  FiEye,
  FiThumbsUp,
  FiTrendingUp,
  FiEdit3,
  FiTrash2,
  FiSettings,
  FiBarChart2,
  FiUsers,
  FiClock,
  FiMessageCircle,
  FiList,
  FiDollarSign,
} from 'react-icons/fi'
import styles from './StudioPage.module.scss'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

export function StudioPage() {
  const router = useRouter()
  const { user } = useStore()
  const [videos, setVideos] = useState<Video[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'analytics' | 'comments' | 'playlists' | 'earnings'>('overview')

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    loadVideos()
  }, [user, router])

  const loadVideos = () => {
    if (!user) return

    const userVideos = db.videos.findByUserId(user.id)
    setVideos(userVideos)
    
    // Load comments for user's videos
    const allComments: Comment[] = []
    userVideos.forEach(video => {
      const videoComments = db.comments.findByVideoId(video.id)
      allComments.push(...videoComments)
      // Add replies
      videoComments.forEach(comment => {
        if (comment.replies) {
          allComments.push(...comment.replies)
        }
      })
    })
    setComments(allComments)
    
    // Load playlists
    const userPlaylists = db.playlists.findByUserId(user.id)
    setPlaylists(userPlaylists)
    
    setLoading(false)
  }

  const stats = {
    totalVideos: videos.length,
    totalViews: videos.reduce((sum, v) => sum + v.views, 0),
    totalLikes: videos.reduce((sum, v) => sum + v.likes, 0),
    totalSubscribers: user?.subscribersCount || 0,
  }

  const handleDeleteVideo = (videoId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это видео?')) return

    db.videos.delete(videoId)
    loadVideos()
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    )
  }

  return (
    <div className={styles.studioPage}>
      <div className={`${styles.header} ${styles.fadeInDown}`}>
        <div className={styles.headerContent}>
          <div>
            <h1>Творческая студия</h1>
            <p>Управляйте своим каналом и видео</p>
          </div>
          <Link href="/upload" className={styles.uploadButton}>
            <FiVideo />
            <span>Загрузить видео</span>
          </Link>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FiBarChart2 />
          Обзор
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'videos' ? styles.active : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          <FiVideo />
          Видео ({videos.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'analytics' ? styles.active : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <FiTrendingUp />
          Аналитика
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'comments' ? styles.active : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          <FiMessageCircle />
          Комментарии
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'playlists' ? styles.active : ''}`}
          onClick={() => setActiveTab('playlists')}
        >
          <FiList />
          Плейлисты
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'earnings' ? styles.active : ''}`}
          onClick={() => setActiveTab('earnings')}
        >
          <FiDollarSign />
          Доходы
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className={`${styles.overview} ${styles.fadeInUp}`}>
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.fadeInScale}`} style={{ animationDelay: '0.1s' }}>
              <div className={styles.statIcon}>
                <FiVideo />
              </div>
              <div className={styles.statInfo}>
                <h3>{stats.totalVideos}</h3>
                <p>Всего видео</p>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.fadeInScale}`} style={{ animationDelay: '0.2s' }}>
              <div className={styles.statIcon}>
                <FiEye />
              </div>
              <div className={styles.statInfo}>
                <h3>{stats.totalViews.toLocaleString()}</h3>
                <p>Всего просмотров</p>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.fadeInScale}`} style={{ animationDelay: '0.3s' }}>
              <div className={styles.statIcon}>
                <FiThumbsUp />
              </div>
              <div className={styles.statInfo}>
                <h3>{stats.totalLikes.toLocaleString()}</h3>
                <p>Всего лайков</p>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.fadeInScale}`} style={{ animationDelay: '0.4s' }}>
              <div className={styles.statIcon}>
                <FiUsers />
              </div>
              <div className={styles.statInfo}>
                <h3>{stats.totalSubscribers.toLocaleString()}</h3>
                <p>Подписчиков</p>
              </div>
            </div>
          </div>

          <div className={styles.recentVideos}>
            <h2>Последние видео</h2>
            {videos.length === 0 ? (
              <div className={styles.empty}>
                <FiVideo className={styles.emptyIcon} />
                <h3>Нет загруженных видео</h3>
                <Link href="/upload" className={styles.uploadLink}>
                  Загрузить первое видео
                </Link>
              </div>
            ) : (
              <div className={styles.videosList}>
                {videos.slice(0, 5).map((video) => (
                  <div key={video.id} className={`${styles.videoItem} ${styles.fadeInLeft}`}>
                    <Link href={`/watch/${video.id}`} className={styles.videoThumbnail}>
                      <img src={video.thumbnailUrl} alt={video.title} />
                      <div className={styles.videoDuration}>
                        {Math.floor(video.duration / 60)}:
                        {String(video.duration % 60).padStart(2, '0')}
                      </div>
                    </Link>
                    <div className={styles.videoInfo}>
                      <Link href={`/watch/${video.id}`} className={styles.videoTitle}>
                        {video.title}
                      </Link>
                      <div className={styles.videoMeta}>
                        <span>
                          <FiEye /> {video.views} просмотров
                        </span>
                        <span>
                          <FiThumbsUp /> {video.likes} лайков
                        </span>
                        <span>
                          <FiClock />{' '}
                          {formatDistanceToNow(new Date(video.createdAt), {
                            addSuffix: true,
                            locale: ru,
                          })}
                        </span>
                      </div>
                    </div>
                    <div className={styles.videoActions}>
                      <Link
                        href={`/watch/${video.id}`}
                        className={styles.actionButton}
                        title="Редактировать"
                      >
                        <FiEdit3 />
                      </Link>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleDeleteVideo(video.id)}
                        title="Удалить"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'videos' && (
        <div className={`${styles.videosTab} ${styles.fadeInUp}`}>
          <div className={styles.videosHeader}>
            <h2>Все видео ({videos.length})</h2>
            <Link href="/upload" className={styles.uploadButton}>
              <FiVideo />
              <span>Загрузить видео</span>
            </Link>
          </div>

          {videos.length === 0 ? (
            <div className={styles.empty}>
              <FiVideo className={styles.emptyIcon} />
              <h3>Нет загруженных видео</h3>
              <Link href="/upload" className={styles.uploadLink}>
                Загрузить первое видео
              </Link>
            </div>
          ) : (
            <div className={styles.videosGrid}>
              {videos.map((video) => (
                <div key={video.id} className={`${styles.videoCard} ${styles.fadeInScale}`}>
                  <Link href={`/watch/${video.id}`} className={styles.thumbnail}>
                    <img src={video.thumbnailUrl} alt={video.title} />
                    <div className={styles.duration}>
                      {Math.floor(video.duration / 60)}:
                      {String(video.duration % 60).padStart(2, '0')}
                    </div>
                  </Link>
                  <div className={styles.cardInfo}>
                    <Link href={`/watch/${video.id}`} className={styles.cardTitle}>
                      {video.title}
                    </Link>
                    <div className={styles.cardMeta}>
                      <span>
                        <FiEye /> {video.views}
                      </span>
                      <span>
                        <FiThumbsUp /> {video.likes}
                      </span>
                      <span>
                        {formatDistanceToNow(new Date(video.createdAt), {
                          addSuffix: true,
                          locale: ru,
                        })}
                      </span>
                    </div>
                    <div className={styles.cardActions}>
                      <Link
                        href={`/watch/${video.id}`}
                        className={styles.cardButton}
                        title="Открыть"
                      >
                        <FiEdit3 />
                        Редактировать
                      </Link>
                      <button
                        className={`${styles.cardButton} ${styles.deleteButton}`}
                        onClick={() => handleDeleteVideo(video.id)}
                        title="Удалить"
                      >
                        <FiTrash2 />
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className={`${styles.analytics} ${styles.fadeInUp}`}>
          <h2>Аналитика канала</h2>
          <div className={styles.analyticsGrid}>
            <div className={styles.analyticsCard}>
              <h3>Просмотры за последние 30 дней</h3>
              <div className={styles.chartPlaceholder}>
                <FiBarChart2 className={styles.chartIcon} />
                <p>График просмотров</p>
                <span>Всего: {stats.totalViews} просмотров</span>
              </div>
            </div>
            <div className={styles.analyticsCard}>
              <h3>Топ видео</h3>
              <div className={styles.topVideos}>
                {videos
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 5)
                  .map((video, index) => (
                    <div key={video.id} className={styles.topVideoItem}>
                      <span className={styles.rank}>#{index + 1}</span>
                      <Link href={`/watch/${video.id}`} className={styles.topVideoTitle}>
                        {video.title}
                      </Link>
                      <span className={styles.topVideoViews}>{video.views} просмотров</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'comments' && (
        <div className={`${styles.commentsTab} ${styles.fadeInUp}`}>
          <h2>Комментарии к вашим видео ({comments.length})</h2>
          {comments.length === 0 ? (
            <div className={styles.empty}>
              <FiMessageCircle className={styles.emptyIcon} />
              <h3>Пока нет комментариев</h3>
              <p>Комментарии к вашим видео появятся здесь</p>
            </div>
          ) : (
            <div className={styles.commentsList}>
              {comments.map((comment) => {
                const video = videos.find(v => v.id === comment.videoId)
                return (
                  <div key={comment.id} className={styles.commentItem}>
                    <div className={styles.commentHeader}>
                      <Link href={`/watch/${comment.videoId}`} className={styles.videoLink}>
                        {video?.title || 'Видео удалено'}
                      </Link>
                      <span className={styles.commentDate}>
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ru })}
                      </span>
                    </div>
                    <div className={styles.commentContent}>
                      <p>{comment.text}</p>
                      <div className={styles.commentStats}>
                        <span><FiThumbsUp /> {comment.likes}</span>
                        {comment.replies && comment.replies.length > 0 && (
                          <span><FiMessageCircle /> {comment.replies.length} ответов</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'playlists' && (
        <div className={`${styles.playlistsTab} ${styles.fadeInUp}`}>
          <h2>Плейлисты ({playlists.length})</h2>
          {playlists.length === 0 ? (
            <div className={styles.empty}>
              <FiList className={styles.emptyIcon} />
              <h3>У вас пока нет плейлистов</h3>
              <p>Создайте плейлист, чтобы организовать свои видео</p>
            </div>
          ) : (
            <div className={styles.playlistsGrid}>
              {playlists.map((playlist) => (
                <div key={playlist.id} className={styles.playlistCard}>
                  <h3>{playlist.name}</h3>
                  {playlist.description && <p>{playlist.description}</p>}
                  <div className={styles.playlistStats}>
                    <span>{playlist.videos?.length || 0} видео</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'earnings' && user && (
        <div className={`${styles.earningsTab} ${styles.fadeInUp}`}>
          <h2>Доходы</h2>
          <div className={styles.earningsOverview}>
            <div className={styles.earningsCard}>
              <h3>Текущий баланс</h3>
              <div className={styles.balance}>
                {getUserCurrency(user.id)} <span className={styles.currencyUnit}>монет</span>
              </div>
            </div>
            <div className={styles.earningsCard}>
              <h3>Всего заработано</h3>
              <div className={styles.totalEarned}>
                {getTransactions(user.id)
                  .filter(t => t.type === 'earn')
                  .reduce((sum, t) => sum + t.amount, 0)} <span className={styles.currencyUnit}>монет</span>
              </div>
            </div>
            <div className={styles.earningsCard}>
              <h3>Всего потрачено</h3>
              <div className={styles.totalSpent}>
                {getTransactions(user.id)
                  .filter(t => t.type === 'spend')
                  .reduce((sum, t) => sum + t.amount, 0)} <span className={styles.currencyUnit}>монет</span>
              </div>
            </div>
          </div>
          <div className={styles.transactionsSection}>
            <h3>История транзакций</h3>
            <div className={styles.transactionsList}>
              {getTransactions(user.id).slice(0, 50).map((transaction) => (
                <div key={transaction.id} className={styles.transactionItem}>
                  <div className={styles.transactionInfo}>
                    <span className={styles.transactionReason}>{transaction.reason}</span>
                    <span className={styles.transactionDate}>
                      {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true, locale: ru })}
                    </span>
                  </div>
                  <div className={`${styles.transactionAmount} ${transaction.type === 'earn' ? styles.earn : styles.spend}`}>
                    {transaction.type === 'earn' ? '+' : '-'}{transaction.amount} монет
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

