import { useEffect, useState } from 'react'
import { useScreenStore } from '@/store/useScreenStore'
import { playClick } from '@/lib/audio'

// SVG icons for fullscreen toggle
function IconExpand() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <polyline points="1,5 1,1 5,1" />
      <polyline points="8,1 12,1 12,5" />
      <polyline points="12,8 12,12 8,12" />
      <polyline points="5,12 1,12 1,8" />
    </svg>
  )
}

function IconCollapse() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <polyline points="1,4 4,4 4,1" />
      <polyline points="9,1 9,4 12,4" />
      <polyline points="12,9 9,9 9,12" />
      <polyline points="4,12 4,9 1,9" />
    </svg>
  )
}

export default function Topbar() {
  const [time, setTime] = useState(() => new Date())
  const { isFullscreen, toggle } = useScreenStore()

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div
      style={{
        height: 28,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 10px 0 16px',
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: 0.3,
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      <span style={{ letterSpacing: 2, fontSize: 11, opacity: 0.6 }}>BUREAU</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span>
          {time.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
          {'  '}
          {time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <button
          onClick={() => {
            playClick()
            toggle()
          }}
          title={isFullscreen ? 'Quitter le plein écran (Échap)' : 'Plein écran'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)',
            padding: '2px 4px',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            lineHeight: 0,
          }}
        >
          {isFullscreen ? <IconCollapse /> : <IconExpand />}
        </button>
      </div>
    </div>
  )
}
