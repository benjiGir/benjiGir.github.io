import { create } from 'zustand'

type ScreenStore = {
  isFullscreen: boolean
  toggle: () => void
  exit: () => void
}

export const useScreenStore = create<ScreenStore>((set) => ({
  isFullscreen: false,
  toggle: () => set((s) => ({ isFullscreen: !s.isFullscreen })),
  exit: () => set({ isFullscreen: false }),
}))
