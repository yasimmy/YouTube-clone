'use client'

import { useState, useEffect } from 'react'
import { FiX, FiShield } from 'react-icons/fi'
import { AdminRole } from '@/types'
import styles from './AssignRoleModal.module.scss'

interface AssignRoleModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  currentRole?: string
  onAssign: (userId: string, role: AdminRole) => void
}

const adminRoles: { value: AdminRole | 'user'; label: string; description: string }[] = [
  {
    value: 'user',
    label: 'Обычный пользователь',
    description: 'Без прав администратора',
  },
  { value: 'own', label: 'Главный админ', description: 'Все абсолютные права' },
  { value: 'admin1', label: 'Админ 1', description: 'Управление пользователями и каналами' },
  { value: 'admin2', label: 'Админ 2', description: 'Управление видео и контентом' },
  { value: 'admin3', label: 'Админ 3', description: 'Модерация жалоб' },
  { value: 'admin4', label: 'Админ 4', description: 'Управление комментариями' },
  { value: 'admin5', label: 'Админ 5', description: 'Статистика и аналитика' },
  { value: 'admin6', label: 'Админ 6', description: 'Управление категориями' },
  { value: 'admin7', label: 'Админ 7', description: 'Управление плейлистами' },
  { value: 'admin8', label: 'Админ 8', description: 'Техническая поддержка' },
  { value: 'admin9', label: 'Админ 9', description: 'Контент-модератор' },
  { value: 'admin10', label: 'Админ 10', description: 'Базовый модератор' },
  { value: 'tech-admin', label: 'Технический админ', description: 'Технические права и управление пользователями' },
]

export function AssignRoleModal({ isOpen, onClose, userId, currentRole, onAssign }: AssignRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<AdminRole | 'user'>(
    (currentRole as AdminRole) || 'user'
  )
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      setSelectedRole((currentRole as AdminRole) || 'user')
    }
  }, [isOpen, currentRole])

  const handleAssign = () => {
    if (selectedRole === 'user') {
      onAssign(userId, 'user' as any)
    } else {
      onAssign(userId, selectedRole)
    }
    onClose()
  }

  if (!isOpen && !mounted) return null

  return (
    <>
      <div 
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
        onClick={onClose}
      />
      <div className={`${styles.modal} ${isOpen ? styles.modalVisible : ''}`}>
            <div className={styles.header}>
              <div className={styles.headerIcon}>
                <FiShield />
              </div>
              <h2>Назначить роль</h2>
              <button className={styles.closeButton} onClick={onClose}>
                <FiX />
              </button>
            </div>

            <div className={styles.content}>
              <p className={styles.description}>
                Выберите роль для пользователя. Роль определяет права доступа к функциям админ панели.
              </p>

              <div className={styles.roleOptions}>
                <label className={styles.roleOption}>
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={selectedRole === 'user'}
                    onChange={() => setSelectedRole('user')}
                  />
                  <div className={styles.roleInfo}>
                    <span className={styles.roleLabel}>Обычный пользователь</span>
                    <span className={styles.roleDesc}>Без прав администратора</span>
                  </div>
                </label>

                {adminRoles.map((role) => (
                  <label key={role.value} className={styles.roleOption}>
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={selectedRole === role.value}
                      onChange={() => setSelectedRole(role.value)}
                    />
                    <div className={styles.roleInfo}>
                      <span className={styles.roleLabel}>{role.label}</span>
                      <span className={styles.roleDesc}>{role.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.footer}>
              <button className={styles.cancelButton} onClick={onClose}>
                Отмена
              </button>
              <button className={styles.assignButton} onClick={handleAssign}>
                Назначить
              </button>
            </div>
          </div>
    </>
  )
}

