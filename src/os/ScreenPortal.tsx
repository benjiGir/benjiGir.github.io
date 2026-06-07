import { createPortal } from 'react-dom'
import { usePowerStore } from '@/store/usePowerStore'
import { useScreenStore } from '@/store/useScreenStore'
import ScreenContent from '@/os/ScreenContent'

/**
 * Monte `<ScreenContent />` une seule fois et le reparente — via portail — entre le conteneur
 * docké dans la scène 3D et celui du mode plein écran. Évite de démonter/remonter l'OS
 * (fenêtres, terminal, focus...) à chaque bascule fullscreen.
 */
export default function ScreenPortal() {
  const power = usePowerStore((s) => s.power)
  const isFullscreen = useScreenStore((s) => s.isFullscreen)
  const dockedEl = useScreenStore((s) => s.dockedEl)
  const fullscreenEl = useScreenStore((s) => s.fullscreenEl)

  if (power === 'off') return null

  const target = isFullscreen ? fullscreenEl : dockedEl
  if (!target) return null

  return createPortal(<ScreenContent />, target)
}
