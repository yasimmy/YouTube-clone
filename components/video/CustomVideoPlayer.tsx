'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import ReactPlayer from 'react-player'
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiVolume1,
  FiSettings,
  FiMinimize,
  FiMaximize2,
  FiChevronDown,
  FiCheck,
  FiRotateCw,
  FiRotateCcw,
} from 'react-icons/fi'
import styles from './CustomVideoPlayer.module.scss'

interface CustomVideoPlayerProps {
  url: string
  title?: string
  onProgress?: (progress: { played: number; playedSeconds: number }) => void
  onDuration?: (duration: number) => void
  onNextVideo?: () => void
  onTimeUpdate?: (seconds: number) => void
  onSeek?: (seconds: number) => void
}

type Quality = 'auto' | '1080p' | '720p' | '480p' | '360p'
type TheaterMode = 'normal' | 'theater' | 'fullscreen'

export function CustomVideoPlayer({ 
  url, 
  title, 
  onProgress, 
  onDuration,
  onNextVideo,
  onTimeUpdate,
  onSeek
}: CustomVideoPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  
  // Основные состояния
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [played, setPlayed] = useState(0)
  const [playedSeconds, setPlayedSeconds] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  
  // UI состояния
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMiniPlayer, setIsMiniPlayer] = useState(false)
  const [theaterMode, setTheaterMode] = useState<TheaterMode>('normal')
  
  // Меню и настройки
  const [showSettings, setShowSettings] = useState(false)
  const [showQuality, setShowQuality] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [quality, setQuality] = useState<Quality>('auto')
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [isHoveringProgress, setIsHoveringProgress] = useState(false)
  const [isDraggingProgress, setIsDraggingProgress] = useState(false)
  const [hoverTime, setHoverTime] = useState(0)
  
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()
  const settingsRef = useRef<HTMLDivElement>(null)
  const qualityRef = useRef<HTMLDivElement>(null)

  // Горячие клавиши
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Игнорируем если фокус на input/textarea
      if (
        (e.target as HTMLElement)?.tagName === 'INPUT' ||
        (e.target as HTMLElement)?.tagName === 'TEXTAREA'
      ) {
        return
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          setPlaying(!playing)
          break
        case 'ArrowLeft':
          e.preventDefault()
          seek(-10)
          break
        case 'ArrowRight':
          e.preventDefault()
          seek(10)
          break
        case 'ArrowUp':
          e.preventDefault()
          setVolume(Math.min(1, volume + 0.1))
          break
        case 'ArrowDown':
          e.preventDefault()
          setVolume(Math.max(0, volume - 0.1))
          break
        case 'KeyM':
          e.preventDefault()
          setMuted(!muted)
          break
        case 'KeyF':
          e.preventDefault()
          handleFullscreen()
          break
        case 'KeyT':
          e.preventDefault()
          toggleTheaterMode()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [playing, volume, muted])

  // Полноэкранный режим
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
      if (!document.fullscreenElement) {
        setTheaterMode('normal')
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Клик вне меню
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false)
      }
      if (qualityRef.current && !qualityRef.current.contains(event.target as Node)) {
        setShowQuality(false)
      }
    }

    if (showSettings || showQuality) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSettings, showQuality])

  // Автоскрытие контролов
  useEffect(() => {
    if (showControls && playing) {
      clearTimeout(controlsTimeoutRef.current)
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
    return () => clearTimeout(controlsTimeoutRef.current)
  }, [showControls, playing])

  // Мини-плеер при скролле
  useEffect(() => {
    if (!isMiniPlayer) return

    const handleScroll = () => {
      const scrollY = window.scrollY
      if (scrollY > 400 && !isMiniPlayer) {
        setIsMiniPlayer(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isMiniPlayer])

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const seek = useCallback((seconds: number) => {
    if (!playerRef.current) return
    const newTime = Math.max(0, Math.min(duration, playedSeconds + seconds))
    const newPlayed = duration > 0 ? newTime / duration : 0
    setPlayed(newPlayed)
    setPlayedSeconds(newTime)
    playerRef.current.seekTo(newPlayed, 'fraction')
    onSeek?.(newTime)
  }, [duration, playedSeconds, onSeek])

  // Expose seek function to parent via global window object
  useEffect(() => {
    if (onSeek && playerRef.current) {
      // Store seek function for external calls (absolute time in seconds)
      ;(window as any).__videoPlayerSeek = (seconds: number) => {
        if (!playerRef.current || !duration) return
        const newTime = Math.max(0, Math.min(duration, seconds))
        const newPlayed = duration > 0 ? newTime / duration : 0
        setPlayed(newPlayed)
        setPlayedSeconds(newTime)
        if (playerRef.current) {
          playerRef.current.seekTo(newPlayed, 'fraction')
        }
      }
    }
    return () => {
      delete (window as any).__videoPlayerSeek
    }
  }, [onSeek, duration])

  const updateProgress = (clientX: number) => {
    if (!progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const newTime = pos * duration
    setPlayed(pos)
    setPlayedSeconds(newTime)
    if (playerRef.current) {
      playerRef.current.seekTo(pos, 'fraction')
    }
    onSeek?.(newTime)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    updateProgress(e.clientX)
  }

  const handleProgressPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDraggingProgress(true)
    e.currentTarget.setPointerCapture?.(e.pointerId)
    updateProgress(e.clientX)
  }

  const handleProgressPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingProgress) {
      updateProgress(e.clientX)
      return
    }
    handleProgressHover(e)
  }

  const handleProgressPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingProgress) return
    updateProgress(e.clientX)
    setIsDraggingProgress(false)
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement> | React.PointerEvent<HTMLDivElement>) => {
    if (!progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    setHoverTime(pos * duration)
    setIsHoveringProgress(true)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    setMuted(newVolume === 0)
  }

  const handleMute = () => {
    if (muted) {
      setMuted(false)
      setVolume(volume || 0.5)
    } else {
      setMuted(true)
    }
  }

  const handleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      containerRef.current.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen()
    }
  }

  const toggleTheaterMode = () => {
    if (theaterMode === 'normal') {
      setTheaterMode('theater')
    } else {
      setTheaterMode('normal')
    }
  }

  const handleMiniPlayer = () => {
    setIsMiniPlayer(!isMiniPlayer)
  }

  const handlePlaybackRate = (rate: number) => {
    setPlaybackRate(rate)
    setShowSettings(false)
  }

  const handleQuality = (q: Quality) => {
    setQuality(q)
    setShowQuality(false)
  }

  const getVolumeIcon = () => {
    if (muted || volume === 0) return <FiVolumeX />
    if (volume < 0.5) return <FiVolume1 />
    return <FiVolume2 />
  }

  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
  const qualities: Quality[] = ['auto', '1080p', '720p', '480p', '360p']

  return (
    <div
      ref={containerRef}
      className={`${styles.videoPlayer} ${theaterMode === 'theater' ? styles.theater : ''} ${isFullscreen ? styles.fullscreen : ''} ${isMiniPlayer ? styles.miniPlayer : ''}`}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => {
        if (playing) {
          setTimeout(() => setShowControls(false), 2000)
        }
      }}
      onClick={() => {
        if (showControls) {
          setPlaying(!playing)
        }
      }}
    >
      <div className={styles.videoWrapper}>
        <ReactPlayer
          ref={playerRef}
          url={url}
          playing={playing}
          volume={volume}
          muted={muted}
          playbackRate={playbackRate}
          width="100%"
          height="100%"
          onProgress={(state) => {
            setPlayed(state.played)
            setPlayedSeconds(state.playedSeconds)
            setBuffered(state.loaded)
            onProgress?.(state)
            onTimeUpdate?.(state.playedSeconds)
          }}
          onDuration={(dur) => {
            setDuration(dur)
            onDuration?.(dur)
          }}
          onEnded={() => {
            setPlaying(false)
          }}
          className={styles.reactPlayer}
          controls={false}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
              },
            },
          }}
        />
      </div>

      {/* Центральная кнопка Play/Pause */}
      {!showControls && !playing && (
        <div className={styles.centerPlayButton}>
          <button
            className={styles.playButton}
            onClick={(e) => {
              e.stopPropagation()
              setPlaying(true)
            }}
          >
            <FiPlay />
          </button>
        </div>
      )}

      {/* Контролы */}
      <div 
        ref={controlsRef}
        className={`${styles.controls} ${showControls ? styles.visible : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Прогресс бар */}
        <div 
          ref={progressRef}
          className={styles.progressContainer}
          onClick={handleSeek}
          onPointerDown={handleProgressPointerDown}
          onPointerMove={handleProgressPointerMove}
          onPointerUp={handleProgressPointerUp}
          onPointerCancel={() => setIsDraggingProgress(false)}
          onMouseLeave={() => setIsHoveringProgress(false)}
        >
          <div className={styles.progressBar}>
            <div 
              className={styles.progressBuffered}
              style={{ width: `${buffered * 100}%` }}
            />
            <div 
              className={styles.progressPlayed}
              style={{ width: `${played * 100}%` }}
            >
              <div className={styles.progressHandle} />
            </div>
          </div>
          {isHoveringProgress && (
            <div 
              className={styles.hoverTime}
              style={{ left: `${(hoverTime / duration) * 100}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Нижняя панель контролов */}
        <div className={styles.controlsBar}>
          <div className={styles.controlsLeft}>
            <button
              className={styles.controlBtn}
              onClick={(e) => {
                e.stopPropagation()
                setPlaying(!playing)
              }}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <FiPause /> : <FiPlay />}
            </button>

            <button
              className={styles.controlBtn}
              onClick={(e) => {
                e.stopPropagation()
                seek(-10)
              }}
              aria-label="Rewind 10s"
              title="Назад 10 сек"
            >
              <FiRotateCcw />
            </button>

            <button
              className={styles.controlBtn}
              onClick={(e) => {
                e.stopPropagation()
                seek(10)
              }}
              aria-label="Forward 10s"
              title="Вперед 10 сек"
            >
              <FiRotateCw />
            </button>

            <div
              className={styles.volumeWrapper}
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button
                className={styles.controlBtn}
                onClick={(e) => {
                  e.stopPropagation()
                  handleMute()
                }}
                aria-label={muted ? 'Unmute' : 'Mute'}
              >
                {getVolumeIcon()}
              </button>
              {showVolumeSlider && (
                <div className={styles.volumeSlider}>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={muted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className={styles.volumeInput}
                  />
                  <span className={styles.volumeValue}>{Math.round(volume * 100)}%</span>
                </div>
              )}
            </div>

            <div className={styles.timeDisplay}>
              {formatTime(playedSeconds)} / {formatTime(duration)}
            </div>
          </div>

          <div className={styles.controlsRight}>
            <div className={styles.qualityMenu} ref={qualityRef}>
              <button
                className={styles.controlBtn}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowQuality(!showQuality)
                }}
                title="Качество"
              >
                {quality === 'auto' ? 'AUTO' : quality}
              </button>
              {showQuality && (
                <div className={styles.qualityDropdown}>
                  {qualities.map((q) => (
                    <button
                      key={q}
                      className={`${styles.qualityOption} ${quality === q ? styles.active : ''}`}
                      onClick={() => handleQuality(q)}
                    >
                      {q === 'auto' ? 'Авто' : q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.settingsMenu} ref={settingsRef}>
              <button
                className={styles.controlBtn}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowSettings(!showSettings)
                }}
                title="Настройки"
              >
                <FiSettings />
              </button>
              {showSettings && (
                <div className={styles.settingsDropdown}>
                  <div className={styles.settingsSection}>
                    <div className={styles.settingsTitle}>Скорость</div>
                    {playbackRates.map((rate) => (
                      <button
                        key={rate}
                        className={`${styles.settingsOption} ${playbackRate === rate ? styles.active : ''}`}
                        onClick={() => handlePlaybackRate(rate)}
                      >
                        {playbackRate === rate && <FiCheck className={styles.optionCheck} />}
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              className={styles.controlBtn}
              onClick={(e) => {
                e.stopPropagation()
                handleMiniPlayer()
              }}
              title="Мини-плеер"
            >
                <FiMinimize />
            </button>

            <button
              className={styles.controlBtn}
              onClick={(e) => {
                e.stopPropagation()
                handleFullscreen()
              }}
              title={isFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'}
            >
              {isFullscreen ? <FiChevronDown /> : <FiMaximize2 />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
