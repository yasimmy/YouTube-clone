import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User, Video } from '@/types'

interface AppState {
  user: User | null
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  watchHistory: Video[]
  favorites: Video[]
  setUser: (user: User | null) => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
  addToHistory: (video: Video) => void
  addToFavorites: (video: Video) => void
  removeFromFavorites: (videoId: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      theme: 'light',
      sidebarOpen: true,
      watchHistory: [],
      favorites: [],
      setUser: (user) => set({ user }),
      setTheme: (theme) => {
        set({ theme })
        if (typeof window !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme)
        }
      },
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      addToHistory: (video) =>
        set((state) => {
          const filtered = state.watchHistory.filter((v) => v.id !== video.id)
          return { watchHistory: [video, ...filtered].slice(0, 100) }
        }),
      addToFavorites: (video) =>
        set((state) => {
          if (state.favorites.some((v) => v.id === video.id)) return state
          return { favorites: [...state.favorites, video] }
        }),
      removeFromFavorites: (videoId) =>
        set((state) => ({
          favorites: state.favorites.filter((v) => v.id !== videoId),
        })),
    }),
    {
      name: 'yt2-storage',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => localStorage) : undefined,
      partialize: (state) => ({
        user: state.user,
        theme: state.theme,
        watchHistory: state.watchHistory,
        favorites: state.favorites,
      }),
    }
  )
)

