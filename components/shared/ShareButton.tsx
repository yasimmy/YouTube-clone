'use client'

import { useState, useRef, useEffect } from 'react'
import { FiShare2, FiCopy, FiCheck, FiCode, FiClock, FiLink } from 'react-icons/fi'
import { SiVk, SiTelegram, SiTwitter } from 'react-icons/si'
import toast from 'react-hot-toast'
import styles from './ShareButton.module.scss'

interface ShareButtonProps {
  url: string
  title?: string
  type?: 'video' | 'channel'
  timestamp?: number // Время в секундах для видео
}

export function ShareButton({ url, title, type = 'video', timestamp }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedType, setCopiedType] = useState<'url' | 'embed' | 'short' | null>(null)
  const [showQR, setShowQR] = useState(false)
  const [qrCode, setQrCode] = useState<string>('')
  const menuRef = useRef<HTMLDivElement>(null)

  const getFullUrl = (withTimestamp = false) => {
    const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url
    if (withTimestamp && timestamp && type === 'video') {
      return `${baseUrl}?t=${Math.floor(timestamp)}`
    }
    return baseUrl
  }

  const getShortUrl = () => {
    // Генерируем короткую ссылку (в реальности это будет API)
    const shortId = url.split('/').pop()?.substring(0, 8) || 'video'
    return typeof window !== 'undefined' ? `${window.location.origin}/s/${shortId}` : url
  }

  const getEmbedCode = () => {
    const embedUrl = getFullUrl(false)
    return `<iframe width="560" height="315" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
        setShowQR(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  useEffect(() => {
    if (showQR && typeof window !== 'undefined') {
      // Генерируем QR-код через API
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getFullUrl(!!timestamp))}`
      setQrCode(qrUrl)
    }
  }, [showQR, url, timestamp])

  const handleCopy = async (text: string, type: 'url' | 'embed' | 'short' = 'url') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setCopiedType(type)
      toast.success('Скопировано!')
      setTimeout(() => {
        setCopied(false)
        setCopiedType(null)
      }, 2000)
    } catch (err) {
      toast.error('Не удалось скопировать')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Поделиться',
          text: title || '',
          url: getFullUrl(!!timestamp),
        })
        setShowMenu(false)
      } catch (err) {
        // User cancelled or error
      }
    } else {
      handleCopy(getFullUrl(!!timestamp))
    }
  }

  const handleSocialShare = (platform: 'vk' | 'telegram' | 'twitter') => {
    const shareUrl = getFullUrl(!!timestamp)
    const shareText = encodeURIComponent(title || '')
    const encodedUrl = encodeURIComponent(shareUrl)

    let shareLink = ''
    switch (platform) {
      case 'vk':
        shareLink = `https://vk.com/share.php?url=${encodedUrl}&title=${shareText}`
        break
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${shareText}`
        break
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareText}`
        break
    }

    window.open(shareLink, '_blank', 'width=600,height=400')
    setShowMenu(false)
  }

  return (
    <div className={styles.shareButton} ref={menuRef}>
      <button
        className={styles.button}
        onClick={() => setShowMenu(!showMenu)}
        aria-label="Поделиться"
      >
        <FiShare2 />
        <span>Поделиться</span>
      </button>

      {showMenu && (
        <>
          <div
            className={styles.overlay}
            onClick={() => {
              setShowMenu(false)
              setShowQR(false)
            }}
          />
          <div className={styles.menu}>
            <div className={styles.menuHeader}>
              <h3>Поделиться {type === 'video' ? 'видео' : 'каналом'}</h3>
            </div>
            <div className={styles.menuContent}>
              {type === 'video' && timestamp && (
                <div className={styles.timestampOption}>
                  <button
                    className={styles.timestampButton}
                    onClick={() => handleCopy(getFullUrl(true), 'url')}
                  >
                    <FiClock />
                    <span>С временной меткой ({Math.floor(timestamp / 60)}:{String(Math.floor(timestamp % 60)).padStart(2, '0')})</span>
                  </button>
                </div>
              )}

              <div className={styles.socialButtons}>
                <button
                  className={styles.socialButton}
                  onClick={() => handleSocialShare('vk')}
                  title="Поделиться в VK"
                >
                  <SiVk />
                </button>
                <button
                  className={styles.socialButton}
                  onClick={() => handleSocialShare('telegram')}
                  title="Поделиться в Telegram"
                >
                  <SiTelegram />
                </button>
                <button
                  className={styles.socialButton}
                  onClick={() => handleSocialShare('twitter')}
                  title="Поделиться в Twitter"
                >
                  <SiTwitter />
                </button>
              </div>

              <div className={styles.urlSection}>
                <label className={styles.sectionLabel}>Обычная ссылка</label>
                <div className={styles.urlInputWrapper}>
                  <input
                    type="text"
                    value={getFullUrl(!!timestamp)}
                    readOnly
                    className={styles.urlInput}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    className={`${styles.copyButton} ${copied && copiedType === 'url' ? styles.copied : ''}`}
                    onClick={() => handleCopy(getFullUrl(!!timestamp), 'url')}
                    title="Копировать ссылку"
                  >
                    {copied && copiedType === 'url' ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>
              </div>

              <div className={styles.urlSection}>
                <label className={styles.sectionLabel}>Короткая ссылка</label>
                <div className={styles.urlInputWrapper}>
                  <input
                    type="text"
                    value={getShortUrl()}
                    readOnly
                    className={styles.urlInput}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    className={`${styles.copyButton} ${copied && copiedType === 'short' ? styles.copied : ''}`}
                    onClick={() => handleCopy(getShortUrl(), 'short')}
                    title="Копировать короткую ссылку"
                  >
                    {copied && copiedType === 'short' ? <FiCheck /> : <FiLink />}
                  </button>
                </div>
              </div>

              {type === 'video' && (
                <div className={styles.urlSection}>
                  <label className={styles.sectionLabel}>Код для встраивания</label>
                  <div className={styles.urlInputWrapper}>
                    <textarea
                      value={getEmbedCode()}
                      readOnly
                      className={styles.embedInput}
                      onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                      rows={3}
                    />
                    <button
                      className={`${styles.copyButton} ${copied && copiedType === 'embed' ? styles.copied : ''}`}
                      onClick={() => handleCopy(getEmbedCode(), 'embed')}
                      title="Копировать код"
                    >
                      {copied && copiedType === 'embed' ? <FiCheck /> : <FiCode />}
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.qrSection}>
                <button
                  className={styles.qrButton}
                  onClick={() => setShowQR(!showQR)}
                >
                  <span>Показать QR-код</span>
                </button>
                {showQR && qrCode && (
                  <div className={styles.qrCode}>
                    <img src={qrCode} alt="QR Code" />
                    <p className={styles.qrHint}>Отсканируйте для быстрого доступа</p>
                  </div>
                )}
              </div>

              <div className={styles.actions}>
                {navigator.share && (
                  <button className={styles.actionButton} onClick={handleShare}>
                    <FiShare2 />
                    Поделиться
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
