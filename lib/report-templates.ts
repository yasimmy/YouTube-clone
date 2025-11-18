// Report resolution templates for admins

export interface ReportTemplate {
  id: string
  name: string
  description: string
  category: 'spam' | 'harassment' | 'copyright' | 'inappropriate' | 'other'
  action: 'delete_video' | 'block_channel' | 'warn_channel' | 'none'
  message: string
  autoResponse?: string
}

export const reportTemplates: ReportTemplate[] = [
  {
    id: 'spam-1',
    name: 'Спам контент',
    description: 'Видео содержит спам',
    category: 'spam',
    action: 'delete_video',
    message: 'Видео удалено за нарушение правил (спам)',
    autoResponse: 'Ваша жалоба рассмотрена. Видео удалено за нарушение правил сообщества.',
  },
  {
    id: 'harassment-1',
    name: 'Травля и оскорбления',
    description: 'Контент содержит оскорбления или травлю',
    category: 'harassment',
    action: 'warn_channel',
    message: 'Выдано предупреждение за нарушение правил (травля)',
    autoResponse: 'Ваша жалоба рассмотрена. Автору выдано предупреждение.',
  },
  {
    id: 'copyright-1',
    name: 'Нарушение авторских прав',
    description: 'Нарушение авторских прав',
    category: 'copyright',
    action: 'delete_video',
    message: 'Видео удалено за нарушение авторских прав',
    autoResponse: 'Ваша жалоба рассмотрена. Видео удалено за нарушение авторских прав.',
  },
  {
    id: 'inappropriate-1',
    name: 'Неприемлемый контент',
    description: 'Контент не соответствует правилам',
    category: 'inappropriate',
    action: 'block_channel',
    message: 'Канал заблокирован за нарушение правил',
    autoResponse: 'Ваша жалоба рассмотрена. Канал заблокирован за нарушение правил сообщества.',
  },
  {
    id: 'reject-1',
    name: 'Жалоба отклонена',
    description: 'Жалоба не обоснована',
    category: 'other',
    action: 'none',
    message: 'Жалоба отклонена',
    autoResponse: 'Ваша жалоба рассмотрена. Оснований для принятия мер не обнаружено.',
  },
]

export function getTemplatesByCategory(category?: string): ReportTemplate[] {
  if (!category) return reportTemplates
  return reportTemplates.filter(t => t.category === category)
}

export function getTemplateById(id: string): ReportTemplate | undefined {
  return reportTemplates.find(t => t.id === id)
}


