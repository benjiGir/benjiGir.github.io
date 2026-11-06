import { useRef, type MutableRefObject } from 'react'
import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ACCENT, JOINT, SEAM, SHELL } from '../naoPalette'

const FOREARM_PROFILE = [
  [0, -0.121],
  [0.009, -0.121],
  [0.013, -0.118],
  [0.018, -0.103],
  [0.019, -0.093],
  [0.017, -0.084],
  [0.013, -0.079],
  [0, -0.079],
].map(([radius, y]) => new THREE.Vector2(radius, y))

function Finger({ curl }: { curl: number }) {
  return (
    <>
      <mesh position={[0, -0.003, 0]}>
        <capsuleGeometry args={[0.005, 0.005, 3, 8]} />
        <meshStandardMaterial color={SHELL} roughness={0.46} />
      </mesh>
      <mesh position={[0, -0.0115, 0]} scale={[1, 0.8, 1]}>
        <sphereGeometry args={[0.0045, 10, 6]} />
        <meshStandardMaterial color={SEAM} roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.0165, 0]} rotation={[0, 0, curl]}>
        <capsuleGeometry args={[0.0044, 0.004, 3, 8]} />
        <meshStandardMaterial color={SHELL} roughness={0.46} />
      </mesh>
    </>
  )
}

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
    <group ref={groupRef} position={[sign * 0.099, 0.409, 0]}>
      <mesh position={[-sign * 0.016, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.018, 0.01, 4, 12]} />
        <meshStandardMaterial color={JOINT} roughness={0.82} />
      </mesh>
      <mesh position={[sign * 0.005, 0, 0]} scale={[0.031, 0.033, 0.034]} castShadow>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color={ACCENT} roughness={0.38} />
      </mesh>
      <mesh position={[0, -0.035, 0]} scale={[0.82, 1, 1.14]} castShadow>
        <capsuleGeometry args={[0.018, 0.032, 6, 16]} />
        <meshStandardMaterial color={SHELL} roughness={0.44} />
      </mesh>
      <mesh position={[0, -0.072, 0]} scale={[0.019, 0.014, 0.016]} castShadow>
        <sphereGeometry args={[1, 16, 10]} />
        <meshStandardMaterial color={JOINT} roughness={0.82} />
      </mesh>
      <mesh scale={[1, 1, 1.18]} castShadow>
        <latheGeometry args={[FOREARM_PROFILE, 20]} />
        <meshStandardMaterial color={SHELL} roughness={0.44} />
      </mesh>
      <mesh position={[0, -0.127, 0]}>
        <cylinderGeometry args={[0.009, 0.009, 0.018, 12]} />
        <meshStandardMaterial color={JOINT} roughness={0.82} />
      </mesh>
      <RoundedBox
        args={[0.022, 0.008, 0.025]}
        position={[0, -0.126, 0]}
        radius={0.003}
        smoothness={1}
        bevelSegments={1}
      >
        <meshStandardMaterial color={SHELL} roughness={0.44} />
      </RoundedBox>
      <RoundedBox
        args={[0.025, 0.022, 0.032]}
        position={[0, -0.144, 0]}
        radius={0.008}
        smoothness={2}
        bevelSegments={2}
        castShadow
      >
        <meshStandardMaterial color={SHELL} roughness={0.46} />
      </RoundedBox>

      {/* Deux doigts et un pouce opposé, repliés vers la paume. */}
      <group position={[0, -0.151, -0.008]}>
        <Finger curl={-sign * 0.42} />
      </group>
      <group position={[0, -0.152, 0.003]}>
        <Finger curl={-sign * 0.52} />
      </group>
      <group
        position={[-sign * 0.006, -0.144, 0.012]}
        rotation={[-0.38, 0, -sign * 0.28]}
        scale={0.8}
      >
        <Finger curl={-sign * 0.5} />
      </group>
    </group>
  )
}
