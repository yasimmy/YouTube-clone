// Seasonal system for Yt 2.0
// Changes design and features based on current season

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export interface SeasonConfig {
  name: string
  emoji: string
  colors: {
    primary: string
    secondary: string
    accent: string
    gradient: string
  }
  frames: string[]
  titles: Array<{ name: string; emoji: string }>
  reactions: string[]
  quests: Array<{ name: string; description: string; reward: string }>
}

const seasons: Record<Season, SeasonConfig> = {
  spring: {
    name: 'Весна',
    emoji: '🌸',
    colors: {
      primary: '#ff9a9e',
      secondary: '#fecfef',
      accent: '#fad0c4',
      gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fad0c4 100%)',
    },
    frames: ['spring-flowers', 'spring-petals', 'spring-bloom'],
    titles: [
      { name: 'Bloom Seeker', emoji: '🌸' },
      { name: 'Spring Hopper', emoji: '🐣' },
    ],
    reactions: ['🌸', '🐦', '🌱', '🦋'],
    quests: [
      { name: 'Весенний просмотр', description: 'Посмотри 10 видео о природе', reward: 'Весенняя рамка' },
      { name: 'Цветочный лайк', description: 'Поставь 20 лайков', reward: 'Бейдж "Весенний зритель"' },
    ],
  },
  summer: {
    name: 'Лето',
    emoji: '☀️',
    colors: {
      primary: '#4facfe',
      secondary: '#00f2fe',
      accent: '#43e97b',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #43e97b 100%)',
    },
    frames: ['summer-waves', 'summer-sun', 'summer-beach'],
    titles: [
      { name: 'Summer Explorer', emoji: '🌞' },
      { name: 'Beach Mode', emoji: '🏖️' },
    ],
    reactions: ['☀️', '🏄‍♂️', '🌊', '🏖️'],
    quests: [
      { name: 'Летний марафон', description: 'Посмотри 10 видео о путешествиях', reward: 'Летняя рамка' },
      { name: 'Пляжный лайк', description: 'Поставь 20 лайков', reward: 'Бейдж "Летний зритель"' },
    ],
  },
  autumn: {
    name: 'Осень',
    emoji: '🍂',
    colors: {
      primary: '#fa709a',
      secondary: '#fee140',
      accent: '#ff8a80',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 50%, #ff8a80 100%)',
    },
    frames: ['autumn-leaves', 'autumn-gold', 'autumn-pumpkin'],
    titles: [
      { name: 'Pumpkin King', emoji: '🍁' },
      { name: 'Cozy Enjoyer', emoji: '🌰' },
    ],
    reactions: ['🍂', '🎃', '🍁', '🌰'],
    quests: [
      { name: 'Осенний марафон', description: 'Посмотри 10 видео о хобби', reward: 'Осенняя рамка' },
      { name: 'Уютный лайк', description: 'Поставь 20 лайков', reward: 'Бейдж "Осенний марафон"' },
    ],
  },
  winter: {
    name: 'Зима',
    emoji: '❄️',
    colors: {
      primary: '#a8edea',
      secondary: '#fed6e3',
      accent: '#d299c2',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 50%, #d299c2 100%)',
    },
    frames: ['winter-snow', 'winter-frost', 'winter-holiday'],
    titles: [
      { name: 'Frostbite', emoji: '❄️' },
      { name: 'Holiday Spirit', emoji: '🎄' },
    ],
    reactions: ['❄️', '🎁', '⛄', '🎄'],
    quests: [
      { name: 'Зимний буст', description: 'Посмотри 10 видео о праздниках', reward: 'Зимняя рамка' },
      { name: 'Снежный лайк', description: 'Поставь 20 лайков', reward: 'Бейдж "Зимний буст"' },
    ],
  },
}

export function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1 // 1-12
  
  if (month >= 3 && month <= 5) return 'spring'   // Март-Май
  if (month >= 6 && month <= 8) return 'summer'   // Июнь-Август
  if (month >= 9 && month <= 11) return 'autumn' // Сентябрь-Ноябрь
  return 'winter'                                 // Декабрь-Февраль
}

export function getSeasonConfig(season?: Season): SeasonConfig {
  const currentSeason = season || getCurrentSeason()
  return seasons[currentSeason]
}

export function getAllSeasons(): Record<Season, SeasonConfig> {
  return seasons
}

