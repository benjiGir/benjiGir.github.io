import { useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useLampStore } from '@/store/useLampStore'
import { useEditorStore } from '@/editor/useEditorStore'
import { playClick } from '@/lib/audio'
import Editable from '@/editor/Editable'
import { DeskLampModel } from '@/scene/desk/DeskLampModel'

// ─── DeskLamp ─────────────────────────────────────────────────────────────────
// Lampe de bureau allumable/éteignable au clic (même pattern que Tower.tsx pour le bouton
// power) : participe à l'éclairage motivé de la pièce une fois l'ambiant global réduit.

// Info-bulle au survol — repère local de l'Editable, au-dessus de l'abat-jour.
const TOOLTIP_POSITION: readonly [number, number, number] = [0, 0.35, 0]

export function DeskLamp() {
  const [hovered, setHovered] = useState(false)
  const isOn = useLampStore((s) => s.isOn)
  const toggleLamp = useLampStore((s) => s.toggleLamp)
  const editing = useEditorStore((s) => s.enabled)

  // Pas cliquable en mode éditeur — sinon le clic volerait la sélection du gizmo de l'<Editable>.
  const interactive = !editing

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    playClick()
    toggleLamp()
  }

  return (
    <Editable id="desk-lamp" label="Lampe" position={[-0.55, 0.75, -0.27]}>
      <group
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
        <DeskLampModel lit={isOn} />
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
            {isOn ? 'Éteindre' : 'Allumer'}
          </div>
        </Html>
      )}
    </Editable>
  )
}
