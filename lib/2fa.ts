const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function base32Decode(value: string): Uint8Array {
  const output: number[] = []; let buffer = 0; let bits = 0
  for (const char of value.toUpperCase().replace(/=+$/, '')) {
    const index = BASE32.indexOf(char); if (index < 0) throw new Error('Invalid TOTP secret')
    buffer = (buffer << 5) | index; bits += 5
    if (bits >= 8) { bits -= 8; output.push((buffer >> bits) & 255) }
  }
  return new Uint8Array(output)
}

function timingSafeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  return diff === 0
}

async function codeFor(secret: string, counter: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', base32Decode(secret) as BufferSource, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
  const message = new Uint8Array(8); let value = counter
  for (let i = 7; i >= 0; i--) { message[i] = value & 255; value = Math.floor(value / 256) }
  const digest = new Uint8Array(await crypto.subtle.sign('HMAC', key, message))
  const offset = digest[digest.length - 1] & 15
  const binary = ((digest[offset] & 127) << 24) | (digest[offset + 1] << 16) | (digest[offset + 2] << 8) | digest[offset + 3]
  return String(binary % 1000000).padStart(6, '0')
}

export function generateSecret(): string {
  const bytes = new Uint8Array(20); crypto.getRandomValues(bytes)
  return Array.from(bytes, byte => BASE32[byte % BASE32.length]).join('')
}

export function generateQRCodeUrl(secret: string, email: string, issuer: string = 'wave'): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`
}

export async function verifyTOTP(token: string, secret: string): Promise<boolean> {
  if (!/^\d{6}$/.test(token) || !secret) return false
  const counter = Math.floor(Date.now() / 1000 / 30)
  for (const offset of [-1, 0, 1]) if (timingSafeEqual(await codeFor(secret, counter + offset), token)) return true
  return false
}

export function generateBackupCodes(): string[] {
  return Array.from({ length: 10 }, () => {
    const bytes = new Uint8Array(5); crypto.getRandomValues(bytes)
    return Array.from(bytes, byte => (byte % 36).toString(36)).join('').toUpperCase()
  })
}
