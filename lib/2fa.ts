// Simple TOTP implementation for 2FA
// In production, use a proper library like 'otplib' or 'speakeasy'

export function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let secret = ''
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return secret
}

export function generateQRCodeUrl(secret: string, email: string, issuer: string = 'YT2'): string {
  const encodedIssuer = encodeURIComponent(issuer)
  const encodedEmail = encodeURIComponent(email)
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}`
}

export function verifyTOTP(token: string, secret: string): boolean {
  // Simple verification - in production use proper TOTP library
  // This is a placeholder implementation
  if (!token || token.length !== 6 || !/^\d+$/.test(token)) {
    return false
  }
  
  // For demo purposes, accept any 6-digit code
  // In production, implement proper TOTP verification
  return true
}

export function generateBackupCodes(): string[] {
  const codes: string[] = []
  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    codes.push(code)
  }
  return codes
}

