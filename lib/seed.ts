// Seed data for development/demo
import { db } from './db'

export function seedDatabase() {
  // Create official channel with correct login
  const officialChannel = db.users.findByEmail('officialchannel@youtube.com') || db.users.create({
    email: 'officialchannel@youtube.com',
    username: 'Official Channel',
    password: 'officialchannel1', // Password from requirements
    description: 'Официальный канал платформы YouTube',
    emailVerified: true,
    role: 'user',
    isOfficial: true,
    avatarFrame: 'official-gold',
    nicknameHighlight: 'White Sparkles',
    badges: ['verified', 'staff'],
  })

  // Create admin user with 'own' role
  const admin = db.users.findByEmail('admin@yt2.com') || db.users.create({
    email: 'admin@yt2.com',
    username: 'admin',
    description: 'Главный администратор YouTube',
    emailVerified: true,
    role: 'own',
  })

  // Create sample users
  const user1 = db.users.create({
    email: 'demo@yt2.com',
    username: 'DemoUser',
    description: 'Демонстрационный канал с интересными видео',
    emailVerified: true,
  })

  const user2 = db.users.create({
    email: 'creator@yt2.com',
    username: 'TechCreator',
    description: 'Канал о технологиях и программировании',
    emailVerified: true,
  })

  // Create sample videos
  const video1 = db.videos.create({
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

  const video2 = db.videos.create({
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

  const video3 = db.videos.create({
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

  const video4 = db.videos.create({
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

  const video5 = db.videos.create({
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
}

