import { useEffect } from 'react'
import { usePowerStore } from '@/store/usePowerStore'
import { useCameraStore } from '@/store/useCameraStore'
import { playPowerOn, playLoop, stopLoop } from '@/lib/audio'

const BOOT_DURATION = 3500

/** Place ton fichier d'ambiance dans `public/audio/` et ajuste le chemin ici. */
const AMBIENT_TRACK = '/audio/ambient.mp3'
const AMBIENT_VOLUME = 0.2

export default function PowerSequence() {
  const { power, setPower } = usePowerStore()
  const focusOn = useCameraStore((s) => s.focusOn)

  useEffect(() => {
    if (power === 'booting') {
      focusOn('screen')
      playPowerOn()
      const t = setTimeout(() => setPower('on'), BOOT_DURATION)
      return () => clearTimeout(t)
    }
    if (power === 'on') {
      playLoop(AMBIENT_TRACK, AMBIENT_VOLUME)
    }
    if (power === 'off') {
      focusOn('overview')
      stopLoop()
    }
  }, [power, focusOn, setPower])

  return null
}
