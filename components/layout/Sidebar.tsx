'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'
import {
  FiHome,
  FiTrendingUp,
  FiMusic,
  FiFilm,
  FiZap,
  FiFileText,
  FiActivity,
  FiBookOpen,
  FiSettings,
  FiHelpCircle,
  FiFlag,
  FiGift,
  FiGitBranch,
} from 'react-icons/fi'
import styles from './Sidebar.module.scss'

const menuItems = [
  { icon: FiHome, label: 'Главная', href: '/' },
  { icon: FiTrendingUp, label: 'В тренде', href: '/trending' },
  { icon: FiMusic, label: 'Музыка', href: '/category/music' },
  { icon: FiFilm, label: 'Фильмы', href: '/category/films' },
  { icon: FiZap, label: 'Игры', href: '/category/gaming' },
  { icon: FiFileText, label: 'Новости', href: '/category/news' },
  { icon: FiActivity, label: 'Спорт', href: '/category/sports' },
  { icon: FiBookOpen, label: 'Обучение', href: '/category/education' },
]

const settingsItems = [
  { icon: FiSettings, label: 'Настройки', href: '/settings' },
  { icon: FiHelpCircle, label: 'Справка', href: '/help' },
  { icon: FiFlag, label: 'Отправить отзыв', href: '/feedback' },
  { icon: FiGift, label: 'Адвент-календарь', href: '/advent' },
  { icon: FiGitBranch, label: 'История изменений', href: '/changelog' },
]

export function Sidebar() {
  const pathname = usePathname()
  const sidebarOpen = useStore((state) => state.sidebarOpen)

  return (
    <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
          <nav className={styles.nav}>
            <div className={styles.section}>
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
                    title={item.label}
                  >
                    <Icon />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            <div className={styles.section}>
              {settingsItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
                    title={item.label}
                  >
                    <Icon />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
        </aside>
  )
}

