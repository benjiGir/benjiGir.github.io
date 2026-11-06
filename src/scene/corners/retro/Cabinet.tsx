import { useLayoutEffect, useRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import { Matrix4, type InstancedMesh } from 'three'
import { CABINET_TOP_Y } from './retroLayout'

const WALNUT = '#936747'
const EDGE = '#70503b'
const RECESS = '#45372e'
const BRASS = '#b08d56'
const DOOR_CENTERS = [-0.421, -0.083] as const
const SLATS_PER_DOOR = 13

function DoorSlats() {
  const slats = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = slats.current
    if (!mesh) return

    const matrix = new Matrix4()
    DOOR_CENTERS.forEach((center, door) => {
      for (let index = 0; index < SLATS_PER_DOOR; index += 1) {
        const x = center + (index - (SLATS_PER_DOOR - 1) / 2) * 0.021
        mesh.setMatrixAt(door * SLATS_PER_DOOR + index, matrix.makeTranslation(x, 0.321, 0.235))
      }
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [])

  return (
    <instancedMesh
      ref={slats}
      args={[undefined, undefined, DOOR_CENTERS.length * SLATS_PER_DOOR]}
      raycast={() => undefined}
    >
      <boxGeometry args={[0.013, 0.298, 0.008]} />
      <meshStandardMaterial color="#9e7150" roughness={0.77} />
    </instancedMesh>
  )
}

function MediaShelf() {
  return (
    <group>
      <RoundedBox
        position={[0.331, 0.201, 0.224]}
        args={[0.493, 0.12, 0.025]}
        radius={0.006}
        smoothness={2}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={WALNUT} roughness={0.74} />
      </RoundedBox>
      <mesh position={[0.331, 0.219, 0.244]}>
        <boxGeometry args={[0.102, 0.012, 0.022]} />
        <meshStandardMaterial color={BRASS} metalness={0.55} roughness={0.48} />
      </mesh>
      {['#829184', '#c9b18b', '#9a5949', '#737a89'].map((color, index) => (
        <group key={color} position={[0.161 + index * 0.027, 0.347, 0.089]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.023, 0.132, 0.182]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.034, 0.092]}>
            <boxGeometry args={[0.015, 0.032, 0.001]} />
            <meshStandardMaterial color="#e2d1b0" roughness={0.86} />
          </mesh>
        </group>
      ))}
      <group position={[0.407, 0.283, 0.061]}>
        {[0.011, 0.031].map((y, index) => (
          <RoundedBox
            key={y}
            position={[index * 0.018, y, 0]}
            args={[0.198, 0.02, 0.18]}
            radius={0.004}
            smoothness={2}
            rotation={[0, index * -0.1, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={index === 0 ? '#564d47' : '#827363'} roughness={0.83} />
          </RoundedBox>
        ))}
      </group>
    </group>
  )
}

export function Cabinet() {
  return (
    <group>
      <RoundedBox
        position={[0, CABINET_TOP_Y - 0.018, 0]}
        args={[1.25, 0.036, 0.5]}
        radius={0.011}
        smoothness={3}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={WALNUT} roughness={0.72} />
      </RoundedBox>
      <mesh position={[0, 0.139, -0.009]} castShadow receiveShadow>
        <boxGeometry args={[1.193, 0.03, 0.456]} />
        <meshStandardMaterial color={EDGE} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.331, -0.214]} castShadow receiveShadow>
        <boxGeometry args={[1.182, 0.359, 0.018]} />
        <meshStandardMaterial color={RECESS} roughness={0.92} />
      </mesh>
      {[-0.58, 0.067, 0.58].map((x) => (
        <mesh key={x} position={[x, 0.331, -0.007]} castShadow receiveShadow>
          <boxGeometry args={[0.03, 0.354, 0.438]} />
          <meshStandardMaterial color={WALNUT} roughness={0.78} />
        </mesh>
      ))}
      <mesh position={[0.325, 0.27, -0.012]} castShadow receiveShadow>
        <boxGeometry args={[0.49, 0.026, 0.428]} />
        <meshStandardMaterial color={EDGE} roughness={0.81} />
      </mesh>
      {DOOR_CENTERS.map((x, index) => (
        <group key={x} position={[x, 0.321, 0.224]}>
          <RoundedBox
            args={[0.326, 0.331, 0.02]}
            radius={0.005}
            smoothness={2}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={EDGE} roughness={0.8} />
          </RoundedBox>
          <mesh position={[index === 0 ? 0.139 : -0.139, 0.032, 0.019]}>
            <boxGeometry args={[0.013, 0.068, 0.024]} />
            <meshStandardMaterial color={BRASS} roughness={0.45} metalness={0.58} />
          </mesh>
        </group>
      ))}
      <DoorSlats />
      <MediaShelf />
      {[-0.501, 0.501].flatMap((x) =>
        [-0.164, 0.164].map((z) => (
          <group key={`${x},${z}`} position={[x, 0.062, z]}>
            <mesh rotation={[z * 0.55, 0, -x * 0.23]} castShadow receiveShadow>
              <cylinderGeometry args={[0.028, 0.016, 0.125, 12]} />
              <meshStandardMaterial color={EDGE} roughness={0.77} />
            </mesh>
            <mesh position={[x * 0.014, 0.002, z * 0.036]}>
              <cylinderGeometry args={[0.017, 0.017, 0.008, 12]} />
              <meshStandardMaterial color={BRASS} roughness={0.52} metalness={0.48} />
            </mesh>
          </group>
        ))
      )}
    </group>
  )
}
