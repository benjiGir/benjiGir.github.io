import { useRef } from 'react'
import Hotspot from '@/scene/camera/Hotspot'
import Editable from '@/editor/Editable'
import { useCameraStore } from '@/store/useCameraStore'
import { GuitarModel } from './GuitarModel'
import { SimonPanel } from './SimonPanel'
import { STRING_COUNT } from './constants'

// ─── Guitar (export) ──────────────────────────────────────────────────────────
//
// Guitare acoustique sur stand, coin musique (mur gauche, juste après la fenêtre).
// Le Hotspot englobant gère le focus caméra (POI 'guitar') ; une fois le POI actif, chaque
// corde devient cliquable individuellement (pince + vibration) et le panneau Simon apparaît.
//
// `stringTriggerRef` est un canal de communication léger entre `SimonPanel` et les `GuitarString`
// (déclenchement visuel/sonore par index, valeurs : 0 = repos, 1 = "joue visuellement", 2 = "clic
// utilisateur à valider par le Simon"). Évite un store zustand pour une interaction aussi locale.

export default function Guitar() {
  const stringTriggerRef = useRef<number[]>(new Array(STRING_COUNT).fill(0))
  const activePoi = useCameraStore((s) => s.poi)
  const poiActive = activePoi === 'guitar'

  return (
    <Hotspot poi="guitar" label="Guitare" position={[-3.85, 0, 2.35]}>
      <Editable id="guitar" label="Guitare" rotation={[0, Math.PI / 2, 0]}>
        <GuitarModel stringTriggerRef={stringTriggerRef} interactive={poiActive} />
        {poiActive && <SimonPanel stringTriggerRef={stringTriggerRef} />}
      </Editable>
    </Hotspot>
  )
}
