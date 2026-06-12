import { useEffect } from 'react'
import { useCameraStore } from '@/store/useCameraStore'
import { useScreenStore } from '@/store/useScreenStore'
import { playClick } from '@/lib/audio'

export default function CameraUI() {
  const poi = useCameraStore((s) => s.poi)
  const back = useCameraStore((s) => s.back)
  const isFullscreen = useScreenStore((s) => s.isFullscreen)

  const showBack = poi !== 'overview' && !isFullscreen

  // Échap → retour à la vue d'ensemble (uniquement hors plein écran OS, où Échap quitte déjà
  // le plein écran via `FullscreenOverlay`).
  useEffect(() => {
    if (!showBack) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playClick()
        back()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showBack, back])

  if (!showBack) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 8,
        zIndex: 10,
      }}
    >
      <button
        onClick={() => {
          playClick()
          back()
        }}
        style={{
          padding: '8px 16px',
          borderRadius: 6,
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'system-ui, sans-serif',
          fontSize: 13,
          fontWeight: 500,
          background: 'rgba(255,255,255,0.2)',
          color: '#fff',
          backdropFilter: 'blur(8px)',
          transition: 'background 0.2s, color 0.2s',
        }}
      >
        ← Retour
      </button>
    </div>
  )
}
