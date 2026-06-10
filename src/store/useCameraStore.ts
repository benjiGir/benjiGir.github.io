import { create } from 'zustand'
import type { PoiId } from '@/scene/pois'

export type { PoiId }

interface CameraStore {
  poi: PoiId
  /** POI précédent — utilisé pour revenir en arrière si pertinent (toujours `overview` pour l'instant). */
  focusOn: (poi: PoiId) => void
  /** Retour à la vue d'ensemble. */
  back: () => void
}

export const useCameraStore = create<CameraStore>((set) => ({
  poi: 'overview',
  focusOn: (poi) => set({ poi }),
  back: () => set({ poi: 'overview' }),
}))
