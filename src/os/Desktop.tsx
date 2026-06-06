import { useEffect, useState } from 'react'
import { useWindowStore } from '@/store/useWindowStore'
import { useScreenStore } from '@/store/useScreenStore'
import { APP_REGISTRY } from '@/os/appRegistry'
import { playClick } from '@/lib/audio'
import Window from '@/os/Window'

export const SCREEN_W = 1280
export const SCREEN_H = 720

const APPS = [
  { id: 'projects', label: 'Projets', bg: '#3b82f6' },
  { id: 'about', label: 'À propos', bg: '#8b5cf6' },
  { id: 'contact', label: 'Contact', bg: '#10b981' },
  { id: 'terminal', label: 'Terminal', bg: '#334155' },
]

// ─── Topbar ───────────────────────────────────────────────────────────────────

// SVG icons for fullscreen toggle
function IconExpand() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <polyline points="1,5 1,1 5,1" />
      <polyline points="8,1 12,1 12,5" />
      <polyline points="12,8 12,12 8,12" />
      <polyline points="5,12 1,12 1,8" />
    </svg>
  )
}

function IconCollapse() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <polyline points="1,4 4,4 4,1" />
      <polyline points="9,1 9,4 12,4" />
      <polyline points="12,9 9,9 9,12" />
      <polyline points="4,12 4,9 1,9" />
    </svg>
  )
}

function Topbar() {
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
          onClick={() => { playClick(); toggle() }}
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

// ─── Desktop icon ─────────────────────────────────────────────────────────────

function DesktopIcon({ appId, label, bg }: { appId: string; label: string; bg: string }) {
  const openWindow = useWindowStore((s) => s.openWindow)
  const [selected, setSelected] = useState(false)

  function open() {
    const meta = APP_REGISTRY[appId]
    if (meta) {
      playClick()
      openWindow(appId, meta)
    }
  }

  return (
    <div
      tabIndex={0}
      onClick={() => setSelected(true)}
      onDoubleClick={open}
      onBlur={() => setSelected(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '6px 8px',
        borderRadius: 6,
        background: selected ? 'rgba(255,255,255,0.12)' : 'transparent',
        cursor: 'default',
        userSelect: 'none',
        width: 72,
        outline: 'none',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
          color: '#fff',
          letterSpacing: 0.5,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        }}
      >
        {label.slice(0, 2).toUpperCase()}
      </div>
      <span
        style={{
          fontSize: 10,
          color: selected ? '#fff' : 'rgba(255,255,255,0.75)',
          textAlign: 'center',
          lineHeight: 1.2,
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
        }}
      >
        {label}
      </span>
    </div>
  )
}

// ─── Desktop area (icons + windows) ──────────────────────────────────────────

function DesktopArea() {
  const windows = useWindowStore((s) => s.windows)
  const visible = windows.filter((w) => !w.minimized)

  return (
    <div
      data-desktop=""
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Icons column — top-left */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {APPS.map((app) => (
          <DesktopIcon key={app.id} appId={app.id} label={app.label} bg={app.bg} />
        ))}
      </div>

      {/* Windows */}
      {visible.map((win) => (
        <Window key={win.id} {...win} />
      ))}
    </div>
  )
}

// ─── Dock ─────────────────────────────────────────────────────────────────────

function DockItem({ id, label, bg }: { id: string; label: string; bg: string }) {
  const openWindow = useWindowStore((s) => s.openWindow)
  const windows = useWindowStore((s) => s.windows)
  const [hovered, setHovered] = useState(false)

  const win = windows.find((w) => w.appId === id)
  const isOpen = !!win
  const isMinimized = win?.minimized ?? false

  function activate() {
    const meta = APP_REGISTRY[id]
    if (meta) {
      playClick()
      openWindow(id, meta)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div
        onClick={activate}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transform: hovered ? 'scale(1.15) translateY(-4px)' : 'scale(1)',
          transition: 'transform 0.15s ease',
          boxShadow: hovered
            ? `0 8px 24px ${bg}55`
            : isOpen
              ? `0 4px 16px ${bg}44`
              : '0 2px 8px rgba(0,0,0,0.4)',
          opacity: isMinimized ? 0.5 : 1,
          fontSize: 11,
          fontWeight: 700,
          color: '#fff',
          letterSpacing: 0.5,
          userSelect: 'none',
        }}
      >
        {label.slice(0, 2).toUpperCase()}
      </div>
      {/* Open indicator */}
      <div
        style={{
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: isOpen ? 'rgba(255,255,255,0.6)' : 'transparent',
          transition: 'background 0.2s',
        }}
      />
    </div>
  )
}

function Dock() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 14,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 10,
        padding: '10px 16px 6px',
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
        zIndex: 1000,
      }}
    >
      {APPS.map((app) => (
        <DockItem key={app.id} id={app.id} label={app.label} bg={app.bg} />
      ))}
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Desktop() {
  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        width: SCREEN_W,
        height: SCREEN_H,
        overflow: 'hidden',
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif",
        fontSize: 13,
        lineHeight: 1.4,
        color: '#e2e8f0',
        boxSizing: 'border-box',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background:
          'radial-gradient(ellipse at 30% 20%, #1a2a4a 0%, #0d1525 40%, #080d18 100%)',
      }}
    >
      <Topbar />
      <DesktopArea />
      <Dock />
    </div>
  )
}
