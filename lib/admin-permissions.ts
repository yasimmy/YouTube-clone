import { AdminRole } from '@/types'

export interface AdminPermissions {
  manageUsers: boolean
  manageVideos: boolean
  manageReports: boolean
  manageComments: boolean
  viewStats: boolean
  manageCategories: boolean
  managePlaylists: boolean
  technicalSupport: boolean
  contentModeration: boolean
  basicModeration: boolean
  assignAdminRoles: boolean
  blockChannels: boolean
  deleteVideos: boolean
  issueWarnings: boolean
}

export function getAdminPermissions(role: AdminRole | 'user' | undefined): AdminPermissions {
  if (!role || role === 'user') {
    return {
      manageUsers: false,
      manageVideos: false,
      manageReports: false,
      manageComments: false,
      viewStats: false,
      manageCategories: false,
      managePlaylists: false,
      technicalSupport: false,
      contentModeration: false,
      basicModeration: false,
      assignAdminRoles: false,
      blockChannels: false,
      deleteVideos: false,
      issueWarnings: false,
    }
  }

  // own - все права
  if (role === 'own') {
    return {
      manageUsers: true,
      manageVideos: true,
      manageReports: true,
      manageComments: true,
      viewStats: true,
      manageCategories: true,
      managePlaylists: true,
      technicalSupport: true,
      contentModeration: true,
      basicModeration: true,
      assignAdminRoles: true,
      blockChannels: true,
      deleteVideos: true,
      issueWarnings: true,
    }
  }

  // admin1 - Управление пользователями и каналами
  if (role === 'admin1') {
    return {
      manageUsers: true,
      manageVideos: false,
      manageReports: true,
      manageComments: false,
      viewStats: true,
      manageCategories: false,
      managePlaylists: false,
      technicalSupport: false,
      contentModeration: false,
      basicModeration: true,
      assignAdminRoles: false,
      blockChannels: true,
      deleteVideos: false,
      issueWarnings: true,
    }
  }

  // admin2 - Управление видео и контентом
  if (role === 'admin2') {
    return {
      manageUsers: false,
      manageVideos: true,
      manageReports: true,
      manageComments: true,
      viewStats: true,
      manageCategories: true,
      managePlaylists: true,
      technicalSupport: false,
      contentModeration: true,
      basicModeration: true,
      assignAdminRoles: false,
      blockChannels: false,
      deleteVideos: true,
      issueWarnings: false,
    }
  }

  // admin3 - Модерация жалоб
  if (role === 'admin3') {
    return {
      manageUsers: false,
      manageVideos: true,
      manageReports: true,
      manageComments: false,
      viewStats: false,
      manageCategories: false,
      managePlaylists: false,
      technicalSupport: false,
      contentModeration: true,
      basicModeration: true,
      assignAdminRoles: false,
      blockChannels: true,
      deleteVideos: true,
      issueWarnings: true,
    }
  }

  // admin4 - Управление комментариями
  if (role === 'admin4') {
    return {
      manageUsers: false,
      manageVideos: false,
      manageReports: false,
      manageComments: true,
      viewStats: false,
      manageCategories: false,
      managePlaylists: false,
      technicalSupport: false,
      contentModeration: true,
      basicModeration: true,
      assignAdminRoles: false,
      blockChannels: false,
      deleteVideos: false,
      issueWarnings: false,
    }
  }

  // admin5 - Статистика и аналитика
  if (role === 'admin5') {
    return {
      manageUsers: false,
      manageVideos: false,
      manageReports: false,
      manageComments: false,
      viewStats: true,
      manageCategories: false,
      managePlaylists: false,
      technicalSupport: false,
      contentModeration: false,
      basicModeration: false,
      assignAdminRoles: false,
      blockChannels: false,
      deleteVideos: false,
      issueWarnings: false,
    }
  }

  // admin6 - Управление категориями
  if (role === 'admin6') {
    return {
      manageUsers: false,
      manageVideos: false,
      manageReports: false,
      manageComments: false,
      viewStats: false,
      manageCategories: true,
      managePlaylists: false,
      technicalSupport: false,
      contentModeration: false,
      basicModeration: false,
      assignAdminRoles: false,
      blockChannels: false,
      deleteVideos: false,
      issueWarnings: false,
    }
  }

  // admin7 - Управление плейлистами
  if (role === 'admin7') {
    return {
      manageUsers: false,
      manageVideos: false,
      manageReports: false,
      manageComments: false,
      viewStats: false,
      manageCategories: false,
      managePlaylists: true,
      technicalSupport: false,
      contentModeration: false,
      basicModeration: false,
      assignAdminRoles: false,
      blockChannels: false,
      deleteVideos: false,
      issueWarnings: false,
    }
  }

  // admin8 - Техническая поддержка
  if (role === 'admin8') {
    return {
      manageUsers: true,
      manageVideos: false,
      manageReports: false,
      manageComments: false,
      viewStats: true,
      manageCategories: false,
      managePlaylists: false,
      technicalSupport: true,
      contentModeration: false,
      basicModeration: false,
      assignAdminRoles: false,
      blockChannels: false,
      deleteVideos: false,
      issueWarnings: false,
    }
  }

  // admin9 - Контент-модератор
  if (role === 'admin9') {
    return {
      manageUsers: false,
      manageVideos: true,
      manageReports: true,
      manageComments: true,
      viewStats: false,
      manageCategories: false,
      managePlaylists: false,
      technicalSupport: false,
      contentModeration: true,
      basicModeration: true,
      assignAdminRoles: false,
      blockChannels: false,
      deleteVideos: true,
      issueWarnings: true,
    }
  }

  // admin10 - Базовый модератор
  if (role === 'admin10') {
    return {
      manageUsers: false,
      manageVideos: false,
      manageReports: true,
      manageComments: true,
      viewStats: false,
      manageCategories: false,
      managePlaylists: false,
      technicalSupport: false,
      contentModeration: false,
      basicModeration: true,
      assignAdminRoles: false,
      blockChannels: false,
      deleteVideos: false,
      issueWarnings: false,
    }
  }

  // tech-admin - Технический админ
  if (role === 'tech-admin') {
    return {
      manageUsers: true,
      manageVideos: false,
      manageReports: false,
      manageComments: false,
      viewStats: true,
      manageCategories: false,
      managePlaylists: false,
      technicalSupport: true,
      contentModeration: false,
      basicModeration: false,
      assignAdminRoles: false,
      blockChannels: false,
      deleteVideos: false,
      issueWarnings: false,
    }
  }

  // Legacy 'admin' role - same as admin3
  if (role === 'admin') {
    return {
      manageUsers: false,
      manageVideos: true,
      manageReports: true,
      manageComments: false,
      viewStats: false,
      manageCategories: false,
      managePlaylists: false,
      technicalSupport: false,
      contentModeration: true,
      basicModeration: true,
      assignAdminRoles: false,
      blockChannels: true,
      deleteVideos: true,
      issueWarnings: true,
    }
  }

  return {
    manageUsers: false,
    manageVideos: false,
    manageReports: false,
    manageComments: false,
    viewStats: false,
    manageCategories: false,
    managePlaylists: false,
    technicalSupport: false,
    contentModeration: false,
    basicModeration: false,
    assignAdminRoles: false,
    blockChannels: false,
    deleteVideos: false,
    issueWarnings: false,
  }
}

