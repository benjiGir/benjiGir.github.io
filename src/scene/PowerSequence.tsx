import { useEffect, useRef } from 'react'
import { usePowerStore } from '@/store/usePowerStore'
import { useCameraStore } from '@/store/useCameraStore'
import { useToastStore } from '@/store/useToastStore'
import { playPowerOn, playPowerOff, playBeep, playLoop, stopLoop } from '@/lib/audio'

/** Durée de l'écran POST/BIOS façon vieux PC, avant le chargement de l'OS. */
const BIOS_DURATION = 3200
/** Durée de l'écran de chargement de l'OS (logo + barre de progression). */
const BOOT_DURATION = 2000
/** Durée de l'écran d'extinction (fondu au noir compris) avant la coupure. */
const SHUTDOWN_DURATION = 2200

/** Place ton fichier d'ambiance dans `public/audio/` et ajuste le chemin ici. */
const AMBIENT_TRACK = '/audio/ambient.mp3'
const AMBIENT_VOLUME = 0.2

export default function PowerSequence() {
  const { power, setPower } = usePowerStore()
  const focusOn = useCameraStore((s) => s.focusOn)
  const back = useCameraStore((s) => s.back)
  const pushToast = useToastStore((s) => s.push)
  const hasGreeted = useRef(false)

  useEffect(() => {
    if (power === 'bios') {
      focusOn('screen')
      playPowerOn()
      const b = setTimeout(() => playBeep(), 250)
      const t = setTimeout(() => setPower('booting'), BIOS_DURATION)
      return () => {
        clearTimeout(b)
        clearTimeout(t)
      }
    }
    if (power === 'booting') {
      const t = setTimeout(() => setPower('on'), BOOT_DURATION)
      return () => clearTimeout(t)
    }
    if (power === 'on') {
      playLoop(AMBIENT_TRACK, AMBIENT_VOLUME)
      // Toast de bienvenue — uniquement au tout premier démarrage de la session.
      if (!hasGreeted.current) {
        hasGreeted.current = true
        pushToast({
          title: 'Bienvenue sur Bureau OS',
          body: 'Explorez le bureau, les fenêtres et les coins de la pièce.',
        })
      }
    }
    if (power === 'shuttingDown') {
      stopLoop()
      playPowerOff()
      const t = setTimeout(() => setPower('off'), SHUTDOWN_DURATION)
      return () => clearTimeout(t)
    }
    if (power === 'off') {
      back()
      stopLoop()
    }
  }, [power, focusOn, back, setPower, pushToast])

  return null
}
