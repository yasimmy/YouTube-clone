// User activity history and authorization log

export interface UserActivity {
  id: string
  userId: string
  type: 'registration' | 'login' | 'email_change' | 'block' | 'unblock' | 'warning' | 'warning_removed' | 'video_view' | 'report' | 'role_change' | 'password_reset' | 'account_freeze' | 'account_unfreeze'
  description: string
  details?: any
  timestamp: string
  adminId?: string
  ip?: string
  device?: string
}

export interface AuthLog {
  id: string
  userId: string
  email: string
  ip: string
  device: string
  userAgent: string
  success: boolean
  reason?: string
  timestamp: string
  suspicious?: boolean
}

const activities: UserActivity[] = []
const authLogs: AuthLog[] = []
const MAX_ACTIVITIES = 50000
const MAX_AUTH_LOGS = 10000

// Get user activities
export function getUserActivities(userId: string, limit: number = 100): UserActivity[] {
  if (typeof window === 'undefined') return []
  
  const storage = localStorage.getItem(`yt2-user-activities-${userId}`)
  if (!storage) return []
  
  try {
    const stored = JSON.parse(storage)
    return stored.slice(0, limit)
  } catch {
    return []
  }
}

// Add user activity
export function addUserActivity(activity: Omit<UserActivity, 'id' | 'timestamp'>) {
  if (typeof window === 'undefined') return
  
  const newActivity: UserActivity = {
    ...activity,
    id: Date.now().toString() + Math.random().toString(36).substring(7),
    timestamp: new Date().toISOString(),
  }
  
  activities.unshift(newActivity)
  
  // Save to localStorage
  const userActivities = getUserActivities(activity.userId, MAX_ACTIVITIES)
  userActivities.unshift(newActivity)
  if (userActivities.length > MAX_ACTIVITIES) {
    userActivities.splice(MAX_ACTIVITIES)
  }
  localStorage.setItem(`yt2-user-activities-${activity.userId}`, JSON.stringify(userActivities))
}

// Get auth logs for user
export function getUserAuthLogs(userId: string, limit: number = 100): AuthLog[] {
  if (typeof window === 'undefined') return []
  
  const storage = localStorage.getItem(`yt2-auth-logs-${userId}`)
  if (!storage) return []
  
  try {
    const stored = JSON.parse(storage)
    return stored.slice(0, limit)
  } catch {
    return []
  }
}

// Add auth log
export function addAuthLog(log: Omit<AuthLog, 'id' | 'timestamp'>) {
  if (typeof window === 'undefined') return
  
  const newLog: AuthLog = {
    ...log,
    id: Date.now().toString() + Math.random().toString(36).substring(7),
    timestamp: new Date().toISOString(),
  }
  
  authLogs.unshift(newLog)
  
  // Save to localStorage
  const userLogs = getUserAuthLogs(log.userId, MAX_AUTH_LOGS)
  userLogs.unshift(newLog)
  if (userLogs.length > MAX_AUTH_LOGS) {
    userLogs.splice(MAX_AUTH_LOGS)
  }
  localStorage.setItem(`yt2-auth-logs-${log.userId}`, JSON.stringify(userLogs))
}

// Get suspicious activity
export function getSuspiciousActivity(userId?: string): AuthLog[] {
  const logs = userId ? getUserAuthLogs(userId) : authLogs
  return logs.filter(log => log.suspicious || !log.success)
}

// Get device info
export function getDeviceInfo(): string {
  if (typeof window === 'undefined') return 'Unknown'
  
  const ua = navigator.userAgent
  if (ua.includes('Mobile')) return 'Mobile'
  if (ua.includes('Tablet')) return 'Tablet'
  return 'Desktop'
}


