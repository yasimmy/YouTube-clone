import { compareSync, hashSync } from 'bcryptjs'

export function hashPassword(password: string): string {
  return hashSync(password, 12)
}

export function verifyPassword(password: string, passwordHash?: string): boolean {
  return Boolean(passwordHash && compareSync(password, passwordHash))
}

export function createSessionToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
}
