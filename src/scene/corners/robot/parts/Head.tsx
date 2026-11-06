import { useRef, type MutableRefObject, type RefObject } from 'react'
import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GazeTarget } from '../types'

import { ACCENT, JOINT, LIGHT, SEAM, SHELL } from '../naoPalette'

const FORWARD = [Math.PI / 2, 0, 0] as const

function Eye({
  side,
  material,
}: {
  side: number
  material: RefObject<THREE.MeshStandardMaterial | null>
}) {
  return (
    <group position={[side * 0.026, 0.05, 0.056]} rotation={[0, side * 0.34, 0]}>
      <mesh rotation={FORWARD}>
        <cylinderGeometry args={[0.014, 0.0155, 0.007, 24]} />
        <meshStandardMaterial color="#7c8794" roughness={0.42} />
      </mesh>
      <mesh position={[0, 0, 0.004]} scale={[0.0116, 0.0116, 0.0048]}>
        <sphereGeometry args={[1, 20, 12]} />
        <meshPhysicalMaterial color="#182330" roughness={0.22} clearcoat={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.006]}>
        <ringGeometry args={[0.0094, 0.0117, 28]} />
        <meshStandardMaterial
          ref={material}
          color={LIGHT}
          emissive={LIGHT}
          emissiveIntensity={0.9}
        />
      </mesh>
      <mesh position={[0, 0, 0.009]}>
        <circleGeometry args={[0.0042, 16]} />
        <meshStandardMaterial color="#354c67" roughness={0.25} />
      </mesh>
    </group>
  )
}

function CameraPort({ y, z, tilt }: { y: number; z: number; tilt: number }) {
  return (
    <group position={[0, y, z]} rotation={[tilt, 0, 0]}>
      <mesh rotation={FORWARD}>
        <cylinderGeometry args={[0.0051, 0.0062, 0.004, 16]} />
        <meshStandardMaterial color={SEAM} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.0021]}>
        <circleGeometry args={[0.0037, 16]} />
        <meshStandardMaterial color="#19232c" roughness={0.23} />
      </mesh>
    </group>
  )
}

// ─── Tête ────────────────────────────────────────────────────────────────────
//
// `gazeRef` est une référence mutable partagée : le composant englobant (ex. `Robot.tsx`,
// pour le suivi du regard sur POI actif) y écrit la direction de regard désirée chaque frame ;
// `Head` la lit dans son propre `useFrame` pour rester l'unique writer de `rotation` (évite
// que deux boucles `useFrame` se disputent la même propriété).

interface HeadProps {
  headRef: MutableRefObject<THREE.Group | null>
  gazeRef: MutableRefObject<GazeTarget>
  failTrigger: number
}

export function Head({ headRef, gazeRef, failTrigger }: HeadProps) {
  const eyeLMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const eyeRMatRef = useRef<THREE.MeshStandardMaterial>(null)

  const blinkTimer = useRef(THREE.MathUtils.randFloat(2, 5))
  const blinkPhase = useRef(0) // 0 = ouvert, >0 = en cours de clignement
  const failAnim = useRef(0) // >0 = animation "non" en cours (durée restante)
  const lastFailTrigger = useRef(failTrigger)

  // Démarre l'animation "non" (rotation latérale rapide de la tête) sur changement de trigger
  if (failTrigger !== lastFailTrigger.current) {
    lastFailTrigger.current = failTrigger
    failAnim.current = 0.6
  }

  useFrame((_, delta) => {
    if (!headRef.current) return

    // ── Clignement des yeux ──
    blinkTimer.current -= delta
    if (blinkTimer.current <= 0 && blinkPhase.current === 0) {
      blinkPhase.current = 0.12
      blinkTimer.current = THREE.MathUtils.randFloat(2.5, 6)
    }
    if (blinkPhase.current > 0) {
      blinkPhase.current -= delta
      const t = Math.max(blinkPhase.current, 0) / 0.12
      const scale = Math.abs(Math.sin(t * Math.PI)) < 0.05 ? 0.05 : Math.abs(Math.sin(t * Math.PI))
      const closed = 1 - scale
      if (eyeLMatRef.current) eyeLMatRef.current.emissiveIntensity = 0.9 * closed
      if (eyeRMatRef.current) eyeRMatRef.current.emissiveIntensity = 0.9 * closed
    } else {
      if (eyeLMatRef.current) eyeLMatRef.current.emissiveIntensity = 0.9
      if (eyeRMatRef.current) eyeRMatRef.current.emissiveIntensity = 0.9
    }

    // ── Animation "non" (échec) : rotation latérale rapide amortie ──
    if (failAnim.current > 0) {
      failAnim.current -= delta
      const t = Math.max(failAnim.current, 0)
      const shake = Math.sin(t * 28) * (t / 0.6) * 0.5
      headRef.current.rotation.y = shake
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        0,
        1 - Math.exp(-delta * 8)
      )
      return
    }

    // ── Suivi du regard (écrit par le composant englobant via `gazeRef`) ou retour au repos ──
    const damp = 1 - Math.exp(-delta * 5)
    headRef.current.rotation.y = THREE.MathUtils.lerp(
      headRef.current.rotation.y,
      gazeRef.current.yaw,
      damp
    )
    headRef.current.rotation.x = THREE.MathUtils.lerp(
      headRef.current.rotation.x,
      gazeRef.current.pitch,
      damp
    )
  })

  return (
    <group ref={headRef} position={[0, 0.455, 0]}>
      <mesh position={[0, 0.05, -0.007]} scale={[0.071, 0.073, 0.067]} castShadow receiveShadow>
        <sphereGeometry args={[1, 32, 22]} />
        <meshStandardMaterial color={SHELL} roughness={0.34} />
      </mesh>
      {/* Coque bleue sur l'arrière du crâne et les flancs. */}
      <mesh position={[0, 0.05, -0.007]} scale={[0.072, 0.074, 0.068]} castShadow>
        <sphereGeometry args={[1, 32, 22, Math.PI, Math.PI]} />
        <meshStandardMaterial color={ACCENT} roughness={0.36} />
      </mesh>

      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * 0.065, 0.05, -0.008]}
          rotation={[0, side * Math.PI / 2, 0]}
        >
          <mesh rotation={FORWARD}>
            <cylinderGeometry args={[0.025, 0.027, 0.012, 26]} />
            <meshStandardMaterial color={ACCENT} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.0065]}>
            <circleGeometry args={[0.0186, 24]} />
            <meshStandardMaterial color={JOINT} roughness={0.65} />
          </mesh>
          <mesh position={[0, 0, 0.0068]}>
            <ringGeometry args={[0.019, 0.0206, 24]} />
            <meshStandardMaterial color={LIGHT} emissive={LIGHT} emissiveIntensity={0.35} />
          </mesh>
          {[-0.005, 0, 0.005].map((y) => (
            <mesh key={y} position={[0, y, 0.0068]}>
              <boxGeometry args={[0.017 - Math.abs(y) * 0.7, 0.0015, 0.0006]} />
              <meshStandardMaterial color={SEAM} roughness={0.58} />
            </mesh>
          ))}
        </group>
      ))}

      <Eye side={-1} material={eyeLMatRef} />
      <Eye side={1} material={eyeRMatRef} />
      <CameraPort y={0.077} z={0.0555} tilt={-0.32} />
      <RoundedBox
        position={[0, 0.0225, 0.0554]}
        args={[0.029, 0.005, 0.004]}
        radius={0.0018}
        smoothness={2}
        rotation={[0.28, 0, 0]}
      >
        <meshStandardMaterial color={SEAM} roughness={0.56} />
      </RoundedBox>
      <CameraPort y={0.0205} z={0.0559} tilt={0.33} />

      {/* Trois touches capacitives intégrées à la coque supérieure. */}
      {[-0.022, -0.007, 0.008].map((z) => (
        <mesh
          key={z}
          position={[0, z === -0.007 ? 0.1245 : 0.1228, z]}
          rotation={[(z + 0.007) * 15, 0, 0]}
        >
          <boxGeometry args={[0.013, 0.0014, 0.005]} />
          <meshStandardMaterial color="#899db8" roughness={0.61} />
        </mesh>
      ))}
    </group>
  )
}
