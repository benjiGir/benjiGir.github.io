import { useState } from 'react'

export default function MobileWarning() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || window.innerWidth >= 768) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: '#080d18',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: 32,
        textAlign: 'center',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: '#e2e8f0',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      </div>

      <div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          Mieux sur desktop
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, maxWidth: 280 }}>
          Cette expérience 3D est conçue pour un écran d'ordinateur. Sur mobile, certaines interactions peuvent être limitées.
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        style={{
          padding: '10px 24px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.08)',
          color: '#fff',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          letterSpacing: 0.3,
        }}
      >
        Continuer quand même
      </button>
    </div>
  )
}
