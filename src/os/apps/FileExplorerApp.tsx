import { useState } from 'react'
import { useWindowStore } from '@/store/useWindowStore'
import { APP_REGISTRY } from '@/os/appRegistry'
import { playClick } from '@/lib/audio'

type Entry =
  | { type: 'folder'; name: string; appId: string; color: string }
  | { type: 'file'; name: string; content: string[] }

const ENTRIES: Entry[] = [
  { type: 'folder', name: 'Projets', appId: 'projects', color: '#3b82f6' },
  { type: 'folder', name: 'À propos', appId: 'about', color: '#8b5cf6' },
  { type: 'folder', name: 'Contact', appId: 'contact', color: '#10b981' },
  { type: 'folder', name: 'Compétences', appId: 'about', color: '#f59e0b' },
  {
    type: 'file',
    name: 'lisez-moi.txt',
    content: [
      'Bienvenue dans ce bureau virtuel.',
      '',
      'Tout ici est cliquable, double-cliquable et un peu trop',
      'inspiré des systèmes d\'exploitation des années 2000.',
      '',
      'Astuce : la corbeille n\'est pas vide.',
    ],
  },
  {
    type: 'file',
    name: 'ne_pas_ouvrir.txt',
    content: [
      'Vous avez ouvert le fichier qu\'il ne fallait pas ouvrir.',
      '',
      'Rassurez-vous, il ne contient que ce message.',
      'Rien ne s\'est passé. Tout va bien.',
      '',
      '...probablement.',
    ],
  },
]

function IconFolder({ color }: { color: string }) {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill={color}>
      <path d="M3 5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z" opacity="0.85" />
    </svg>
  )
}

function IconFile() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M6 2h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
      <path d="M14 2v4h4" />
    </svg>
  )
}

export default function FileExplorerApp() {
  const openWindow = useWindowStore((s) => s.openWindow)
  const [openFile, setOpenFile] = useState<Extract<Entry, { type: 'file' }> | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  function activate(entry: Entry) {
    if (entry.type === 'folder') {
      const meta = APP_REGISTRY[entry.appId]
      if (meta) {
        playClick()
        openWindow(entry.appId, meta)
      }
    } else {
      playClick()
      setOpenFile(entry)
    }
  }

  return (
    <div style={{ height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', background: '#0d1525' }}>
      <div
        style={{
          padding: '10px 16px',
          fontSize: 11,
          letterSpacing: 0.5,
          color: 'rgba(255,255,255,0.35)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        Ce PC › Bureau
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 18,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, 88px)',
          gap: 8,
          alignContent: 'start',
        }}
      >
        {ENTRIES.map((entry) => (
          <div
            key={entry.name}
            tabIndex={0}
            onClick={() => setSelected(entry.name)}
            onDoubleClick={() => activate(entry)}
            onBlur={() => setSelected(null)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              padding: '10px 6px',
              borderRadius: 8,
              background: selected === entry.name ? 'rgba(255,255,255,0.08)' : 'transparent',
              cursor: 'default',
              userSelect: 'none',
              outline: 'none',
              textAlign: 'center',
            }}
          >
            {entry.type === 'folder' ? <IconFolder color={entry.color} /> : <IconFile />}
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.3 }}>
              {entry.name}
            </span>
          </div>
        ))}
      </div>

      {openFile && (
        <div
          onClick={() => setOpenFile(null)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 320,
              maxWidth: '90%',
              background: '#141c2b',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '10px 14px',
                fontSize: 11,
                color: 'rgba(255,255,255,0.6)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {openFile.name}
              <button
                onClick={() => setOpenFile(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '14px 16px', fontSize: 12, lineHeight: 1.7, color: 'rgba(255,255,255,0.6)' }}>
              {openFile.content.map((line, i) => (
                <div key={i}>{line || ' '}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
