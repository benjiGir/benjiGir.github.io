import { create } from 'zustand'

export type PowerState = 'off' | 'booting' | 'on'

interface PowerStore {
  power: PowerState
  pressPower: () => void
  shutdown: () => void
  setPower: (state: PowerState) => void
}

export const usePowerStore = create<PowerStore>((set, get) => ({
  power: 'off',
  pressPower: () => {
    const { power, shutdown } = get()
    if (power === 'off') set({ power: 'booting' })
    else if (power === 'on') shutdown()
  },
  /** Éteint l'ordinateur — déclenchable depuis le bouton de la tour ou depuis l'OS. */
  shutdown: () => {
    if (get().power === 'on') set({ power: 'off' })
  },
  setPower: (power) => set({ power }),
}))
