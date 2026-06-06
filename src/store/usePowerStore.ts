import { create } from 'zustand'

export type PowerState = 'off' | 'booting' | 'on'

interface PowerStore {
  power: PowerState
  pressPower: () => void
  setPower: (state: PowerState) => void
}

export const usePowerStore = create<PowerStore>((set, get) => ({
  power: 'off',
  pressPower: () => {
    const { power } = get()
    if (power === 'off') set({ power: 'booting' })
  },
  setPower: (power) => set({ power }),
}))
