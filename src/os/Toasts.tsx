import { useToastStore, type Toast } from '@/store/useToastStore'
import { playClick } from '@/lib/audio'

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div
      onClick={() => { playClick(); dismiss(toast.id) }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        width: 260,
        padding: '10px 12px',
        borderRadius: 10,
        background: 'rgba(20,28,46,0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        color: '#e2e8f0',
        cursor: 'pointer',
        userSelect: 'none',
        animation: 'toast-in 0.25s ease-out',
      }}
    >
      {toast.icon && (
        <img src={toast.icon} alt="" draggable={false} style={{ width: 28, height: 28, flexShrink: 0 }} />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.2 }}>{toast.title}</span>
        {toast.body && (
          <span style={{ fontSize: 11, color: 'rgba(226,232,240,0.65)', lineHeight: 1.35 }}>
            {toast.body}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

/** Pile de notifications OS, en bas à droite, au-dessus de la taskbar. */
export default function Toasts() {
  const toasts = useToastStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div
        style={{
          position: 'absolute',
          right: 12,
          bottom: 64,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          alignItems: 'flex-end',
          zIndex: 900,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={toast} />
          </div>
        ))}
      </div>
    </>
  )
}
