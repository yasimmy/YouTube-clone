export interface Feedback {
  id: string
  userId: string
  type: 'bug' | 'feature' | 'suggestion' | 'other'
  title: string
  message: string
  rating?: number
  createdAt: string
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected'
  adminResponse?: string
  adminId?: string
  resolvedAt?: string
}

export interface FeedbackMessage {
  id: string
  feedbackId: string
  userId: string
  message: string
  createdAt: string
  isAdmin: boolean
}

