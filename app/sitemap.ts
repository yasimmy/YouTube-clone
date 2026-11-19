import type { MetadataRoute } from 'next'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

const publicRoutes = [
  '/',
  '/trending',
  '/category/music',
  '/category/films',
  '/category/gaming',
  '/category/news',
  '/category/sports',
  '/category/education',
  '/shop',
  '/advent',
  '/changelog',
  '/help',
  '/feedback',
  '/users',
  '/auth/login',
  '/auth/register',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '/' || route === '/trending' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : route === '/trending' ? 0.9 : 0.7,
  }))
}
