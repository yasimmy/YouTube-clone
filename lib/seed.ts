// Seed data for development/demo
import { db } from './db'
import { hashPassword } from './auth'

function createBootstrapPassword(): string {
  const source = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID().replace(/-/g, '')
    : `${Date.now()}${Math.random().toString(36).slice(2)}`
  return `Wave-${source.slice(0, 16)}!`
}

export function seedDatabase(): { adminPassword?: string; officialPassword?: string } {
  let adminPassword: string | undefined
  let officialPassword: string | undefined
  // Create official channel with correct login
  let officialChannel = db.users.findByEmail('officialchannel@youtube.com')
  if (!officialChannel) {
    officialPassword = createBootstrapPassword()
    officialChannel = db.users.create({
    email: 'officialchannel@youtube.com',
    username: 'Official Channel',
    passwordHash: hashPassword(officialPassword),
    description: 'Официальный канал платформы YouTube',
    emailVerified: true,
    role: 'user',
    isOfficial: true,
    avatarFrame: 'official-gold',
    nicknameHighlight: 'White Sparkles',
    badges: ['verified', 'staff'],
    })
  } else if (!officialChannel.passwordHash) {
    officialPassword = createBootstrapPassword()
    officialChannel = db.users.update(officialChannel.id, { passwordHash: hashPassword(officialPassword) }) || officialChannel
  }

  // Create admin user with 'own' role
  let admin = db.users.findByEmail('admin@yt2.com')
  if (!admin) {
    adminPassword = createBootstrapPassword()
    admin = db.users.create({
    email: 'admin@yt2.com',
    username: 'admin',
    passwordHash: hashPassword(adminPassword),
    description: 'Главный администратор wave. Пароль задаётся отдельным защищённым способом.',
    emailVerified: true,
    role: 'own',
    })
  } else if (!admin.passwordHash) {
    adminPassword = createBootstrapPassword()
    admin = db.users.update(admin.id, { passwordHash: hashPassword(adminPassword), role: 'own' }) || admin
  }

  // Create sample users
  const user1 = db.users.findByEmail('demo@yt2.com') || db.users.create({
      email: 'demo@yt2.com',
      username: 'DemoUser',
      description: 'Демонстрационный канал с интересными видео',
      emailVerified: true,
    })

  const user2 = db.users.findByEmail('creator@yt2.com') || db.users.create({
      email: 'creator@yt2.com',
      username: 'TechCreator',
      description: 'Канал о технологиях и программировании',
      emailVerified: true,
    })

  // Create sample videos
  const video1 = db.videos.getAll().find((video) => video.title === 'Введение в React и Next.js') || db.videos.create({
    title: 'Введение в React и Next.js',
    description: 'Узнайте основы React и Next.js в этом подробном руководстве. Мы рассмотрим компоненты, хуки, и серверный рендеринг.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://via.placeholder.com/1280x720/667eea/ffffff?text=React+%26+Next.js',
    duration: 600,
    category: 'Обучение',
    tags: ['react', 'nextjs', 'программирование', 'обучение'],
    privacy: 'public',
    userId: user2.id,
  })

  const video2 = db.videos.getAll().find((video) => video.title === 'Лучшие практики TypeScript') || db.videos.create({
    title: 'Лучшие практики TypeScript',
    description: 'Изучите передовые практики использования TypeScript в современных проектах.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://via.placeholder.com/1280x720/764ba2/ffffff?text=TypeScript',
    duration: 450,
    category: 'Обучение',
    tags: ['typescript', 'программирование', 'обучение'],
    privacy: 'public',
    userId: user2.id,
  })

  const video3 = db.videos.getAll().find((video) => video.title === 'Музыка для работы и концентрации') || db.videos.create({
    title: 'Музыка для работы и концентрации',
    description: 'Спокойная фоновая музыка для продуктивной работы.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://via.placeholder.com/1280x720/ff6b6b/ffffff?text=Music',
    duration: 1800,
    category: 'Музыка',
    tags: ['музыка', 'фоновая музыка', 'работа'],
    privacy: 'public',
    userId: user1.id,
  })

  const video4 = db.videos.getAll().find((video) => video.title === 'Обзор новейших игр 2024') || db.videos.create({
    title: 'Обзор новейших игр 2024',
    description: 'Подробный обзор самых ожидаемых игр этого года.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://via.placeholder.com/1280x720/4ecdc4/ffffff?text=Gaming',
    duration: 900,
    category: 'Игры',
    tags: ['игры', 'обзор', '2024'],
    privacy: 'public',
    userId: user1.id,
  })

  const video5 = db.videos.getAll().find((video) => video.title === 'Путешествие по Японии') || db.videos.create({
    title: 'Путешествие по Японии',
    description: 'Красивые места и культура Японии в этом видео-путешествии.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://via.placeholder.com/1280x720/ffe66d/ffffff?text=Travel',
    duration: 1200,
    category: 'Путешествия',
    tags: ['путешествия', 'япония', 'культура'],
    privacy: 'public',
    userId: user1.id,
  })

  // Add some views and likes
  video1.views = 1250
  video1.likes = 89
  video2.views = 890
  video2.likes = 67
  video3.views = 2340
  video3.likes = 156
  video4.views = 5670
  video4.likes = 423
  video5.views = 1890
  video5.likes = 134

  console.log('Database seeded successfully!')
  return { adminPassword, officialPassword }
}

