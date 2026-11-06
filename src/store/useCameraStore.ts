import { create } from 'zustand'
import type { PoiId } from '@/scene/camera/pois'

export type { PoiId }

interface CameraStore {
  poi: PoiId
  viewRequest: number
  /** Cadre le point demandé, même s’il est déjà actif. */
  focusOn: (poi: PoiId) => void
  /** Retour à la vue d'ensemble. */
  back: () => void
}

export const useCameraStore = create<CameraStore>((set) => ({
  poi: 'overview',
  viewRequest: 0,
  focusOn: (poi) => set((s) => ({ poi, viewRequest: s.viewRequest + 1 })),
  back: () => set((s) => ({ poi: 'overview', viewRequest: s.viewRequest + 1 })),
}))
