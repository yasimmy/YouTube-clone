'use client'

import { User, UserBadge, AvatarFrame } from '@/types'
import { 
  FiShield, 
  FiCheck, 
  FiStar, 
  FiAward, 
  FiZap,
  FiHeart,
  FiSun
} from 'react-icons/fi'
import { LuLeaf, LuSnowflake, LuSprout, LuFlower2 } from 'react-icons/lu'
import styles from './UserAvatar.module.scss'

interface UserAvatarProps {
  user: User
  size?: number
  showBadges?: boolean
  showFrame?: boolean
}

const badgeIcons: Partial<Record<UserBadge, React.ReactNode>> = {
  staff: <FiShield />,
  verified: <FiCheck />,
  premium: <FiStar />,
  partner: <FiAward />,
  creator: <FiZap />,
  pumpkin: <FiStar />,
  'golden-leaf': <LuLeaf />,
  santa: <FiAward />,
  'ice-master': <LuSnowflake />,
  'winter-king': <LuSnowflake />,
  'february-heart': <FiHeart />,
  sprout: <LuSprout />,
  blooming: <FiStar />,
  'spring-keeper': <LuFlower2 />,
  'beach-goer': <FiSun />,
  'sun-lord': <FiSun />,
}

const badgeLabels: Record<UserBadge, string> = {
  staff: 'wave. staff',
  verified: 'Верифицированный',
  premium: 'Премиум',
  partner: 'Партнер',
  creator: 'Креатор',
  pumpkin: 'Тыквочка',
  'golden-leaf': 'Золотой лист',
  santa: 'Санта',
  'ice-master': 'Ледяной мастер',
  'winter-king': 'Король зимы',
  'february-heart': 'Февральское сердце',
  sprout: 'Росточек',
  blooming: 'Цветущий',
  'spring-keeper': 'Хранитель Весны',
  'beach-goer': 'Пляжник',
  'sun-lord': 'Повелитель солнца',
}

const badgeRarity: Record<UserBadge, 'common' | 'rare' | 'epic' | 'legendary'> = {
  staff: 'legendary', verified: 'epic', premium: 'epic', partner: 'legendary', creator: 'rare',
  pumpkin: 'common', 'golden-leaf': 'rare', santa: 'rare', 'ice-master': 'epic', 'winter-king': 'legendary',
  'february-heart': 'rare', sprout: 'common', blooming: 'rare', 'spring-keeper': 'epic', 'beach-goer': 'rare', 'sun-lord': 'legendary',
}

export function UserAvatar({ user, size = 40, showBadges = true, showFrame = true }: UserAvatarProps) {
  const frame = user.avatarFrame || 'none'
  const badges = Array.isArray(user.badges) ? user.badges.filter((b): b is UserBadge => typeof b === 'string') : []

  // Auto-assign badges based on role
  const allBadges: UserBadge[] = [...badges]
  if (user.role && user.role !== 'user') {
    if (!allBadges.includes('staff')) {
      allBadges.push('staff')
    }
  }

  // Priority order: verified, staff, then others
  // Show only 3 badges under avatar
  const getBadgePriority = (badge: UserBadge): number => {
    if (badge === 'verified') return 1
    if (badge === 'staff') return 2
    return 3
  }

  const sortedBadges = [...allBadges].sort((a, b) => getBadgePriority(a) - getBadgePriority(b))
  const displayBadges = sortedBadges.slice(0, 3)

  return (
    <div className={styles.avatarContainer} style={{ width: size, height: size }}>
      <div
        className={`${styles.avatar} ${styles[`frame-${frame}`]}`}
        style={{ width: size, height: size }}
      >
        {user.avatar ? (
          <img src={user.avatar} alt={user.username} />
        ) : (
          <div className={styles.placeholder}>
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      {showBadges && displayBadges.length > 0 && (
        <div className={styles.badges}>
          {displayBadges.map((badge) => {
            const badgeLabel = badgeLabels[badge as UserBadge] || badge
            const badgeIcon = badgeIcons[badge as UserBadge] || <FiStar />
            return (
              <div
                key={badge}
                className={`${styles.badge} ${styles[`badge-${badge}`]}`}
                data-rarity={badgeRarity[badge] || 'common'}
              >
                {badgeIcon}
                <div className={styles.badgeTooltip}>
                  <span>{badgeLabel}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}




