export default function StartButton({
  active,
  onClick,
}: {
  active: boolean
  onClick: () => void
}) {
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
