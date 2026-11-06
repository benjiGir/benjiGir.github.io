import { Suspense, useEffect } from 'react'
import { CuboidCollider, Physics } from '@react-three/rapier'
import Hotspot from '@/scene/camera/Hotspot'
import Editable from '@/editor/Editable'
import { useCameraStore } from '@/store/useCameraStore'
import { useLegoStore } from '@/store/useLegoStore'
import { LEGO_POSITION, ROOM_BACK_Z, ROOM_DEPTH, ROOM_WIDTH } from '@/scene/roomLayout'
import { playClick } from '@/lib/audio'
import { LowTable } from './LowTable'
import { BuildPlate } from './BuildPlate'
import { ScatteredBricks } from './ScatteredBricks'
import { PhysicsTower } from './PhysicsTower'
import { BuildPanel } from './BuildPanel'
import { TABLE_TOP_Y, TABLETOP_DEPTH, TABLETOP_THICKNESS, TABLETOP_WIDTH } from './bricks'

// ─── LegoCorner (export) ──────────────────────────────────────────────────────────
//
// Coin legos au premier plan gauche : table basse avec un plateau de montage
// (petite voiture en ~9 étapes, clic pour assembler progressivement), des briques éparses
// statiques, et une tour de briques physique (rapier) qui s'écroule au clic.
//
// `<Physics>` n'est monté qu'une fois le POI 'legos' visité au moins une fois
// (`useLegoStore.visited`) — évite de payer le coût d'initialisation de rapier (WASM) au
// chargement initial de la scène, pour un coin qui n'est peut-être jamais visité.

export default function LegoCorner() {
  const activePoi = useCameraStore((s) => s.poi)
  const poiActive = activePoi === 'legos'
  const step = useLegoStore((s) => s.step)
  const reset = useLegoStore((s) => s.reset)
  const visited = useLegoStore((s) => s.visited)
  const markVisited = useLegoStore((s) => s.markVisited)

  // `<Physics>` reste monté pour le reste de la session une fois `visited` passé à `true` —
  // le store ne revient jamais en arrière, donc pas besoin d'état local supplémentaire.
  useEffect(() => {
    if (poiActive) markVisited()
  }, [poiActive, markVisited])

  function handleReset() {
    playClick()
    reset()
  }

  return (
    <Hotspot poi="legos" label="Coin legos" position={LEGO_POSITION}>
      <Editable id="legos" label="Coin legos">
        <LowTable />
        <BuildPlate active={poiActive} />
        <ScatteredBricks />
      </Editable>
      {poiActive && <BuildPanel step={step} onReset={handleReset} />}
      {visited && (
        <Suspense fallback={null}>
          <Physics>
            <CuboidCollider
              args={[TABLETOP_WIDTH / 2, TABLETOP_THICKNESS / 2, TABLETOP_DEPTH / 2]}
              position={[0, TABLE_TOP_Y - TABLETOP_THICKNESS / 2, 0]}
            />
            <CuboidCollider
              args={[ROOM_WIDTH / 2, 0.05, ROOM_DEPTH / 2]}
              position={[-LEGO_POSITION[0], -0.05, ROOM_BACK_Z + ROOM_DEPTH / 2 - LEGO_POSITION[2]]}
            />
            <PhysicsTower />
          </Physics>
        </Suspense>
      )}
    </Hotspot>
  )
}
