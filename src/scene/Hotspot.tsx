import { useState, type ReactNode } from 'react'
import { Html } from '@react-three/drei'
import { useCameraStore, type PoiId } from '@/store/useCameraStore'
import { playClick } from '@/lib/audio'

interface HotspotProps {
  /** POI ciblé au clic — voir `scene/pois.ts`. */
  poi: PoiId
  /** Libellé affiché dans la tooltip au survol. */
  label: string
  /** Position du groupe enveloppant les meshes de l'objet. */
  position?: readonly [number, number, number]
  /** Callback optionnel déclenché en plus du focus caméra (ex. son spécifique). */
  onFocus?: () => void
  children: ReactNode
}

/**
 * Enveloppe réutilisable pour les objets cliquables de la scène : gère le survol (curseur
 * pointer + tooltip façon Tower) et le clic → focus caméra sur le POI associé.
 * Désactivé quand un POI est déjà actif (un seul niveau de zoom à la fois).
 */
export default function Hotspot({ poi, label, position, onFocus, children }: HotspotProps) {
  const [hovered, setHovered] = useState(false)
  const activePoi = useCameraStore((s) => s.poi)
  const focusOn = useCameraStore((s) => s.focusOn)

  const enabled = activePoi === 'overview'

  function handleClick() {
    if (!enabled) return
    playClick()
    focusOn(poi)
    onFocus?.()
  }

  return (
    <group
      position={position}
      onClick={enabled ? handleClick : undefined}
      onPointerOver={() => {
        if (enabled) document.body.style.cursor = 'pointer'
        setHovered(true)
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
        setHovered(false)
      }}
    >
      {children}
      {hovered && enabled && (
        <Html position={[0, 0.3, 0]} center style={{ pointerEvents: 'none' }}>
          <div
            style={{
              padding: '4px 9px',
              borderRadius: 6,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.9)',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: 0.3,
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  )
}
