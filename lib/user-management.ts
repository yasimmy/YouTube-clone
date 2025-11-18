// User management functions for admins

import { db } from './db'
import { addUserActivity } from './user-activity'
import { log } from './logging'
import { notifyWarning, notifyChannelBlocked } from './notifications'

// Reset password (admin only)
export async function resetUserPassword(userId: string, adminId: string, newPassword?: string): Promise<boolean> {
  const user = db.users.findById(userId)
  if (!user) return false
  
  // For admin user, set password to "admin" (hashed)
  let password: string
  if (user.email === 'admin@yt2.com' || user.username === 'admin') {
    // Hash "admin" password
    const bcrypt = await import('bcryptjs')
    password = await bcrypt.hash('admin', 10)
  } else {
    password = newPassword || generateRandomPassword()
    // In production, hash this
    if (!newPassword) {
      const bcrypt = await import('bcryptjs')
      password = await bcrypt.hash(password, 10)
    }
  }
  
  // Also unblock if blocked
  db.users.update(userId, {
    password: password,
    isBlocked: false,
    blockedUntil: undefined,
  })
  
  addUserActivity({
    userId,
    type: 'password_reset',
    description: 'Пароль сброшен администратором',
    adminId,
    details: { resetBy: adminId },
  })
  
  log('info', 'admin', `Пароль сброшен для пользователя ${user.username}`, { userId, adminId })
  
  return true
}

// Freeze account (temporary disable)
export function freezeAccount(userId: string, adminId: string, reason?: string, until?: string): boolean {
  const user = db.users.findById(userId)
  if (!user) return false
  
  const freezeUntil = until || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days default
  
  db.users.update(userId, {
    isBlocked: true,
    blockedUntil: freezeUntil,
  })
  
  addUserActivity({
    userId,
    type: 'account_freeze',
    description: `Аккаунт заморожен${reason ? `: ${reason}` : ''}`,
    adminId,
    details: { reason, until: freezeUntil },
  })
  
  log('warning', 'admin', `Аккаунт заморожен: ${user.username}`, { userId, adminId, reason })
  notifyChannelBlocked(userId, 7)
  
  return true
}

// Unfreeze account
export function unfreezeAccount(userId: string, adminId: string): boolean {
  const user = db.users.findById(userId)
  if (!user) return false
  
  db.users.update(userId, {
    isBlocked: false,
    blockedUntil: undefined,
  })
  
  addUserActivity({
    userId,
    type: 'account_unfreeze',
    description: 'Аккаунт разморожен',
    adminId,
  })
  
  log('info', 'admin', `Аккаунт разморожен: ${user.username}`, { userId, adminId })
  
  return true
}

// Generate random password
function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}


