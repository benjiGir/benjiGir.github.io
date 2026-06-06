import { useEffect } from 'react'
import { usePowerStore } from '@/store/usePowerStore'
import { useCameraStore } from '@/store/useCameraStore'
import { playPowerOn, startAmbient, stopAmbient } from '@/lib/audio'

const BOOT_DURATION = 3500

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
      startAmbient()
    }
    if (power === 'off') {
      focusOn('overview')
      stopAmbient()
    }
  }, [power, focusOn, setPower])

  return null
}
