import { useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GazeTarget } from '../types'

const BODY_COLOR = '#f4f4f6'
const ACCENT_COLOR = '#2b6cb0'
const EYE_COLOR = '#5ec8ff'

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
      if (eyeLMatRef.current) eyeLMatRef.current.emissiveIntensity = 1.4 * closed
      if (eyeRMatRef.current) eyeRMatRef.current.emissiveIntensity = 1.4 * closed
    } else {
      if (eyeLMatRef.current) eyeLMatRef.current.emissiveIntensity = 1.4
      if (eyeRMatRef.current) eyeRMatRef.current.emissiveIntensity = 1.4
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
    <group ref={headRef} position={[0, 0.235, 0]}>
      {/* Crâne */}
      <mesh castShadow>
        <sphereGeometry args={[0.07, 24, 24]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Visière */}
      <mesh position={[0, -0.005, 0.05]} castShadow>
        <boxGeometry args={[0.09, 0.045, 0.03]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Yeux émissifs */}
      <mesh position={[-0.022, -0.005, 0.066]}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshStandardMaterial
          ref={eyeLMatRef}
          color={EYE_COLOR}
          emissive={EYE_COLOR}
          emissiveIntensity={1.4}
        />
      </mesh>
      <mesh position={[0.022, -0.005, 0.066]}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshStandardMaterial
          ref={eyeRMatRef}
          color={EYE_COLOR}
          emissive={EYE_COLOR}
          emissiveIntensity={1.4}
        />
      </mesh>
      {/* Antenne */}
      <mesh position={[0, 0.075, 0]} castShadow>
        <cylinderGeometry args={[0.004, 0.004, 0.04, 8]} />
        <meshStandardMaterial color="#888888" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.097, 0]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshStandardMaterial color={ACCENT_COLOR} emissive={ACCENT_COLOR} emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}
