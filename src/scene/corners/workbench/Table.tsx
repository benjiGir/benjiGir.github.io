import { RoundedBox } from '@react-three/drei'

const FRAME = '#353b3e'
const DRAWER = '#536062'
const WOOD = '#a07954'
const TOP = '#ba946b'

function DrawerUnit() {
  return (
    <group position={[-0.44, 0, -0.035]}>
      <mesh position={[0, 0.385, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.34, 0.64, 0.47]} />
        <meshStandardMaterial color={FRAME} roughness={0.78} />
      </mesh>
      {[-0.118, 0.118].map((x) => (
        <mesh key={x} position={[x, 0.033, 0]}>
          <boxGeometry args={[0.042, 0.066, 0.412]} />
          <meshStandardMaterial color={FRAME} roughness={0.78} />
        </mesh>
      ))}
      {[0.2, 0.342, 0.484, 0.626].map((y) => (
        <group key={y} position={[0, y, 0.244]}>
          <RoundedBox args={[0.322, 0.132, 0.021]} radius={0.005} castShadow receiveShadow>
            <meshStandardMaterial color={DRAWER} roughness={0.72} />
          </RoundedBox>
          <mesh position={[0, 0.024, 0.013]}>
            <boxGeometry args={[0.111, 0.017, 0.006]} />
            <meshStandardMaterial color="#262b2d" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.017, 0.024]}>
            <boxGeometry args={[0.104, 0.007, 0.021]} />
            <meshStandardMaterial color="#989d97" roughness={0.48} metalness={0.45} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function StorageCrate({ x, width, color }: { x: number; width: number; color: string }) {
  return (
    <group position={[x, 0.16, -0.075]}>
      <RoundedBox args={[width, 0.154, 0.32]} position={[0, 0.077, 0]} radius={0.01} castShadow>
        <meshStandardMaterial color={color} roughness={0.86} />
      </RoundedBox>
      <mesh position={[0, 0.153, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.015, 0.025, 0.333]} />
        <meshStandardMaterial color={FRAME} roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.093, 0.161]}>
        <boxGeometry args={[0.09, 0.027, 0.005]} />
        <meshStandardMaterial color="#333b3e" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.044, 0.161]}>
        <boxGeometry args={[0.059, 0.022, 0.005]} />
        <meshStandardMaterial color="#d3c8ad" roughness={0.93} />
      </mesh>
    </group>
  )
}

export function Table() {
  return (
    <group>
      {/* Plateau, cadre en tube d'acier et quatre patins au sol. */}
      <RoundedBox
        position={[0, 0.732, -0.005]}
        args={[1.46, 0.056, 0.71]}
        radius={0.008}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={TOP} roughness={0.74} />
      </RoundedBox>
      <mesh position={[0, 0.72, 0.35]}>
        <boxGeometry args={[1.422, 0.007, 0.002]} />
        <meshStandardMaterial color={WOOD} roughness={0.85} />
      </mesh>
      {[-0.644, 0.644].flatMap((x) =>
        [-0.266, 0.265].map((z) => (
          <group key={`${x},${z}`} position={[x, 0, z]}>
            <mesh position={[0, 0.364, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.048, 0.704, 0.048]} />
              <meshStandardMaterial color={FRAME} roughness={0.64} metalness={0.18} />
            </mesh>
            <mesh position={[0, 0.01, 0]} receiveShadow>
              <boxGeometry args={[0.062, 0.02, 0.062]} />
              <meshStandardMaterial color="#22282a" roughness={0.94} />
            </mesh>
          </group>
        ))
      )}
      {[-0.266, 0.265].map((z) => (
        <group key={z}>
          <mesh position={[0, 0.68, z]} castShadow receiveShadow>
            <boxGeometry args={[1.3, 0.048, 0.04]} />
            <meshStandardMaterial color={FRAME} roughness={0.64} metalness={0.18} />
          </mesh>
          <mesh position={[0, 0.111, z]} castShadow receiveShadow>
            <boxGeometry args={[1.3, 0.038, 0.04]} />
            <meshStandardMaterial color={FRAME} roughness={0.64} metalness={0.18} />
          </mesh>
        </group>
      ))}
      <DrawerUnit />
      <mesh position={[0.208, 0.145, -0.008]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.03, 0.54]} />
        <meshStandardMaterial color={WOOD} roughness={0.82} />
      </mesh>
      <StorageCrate x={-0.026} width={0.29} color="#77837c" />
      <StorageCrate x={0.36} width={0.36} color="#606a6d" />
    </group>
  )
}
