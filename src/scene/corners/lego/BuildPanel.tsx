import { Html } from '@react-three/drei'
import { CAR_TOTAL_STEPS, PLATE_TOP_Y } from './bricks'

// ─── Panneau UI (Html) ────────────────────────────────────────────────────────────

interface BuildPanelProps {
  step: number
  onReset: () => void
}

export function BuildPanel({ step, onReset }: BuildPanelProps) {
  const done = step >= CAR_TOTAL_STEPS

  return (
    <Html
      position={[0.15, PLATE_TOP_Y + 0.35, -0.2]}
      transform
      distanceFactor={1.1}
      occlude={false}
    >
      <div
        style={{
          width: 170,
          padding: '10px 12px',
          borderRadius: 10,
          background: 'rgba(20,20,24,0.72)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.92)',
          fontSize: 12,
          fontFamily: 'system-ui, sans-serif',
          userSelect: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4, letterSpacing: 0.3 }}>Maquette Lego</div>
        <div style={{ opacity: 0.8, marginBottom: 8 }}>
          {done ? 'Voiture terminée !' : `Étape ${step} / ${CAR_TOTAL_STEPS}`}
        </div>
        <div style={{ opacity: 0.7, marginBottom: 8, fontSize: 11 }}>
          {done ? 'Clique sur reset pour tout démonter.' : 'Clique sur le plateau pour assembler.'}
        </div>
        <button
          onClick={onReset}
          style={{
            width: '100%',
            padding: '6px 0',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.92)',
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          Réinitialiser
        </button>
      </div>
    </Html>
  )
}
