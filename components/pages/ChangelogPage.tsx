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
    id: 'wave-2-0-security-hardening',
    version: '2.0.0-wave.3',
    date: '2026-11-19',
    type: 'security',
    title: 'Wave 2.0 — безопасность, защита и bug fixes',
    description: 'Закрыты критичные обходы авторизации, исправлены сессии, 2FA, seed, хранение медиа и ошибки данных.',
    items: [
      'Пароли пользователей сохраняются только как bcrypt-хэши и проверяются при каждом входе',
      'Удалены захардкоженные admin/admin и officialchannel/officialchannel1',
      'Добавлен localhost-only recovery flow с отдельным recovery key из .env.local',
      'Сессии используют криптографические токены, срок действия 7 дней и проверку активности',
      'Cookie больше не содержит user.id и не восстанавливает пользователя без валидной сессии',
      '2FA переведена на настоящий TOTP с HMAC-SHA1 и временным окном ±30 секунд',
      'Backup-коды генерируются через crypto.getRandomValues',
      'Seed закрыт от неавторизованных пользователей и не создаёт дубликаты',
      'Загрузка изображений и видео больше не складывает base64 в localStorage',
      'Исправлены права доступа и проверка сессий в серверных операциях',
      'Исправлены production TypeScript-ошибки админки, магазина, комментариев и базы данных',
      'Исправлен сброс пароля администратора: теперь требуется новый пароль, старого admin больше нет',
    ],
    icon: FiShield,
  },
  {
    id: 'wave-2-0-storage-consolidation',
    version: '2.0.0-wave.2',
    date: '2026-11-19',
    type: 'improvement',
    title: 'Wave 2.0 — единое хранилище данных',
    description: 'Убрана незавершённая параллельная SQLite-система, которая не использовалась интерфейсом и могла рассинхронизировать данные.',
    items: [
      'Основным и единым хранилищем приложения теперь является lib/db.ts с централизованным persistence-слоем',
      'Удалён незавершённый db-sqlite-wrapper.ts с частичной миграцией только пользователей',
      'Удалены неработающие TODO-операции update, delete и find из неиспользуемого SQLite-контура',
      'Остановлена автоматическая миграция из localStorage в неподключённую базу',
      'Удалены неиспользуемые SQLite-зависимости и server API-ветка, чтобы данные не расходились между двумя системами',
      'Повторные seed-операции остаются идемпотентными и не создают дубликаты',
    ],
    icon: FiCheckCircle,
  },
  {
    id: 'wave-2-0-watch-comments-admin-polish',
    version: '2.0.0-wave.1',
    date: '2026-11-19',
    type: 'improvement',
    title: 'Wave 2.0 — плеер, комментарии и админка',
    description: 'Финальная полировка ключевых сценариев: просмотр видео, обсуждения, управление платформой и синхронизация профилей.',
    items: [
      'Видеоплеер получил новый Wave UI с аккуратной панелью управления и emerald-progress',
      'Добавлено плавное перетаскивание точки прогресса мышью и touch-жестом',
      'Исправлено позиционирование точки прогресса на линии',
      'Убран режим театра и автопереключатель из панели плеера',
      'Мини-плеер получил адаптивную двухрядную панель без наложения текста',
      'Слайдер громкости переработан в компактный вертикальный glass-контрол',
      'Скорость воспроизведения получила понятную активную иконку выбора',
      'Модалка «Поделиться» теперь открывается по центру экрана с blur и анимацией',
      'Удаление комментариев больше не требует отдельного браузерного confirm-окна',
      'Поле добавления комментария переработано под Wave glass UI',
      'Ответы получили аккуратные плавные направляющие и скруглённые соединители',
      'Исправлен перенос длинных комментариев без горизонтального переполнения',
      'Аватары в видео, профиле и комментариях синхронизируются с актуальными данными пользователя',
      'Вкладки админки «Видео» и «Логи» получили полноценные карточки и фильтры',
      'Графики базы объединены в одну интерактивную панель с точками и tooltip-значениями',
      'Самоподписка на собственный канал заблокирована отдельным состоянием «Ваш канал»',
      'Toast-уведомления получили единый obsidian/glass дизайн Wave',
    ],
    icon: FiVideo,
  },
  {
    id: 'wave-2-0-redesign',
    version: '2.0.0-wave',
    date: '2026-11-19',
    type: 'design',
    title: 'Wave 2.0 — новый визуальный язык платформы',
    description: 'Полный переход на Wave Apple UI: glass surfaces, аккуратные отступы и единая obsidian-система.',
    items: [
      'Брендинг платформы обновлён с YT 2.0 на wave',
      'Добавлен единый Wave mark для navbar, favicon и системных состояний',
      'Переработаны navbar, sidebar, cookie consent и глобальный scrollbar',
      'Добавлены новые auth-экраны входа и регистрации',
      'Обновлены Home, Trending и все страницы категорий',
      'Полностью переработаны channel page, профильный UX и карточка канала',
      'Добавлены плавный wave-переход баннера и корректное отображение рамок аватара',
      'Настроены бейджи с иконками, tooltip, цветами редкости и wave. staff',
      'Settings получил новый layout для профиля, рамок, 2FA и сессий',
      'Shop получил реальные preview эффектов ника, рамок и значков',
      'Users получил новый community-каталог с поиском и структурированными карточками',
      'Upload получил компактный Studio UI и кастомные dropdown-списки',
      'Studio переработан в dashboard для видео, аналитики, комментариев, плейлистов и доходов',
      'Help и Feedback получили новые accordion/form interactions',
      'Changelog и Advent Calendar переведены на Wave glass UI',
      'Исправлены сезонные частицы, layout offsets и scroll-поведение navbar',
      'Исправлена ошибка базы данных с суффиксом .0 в именах пользователей',
      'Исправлены обрезание tooltip, переполнение wave-перехода и отступы профиля',
    ],
    icon: FiZap,
  },
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

                <div className={`${styles.entryBody} ${isExpanded ? styles.open : ''}`}>
                    <ul className={styles.entryItems}>
                      {entry.items.map((item, itemIndex) => (
                        <li key={itemIndex} className={styles.entryItem}>
                          <FiCheckCircle className={styles.itemIcon} style={{ color: typeColor }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


