import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.scss'
import { Providers } from '@/components/providers/Providers'
import { Toaster } from 'react-hot-toast'
import { Layout } from '@/components/layout/Layout'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'YouTube',
  description: 'Платформа для размещения и просмотра видео с современным дизайном и расширенными возможностями',
  icons: {
    icon: '/logo-icon.svg',
    apple: '/logo-icon.svg',
    shortcut: '/logo-icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Layout>{children}</Layout>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}

