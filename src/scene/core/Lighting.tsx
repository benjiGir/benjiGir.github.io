import { useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { Environment, useHelper } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import Editable from '@/editor/Editable'
import { useEditorStore } from '@/editor/useEditorStore'
import { useLightingStore } from '@/store/useLightingStore'

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
  const night = useLightingStore((s) => s.mode === 'night')
  const windowOverride = useEditorStore((s) => s.overrides['light-window']?.light)
  const fillOverride = useEditorStore((s) => s.overrides['light-fill']?.light)
  const windowColor = windowOverride?.color ?? (night ? '#9eb8f4' : '#fff1dc')
  const fillColor = fillOverride?.color ?? (night ? '#bac9ed' : '#ffe9d5')
  const windowLightRef = useRef<THREE.DirectionalLight>(null!)
  const fillLightRef = useRef<THREE.DirectionalLight>(null!)
  const skipWindowShadow = useRef(false)
  const windowTarget = useMemo(() => {
    const target = new THREE.Object3D()
    target.position.set(-1.4, 0.3, -1.2)
    return target
  }, [])

  useFrame(() => {
    const shadow = windowLightRef.current?.shadow
    if (!shadow) return

    // Alterne avec une image qui réutilise la carte, sauf pendant l'édition au gizmo.
    const editing = DEBUG && useEditorStore.getState().enabled
    if (!skipWindowShadow.current || !shadow.map || editing) shadow.needsUpdate = true
    skipWindowShadow.current = !skipWindowShadow.current
  })

  return (
    <>
      {night && <color attach="background" args={['#10192f']} />}
      <hemisphereLight
        color={night ? '#a4b9e6' : '#e5edff'}
        groundColor={night ? '#6b6477' : '#a88a69'}
        intensity={night ? 0.25 : 0.64}
      />

      {/* La lumière traverse la fenêtre de gauche vers le sol au milieu de la chambre. */}
      <primitive object={windowTarget} />
      <Editable id="light-window" label="Lumière fenêtre" position={[-5.8, 3, 0.2]}>
        <directionalLight
          ref={windowLightRef}
          target={windowTarget}
          intensity={windowOverride?.intensity ?? (night ? 0.32 : 1.85)}
          color={windowColor}
          castShadow
          shadow-autoUpdate={false}
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={0.1}
          shadow-camera-far={14}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
          shadow-normalBias={0.015}
        />
        <LightMarker lightRef={windowLightRef} color={windowColor} />
      </Editable>

      {/* Rebond discret côté lit et sur le mur du fond. */}
      <Editable id="light-fill" label="Lumière d'appoint" position={[2, 2.5, 2]}>
        <directionalLight
          ref={fillLightRef}
          intensity={fillOverride?.intensity ?? (night ? 0.1 : 0.2)}
          color={fillColor}
        />
        <LightMarker lightRef={fillLightRef} color={fillColor} />
      </Editable>

      <Environment preset="apartment" environmentIntensity={night ? 0.065 : 0.2} />
    </>
  )
}
