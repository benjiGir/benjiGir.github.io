import { create } from 'zustand'

export type Win = {
  id: string
  appId: string
  title: string
  position: { x: number; y: number }
  size: { w: number; h: number }
  zIndex: number
  minimized: boolean
}

type WindowStore = {
  windows: Win[]
  _top: number
  openWindow: (appId: string, meta: { title: string; defaultSize: { w: number; h: number } }) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  moveWindow: (id: string, pos: { x: number; y: number }) => void
  resizeWindow: (id: string, size: { w: number; h: number }) => void
  minimizeWindow: (id: string) => void
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  _top: 10,

  openWindow(appId, meta) {
    const existing = get().windows.find((w) => w.appId === appId)
    if (existing) {
      get().focusWindow(existing.id)
      return
    }
    const top = get()._top + 1
    const n = get().windows.length % 6
    set((s) => ({
      _top: top,
      windows: [
        ...s.windows,
        {
          id: crypto.randomUUID(),
          appId,
          title: meta.title,
          position: { x: 80 + n * 24, y: 48 + n * 24 },
          size: { w: meta.defaultSize.w, h: meta.defaultSize.h },
          zIndex: top,
          minimized: false,
        },
      ],
    }))
  },

  closeWindow(id) {
    set((s) => ({ windows: s.windows.filter((w) => w.id !== id) }))
  },

  focusWindow(id) {
    const top = get()._top + 1
    set((s) => ({
      _top: top,
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, zIndex: top, minimized: false } : w
      ),
    }))
  },

  moveWindow(id, pos) {
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, position: pos } : w)),
    }))
  },

  resizeWindow(id, size) {
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, size } : w)),
    }))
  },

  minimizeWindow(id) {
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
    }))
  },
}))
