import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CircuitStore {
  /** Nombre de niveaux résolus (0..LEVEL_COUNT) — la LED de la breadboard réagit à cette valeur. */
  solvedLevels: number
  /** Incrémenté à chaque résolution récente — utilisé pour déclencher un flash visuel ponctuel. */
  lastSolvedTick: number
  markSolved: (level: number) => void
}

/**
 * État partagé entre l'app OS « Circuit Lab » et `scene/corners/workbench/Workbench.tsx` :
 * la LED de la breadboard 3D change de couleur/comportement selon le nombre de niveaux résolus.
 * Persisté en localStorage pour conserver la progression entre les sessions.
 */
export const useCircuitStore = create<CircuitStore>()(
  persist(
    (set, get) => ({
      solvedLevels: 0,
      lastSolvedTick: 0,
      markSolved: (level) => {
        const current = get().solvedLevels
        if (level + 1 > current) {
          set({ solvedLevels: level + 1, lastSolvedTick: get().lastSolvedTick + 1 })
        } else {
          set({ lastSolvedTick: get().lastSolvedTick + 1 })
        }
      },
    }),
    { name: 'circuit-lab-progress' }
  )
)
