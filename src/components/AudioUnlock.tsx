import { useEffect } from 'react'
import { unlockAudio, setMuted } from '@/lib/audio'
import { useAudioStore } from '@/store/useAudioStore'

/** Débloque l'AudioContext au premier geste utilisateur (politique navigateur). */
export default function AudioUnlock() {
  useEffect(() => {
    function unlock() {
      unlockAudio()
      setMuted(useAudioStore.getState().muted)
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  return null
}
