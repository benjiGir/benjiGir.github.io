import { create } from 'zustand'
import { setMuted } from '@/lib/audio'

const STORAGE_KEY = 'audio-muted'

function readStoredMuted(): boolean {
  return localStorage.getItem(STORAGE_KEY) === '1'
}

interface AudioStore {
  muted: boolean
  toggleMute: () => void
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  muted: readStoredMuted(),
  toggleMute: () => {
    const muted = !get().muted
    localStorage.setItem(STORAGE_KEY, muted ? '1' : '0')
    setMuted(muted)
    set({ muted })
  },
}))
