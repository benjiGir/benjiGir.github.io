import { useEffect, useState } from 'react'
import { useScreenStore } from '@/store/useScreenStore'
import { usePowerStore } from '@/store/usePowerStore'
import { SCREEN_W, SCREEN_H } from '@/os/Desktop'

function useViewport() {
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight })
  useEffect(() => {
    const update = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return vp
}

export default function FullscreenOverlay() {
  const isFullscreen = useScreenStore((s) => s.isFullscreen)
  const exit = useScreenStore((s) => s.exit)
  const setFullscreenEl = useScreenStore((s) => s.setFullscreenEl)
  const power = usePowerStore((s) => s.power)
  const vp = useViewport()

  // Escape key to exit
  useEffect(() => {
    if (!isFullscreen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') exit() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isFullscreen, exit])

  // Garder le conteneur monté pendant toutes les phases transitoires (bios, booting,
  // shuttingDown) pour que le portail ait toujours une cible fullscreenEl valide.
  if (power === 'off') return null

  // Scale the 1280×720 desktop to fit the viewport (contain)
  const scale = Math.min(vp.w / SCREEN_W, vp.h / SCREEN_H)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: '#000',
        display: isFullscreen ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: SCREEN_W,
          height: SCREEN_H,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Conteneur cible du portail d'écran — voir <ScreenPortal /> */}
        <div ref={(el) => setFullscreenEl(el)} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  )
}
