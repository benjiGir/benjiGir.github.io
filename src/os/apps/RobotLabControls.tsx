import type { RunState } from '@/store/useRobotStore'

// ── UI helpers ───────────────────────────────────────────────────────────────────

export function Button({
  children,
  onClick,
  disabled,
  variant = 'default',
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'primary' | 'danger'
}) {
  const colors: Record<string, string> = {
    default: 'rgba(255,255,255,0.08)',
    primary: '#3b82f6',
    danger: 'rgba(239,68,68,0.18)',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '7px 14px',
        borderRadius: 6,
        border: '1px solid rgba(255,255,255,0.1)',
        background: colors[variant],
        color: disabled ? 'rgba(255,255,255,0.25)' : '#fff',
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.15s, background 0.15s',
      }}
    >
      {children}
    </button>
  )
}

export function iconBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: 22,
    height: 22,
    borderRadius: 4,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.06)',
    color: disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
    fontSize: 11,
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    flexShrink: 0,
  }
}

export function StatusBadge({ runState }: { runState: RunState }) {
  const config = {
    idle: { label: 'Prêt', color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.06)' },
    running: { label: 'En cours…', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
    success: { label: 'Réussi !', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    fail: { label: 'Échec', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  }[runState]

  return (
    <div
      style={{
        padding: '4px 10px',
        borderRadius: 999,
        background: config.bg,
        color: config.color,
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {config.label}
    </div>
  )
}
