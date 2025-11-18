export interface Report {
  id: string
  videoId?: string
  channelId?: string
  userId: string
  reason: string
  description?: string
  status: 'pending' | 'reviewed' | 'resolved' | 'rejected'
  createdAt: string
  reviewedBy?: string
  reviewedAt?: string
  action?: 'delete_video' | 'block_channel' | 'warn_channel' | 'none'
}

export interface AdminStats {
  totalUsers: number
  totalVideos: number
  totalReports: number
  pendingReports: number
  totalViews: number
  totalLikes: number
}

