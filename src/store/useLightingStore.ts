import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LightingStore {
  mode: 'day' | 'night'
  toggleMode: () => void
}

export const useLightingStore = create<LightingStore>()(
  persist(
    (set) => ({
      mode: 'day',
      toggleMode: () => set(({ mode }) => ({ mode: mode === 'day' ? 'night' : 'day' })),
    }),
    { name: 'room-lighting' }
  )
)
