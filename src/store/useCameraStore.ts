import { create } from 'zustand'

export type CameraPreset = 'overview' | 'screen'

interface CameraStore {
  preset: CameraPreset
  focusOn: (preset: CameraPreset) => void
}

export const useCameraStore = create<CameraStore>((set) => ({
  preset: 'overview',
  focusOn: (preset) => set({ preset }),
}))
