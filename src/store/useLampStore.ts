import { create } from 'zustand'

// ─── useLampStore ───────────────────────────────────────────────────────────
// État on/off de la lampe de bureau, pilotée par clic (voir DeskLamp.tsx). `isOn: true` par
// défaut car l'éclairage ambiant de la scène est volontairement bas — la lampe doit déjà
// participer à l'éclairage de la pièce au chargement, pas démarrer éteinte dans le noir.

interface LampStore {
  isOn: boolean
  toggleLamp: () => void
}

export const useLampStore = create<LampStore>((set) => ({
  isOn: true,
  toggleLamp: () => set((s) => ({ isOn: !s.isOn })),
}))
