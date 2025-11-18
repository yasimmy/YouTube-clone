'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { SeasonalEffects } from '@/components/seasonal/SeasonalEffects'
import { SeasonalCursorEffects } from '@/components/seasonal/SeasonalCursorEffects'
import { CookieConsent } from './CookieConsent'
import styles from './Layout.module.scss'

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/auth')
  const isNotFoundPage = pathname === '/404' || pathname === '/not-found'
  const isSeedPage = pathname === '/seed'
  const isAdminPage = pathname?.startsWith('/admin')

  if (isAuthPage || isNotFoundPage || isSeedPage || isAdminPage) {
    return (
      <div className={styles.layout}>
        <Header />
        <main className={styles.mainFull}>{children}</main>
      </div>
    )
  }

  return (
    <div className={styles.layout}>
      <SeasonalEffects />
      <SeasonalCursorEffects />
      <Header />
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.main}>{children}</main>
      </div>
      <CookieConsent />
    </div>
  )
}

