'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import {
  FiMenu,
  FiSearch,
  FiMic,
  FiVideo,
  FiBell,
  FiUser,
  FiMoon,
  FiSun,
  FiLogOut,
  FiSettings,
  FiEdit3,
  FiShield,
} from 'react-icons/fi'
import styles from './Header.module.scss'
import toast from 'react-hot-toast'
import { deleteCookie } from '@/lib/cookies'
import { Notifications } from './Notifications'

export function Header() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user, theme, setTheme, toggleSidebar, setUser } = useStore()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const handleLogout = () => {
    setUser(null)
    deleteCookie('yt2_session')
    // Clear localStorage user
    const storage = localStorage.getItem('yt2-storage')
    if (storage) {
      try {
        const parsed = JSON.parse(storage)
        parsed.state.user = null
        localStorage.setItem('yt2-storage', JSON.stringify(parsed))
      } catch (e) {
        // Ignore
      }
    }
    setShowUserMenu(false)
    router.push('/')
    toast.success('Выход выполнен')
  }

  const [isListening, setIsListening] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  const handleVoiceSearch = () => {
    if (typeof window === 'undefined') return
    
    import('@/lib/voice-search').then(({ VoiceSearch }) => {
      const voiceSearch = new VoiceSearch()
      
      if (!voiceSearch.isAvailable()) {
        toast.error('Голосовой поиск не поддерживается в вашем браузере')
        return
      }

      setIsListening(true)
      toast.loading('Слушаю...', { id: 'voice-search' })

      voiceSearch.start(
        (text) => {
          setSearchQuery(text)
          setIsListening(false)
          toast.success('Речь распознана!', { id: 'voice-search' })
          // Auto search after recognition
          setTimeout(() => {
            window.location.href = `/search?q=${encodeURIComponent(text)}`
          }, 500)
        },
        (error) => {
          setIsListening(false)
          toast.error(error, { id: 'voice-search' })
        }
      )
    })
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.menuButton} onClick={toggleSidebar} aria-label="Menu">
          <FiMenu />
        </button>
        <Link href="/" className={styles.logo}>
          <img 
            src="/logo-icon.svg" 
            alt="YouTube" 
            className={styles.logoImage}
            width={32}
            height={32}
          />
          <span className={styles.logoText}>YouTube</span>
        </Link>
      </div>

      <form className={styles.search} onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Поиск"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton} aria-label="Search">
          <FiSearch />
        </button>
        <button 
          type="button" 
          className={`${styles.micButton} ${isListening ? styles.listening : ''}`}
          aria-label="Voice search"
          onClick={handleVoiceSearch}
          title="Голосовой поиск"
        >
          <FiMic />
        </button>
      </form>

      <div className={styles.right}>
        <button
          className={styles.themeButton}
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <FiMoon /> : <FiSun />}
        </button>
        {user ? (
          <>
            <Link href="/upload" className={styles.uploadButton}>
              <FiVideo />
              <span>Создать</span>
            </Link>
            <Notifications />
            <div className={styles.userMenuContainer} ref={menuRef}>
              <button
                className={styles.avatarButton}
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-label="User menu"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {showUserMenu && (
                <div className={styles.userMenu}>
                    <div className={styles.userMenuHeader}>
                      <div className={styles.userMenuAvatar}>
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.username} />
                        ) : (
                          <div className={styles.avatarPlaceholder}>
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className={styles.userMenuInfo}>
                        <div className={styles.userMenuName}>{user.username}</div>
                        <div className={styles.userMenuEmail}>{user.email}</div>
                      </div>
                    </div>

                    <div className={styles.userMenuDivider}></div>

                    <Link
                      href={`/channel/${user.id}`}
                      className={styles.userMenuItem}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FiUser />
                      <span>Мой канал</span>
                    </Link>

                    <Link
                      href="/studio"
                      className={styles.userMenuItem}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FiEdit3 />
                      <span>Творческая студия</span>
                    </Link>
                    <Link
                      href="/users"
                      className={styles.userMenuItem}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FiUser />
                      <span>Поиск пользователей</span>
                    </Link>

                    {(user.role === 'admin' || 
                      user.role === 'own' || 
                      (user.role && user.role.startsWith('admin'))) && (
                      <Link
                        href="/admin"
                        className={styles.userMenuItem}
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FiShield />
                        <span>Админ панель</span>
                      </Link>
                    )}

                    <Link
                      href="/settings"
                      className={styles.userMenuItem}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FiSettings />
                      <span>Настройки</span>
                    </Link>

                    <div className={styles.userMenuDivider}></div>

                    <button className={styles.userMenuItem} onClick={handleLogout}>
                      <FiLogOut />
                      <span>Выйти</span>
                    </button>
                  </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link href="/auth/register" className={styles.loginButton}>
              <span>Регистрация</span>
            </Link>
            <Link href="/auth/login" className={styles.loginButton}>
              <FiUser />
              <span>Войти</span>
            </Link>
          </>
        )}
      </div>
    </header>
  )
}

