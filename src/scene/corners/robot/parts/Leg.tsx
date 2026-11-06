import { useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ACCENT, JOINT, LIGHT, SHELL } from '../naoPalette'

const HIP_Y = 0.243
const THIGH_LENGTH = 0.108
const SHIN_LENGTH = 0.094
const ANKLE_Y = HIP_Y - THIGH_LENGTH - SHIN_LENGTH
const SOLE_HEIGHT = 0.008

const THIGH_PROFILE = [
  [0, -0.096],
  [0.016, -0.096],
  [0.023, -0.09],
  [0.028, -0.073],
  [0.033, -0.048],
  [0.034, -0.025],
  [0.029, -0.011],
  [0.018, -0.005],
  [0, -0.005],
].map(([radius, y]) => new THREE.Vector2(radius, y))

const SHIN_PROFILE = [
  [0, -0.084],
  [0.016, -0.084],
  [0.022, -0.08],
  [0.027, -0.068],
  [0.028, -0.048],
  [0.026, -0.029],
  [0.023, -0.02],
  [0, -0.02],
].map(([radius, y]) => new THREE.Vector2(radius, y))

// Contour dans le plan X/-Z pour extruder la semelle vers +Y.
const FOOT_OUTLINE = new THREE.Shape()
  .moveTo(0, -0.104)
  .bezierCurveTo(0.025, -0.104, 0.037, -0.092, 0.037, -0.067)
  .bezierCurveTo(0.037, -0.036, 0.031, -0.014, 0.031, 0.013)
  .bezierCurveTo(0.031, 0.035, 0.018, 0.041, 0, 0.041)
  .bezierCurveTo(-0.018, 0.041, -0.031, 0.035, -0.031, 0.013)
  .bezierCurveTo(-0.031, -0.014, -0.037, -0.036, -0.037, -0.067)
  .bezierCurveTo(-0.037, -0.092, -0.025, -0.104, 0, -0.104)

const SOLE_EXTRUSION = { depth: SOLE_HEIGHT, bevelEnabled: false, curveSegments: 8 }
const TOE_EXTRUSION = {
  depth: 0.013,
  bevelEnabled: true,
  bevelSegments: 3,
  bevelSize: 0.004,
  bevelThickness: 0.005,
  curveSegments: 8,
}

interface LegProps {
  side: 'left' | 'right'
  walkPhase: MutableRefObject<number>
}

export function Leg({ side, walkPhase }: LegProps) {
  const hipRef = useRef<THREE.Group>(null)
  const kneeRef = useRef<THREE.Group>(null)
  const ankleRef = useRef<THREE.Group>(null)
  const sign = side === 'left' ? 1 : -1

  useFrame((_, delta) => {
    const hip = hipRef.current
    const knee = kneeRef.current
    const ankle = ankleRef.current
    if (!hip || !knee || !ankle) return

    const swing = -Math.sin(walkPhase.current) * 0.3 * sign
    const pitch = THREE.MathUtils.lerp(hip.rotation.x, swing, 1 - Math.exp(-delta * 8))
    const bend = Math.max(0, -pitch) * 0.55
    hip.rotation.x = pitch
    knee.rotation.x = bend
    // La semelle reste parallèle au sol quand la jambe se raccourcit en pivotant.
    ankle.rotation.x = -(pitch + bend)
  })

  return (
    <group ref={hipRef} position={[sign * 0.044, HIP_Y, 0]}>
      <mesh scale={[0.027, 0.025, 0.027]} castShadow>
        <sphereGeometry args={[1, 16, 10]} />
        <meshStandardMaterial color={JOINT} roughness={0.82} />
      </mesh>
      <mesh scale={[1, 1, 1.08]} castShadow>
        <latheGeometry args={[THIGH_PROFILE, 24]} />
        <meshStandardMaterial color={SHELL} roughness={0.44} />
      </mesh>

      <group ref={kneeRef} position={[0, -THIGH_LENGTH, 0]}>
        <mesh scale={[0.025, 0.022, 0.026]} castShadow>
          <sphereGeometry args={[1, 20, 12]} />
          <meshStandardMaterial color={JOINT} roughness={0.82} />
        </mesh>
        <mesh position={[0, -0.02, 0]} scale={[1.1, 1, 1.13]}>
          <cylinderGeometry args={[0.023, 0.025, 0.004, 24]} />
          <meshStandardMaterial color={ACCENT} roughness={0.4} />
        </mesh>
        <mesh scale={[1.1, 1, 1.13]} castShadow>
          <latheGeometry args={[SHIN_PROFILE, 24]} />
          <meshStandardMaterial color={SHELL} roughness={0.44} />
        </mesh>

        <group ref={ankleRef} position={[0, -SHIN_LENGTH, 0]}>
          <mesh scale={[0.022, 0.017, 0.021]}>
            <sphereGeometry args={[1, 16, 10]} />
            <meshStandardMaterial color={JOINT} roughness={0.82} />
          </mesh>
          <group position={[0, -ANKLE_Y, 0]}>
            <group rotation={[-Math.PI / 2, 0, 0]}>
              <mesh castShadow>
                <extrudeGeometry args={[FOOT_OUTLINE, SOLE_EXTRUSION]} />
                <meshStandardMaterial color={SHELL} roughness={0.65} />
              </mesh>
              <mesh position={[0, 0, SOLE_HEIGHT]} castShadow>
                <extrudeGeometry args={[FOOT_OUTLINE, TOE_EXTRUSION]} />
                <meshStandardMaterial color={ACCENT} roughness={0.4} />
              </mesh>
            </group>
            <mesh position={[0, 0.024, 0.001]} scale={[0.033, 0.021, 0.039]} castShadow>
              <sphereGeometry args={[1, 20, 12]} />
              <meshStandardMaterial color={SHELL} roughness={0.44} />
            </mesh>
            <mesh position={[sign * 0.009, 0.026, 0.078]} scale={[0.009, 0.001, 0.0035]}>
              <sphereGeometry args={[1, 12, 8]} />
              <meshStandardMaterial
                color={LIGHT}
                emissive={LIGHT}
                emissiveIntensity={0.12}
                roughness={0.35}
              />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}
