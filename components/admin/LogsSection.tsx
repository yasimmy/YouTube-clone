'use client'

import { useState, useEffect } from 'react'
import { getLogs, clearLogs, Log, LogLevel, LogCategory } from '@/lib/logging'
import { FiFilter, FiX, FiInfo, FiAlertTriangle, FiCheckCircle, FiXCircle, FiDownload, FiTrash2, FiCalendar, FiTrendingUp, FiBarChart2 } from 'react-icons/fi'
import styles from './AdminPage.module.scss'

export function LogsSection() {
  const [logs, setLogs] = useState<Log[]>([])
  const [filterCategory, setFilterCategory] = useState<LogCategory | 'all'>('all')
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [groupByCategory, setGroupByCategory] = useState(false)
  const [showStats, setShowStats] = useState(true)

  useEffect(() => {
    loadLogs()
    const interval = setInterval(loadLogs, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [filterCategory, filterLevel])

  const loadLogs = () => {
    const category = filterCategory === 'all' ? undefined : filterCategory
    const level = filterLevel === 'all' ? undefined : filterLevel
    const allLogs = getLogs(category, level, 500)
    setLogs(allLogs)
  }

  const filterByDate = (log: Log) => {
    if (dateFilter === 'all') return true
    const now = new Date()
    const logDate = new Date(log.timestamp)
    const diff = now.getTime() - logDate.getTime()
    
    switch (dateFilter) {
      case 'today':
        return diff < 24 * 60 * 60 * 1000
      case 'week':
        return diff < 7 * 24 * 60 * 60 * 1000
      case 'month':
        return diff < 30 * 24 * 60 * 60 * 1000
      default:
        return true
    }
  }

  const filteredLogs = logs
    .filter(log => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return log.message.toLowerCase().includes(query) ||
               log.category.toLowerCase().includes(query) ||
               (log.violationType && log.violationType.toLowerCase().includes(query)) ||
               (log.moderatorId && log.moderatorId.toLowerCase().includes(query))
      }
      return true
    })
    .filter(filterByDate)

  const stats = {
    total: logs.length,
    byLevel: {
      error: logs.filter(l => l.level === 'error').length,
      warning: logs.filter(l => l.level === 'warning').length,
      success: logs.filter(l => l.level === 'success').length,
      info: logs.filter(l => l.level === 'info').length,
    },
    byCategory: {
      security: logs.filter(l => l.category === 'security').length,
      admin: logs.filter(l => l.category === 'admin').length,
      user: logs.filter(l => l.category === 'user').length,
      video: logs.filter(l => l.category === 'video').length,
      moderation: logs.filter(l => l.category === 'moderation').length,
      violation: logs.filter(l => l.category === 'violation').length,
    }
  }

  const groupedLogs = groupByCategory
    ? filteredLogs.reduce((acc, log) => {
        if (!acc[log.category]) acc[log.category] = []
        acc[log.category].push(log)
        return acc
      }, {} as Record<string, Log[]>)
    : null

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `logs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    if (confirm('Вы уверены, что хотите очистить все логи?')) {
      clearLogs()
      loadLogs()
    }
  }

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case 'error': return <FiXCircle className={styles.errorIcon} />
      case 'warning': return <FiAlertTriangle className={styles.warningIcon} />
      case 'success': return <FiCheckCircle className={styles.successIcon} />
      default: return <FiInfo className={styles.infoIcon} />
    }
  }

  const getCategoryColor = (category: LogCategory) => {
    switch (category) {
      case 'security': return '#ef4444'
      case 'admin': return '#8b5cf6'
      case 'user': return '#3b82f6'
      case 'video': return '#10b981'
      case 'feedback': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  return (
    <div className={styles.logsSection}>
      <div className={styles.logsHeader}>
        <div className={styles.logsHeaderTop}>
          <h2>Системные логи</h2>
          <div className={styles.logsActions}>
            <button onClick={handleExport} className={styles.exportButton} title="Экспортировать логи">
              <FiDownload />
              <span>Экспорт</span>
            </button>
            <button onClick={handleClear} className={styles.clearButton} title="Очистить логи">
              <FiTrash2 />
              <span>Очистить</span>
            </button>
            <button 
              onClick={() => setShowStats(!showStats)} 
              className={styles.statsButton}
              title="Показать статистику"
            >
              <FiBarChart2 />
            </button>
          </div>
        </div>

        {showStats && (
          <div className={styles.logsStats}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Всего</span>
              <span className={styles.statValue}>{stats.total}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Ошибки</span>
              <span className={`${styles.statValue} ${styles.error}`}>{stats.byLevel.error}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Предупреждения</span>
              <span className={`${styles.statValue} ${styles.warning}`}>{stats.byLevel.warning}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Успех</span>
              <span className={`${styles.statValue} ${styles.success}`}>{stats.byLevel.success}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Инфо</span>
              <span className={`${styles.statValue} ${styles.info}`}>{stats.byLevel.info}</span>
            </div>
          </div>
        )}

        <div className={styles.logsFilters}>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as LogCategory | 'all')}
            className={styles.filterSelect}
          >
            <option value="all">Все категории</option>
            <option value="user">Пользователи</option>
            <option value="video">Видео</option>
            <option value="admin">Админ</option>
            <option value="security">Безопасность</option>
            <option value="system">Система</option>
            <option value="feedback">Отзывы</option>
            <option value="moderation">Модерация</option>
            <option value="violation">Нарушения</option>
          </select>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as LogLevel | 'all')}
            className={styles.filterSelect}
          >
            <option value="all">Все уровни</option>
            <option value="info">Информация</option>
            <option value="success">Успех</option>
            <option value="warning">Предупреждение</option>
            <option value="error">Ошибка</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | 'week' | 'month')}
            className={styles.filterSelect}
          >
            <option value="all">Все время</option>
            <option value="today">Сегодня</option>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
          </select>
          <input
            type="text"
            placeholder="Поиск в логах..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button
            onClick={() => setGroupByCategory(!groupByCategory)}
            className={`${styles.groupButton} ${groupByCategory ? styles.active : ''}`}
            title="Группировать по категориям"
          >
            <FiFilter />
          </button>
        </div>
      </div>

      <div className={styles.logsList}>
        {filteredLogs.length === 0 ? (
          <div className={styles.empty}>
            <FiInfo />
            <p>Нет логов, соответствующих фильтрам</p>
          </div>
        ) : groupByCategory && groupedLogs ? (
          Object.entries(groupedLogs).map(([category, categoryLogs]) => (
            <div key={category} className={styles.logGroup}>
              <div className={styles.logGroupHeader} style={{ borderColor: getCategoryColor(category as LogCategory) }}>
                <span style={{ color: getCategoryColor(category as LogCategory) }}>
                  {category.toUpperCase()}
                </span>
                <span className={styles.logGroupCount}>{categoryLogs.length}</span>
              </div>
              {categoryLogs.map((log) => (
                <div key={log.id} className={`${styles.logItem} ${styles[`log-${log.level}`]}`}>
                  <div className={styles.logIcon}>
                    {getLevelIcon(log.level)}
                  </div>
                  <div className={styles.logContent}>
                    <div className={styles.logHeader}>
                      <span className={styles.logTime}>
                        {new Date(log.timestamp).toLocaleString('ru-RU')}
                      </span>
                    </div>
                    <p className={styles.logMessage}>{log.message}</p>
                    {log.violationType && (
                      <span className={styles.violationType}>Тип: {log.violationType}</span>
                    )}
                    {log.moderatorId && (
                      <span className={styles.moderatorInfo}>Модератор: {log.moderatorId}</span>
                    )}
                    {log.targetUserId && (
                      <span className={styles.targetUser}>Пользователь: {log.targetUserId}</span>
                    )}
                    {log.details && (
                      <details className={styles.logDetails}>
                        <summary>Детали</summary>
                        <pre>{JSON.stringify(log.details, null, 2)}</pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className={`${styles.logItem} ${styles[`log-${log.level}`]}`}>
              <div className={styles.logIcon}>
                {getLevelIcon(log.level)}
              </div>
              <div className={styles.logContent}>
                <div className={styles.logHeader}>
                  <span 
                    className={styles.logCategory}
                    style={{ color: getCategoryColor(log.category) }}
                  >
                    {log.category.toUpperCase()}
                  </span>
                  <span className={styles.logTime}>
                    {new Date(log.timestamp).toLocaleString('ru-RU')}
                  </span>
                </div>
                <p className={styles.logMessage}>{log.message}</p>
                <div className={styles.logMeta}>
                  {log.violationType && (
                    <span className={styles.violationType}>Тип: {log.violationType}</span>
                  )}
                  {log.moderatorId && (
                    <span className={styles.moderatorInfo}>Модератор: {log.moderatorId}</span>
                  )}
                  {log.targetUserId && (
                    <span className={styles.targetUser}>Пользователь: {log.targetUserId}</span>
                  )}
                </div>
                {log.details && (
                  <details className={styles.logDetails}>
                    <summary>Детали</summary>
                    <pre>{JSON.stringify(log.details, null, 2)}</pre>
                  </details>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

