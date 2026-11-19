'use client'

import React, { useEffect, useState } from 'react'
import { Comment, Video } from '@/types'
import { db } from '@/lib/db'
import { useStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { FiThumbsUp, FiThumbsDown, FiHeart, FiMapPin, FiTrash2 } from 'react-icons/fi'
import styles from './VideoComments.module.scss'
import toast from 'react-hot-toast'

interface VideoCommentsProps {
  videoId: string
  onSeek?: (seconds: number) => void
}

// Parse timestamps in comment text and convert to clickable links
function parseTimestamps(text: string, onSeek?: (seconds: number) => void): React.ReactNode[] {
  // Regex patterns for timestamps:
  // 0:02, 1:23, 10:45 (MM:SS)
  // 1:23:45 (HH:MM:SS)
  const timestampRegex = /(\d{1,2}):(\d{2})(?::(\d{2}))?/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = timestampRegex.exec(text)) !== null) {
    // Add text before timestamp
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    // Parse timestamp
    const hours = match[3] ? parseInt(match[1], 10) : 0
    const minutes = match[3] ? parseInt(match[2], 10) : parseInt(match[1], 10)
    const seconds = match[3] ? parseInt(match[3], 10) : parseInt(match[2], 10)
    const totalSeconds = hours * 3600 + minutes * 60 + seconds

    // Create clickable timestamp
    const timestampText = match[0]
    parts.push(
      <span
        key={match.index}
        className={styles.timestamp}
        onClick={() => onSeek?.(totalSeconds)}
        title={`Перейти к ${timestampText}`}
      >
        {timestampText}
      </span>
    )

    lastIndex = timestampRegex.lastIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}

export function VideoComments({ videoId, onSeek }: VideoCommentsProps) {
  const { user } = useStore()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [video, setVideo] = useState<Video | null>(null)

  const resolveAuthor = (authorId: string, fallback: Comment['user']) => {
    if (user?.id === authorId && user.avatar) return user
    return db.users.findById(authorId) || fallback
  }

  useEffect(() => {
    const videoData = db.videos.findById(videoId)
    setVideo(videoData || null)
    
    const videoComments = db.comments.findByVideoId(videoId)
    // Mark author replies and sort: pinned first
    const commentsWithAuthorMark = videoComments.map(comment => {
      const isAuthor = Boolean(videoData && comment.userId === videoData.userId)
      return {
        ...comment,
        isAuthorReply: isAuthor || comment.isAuthorReply,
        replies: comment.replies?.map(reply => ({
          ...reply,
          isAuthorReply: Boolean(videoData && reply.userId === videoData.userId),
        })),
      }
    })
    // Sort: pinned comments first
    const sortedComments = [...commentsWithAuthorMark].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return 0
    })
    setComments(sortedComments)
  }, [videoId])

  const handleSubmitComment = () => {
    if (!user) {
      toast.error('Войдите, чтобы оставить комментарий')
      return
    }

    if (!newComment.trim()) return

    // Sanitize comment
    let sanitizedComment = newComment
    if (typeof window !== 'undefined') {
      import('@/lib/security').then(({ sanitizeInput, sanitizeHTML }) => {
        sanitizedComment = sanitizeHTML(sanitizeInput(newComment))
      })
    }

    const comment = db.comments.create({
      text: sanitizedComment,
      userId: user.id,
      videoId,
    })

    // Mark as author reply if user is video author
    const isAuthor = Boolean(video && user.id === video.userId)
    const commentWithAuthor = {
      ...comment,
      isAuthorReply: isAuthor,
    }

    setComments([commentWithAuthor, ...comments])
    setNewComment('')
    toast.success('Комментарий добавлен')

    // Award currency to video author
    if (video && user.id !== video.userId && typeof window !== 'undefined') {
      import('@/lib/currency-rewards').then(({ rewardCommentToAuthor }) => {
        rewardCommentToAuthor(videoId, user.id)
      })
    }

    // Check seasonal events
    import('@/lib/seasonal-events').then(({ checkSeasonalEvents }) => {
      checkSeasonalEvents(user.id)
    })
  }

  const handleReply = (parentId: string) => {
    if (!user) {
      toast.error('Войдите, чтобы ответить')
      return
    }

    if (!replyText.trim()) return

    const reply = db.comments.create({
      text: replyText,
      userId: user.id,
      videoId,
      parentId,
    })

    // Update comments
    const updatedComments = db.comments.findByVideoId(videoId)
    setComments(updatedComments)
    setReplyingTo(null)
    setReplyText('')
    toast.success('Ответ добавлен')

    // Award currency to video author (replies also count)
    if (video && user.id !== video.userId && typeof window !== 'undefined') {
      import('@/lib/currency-rewards').then(({ rewardCommentToAuthor }) => {
        rewardCommentToAuthor(videoId, user.id)
      })
    }

    // Check seasonal events
    import('@/lib/seasonal-events').then(({ checkSeasonalEvents }) => {
      checkSeasonalEvents(user.id)
    })
  }

  const handleLike = (commentId: string, type: 'like' | 'dislike') => {
    if (!user) {
      toast.error('Войдите, чтобы оценить комментарий')
      return
    }

    db.likes.toggle({
      userId: user.id,
      commentId,
      type,
    })

    // Update comments
    const updatedComments = db.comments.findByVideoId(videoId)
    const commentsWithAuthorMark = updatedComments.map(comment => {
      const isAuthor = Boolean(video && comment.userId === video.userId)
      return {
        ...comment,
        isAuthorReply: isAuthor || comment.isAuthorReply,
        replies: comment.replies?.map(reply => ({
          ...reply,
          isAuthorReply: Boolean(video && reply.userId === video.userId),
        })),
      }
    })
    setComments(commentsWithAuthorMark)
  }

  const handleAuthorLike = (commentId: string) => {
    if (!user || !video || user.id !== video.userId) {
      return
    }

    const comment = comments.find(c => c.id === commentId) || 
                   comments.find(c => c.replies?.some(r => r.id === commentId))?.replies?.find(r => r.id === commentId)
    
    if (!comment) return

    // Toggle author liked
    const updated = db.comments.update(commentId, {
      authorLiked: !comment.authorLiked,
    })

    if (updated) {
      // Update comments
      const updatedComments = db.comments.findByVideoId(videoId)
      const commentsWithAuthorMark = updatedComments.map(c => {
        const isAuthor = Boolean(video && c.userId === video.userId)
        return {
          ...c,
          isAuthorReply: isAuthor || c.isAuthorReply,
          replies: c.replies?.map(reply => ({
            ...reply,
            isAuthorReply: Boolean(video && reply.userId === video.userId),
          })),
        }
      })
      // Sort: pinned first
      const sortedComments = [...commentsWithAuthorMark].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return 0
      })
      setComments(sortedComments)
      toast.success(updated.authorLiked ? 'Отмечено как понравилось автору' : 'Убрано из понравилось автору')
    }
  }

  const handlePinComment = (commentId: string) => {
    if (!user || !video || user.id !== video.userId) {
      return
    }

    const comment = comments.find(c => c.id === commentId)
    if (!comment) return

    // Unpin other comments if pinning this one
    if (!comment.isPinned) {
      comments.forEach(c => {
        if (c.isPinned && c.id !== commentId) {
          db.comments.update(c.id, { isPinned: false })
        }
      })
    }

    // Toggle pin
    const updated = db.comments.update(commentId, {
      isPinned: !comment.isPinned,
    })

    if (updated) {
      // Update comments
      const updatedComments = db.comments.findByVideoId(videoId)
      const commentsWithAuthorMark = updatedComments.map(c => {
        const isAuthor = Boolean(video && c.userId === video.userId)
        return {
          ...c,
          isAuthorReply: isAuthor || c.isAuthorReply,
          replies: c.replies?.map(reply => ({
            ...reply,
            isAuthorReply: Boolean(video && reply.userId === video.userId),
          })),
        }
      })
      // Sort: pinned first
      const sortedComments = [...commentsWithAuthorMark].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return 0
      })
      setComments(sortedComments)
      toast.success(updated.isPinned ? 'Комментарий закреплен' : 'Комментарий откреплен')
    }
  }

  const handleDeleteComment = (commentId: string) => {
    if (!user) {
      toast.error('Войдите, чтобы удалить комментарий')
      return
    }

    const comment = comments.find(c => c.id === commentId) || 
                   comments.find(c => c.replies?.some(r => r.id === commentId))?.replies?.find(r => r.id === commentId)
    
    if (!comment) return

    // Check if user can delete (author of comment or author of video)
    const canDelete = comment.userId === user.id || (video && video.userId === user.id)
    
    if (!canDelete) {
      toast.error('Вы не можете удалить этот комментарий')
      return
    }

    // Delete comment and its replies
    const success = db.comments.delete(commentId)
    
    if (success) {
      // Also delete all replies to this comment
      if (comment.replies) {
        comment.replies.forEach(reply => {
          db.comments.delete(reply.id)
        })
      }
      
      // Update comments
      const updatedComments = db.comments.findByVideoId(videoId)
      const commentsWithAuthorMark = updatedComments.map(c => {
        const isAuthor = Boolean(video && c.userId === video.userId)
        return {
          ...c,
          isAuthorReply: isAuthor || c.isAuthorReply,
          replies: c.replies?.map(reply => ({
            ...reply,
            isAuthorReply: Boolean(video && reply.userId === video.userId),
          })),
        }
      })
      // Sort: pinned first
      const sortedComments = [...commentsWithAuthorMark].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return 0
      })
      setComments(sortedComments)
      toast.success('Комментарий удален')
    } else {
      toast.error('Ошибка при удалении комментария')
    }
  }

  const formatLikes = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}К`
    }
    return count.toString()
  }

  return (
    <div className={styles.comments}>
      <h3 className={styles.title}>
        {comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)} комментариев
      </h3>

      {user && (
        <div className={styles.addComment}>
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className={styles.commentInput}>
            <input
              type="text"
              placeholder="Добавить комментарий..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
            />
            <button onClick={handleSubmitComment} disabled={!newComment.trim()}>
              Комментировать
            </button>
          </div>
        </div>
      )}

      <div className={styles.commentsList}>
        {comments.map((comment) => {
          const commentAuthor = resolveAuthor(comment.userId, comment.user)
          return (
          <div key={comment.id} className={styles.comment}>
            <div className={styles.commentHeader}>
              {commentAuthor.avatar ? (
                <img src={commentAuthor.avatar} alt={commentAuthor.username} className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {commentAuthor.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className={styles.commentContent}>
                <div className={styles.commentAuthor}>
                  <span className={styles.authorName}>
                    {comment.isPinned && (
                      <FiMapPin className={styles.pinnedIcon} title="Закреплен" />
                    )}
                    {commentAuthor.username}
                    {comment.isAuthorReply && (
                      <span className={styles.authorBadge} title="Автор видео">
                        АВТОР
                      </span>
                    )}
                  </span>
                  <span className={styles.commentDate}>
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                      locale: ru,
                    })}
                  </span>
                </div>
                <p className={styles.commentText}>
                  {parseTimestamps(comment.text, onSeek)}
                </p>
                {comment.authorLiked && (
                  <div className={styles.authorLikedBadge}>
                    <FiHeart /> Понравилось автору
                  </div>
                )}
                <div className={styles.commentActions}>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleLike(comment.id, 'like')}
                  >
                    <FiThumbsUp />
                    <span>{formatLikes(comment.likes)}</span>
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleLike(comment.id, 'dislike')}
                  >
                    <FiThumbsDown />
                  </button>
                  {user && video && user.id === video.userId && !comment.isAuthorReply && (
                    <>
                      <button
                        className={`${styles.authorLikeButton} ${comment.authorLiked ? styles.active : ''}`}
                        onClick={() => handleAuthorLike(comment.id)}
                        title="Понравилось автору"
                      >
                        <FiHeart />
                        <span>Понравилось автору</span>
                      </button>
                      <button
                        className={`${styles.pinButton} ${comment.isPinned ? styles.pinned : ''}`}
                        onClick={() => handlePinComment(comment.id)}
                        title={comment.isPinned ? "Открепить" : "Закрепить"}
                      >
                        <FiMapPin />
                        <span>{comment.isPinned ? 'Открепить' : 'Закрепить'}</span>
                      </button>
                    </>
                  )}
                  {user && (
                    <button
                      className={styles.replyButton}
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    >
                      Ответить
                    </button>
                  )}
                  {user && (comment.userId === user.id || (video && video.userId === user.id)) && (
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteComment(comment.id)}
                      title="Удалить комментарий"
                    >
                      <FiTrash2 />
                      <span>Удалить</span>
                    </button>
                  )}
                </div>

                {replyingTo === comment.id && (
                  <div className={styles.replyForm}>
                    <input
                      type="text"
                      placeholder="Написать ответ..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleReply(comment.id)}
                    />
                    <div className={styles.replyActions}>
                      <button onClick={() => setReplyingTo(null)}>Отмена</button>
                      <button onClick={() => handleReply(comment.id)} disabled={!replyText.trim()}>
                        Ответить
                      </button>
                    </div>
                  </div>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <div className={styles.replies}>
                    {comment.replies.map((reply) => {
                      const replyAuthor = resolveAuthor(reply.userId, reply.user)
                      return (
                      <div key={reply.id} className={styles.reply}>
                        {replyAuthor.avatar ? (
                          <img src={replyAuthor.avatar} alt={replyAuthor.username} className={styles.avatar} />
                        ) : (
                          <div className={styles.avatarPlaceholder}>
                            {replyAuthor.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className={styles.commentContent}>
                          <div className={styles.commentAuthor}>
                            <span className={styles.authorName}>
                              {replyAuthor.username}
                              {reply.isAuthorReply && (
                                <span className={styles.authorBadge} title="Автор видео">
                                  АВТОР
                                </span>
                              )}
                            </span>
                            <span className={styles.commentDate}>
                              {formatDistanceToNow(new Date(reply.createdAt), {
                                addSuffix: true,
                                locale: ru,
                              })}
                            </span>
                          </div>
                          <p className={styles.commentText}>
                            {parseTimestamps(reply.text, onSeek)}
                          </p>
                          {reply.authorLiked && (
                            <div className={styles.authorLikedBadge}>
                              <FiHeart /> Понравилось автору
                            </div>
                          )}
                          <div className={styles.commentActions}>
                            <button
                              className={styles.actionButton}
                              onClick={() => handleLike(reply.id, 'like')}
                            >
                              <FiThumbsUp />
                              <span>{formatLikes(reply.likes)}</span>
                            </button>
                            <button
                              className={styles.actionButton}
                              onClick={() => handleLike(reply.id, 'dislike')}
                            >
                              <FiThumbsDown />
                            </button>
                            {user && video && user.id === video.userId && !reply.isAuthorReply && (
                              <button
                                className={`${styles.authorLikeButton} ${reply.authorLiked ? styles.active : ''}`}
                                onClick={() => handleAuthorLike(reply.id)}
                                title="Понравилось автору"
                              >
                                <FiHeart />
                                <span>Понравилось автору</span>
                              </button>
                            )}
                            {user && (reply.userId === user.id || (video && video.userId === user.id)) && (
                              <button
                                className={styles.deleteButton}
                                onClick={() => handleDeleteComment(reply.id)}
                                title="Удалить ответ"
                              >
                                <FiTrash2 />
                                <span>Удалить</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}

