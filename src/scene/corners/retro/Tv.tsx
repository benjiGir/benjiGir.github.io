import { useLayoutEffect, useRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import { Matrix4, Vector2, type CanvasTexture, type InstancedMesh } from 'three'
import { CABINET_TOP_Y } from './retroLayout'
import { TV_SCREEN_HEIGHT, TV_SCREEN_WIDTH, TvScreen } from './TvScreen'

const SCREEN_HEIGHT_ABOVE_CABINET = 0.275
const SCREEN_X = -0.063
const CONTROLS_X = 0.262
const FOOT_HEIGHT = 0.043

const DIAL_PROFILE = [
  new Vector2(0, 0),
  new Vector2(0.039, 0),
  new Vector2(0.039, 0.007),
  new Vector2(0.034, 0.009),
  new Vector2(0.034, 0.022),
  new Vector2(0.03, 0.027),
  new Vector2(0, 0.027),
]

// Les creux du haut-parleur et des aérations partagent une seule géométrie instanciée.
type Slot = [x: number, y: number, z: number, width: number, height: number, depth: number]

const SLOTS: Slot[] = [
  ...Array.from(
    { length: 13 },
    (_, i): Slot => [CONTROLS_X, -0.019 - i * 0.0115, 0.192, 0.073, 0.0038, 0.0014]
  ),
  ...Array.from(
    { length: 17 },
    (_, i): Slot => [(i - 8) * 0.022, 0.2395, -0.108, 0.009, 0.0014, 0.05]
  ),
  ...Array.from(
    { length: 17 },
    (_, i): Slot => [(i - 8) * 0.022, 0.053, -0.233, 0.01, 0.105, 0.002]
  ),
]

function Slots() {
  const slotsRef = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = slotsRef.current
    if (!mesh) return

    const matrix = new Matrix4()
    SLOTS.forEach(([x, y, z, width, height, depth], i) => {
      matrix.makeScale(width, height, depth).setPosition(x, y, z)
      mesh.setMatrixAt(i, matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [])

  return (
    <instancedMesh
      ref={slotsRef}
      args={[undefined, undefined, SLOTS.length]}
      raycast={() => undefined}
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#0b0c0e" roughness={0.95} />
    </instancedMesh>
  )
}

function TuningDial({ y, scale }: { y: number; scale: number }) {
  return (
    <group position={[CONTROLS_X, y, 0.191]} scale={scale}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <latheGeometry args={[DIAL_PROFILE, 40]} />
        <meshStandardMaterial color="#c6cbcf" metalness={0.7} roughness={0.27} />
      </mesh>
      <mesh position={[0, 0.02, 0.0274]}>
        <boxGeometry args={[0.003, 0.012, 0.001]} />
        <meshStandardMaterial color="#24272b" roughness={0.75} />
      </mesh>
    </group>
  )
}

function Antenna() {
  return (
    <group position={[0.086, 0.247, -0.049]}>
      <RoundedBox args={[0.071, 0.025, 0.055]} radius={0.009}>
        <meshStandardMaterial color="#27292d" roughness={0.57} />
      </RoundedBox>
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * 0.014, 0.009, 0]}
          rotation={[-0.16, 0, -side * 0.49]}
        >
          <mesh position={[0, 0.0675, 0]}>
            <cylinderGeometry args={[0.003, 0.005, 0.135, 10]} />
            <meshStandardMaterial color="#9da4aa" metalness={0.64} roughness={0.29} />
          </mesh>
          <mesh position={[0, 0.134, 0]}>
            <sphereGeometry args={[0.0055, 10, 8]} />
            <meshStandardMaterial color="#36393e" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

interface TvProps {
  texture: CanvasTexture
  on: boolean
}

export function Tv({ texture, on }: TvProps) {
  return (
    <group position={[-0.235, CABINET_TOP_Y + SCREEN_HEIGHT_ABOVE_CABINET, 0]}>
      {/* Le capot se resserre autour du tube. Un joint sombre souligne le bandeau avant. */}
      <RoundedBox
        args={[0.59, 0.404, 0.106]}
        radius={0.037}
        position={[0, 0.014, -0.18]}
        castShadow
      >
        <meshStandardMaterial color="#303236" roughness={0.66} />
      </RoundedBox>
      <RoundedBox
        args={[0.672, 0.479, 0.342]}
        radius={0.039}
        position={[0, 0, -0.019]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#36393e" roughness={0.57} />
      </RoundedBox>
      <RoundedBox args={[0.679, 0.484, 0.014]} radius={0.006} position={[0, 0, 0.105]}>
        <meshStandardMaterial color="#17181b" roughness={0.77} />
      </RoundedBox>
      <RoundedBox
        args={[0.688, 0.49, 0.073]}
        radius={0.024}
        position={[0, 0, 0.1375]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#2b2e33" roughness={0.49} />
      </RoundedBox>
      <RoundedBox args={[0.66, 0.457, 0.024]} radius={0.01} position={[0, 0, 0.171]} receiveShadow>
        <meshPhysicalMaterial color="#96938c" metalness={0.48} roughness={0.46} anisotropy={0.45} />
      </RoundedBox>

      <group position={[SCREEN_X, 0, 0]}>
        <RoundedBox
          args={[TV_SCREEN_WIDTH + 0.046, TV_SCREEN_HEIGHT + 0.045, 0.08]}
          radius={0.034}
          scale={[1, 1, 0.31]}
          position={[0, 0, 0.1845]}
        >
          <meshStandardMaterial color="#15171b" roughness={0.5} />
        </RoundedBox>
        <group position={[0, 0, 0.197]}>
          <TvScreen texture={texture} on={on} />
        </group>
      </group>

      <RoundedBox
        args={[0.112, 0.421, 0.016]}
        radius={0.007}
        position={[CONTROLS_X, 0, 0.184]}
        receiveShadow
      >
        <meshStandardMaterial color="#40434a" roughness={0.63} />
      </RoundedBox>
      <TuningDial y={0.143} scale={1} />
      <TuningDial y={0.055} scale={0.76} />
      <Slots />
      <RoundedBox
        args={[0.033, 0.013, 0.008]}
        radius={0.003}
        position={[0.248, -0.184, 0.194]}
      >
        <meshStandardMaterial color="#22252a" roughness={0.61} />
      </RoundedBox>
      <mesh position={[0.288, -0.184, 0.192]}>
        <sphereGeometry args={[0.004, 10, 8]} />
        <meshStandardMaterial
          color={on ? '#e6a950' : '#64462b'}
          emissive="#e69734"
          emissiveIntensity={on ? 0.65 : 0}
          roughness={0.34}
        />
      </mesh>
      <mesh position={[SCREEN_X, -0.217, 0.183]}>
        <boxGeometry args={[0.078, 0.008, 0.002]} />
        <meshStandardMaterial color="#59534a" metalness={0.45} roughness={0.48} />
      </mesh>

      {[-0.23, 0.23].map((x) =>
        [-0.133, 0.104].map((z) => (
          <RoundedBox
            key={`${x}:${z}`}
            args={[0.087, FOOT_HEIGHT, 0.069]}
            radius={0.01}
            position={[x, -SCREEN_HEIGHT_ABOVE_CABINET + FOOT_HEIGHT / 2, z]}
            castShadow
          >
            <meshStandardMaterial color="#1e1f22" roughness={0.89} />
          </RoundedBox>
        ))
      )}
      <Antenna />
    </group>
  )
}
