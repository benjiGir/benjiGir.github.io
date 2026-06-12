import { useState } from 'react'
import { useWindowStore } from '@/store/useWindowStore'
import { useScreenStore } from '@/store/useScreenStore'
import { usePowerStore } from '@/store/usePowerStore'
import { APP_REGISTRY } from '@/os/appRegistry'
import { playClick } from '@/lib/audio'
import AppIcon from '@/os/AppIcon'

const PINNED_APPS = [
  { id: 'projects', label: 'Projets', bg: '#3b82f6', icon: '/icons/projects.png' },
  { id: 'about', label: 'À propos', bg: '#8b5cf6', icon: '/icons/information.png' },
  { id: 'contact', label: 'Contact', bg: '#10b981', icon: '/icons/contact.png' },
  { id: 'terminal', label: 'Terminal', bg: '#334155', icon: '/icons/terminal.png' },
  { id: 'editor', label: 'Éditeur', bg: '#7c3aed', icon: '/icons/editor.png' },
  { id: 'robotlab', label: 'Robot Lab', bg: '#fff', icon: '/icons/robot.png' },
  { id: 'circuitlab', label: 'Circuit Lab', bg: '#f59e0b', icon: '/icons/oscillograph.png' },
]

function IconPower() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v8" />
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
    </svg>
  )
}

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

function StartMenuApp({ id, label, bg, icon }: { id: string; label: string; bg: string; icon?: string }) {
  const openWindow = useWindowStore((s) => s.openWindow)
  const [hovered, setHovered] = useState(false)

  function open() {
    const meta = APP_REGISTRY[id]
    if (meta) {
      playClick()
      openWindow(id, meta)
    }
  }

  return (
    <button
      onClick={open}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '14px 8px',
        borderRadius: 10,
        background: hovered ? 'rgba(255,255,255,0.08)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.15s ease',
      }}
    >
      <AppIcon icon={icon} label={label} bg={bg} size={44} />
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', letterSpacing: 0.2 }}>
        {label}
      </span>
    </button>
  )
}

export default function StartMenu({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const { isFullscreen, toggle } = useScreenStore()
  const shutdown = usePowerStore((s) => s.shutdown)

  const filtered = PINNED_APPS.filter((app) =>
    app.label.toLowerCase().includes(query.trim().toLowerCase())
  )

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, zIndex: 1990 }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 56,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 380,
          background: 'rgba(20,28,43,0.75)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          zIndex: 2000,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Search */}
        <div style={{ padding: '16px 18px 12px' }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher des applications..."
            spellCheck={false}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '8px 14px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.85)',
              fontSize: 12,
              outline: 'none',
            }}
          />
        </div>

        {/* App grid */}
        <div
          style={{
            padding: '4px 14px 18px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 4,
          }}
        >
          {filtered.map((app) => (
            <StartMenuApp key={app.id} id={app.id} label={app.label} bg={app.bg} icon={app.icon} />
          ))}
          {filtered.length === 0 && (
            <div
              style={{
                gridColumn: 'span 4',
                textAlign: 'center',
                fontSize: 11,
                color: 'rgba(255,255,255,0.3)',
                padding: '20px 0',
              }}
            >
              Aucun résultat pour « {query} »
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.07)',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0,0,0,0.18)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              V
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Visiteur</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => { playClick(); toggle() }}
              title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              <IconExpand />
              Plein écran
            </button>
            <button
              onClick={() => { playClick(); shutdown(); onClose() }}
              title="Arrêter l'ordinateur"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              <IconPower />
              Arrêter
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
