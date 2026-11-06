import type { RefObject } from 'react'
import { RoundedBox } from '@react-three/drei'
import { Vector2, type MeshStandardMaterial } from 'three'
import { ACCENT, JOINT, LIGHT, SEAM, SHELL } from '../naoPalette'

const PROFILE = [
  [0, 0.254],
  [0.037, 0.254],
  [0.051, 0.261],
  [0.056, 0.278],
  [0.058, 0.302],
  [0.064, 0.324],
  [0.075, 0.348],
  [0.084, 0.376],
  [0.086, 0.395],
  [0.079, 0.413],
  [0.063, 0.429],
  [0.042, 0.44],
  [0.025, 0.443],
  [0, 0.443],
].map(([radius, y]) => new Vector2(radius, y))

const FACING_FRONT = [Math.PI / 2, 0, 0] as const

interface TorsoProps {
  statusMaterial: RefObject<MeshStandardMaterial | null>
}

export function Torso({ statusMaterial }: TorsoProps) {
  return (
    <group>
      <RoundedBox
        position={[0, 0.248, 0]}
        args={[0.136, 0.068, 0.092]}
        radius={0.023}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial color={ACCENT} roughness={0.39} />
      </RoundedBox>
      <mesh position={[0, 0.28, 0]} scale={[0.059, 0.031, 0.045]} castShadow>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color={JOINT} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0, -0.003]} scale={[1, 1, 0.64]} castShadow receiveShadow>
        <latheGeometry args={[PROFILE, 40]} />
        <meshStandardMaterial color={SHELL} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.432, -0.002]} scale={[0.045, 0.017, 0.035]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color={ACCENT} roughness={0.43} />
      </mesh>
      <mesh position={[0, 0.446, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.025, 0.022, 24]} />
        <meshStandardMaterial color={JOINT} roughness={0.55} />
      </mesh>

      {/* Bouton d'état et les deux transducteurs du sonar intégrés à la poitrine. */}
      <group position={[0, 0.395, 0.052]}>
        <mesh rotation={FACING_FRONT}>
          <cylinderGeometry args={[0.016, 0.017, 0.005, 24]} />
          <meshStandardMaterial color={SEAM} roughness={0.43} />
        </mesh>
        <mesh position={[0, 0, 0.0028]}>
          <circleGeometry args={[0.0118, 24]} />
          <meshStandardMaterial
            ref={statusMaterial}
            color={LIGHT}
            emissive={LIGHT}
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * 0.032, 0.352, 0.042]}
          rotation={[0.11, side * 0.29, 0]}
        >
          <mesh rotation={FACING_FRONT}>
            <cylinderGeometry args={[0.0095, 0.01, 0.0045, 16]} />
            <meshStandardMaterial color={SEAM} roughness={0.56} />
          </mesh>
          <mesh position={[0, 0, 0.0025]}>
            <circleGeometry args={[0.0067, 16]} />
            <meshStandardMaterial color={JOINT} roughness={0.64} />
          </mesh>
        </group>
      ))}
      <RoundedBox
        args={[0.073, 0.098, 0.019]}
        radius={0.008}
        smoothness={2}
        position={[0, 0.363, -0.048]}
      >
        <meshStandardMaterial color="#d5d9dd" roughness={0.54} />
      </RoundedBox>
      {[0.348, 0.356, 0.364].map((y) => (
        <mesh key={y} position={[0, y, -0.058]}>
          <boxGeometry args={[0.032, 0.002, 0.0018]} />
          <meshStandardMaterial color={SEAM} roughness={0.68} />
        </mesh>
      ))}
    </group>
  )
}
