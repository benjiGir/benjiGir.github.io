import { useEffect } from 'react'
import { Physics } from '@react-three/rapier'
import Hotspot from '@/scene/camera/Hotspot'
import Editable from '@/editor/Editable'
import { useCameraStore } from '@/store/useCameraStore'
import { useLegoStore } from '@/store/useLegoStore'
import { playClick } from '@/lib/audio'
import { LowTable } from './LowTable'
import { BuildPlate } from './BuildPlate'
import { ScatteredBricks } from './ScatteredBricks'
import { PhysicsTower } from './PhysicsTower'
import { BuildPanel } from './BuildPanel'

// ─── LegoCorner (export) ──────────────────────────────────────────────────────────
//
// Coin legos (premier plan droit, x≈2.6, z≈1.2) : table basse avec un plateau de montage
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
    <Hotspot poi="legos" label="Coin legos" position={[2.6, 0, 1.2]}>
      <Editable id="legos" label="Coin legos">
        <LowTable />
        <BuildPlate active={poiActive} />
        <ScatteredBricks />
      </Editable>
      {poiActive && <BuildPanel step={step} onReset={handleReset} />}
      {visited && (
        <Physics>
          <PhysicsTower />
        </Physics>
      )}
    </Hotspot>
  )
}
