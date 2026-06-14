import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRobotStore, cellToWorld, LEVELS } from '@/store/useRobotStore'

const LED_COLOR = '#3ddc84'

// ─── Marqueur de case cible ─────────────────────────────────────────────────

export function TargetMarker() {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const levelIndex = useRobotStore((s) => s.levelIndex)
  const level = LEVELS[levelIndex]
  const [x, z] = cellToWorld(level.target.col, level.target.row)

  useFrame(({ clock }) => {
    if (!matRef.current) return
    // Pulsation douce pour signaler la cible sans être trop voyant
    matRef.current.emissiveIntensity = 0.8 + Math.sin(clock.elapsedTime * 2.5) * 0.4
  })

  return (
    <mesh position={[x, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.06, 0.09, 24]} />
      <meshStandardMaterial
        ref={matRef}
        color={LED_COLOR}
        emissive={LED_COLOR}
        emissiveIntensity={1}
        transparent
        opacity={0.85}
      />
    </mesh>
  )
}
