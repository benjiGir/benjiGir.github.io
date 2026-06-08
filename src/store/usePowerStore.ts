import { create } from 'zustand'

export type PowerState = 'off' | 'bios' | 'booting' | 'on' | 'shuttingDown'

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
    if (power === 'off') set({ power: 'bios' })
    else if (power === 'on') shutdown()
  },
  /** Lance l'extinction — déclenchable depuis le bouton de la tour ou depuis l'OS.
   *  Passe par `'shuttingDown'` (écran d'extinction) avant de couper l'alimentation. */
  shutdown: () => {
    if (get().power === 'on') set({ power: 'shuttingDown' })
  },
  setPower: (power) => set({ power }),
}))
