import { create } from 'zustand'

type ScreenStore = {
  isFullscreen: boolean
  toggle: () => void
  exit: () => void
  /** Conteneurs cibles pour le portail de l'écran (docké dans la scène 3D / plein écran). */
  dockedEl: HTMLDivElement | null
  fullscreenEl: HTMLDivElement | null
  setDockedEl: (el: HTMLDivElement | null) => void
  setFullscreenEl: (el: HTMLDivElement | null) => void
}

export const useScreenStore = create<ScreenStore>((set) => ({
  isFullscreen: false,
  toggle: () => set((s) => ({ isFullscreen: !s.isFullscreen })),
  exit: () => set({ isFullscreen: false }),
  dockedEl: null,
  fullscreenEl: null,
  setDockedEl: (dockedEl) => set({ dockedEl }),
  setFullscreenEl: (fullscreenEl) => set({ fullscreenEl }),
}))
