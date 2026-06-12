import { create } from 'zustand'

// État du montage Lego du coin "legos" (premier plan droit, voir `scene/LegoCorner.tsx`).
// Une étape = un groupe de briques qui apparaît/s'assemble sur le plateau. `visited` sert à
// monter `<Physics>` (rapier) paresseusement : seulement une fois le POI 'legos' atteint au
// moins une fois, pour ne pas payer le coût de rapier au chargement initial de la scène.

interface LegoState {
  /** Étape de montage courante (0 = rien de monté, MAX_STEPS = modèle complet). */
  step: number
  /** Le POI 'legos' a déjà été visité au moins une fois → autorise le montage de <Physics>. */
  visited: boolean

  /** Avance d'une étape (sans dépasser `maxSteps`). */
  next: (maxSteps: number) => void
  /** Revient au plateau vide. */
  reset: () => void
  markVisited: () => void
}

export const useLegoStore = create<LegoState>((set, get) => ({
  step: 0,
  visited: false,

  next: (maxSteps) => {
    const { step } = get()
    if (step < maxSteps) set({ step: step + 1 })
  },
  reset: () => set({ step: 0 }),
  markVisited: () => set({ visited: true }),
}))
