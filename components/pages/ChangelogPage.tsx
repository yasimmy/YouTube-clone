'use client'

import { useState } from 'react'
import {
  FiStar,
  FiZap,
  FiShield,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
  FiVideo,
  FiAward,
  FiGift,
  FiSettings,
  FiBarChart2,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiPlus,
  FiMinus,
} from 'react-icons/fi'
import styles from './ChangelogPage.module.scss'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface ChangelogEntry {
  id: string
  version: string
  date: string
  type: 'feature' | 'improvement' | 'bugfix' | 'security' | 'design'
  title: string
  description: string
  items: string[]
  icon: typeof FiStar
}

const changelogData: ChangelogEntry[] = [
  {
    id: '1',
    version: '2.1.0',
    date: '2024-01-20',
    type: 'feature',
    title: 'Безопасность и видеоплеер',
    description: 'Новые функции безопасности и улучшенный видеоплеер',
    items: [
      'Двухфакторная аутентификация (2FA) через Google Authenticator',
      'История входов в аккаунт с детальной информацией',
      'Управление активными сессиями на разных устройствах',
      'Смена пароля с проверкой старого пароля',
      'Расширенная функция "Поделиться" с QR-кодом',
      'Поделиться в социальных сетях (VK, Telegram, Twitter)',
      'Поделиться с временной меткой (timestamp)',
      'Короткие ссылки и код для встраивания (iframe)',
      'Полностью переработанный видеоплеер с YouTube-like контролами',
      'Режим театра и мини-плеер',
      'Горячие клавиши для управления плеером',
      'Настройки скорости воспроизведения и качества',
      'Автовоспроизведение следующего видео',
    ],
    icon: FiShield,
  },
  {
    id: '2',
    version: '2.0.5',
    date: '2024-01-18',
    type: 'design',
    title: '3D дизайн по всему сайту',
    description: 'Интерактивные 3D эффекты для улучшения UX',
    items: [
      '3D трансформации для всех интерактивных элементов',
      'Глубинные тени и эффекты свечения',
      '3D анимации при наведении на карточки',
      'Интерактивные кнопки с 3D эффектами',
      'Улучшенные переходы и анимации',
      '3D эффекты для видеоплеера',
      '3D дизайн в админ-панели',
      '3D эффекты в настройках канала',
    ],
    icon: FiAward,
  },
  {
    id: '3',
    version: '2.0.0',
    date: '2024-01-15',
    type: 'feature',
    title: 'Большое обновление платформы',
    description: 'Множество новых функций и улучшений',
    items: [
      'Система значков и рамок аватаров с 3D эффектами',
      'Сезонные эффекты и события (осень, зима, весна, лето)',
      'Адвент-календарь с ежедневными наградами',
      'Виртуальная валюта и магазин',
      'Алгоритм продвижения видео',
      'Голосовой поиск',
      'Система уведомлений',
      'Улучшенная админ-панель с логами и статистикой',
      'Защита от DDoS и SQL-инъекций',
      'Система ролей администраторов',
    ],
    icon: FiStar,
  },
  {
    id: '4',
    version: '1.9.0',
    date: '2024-01-10',
    type: 'improvement',
    title: 'Улучшения дизайна',
    description: 'Современный минималистичный дизайн',
    items: [
      'Полностью переработанный дизайн интерфейса',
      'Плавные анимации и переходы',
      '3D эффекты для значков и карточек',
      'Градиентные фоны и свечения',
      'Улучшенная типографика',
      'Адаптивный дизайн для всех устройств',
    ],
    icon: FiZap,
  },
  {
    id: '5',
    version: '1.8.5',
    date: '2024-01-08',
    type: 'feature',
    title: 'Новые функции админ-панели',
    description: 'Расширенные возможности управления',
    items: [
      'История активности пользователей',
      'Журнал авторизации',
      'Сброс паролей',
      'Заморозка аккаунтов',
      'Шаблоны решений для жалоб',
      'Удаление решенных жалоб',
      'Live-мониторинг нагрузки',
      'Графики базы данных',
    ],
    icon: FiShield,
  },
  {
    id: '6',
    version: '1.8.0',
    date: '2024-01-05',
    type: 'feature',
    title: 'Магазин и виртуальная валюта',
    description: 'Новая экономическая система',
    items: [
      'Виртуальная валюта для покупок',
      'Магазин эффектов для ника',
      'Магазин рамок аватаров',
      'Магазин значков',
      'Автоматическое начисление валюты',
      'История транзакций',
    ],
    icon: FiShoppingBag,
  },
  {
    id: '7',
    version: '1.7.5',
    date: '2024-01-03',
    type: 'improvement',
    title: 'Улучшения творческой студии',
    description: 'Новые возможности для создателей',
    items: [
      'Вкладка комментариев',
      'Вкладка плейлистов',
      'Вкладка доходов',
      'Расширенная аналитика',
      'Улучшенная статистика',
    ],
    icon: FiBarChart2,
  },
  {
    id: '8',
    version: '1.7.0',
    date: '2024-01-01',
    type: 'feature',
    title: 'Сезонные события',
    description: 'Специальные события и награды',
    items: [
      'Осенние события и награды',
      'Зимние события и награды',
      'Весенние события и награды',
      'Летние события и награды',
      'Сезонные рамки и значки',
      'Автоматическая проверка достижений',
    ],
    icon: FiGift,
  },
  {
    id: '9',
    version: '1.6.5',
    date: '2023-12-28',
    type: 'bugfix',
    title: 'Исправления ошибок',
    description: 'Устранение критических багов',
    items: [
      'Исправлена ошибка с отрицательными лайками',
      'Исправлена проблема с "0" в описаниях',
      'Исправлена ошибка в ShopPage',
      'Исправлена синхронизация пользователей',
      'Улучшена обработка ошибок',
    ],
    icon: FiAlertTriangle,
  },
  {
    id: '10',
    version: '1.6.0',
    date: '2023-12-25',
    type: 'feature',
    title: 'Система уведомлений',
    description: 'Полноценная система уведомлений',
    items: [
      'Уведомления о новых видео',
      'Уведомления о комментариях',
      'Уведомления о подписках',
      'Уведомления о наградах',
      'Уведомления о блокировках',
      'Уведомления о сезонных изменениях',
    ],
    icon: FiInfo,
  },
  {
    id: '11',
    version: '1.5.5',
    date: '2023-12-20',
    type: 'security',
    title: 'Улучшения безопасности',
    description: 'Защита от атак и уязвимостей',
    items: [
      'Защита от DDoS атак',
      'Защита от SQL-инъекций',
      'Санитизация пользовательского ввода',
      'Rate limiting',
      'Улучшенная система логирования',
    ],
    icon: FiShield,
  },
  {
    id: '12',
    version: '1.5.0',
    date: '2023-12-15',
    type: 'feature',
    title: 'Алгоритм продвижения',
    description: 'Умная система рекомендаций',
    items: [
      'Алгоритм расчета популярности видео',
      'Персонализированные рекомендации',
      'Похожие видео',
      'Трендовые видео',
      'Учет просмотров, лайков и комментариев',
    ],
    icon: FiTrendingUp,
  },
]

export function ChangelogPage() {
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set([changelogData[0].id]))
  const [filterType, setFilterType] = useState<'all' | ChangelogEntry['type']>('all')

  const toggleEntry = (id: string) => {
    const newExpanded = new Set(expandedEntries)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedEntries(newExpanded)
  }

  const getTypeIcon = (type: ChangelogEntry['type']) => {
    switch (type) {
      case 'feature': return FiStar
      case 'improvement': return FiZap
      case 'bugfix': return FiAlertTriangle
      case 'security': return FiShield
      case 'design': return FiAward
      default: return FiInfo
    }
  }

  const getTypeColor = (type: ChangelogEntry['type']) => {
    switch (type) {
      case 'feature': return '#8b5cf6'
      case 'improvement': return '#3b82f6'
      case 'bugfix': return '#f59e0b'
      case 'security': return '#ef4444'
      case 'design': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getTypeLabel = (type: ChangelogEntry['type']) => {
    switch (type) {
      case 'feature': return 'Новая функция'
      case 'improvement': return 'Улучшение'
      case 'bugfix': return 'Исправление'
      case 'security': return 'Безопасность'
      case 'design': return 'Дизайн'
      default: return 'Обновление'
    }
  }

  const filteredChangelog = filterType === 'all' 
    ? changelogData 
    : changelogData.filter(entry => entry.type === filterType)

  return (
    <div className={styles.changelogPage}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <FiStar className={styles.titleIcon} />
            История изменений
          </h1>
          <p className={styles.subtitle}>
            Следите за всеми обновлениями и новыми функциями платформы
          </p>
        </div>
      </div>

      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${filterType === 'all' ? styles.active : ''}`}
          onClick={() => setFilterType('all')}
        >
          Все
        </button>
        <button
          className={`${styles.filterButton} ${filterType === 'feature' ? styles.active : ''}`}
          onClick={() => setFilterType('feature')}
        >
          <FiStar />
          Функции
        </button>
        <button
          className={`${styles.filterButton} ${filterType === 'improvement' ? styles.active : ''}`}
          onClick={() => setFilterType('improvement')}
        >
          <FiZap />
          Улучшения
        </button>
        <button
          className={`${styles.filterButton} ${filterType === 'bugfix' ? styles.active : ''}`}
          onClick={() => setFilterType('bugfix')}
        >
          <FiAlertTriangle />
          Исправления
        </button>
        <button
          className={`${styles.filterButton} ${filterType === 'security' ? styles.active : ''}`}
          onClick={() => setFilterType('security')}
        >
          <FiShield />
          Безопасность
        </button>
        <button
          className={`${styles.filterButton} ${filterType === 'design' ? styles.active : ''}`}
          onClick={() => setFilterType('design')}
        >
          <FiAward />
          Дизайн
        </button>
      </div>

      <div className={styles.timeline}>
        {filteredChangelog.map((entry, index) => {
          const isExpanded = expandedEntries.has(entry.id)
          const TypeIcon = getTypeIcon(entry.type)
          const typeColor = getTypeColor(entry.type)
          const EntryIcon = entry.icon

          return (
            <div key={entry.id} className={`${styles.entry} ${styles[`entry-${entry.type}`]}`}>
              <div className={styles.timelineLine} />
              <div className={styles.entryMarker} style={{ borderColor: typeColor }}>
                <div className={styles.markerIcon} style={{ background: typeColor }}>
                  <TypeIcon />
                </div>
              </div>

              <div className={styles.entryContent}>
                <div 
                  className={styles.entryHeader}
                  onClick={() => toggleEntry(entry.id)}
                >
                  <div className={styles.entryHeaderLeft}>
                    <div className={styles.entryIcon} style={{ background: `${typeColor}20`, color: typeColor }}>
                      <EntryIcon />
                    </div>
                    <div className={styles.entryInfo}>
                      <div className={styles.entryMeta}>
                        <span className={styles.version} style={{ color: typeColor }}>
                          v{entry.version}
                        </span>
                        <span className={styles.entryType} style={{ color: typeColor, background: `${typeColor}15` }}>
                          {getTypeLabel(entry.type)}
                        </span>
                        <span className={styles.entryDate}>
                          {format(new Date(entry.date), 'd MMMM yyyy', { locale: ru })}
                        </span>
                      </div>
                      <h2 className={styles.entryTitle}>{entry.title}</h2>
                      <p className={styles.entryDescription}>{entry.description}</p>
                    </div>
                  </div>
                  <button className={styles.expandButton}>
                    {isExpanded ? <FiMinus /> : <FiPlus />}
                  </button>
                </div>

                {isExpanded && (
                  <div className={styles.entryBody}>
                    <ul className={styles.entryItems}>
                      {entry.items.map((item, itemIndex) => (
                        <li key={itemIndex} className={styles.entryItem}>
                          <FiCheckCircle className={styles.itemIcon} style={{ color: typeColor }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


