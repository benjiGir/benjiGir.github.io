import { useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { usePowerStore } from '@/store/usePowerStore'
import { useEditorStore } from '@/editor/useEditorStore'
import { playClick } from '@/lib/audio'
import Editable from '@/editor/Editable'
import { TowerModel } from './TowerModel'

// ─── Tower ────────────────────────────────────────────────────────────────────
// Tour PC : modèle GLB (Sketchfab). Le GLB n'a ni bouton ni LED repérables par nom (57 meshes
// `defaultMaterial_*` génériques) : pour l'instant on reste simple — TOUTE la tour est cliquable
// (clic → allume/éteint). Un bouton power + une LED dédiés seront recalés plus tard sur la vraie
// façade du modèle.

// ── Transform du GLB — À AJUSTER À L'ŒIL ────────────────────────────────────────
// Scale calé sur la HAUTEUR réelle du modèle (bbox ~10.63 d'unités de haut → 0.44 cible). Façade
// supposée côté +Z ; changer MODEL_ROTATION_Y (Math.PI / 2, Math.PI, -Math.PI / 2) si elle ne
// regarde pas la pièce. MODEL_POSITION pose la base et la façade là où était l'ancien boîtier.
const MODEL_SCALE = 0.44 / 10.63
const MODEL_POSITION: readonly [number, number, number] = [0.0066, -0.2294, 0.19]
const MODEL_ROTATION_Y = 0

// Info-bulle au survol — repère local de l'Editable, au-dessus de la tour (à ajuster à l'œil).
const TOOLTIP_POSITION: readonly [number, number, number] = [0, 0.28, 0.18]

export function Tower() {
  const [hovered, setHovered] = useState(false)
  const power = usePowerStore((s) => s.power)
  const pressPower = usePowerStore((s) => s.pressPower)
  const editing = useEditorStore((s) => s.enabled)

  // Cliquable sauf : pendant une transition (démarrage/extinction), et en mode éditeur — sinon le
  // clic-power volerait la sélection du gizmo de l'<Editable> (toute la tour étant cliquable).
  const isTransitioning = power === 'bios' || power === 'booting' || power === 'shuttingDown'
  const interactive = !isTransitioning && !editing

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    playClick()
    pressPower()
  }

  return (
    <Editable id="tower" label="Tour" position={[0.48, 0.97, -0.17]}>
      <group
        position={MODEL_POSITION}
        rotation={[0, MODEL_ROTATION_Y, 0]}
        scale={MODEL_SCALE}
        onClick={interactive ? handleClick : undefined}
        onPointerOver={(e) => {
          if (!interactive) return
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
          setHovered(true)
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
          setHovered(false)
        }}
      >
        <TowerModel />
      </group>
      {/* Info-bulle au survol — indique l'action du clic */}
      {hovered && interactive && (
        <Html position={TOOLTIP_POSITION} center style={{ pointerEvents: 'none' }}>
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
            {power === 'off' ? 'Allumer' : 'Éteindre'}
          </div>
        </Html>
      )}
    </Editable>
  )
}
