// Logging system for admin panel

export type LogLevel = 'info' | 'warning' | 'error' | 'success'
export type LogCategory = 'user' | 'video' | 'admin' | 'security' | 'system' | 'feedback' | 'moderation' | 'violation'

export interface Log {
  id: string
  level: LogLevel
  category: LogCategory
  message: string
  userId?: string
  adminId?: string
  targetUserId?: string
  details?: any
  timestamp: string
  ip?: string
  violationType?: 'warning' | 'block' | 'ban' | 'role_change' | 'warning_removed' | 'unblock'
  moderatorId?: string
}

const logs: Log[] = []
const MAX_LOGS = 10000

export function log(
  level: LogLevel, 
  category: LogCategory, 
  message: string, 
  details?: any, 
  userId?: string,
  adminId?: string,
  targetUserId?: string,
  violationType?: 'warning' | 'block' | 'ban' | 'role_change' | 'warning_removed' | 'unblock',
  moderatorId?: string
) {
  const logEntry: Log = {
    id: Date.now().toString() + Math.random().toString(36).substring(7),
    level,
    category,
    message,
    details,
    userId,
    adminId,
    targetUserId,
    violationType,
    moderatorId,
    timestamp: new Date().toISOString(),
    ip: typeof window !== 'undefined' ? 'client' : 'server',
  }

  logs.unshift(logEntry)
  
  // Keep only last MAX_LOGS entries
  if (logs.length > MAX_LOGS) {
    logs.splice(MAX_LOGS)
  }

  // Save to localStorage
  if (typeof window !== 'undefined') {
    try {
      const storage = localStorage.getItem('yt2-logs')
      const storedLogs = storage ? JSON.parse(storage) : []
      storedLogs.unshift(logEntry)
      if (storedLogs.length > MAX_LOGS) {
        storedLogs.splice(MAX_LOGS)
      }
      localStorage.setItem('yt2-logs', JSON.stringify(storedLogs))
    } catch (e) {
      console.error('Failed to save log:', e)
    }
  }

  // Console output
  const consoleMethod = level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log'
  console[consoleMethod](`[${category.toUpperCase()}] ${message}`, details || '')
}

export function getLogs(category?: LogCategory, level?: LogLevel, limit: number = 100): Log[] {
  let filtered = [...logs]

  if (category) {
    filtered = filtered.filter(l => l.category === category)
  }

  if (level) {
    filtered = filtered.filter(l => l.level === level)
  }

  return filtered.slice(0, limit)
}

export function clearLogs() {
  logs.length = 0
  if (typeof window !== 'undefined') {
    localStorage.removeItem('yt2-logs')
  }
}

// Load logs from localStorage on init
if (typeof window !== 'undefined') {
  try {
    const storage = localStorage.getItem('yt2-logs')
    if (storage) {
      const storedLogs = JSON.parse(storage)
      logs.push(...storedLogs.slice(0, MAX_LOGS))
    }
  } catch (e) {
    console.error('Failed to load logs:', e)
  }
}

