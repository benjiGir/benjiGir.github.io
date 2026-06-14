import { useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const BODY_COLOR = '#f4f4f6'

// ─── Bras ────────────────────────────────────────────────────────────────────

interface ArmProps {
  side: 'left' | 'right'
  walkPhase: MutableRefObject<number>
  greetTrigger: number
}

export function Arm({ side, walkPhase, greetTrigger }: ArmProps) {
  const groupRef = useRef<THREE.Group>(null)
  const sign = side === 'left' ? 1 : -1
  const greetAnim = useRef(0)
  const lastTrigger = useRef(greetTrigger)

  if (greetTrigger !== lastTrigger.current) {
    lastTrigger.current = greetTrigger
    // Seul le bras droit fait le salut
    if (side === 'right') greetAnim.current = 1
  }

  useFrame((_, delta) => {
    if (!groupRef.current) return

    if (side === 'right' && greetAnim.current > 0) {
      greetAnim.current -= delta * 0.7
      const t = Math.max(greetAnim.current, 0)
      // Lève le bras puis petit balancement façon salut
      const raise = Math.sin((1 - t) * Math.PI) // 0 -> 1 -> 0
      const wave = Math.sin((1 - t) * Math.PI * 6) * 0.25 * raise
      groupRef.current.rotation.z = -raise * 2.4 + wave
      groupRef.current.rotation.x = 0
      return
    }

    // Balancement de marche, sinon léger repos
    const swing = Math.sin(walkPhase.current) * 0.35 * sign
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      swing,
      1 - Math.exp(-delta * 8)
    )
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      0,
      1 - Math.exp(-delta * 8)
    )
  })

  return (
    <group ref={groupRef} position={[sign * 0.085, 0.16, 0]}>
      <mesh position={[0, -0.05, 0]} castShadow>
        <capsuleGeometry args={[0.018, 0.08, 6, 12]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.45} metalness={0.1} />
      </mesh>
    </group>
  )
}
