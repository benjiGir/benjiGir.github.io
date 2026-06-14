import { useState } from 'react'

// Badge « work in progress » affiché par-dessus la scène et l'OS pour signaler aux visiteurs que
// le portfolio est encore en cours de finition. Fermable ; le choix est mémorisé en localStorage
// pour ne pas réapparaître à chaque visite. Coin bas-gauche (les autres overlays occupent le bas
// centre/droite).

const STORAGE_KEY = 'wip-dismissed'

function readDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    // localStorage indisponible (navigation privée…) — on affiche par défaut
    return false
  }
}

export default function WipBadge() {
  const [dismissed, setDismissed] = useState(readDismissed)

  if (dismissed) return null

  function dismiss() {
    setDismissed(true)
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // localStorage indisponible — on ignore silencieusement
    }
  }

  return (
    <>
      <style>{`
        @keyframes wip-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          left: 24,
          bottom: 24,
          // Sous le FullscreenOverlay (zIndex 50) : le badge informe sur la vue d'accueil puis
          // s'efface quand on entre en plein écran dans l'OS (où il chevaucherait la taskbar).
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 8px 8px 12px',
          borderRadius: 10,
          background: 'rgba(20,28,46,0.72)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          color: '#e2e8f0',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          userSelect: 'none',
          animation: 'wip-in 0.3s ease-out',
        }}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }} aria-hidden>
          🚧
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.2 }}>En construction</span>
          <span style={{ fontSize: 11, color: 'rgba(226,232,240,0.6)', lineHeight: 1.3 }}>
            Certaines fonctionnalités sont encore incomplètes
          </span>
        </div>
        <button
          onClick={dismiss}
          aria-label="Fermer"
          style={{
            width: 22,
            height: 22,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
            border: 'none',
            background: 'transparent',
            color: 'rgba(226,232,240,0.5)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>
    </>
  )
}
