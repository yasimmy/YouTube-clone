import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.scss'
import { Providers } from '@/components/providers/Providers'
import { Toaster } from 'react-hot-toast'
import { Layout } from '@/components/layout/Layout'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'wave',
  description: 'Wave — видеохостинг для своей волны.',
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
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'waveToast',
              duration: 3500,
            }}
          />
        </Providers>
      </body>
    </html>
  )
}

