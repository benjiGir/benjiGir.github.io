import { useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { Environment, useHelper } from '@react-three/drei'
import Editable from '@/editor/Editable'
import { useEditorStore } from '@/editor/useEditorStore'

const DEBUG = import.meta.env.VITE_DEBUG === 'true'

// Les directionalLight n'ont aucune géométrie propre : sans marqueur elles sont invisibles et
// non cliquables dans le viewport de l'éditeur de scène (seul le dropdown Leva permet alors de
// les sélectionner). Ce petit composant leur donne une présence visuelle + un raycast réel,
// strictement gated DEBUG && enabled — aucune trace en prod (DEBUG est inliné au build, la
// branche est éliminée du bundle) ni même en dev hors mode édition.
function LightMarker({
  lightRef,
  color,
}: {
  lightRef: RefObject<THREE.DirectionalLight>
  color: string
}) {
  const enabled = useEditorStore((s) => s.enabled)
  // Le helper visualise le faisceau réel vers `target-position` (Object3D monde, cf. note
  // architecturale) — désactivé hors édition en passant `undefined` (useHelper vérifie déjà en
  // interne `object3D && object3D.current` avant d'instancier).
  useHelper(enabled ? lightRef : undefined, THREE.DirectionalLightHelper, 0.4, color)

  if (!DEBUG || !enabled) return null

  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
    </mesh>
  )
}

export default function Lighting() {
  const windowLightRef = useRef<THREE.DirectionalLight>(null!)
  const fillLightRef = useRef<THREE.DirectionalLight>(null!)
  const windowTarget = useMemo(() => {
    const target = new THREE.Object3D()
    target.position.set(-1.4, 0.3, -1.2)
    return target
  }, [])

  return (
    <>
      <hemisphereLight args={['#e5edff', '#a88a69', 0.64]} />
      <pointLight position={[0, 2.31, -0.3]} color="#ffe0b1" intensity={1.4} distance={4} />

      {/* La lumière traverse la fenêtre de gauche vers le sol au milieu de la chambre. */}
      <primitive object={windowTarget} />
      <Editable id="light-window" label="Lumière fenêtre" position={[-5.8, 3, 0.2]}>
        <directionalLight
          ref={windowLightRef}
          target={windowTarget}
          intensity={1.85}
          color="#fff1dc"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={0.1}
          shadow-camera-far={14}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
          shadow-normalBias={0.015}
        />
        <LightMarker lightRef={windowLightRef} color="#fff1dc" />
      </Editable>

      {/* Rebond discret côté lit et sur le mur du fond. */}
      <Editable id="light-fill" label="Lumière d'appoint" position={[2, 2.5, 2]}>
        <directionalLight ref={fillLightRef} intensity={0.2} color="#ffe9d5" />
        <LightMarker lightRef={fillLightRef} color="#ffe9d5" />
      </Editable>

      <Environment preset="apartment" environmentIntensity={0.2} />
    </>
  )
}
