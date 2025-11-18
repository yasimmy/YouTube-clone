// Virtual currency system
import { User } from '@/types'

export interface CurrencyTransaction {
  id: string
  userId: string
  type: 'earn' | 'spend'
  amount: number
  reason: string
  createdAt: string
}

// Currency earning rules
export const CURRENCY_RULES = {
  VIDEO_UPLOAD: 10,
  LIKE_RECEIVED: 1,
  SUBSCRIBER_GAINED: 5,
  COMMENT_RECEIVED: 2,
  VIEW_MILESTONE_100: 50,
  VIEW_MILESTONE_1000: 200,
  VIEW_MILESTONE_10000: 1000,
  DAILY_LOGIN: 5,
}

// Get user currency from localStorage
export function getUserCurrency(userId: string): number {
  if (typeof window === 'undefined') return 0
  
  const storage = localStorage.getItem(`yt2-currency-${userId}`)
  if (!storage) return 0
  
  try {
    const data = JSON.parse(storage)
    return data.balance || 0
  } catch {
    return 0
  }
}

// Add currency to user
export function addCurrency(userId: string, amount: number, reason: string): void {
  if (typeof window === 'undefined') return
  
  const currentBalance = getUserCurrency(userId)
  const newBalance = currentBalance + amount
  
  const transaction: CurrencyTransaction = {
    id: Date.now().toString(),
    userId,
    type: 'earn',
    amount,
    reason,
    createdAt: new Date().toISOString(),
  }
  
  // Save balance
  localStorage.setItem(`yt2-currency-${userId}`, JSON.stringify({
    balance: newBalance,
    lastUpdated: new Date().toISOString(),
  }))
  
  // Save transaction history
  const transactions = getTransactions(userId)
  transactions.push(transaction)
  localStorage.setItem(`yt2-currency-transactions-${userId}`, JSON.stringify(transactions))
}

// Spend currency
export function spendCurrency(userId: string, amount: number, reason: string): boolean {
  if (typeof window === 'undefined') return false
  
  const currentBalance = getUserCurrency(userId)
  if (currentBalance < amount) return false
  
  const newBalance = currentBalance - amount
  
  const transaction: CurrencyTransaction = {
    id: Date.now().toString(),
    userId,
    type: 'spend',
    amount,
    reason,
    createdAt: new Date().toISOString(),
  }
  
  // Save balance
  localStorage.setItem(`yt2-currency-${userId}`, JSON.stringify({
    balance: newBalance,
    lastUpdated: new Date().toISOString(),
  }))
  
  // Save transaction history
  const transactions = getTransactions(userId)
  transactions.push(transaction)
  localStorage.setItem(`yt2-currency-transactions-${userId}`, JSON.stringify(transactions))
  
  return true
}

// Get transaction history
export function getTransactions(userId: string): CurrencyTransaction[] {
  if (typeof window === 'undefined') return []
  
  const storage = localStorage.getItem(`yt2-currency-transactions-${userId}`)
  if (!storage) return []
  
  try {
    return JSON.parse(storage)
  } catch {
    return []
  }
}

// Check if user can afford item
export function canAfford(userId: string, price: number): boolean {
  return getUserCurrency(userId) >= price
}

