import { create } from 'zustand'

interface DeskStore {
  isStanding: boolean
  toggleHeight: () => void
}

export const useDeskStore = create<DeskStore>((set) => ({
  isStanding: false,
  toggleHeight: () => set((s) => ({ isStanding: !s.isStanding })),
}))
