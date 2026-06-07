import { useEffect, useState } from 'react'
import { useWindowStore } from '@/store/useWindowStore'
import { useScreenStore } from '@/store/useScreenStore'
import { APP_REGISTRY } from '@/os/appRegistry'
import { playClick } from '@/lib/audio'
import Window from '@/os/Window'
import StartMenu from '@/os/StartMenu'
import AppIcon from '@/os/AppIcon'

export const SCREEN_W = 1280
export const SCREEN_H = 720

const DESKTOP_ICONS = [
  { id: 'recyclebin', label: 'Corbeille', bg: '#64748b', icon: '/icons/bin.png' },
  { id: 'explorer', label: 'Poste de travail', bg: '#f59e0b', icon: '/icons/pc.png' },
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

function DesktopIcon({ appId, label, bg, icon }: { appId: string; label: string; bg: string; icon?: string }) {
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
      <AppIcon icon={icon} label={label} bg={bg} size={44} />
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
        {DESKTOP_ICONS.map((item) => (
          <DesktopIcon key={item.id} appId={item.id} label={item.label} bg={item.bg} icon={item.icon} />
        ))}
      </div>

      {/* Windows */}
      {visible.map((win) => (
        <Window key={win.id} {...win} />
      ))}
    </div>
  )
}

// ─── Taskbar ──────────────────────────────────────────────────────────────────

function StartButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 36,
        padding: '0 14px',
        borderRadius: 10,
        background: active ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#fff',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.3,
        cursor: 'pointer',
        transition: 'background 0.15s ease',
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <rect x="2" y="2" width="9" height="9" rx="1.5" />
        <rect x="13" y="2" width="9" height="9" rx="1.5" />
        <rect x="2" y="13" width="9" height="9" rx="1.5" />
        <rect x="13" y="13" width="9" height="9" rx="1.5" />
      </svg>
      Démarrer
    </button>
  )
}

function TaskbarWindow({ id, appId, title, minimized }: { id: string; appId: string; title: string; minimized: boolean }) {
  const { focusWindow, minimizeWindow } = useWindowStore()
  const meta = APP_REGISTRY[appId]
  const bg = meta?.color ?? '#475569'
  const icon = meta?.icon

  function toggle() {
    playClick()
    if (minimized) focusWindow(id)
    else minimizeWindow(id)
  }

  return (
    <button
      onClick={toggle}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 36,
        padding: '0 12px',
        borderRadius: 10,
        background: minimized ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'rgba(255,255,255,0.85)',
        fontSize: 11,
        cursor: 'pointer',
        opacity: minimized ? 0.55 : 1,
      }}
    >
      {icon ? (
        <img src={icon} alt="" draggable={false} style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }} />
      ) : (
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: bg,
            flexShrink: 0,
          }}
        />
      )}
      {title}
    </button>
  )
}

function Clock() {
  const [time, setTime] = useState(() => new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'right', lineHeight: 1.3 }}>
      <div>{time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
        {time.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
      </div>
    </div>
  )
}

function Taskbar() {
  const windows = useWindowStore((s) => s.windows)
  const [startOpen, setStartOpen] = useState(false)

  return (
    <>
      {startOpen && <StartMenu onClose={() => setStartOpen(false)} />}
      <div
        style={{
          flexShrink: 0,
          height: 52,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 12px',
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          zIndex: 1000,
        }}
      >
        <StartButton active={startOpen} onClick={() => { playClick(); setStartOpen((v) => !v) }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, overflowX: 'auto' }}>
          {windows.map((win) => (
            <TaskbarWindow key={win.id} id={win.id} appId={win.appId} title={win.title} minimized={win.minimized} />
          ))}
        </div>

        <Clock />
      </div>
    </>
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
      <Taskbar />
    </div>
  )
}
