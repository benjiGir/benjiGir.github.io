import { useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const ACCENT_COLOR = '#2b6cb0'

// ─── Jambe ───────────────────────────────────────────────────────────────────

interface LegProps {
  side: 'left' | 'right'
  walkPhase: MutableRefObject<number>
}

export function Leg({ side, walkPhase }: LegProps) {
  const groupRef = useRef<THREE.Group>(null)
  const sign = side === 'left' ? 1 : -1

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const swing = Math.sin(walkPhase.current + Math.PI) * 0.3 * sign
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      swing,
      1 - Math.exp(-delta * 8)
    )
  })

  return (
    <group ref={groupRef} position={[sign * 0.028, 0.06, 0]}>
      <mesh position={[0, -0.05, 0]} castShadow>
        <capsuleGeometry args={[0.02, 0.08, 6, 12]} />
        <meshStandardMaterial color={ACCENT_COLOR} roughness={0.5} metalness={0.15} />
      </mesh>
      {/* Pied */}
      <mesh position={[0, -0.105, 0.012]} castShadow>
        <boxGeometry args={[0.045, 0.018, 0.07]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  )
}
