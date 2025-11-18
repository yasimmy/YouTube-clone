export interface LoginHistory {
  id: string
  userId: string
  timestamp: string
  ip?: string
  userAgent?: string
  device?: string
  location?: string
  success: boolean
  failureReason?: string
}

export interface ActiveSession {
  id: string
  userId: string
  sessionToken: string
  createdAt: string
  lastActivity: string
  ip?: string
  userAgent?: string
  device?: string
  location?: string
  isCurrent: boolean
}

