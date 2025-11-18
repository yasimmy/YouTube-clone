// Security utilities for DDoS and SQL injection protection

// Rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 100 // requests per window
const RATE_WINDOW = 60000 // 1 minute

export function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = requestCounts.get(ip)

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT) {
    return false
  }

  record.count++
  return true
}

// SQL Injection protection
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  // Remove SQL injection patterns
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
    /(--|#|\/\*|\*\/|;)/g,
    /(\bOR\b.*=.*|'.*OR.*'.*=.*')/gi,
    /(\bAND\b.*=.*|'.*AND.*'.*=.*')/gi,
  ]

  let sanitized = input
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '')
  })

  // Escape special characters
  return sanitized
    .replace(/[<>]/g, '')
    .replace(/['"]/g, '')
    .trim()
}

// XSS Protection
export function sanitizeHTML(html: string): string {
  if (typeof html !== 'string') return ''
  
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Get client IP (for rate limiting)
export function getClientIP(): string {
  if (typeof window === 'undefined') return 'unknown'
  // In production, get from request headers
  return 'client-' + Math.random().toString(36).substring(7)
}

