import { useState } from 'react'

const EMAIL = 'benjiamin.girard7@gmail.com'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={copy}
      style={{
        padding: '6px 14px',
        borderRadius: 6,
        background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)',
        border: `1px solid ${copied ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)'}`,
        color: copied ? '#10b981' : 'rgba(255,255,255,0.5)',
        fontSize: 11,
        cursor: 'pointer',
        transition: 'all 0.2s',
        letterSpacing: 0.3,
      }}
    >
      {copied ? 'Copié !' : 'Copier'}
    </button>
  )
}

// Simple envelope SVG
function IconMail() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="2,4 12,13 22,4" />
    </svg>
  )
}

export default function ContactApp() {
  return (
    <div
      style={{
        height: '100%',
        background: '#0d1525',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        padding: 32,
        boxSizing: 'border-box',
      }}
    >
      <IconMail />

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.25)', marginBottom: 10, textTransform: 'uppercase' }}>
          Email
        </div>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.85)', letterSpacing: 0.3 }}>
          {EMAIL}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <a
          href={`mailto:${EMAIL}`}
          style={{
            padding: '8px 20px',
            borderRadius: 8,
            background: '#10b981',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            textDecoration: 'none',
            letterSpacing: 0.3,
          }}
        >
          Envoyer un message
        </a>
        <CopyButton text={EMAIL} />
      </div>
    </div>
  )
}
