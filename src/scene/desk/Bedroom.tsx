import { RoundedBox } from '@react-three/drei'
import { useLightingStore } from '@/store/useLightingStore'

const OAK = '#b18760'
const LINEN = '#e8dfcf'
const SAGE = '#8f997c'

export function Bedroom() {
  const night = useLightingStore((s) => s.mode === 'night')

  return (
    <group>
      <RoundedBox
        position={[2.56, 0.008, -0.25]}
        args={[2.48, 0.016, 2.78]}
        radius={0.007}
        receiveShadow
      >
        <meshStandardMaterial color="#c9bcaa" roughness={1} />
      </RoundedBox>

      <group position={[2.65, 0, -0.55]}>
        <RoundedBox
          position={[0, 0.205, 0]}
          args={[2.16, 0.22, 1.62]}
          radius={0.028}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={OAK} roughness={0.82} />
        </RoundedBox>
        {[-0.95, 0.95].flatMap((x) =>
          [-0.69, 0.69].map((z) => (
            <mesh key={`${x},${z}`} position={[x, 0.058, z]} castShadow>
              <boxGeometry args={[0.09, 0.1, 0.09]} />
              <meshStandardMaterial color={OAK} roughness={0.82} />
            </mesh>
          ))
        )}
        <RoundedBox
          position={[1.057, 0.62, 0]}
          args={[0.095, 0.78, 1.66]}
          radius={0.025}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={OAK} roughness={0.82} />
        </RoundedBox>
        <RoundedBox
          position={[-0.012, 0.415, 0]}
          args={[2.11, 0.215, 1.6]}
          radius={0.075}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={LINEN} roughness={0.96} />
        </RoundedBox>
        <RoundedBox
          position={[-0.277, 0.487, 0]}
          args={[1.7, 0.19, 1.7]}
          radius={0.09}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#ddd2bf" roughness={1} />
        </RoundedBox>
        <RoundedBox
          position={[-0.735, 0.498, 0]}
          args={[0.52, 0.19, 1.704]}
          radius={0.075}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={SAGE} roughness={1} />
        </RoundedBox>
        {[-0.37, 0.37].map((z) => (
          <group key={z}>
            <RoundedBox
              position={[0.82, 0.652, z]}
              rotation={[0, 0, 0.96]}
              args={[0.45, 0.155, 0.65]}
              radius={0.074}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color={LINEN} roughness={1} />
            </RoundedBox>
            <RoundedBox
              position={[0.608, 0.644, z]}
              rotation={[0, 0, 0.9]}
              args={[0.29, 0.13, 0.48]}
              radius={0.061}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color={SAGE} roughness={1} />
            </RoundedBox>
          </group>
        ))}
      </group>

      <group position={[3.46, 0, 0.744]}>
        <RoundedBox
          position={[0, 0.44, 0]}
          args={[0.53, 0.22, 0.55]}
          radius={0.018}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={OAK} roughness={0.82} />
        </RoundedBox>
        <mesh position={[-0.272, 0.446, 0]} castShadow>
          <boxGeometry args={[0.022, 0.027, 0.16]} />
          <meshStandardMaterial color="#594536" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.155, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.49, 0.04, 0.51]} />
          <meshStandardMaterial color={OAK} roughness={0.82} />
        </mesh>
        {[-0.218, 0.218].flatMap((x) =>
          [-0.232, 0.232].map((z) => (
            <mesh key={`${x},${z}`} position={[x, 0.178, z]} castShadow>
              <boxGeometry args={[0.055, 0.325, 0.055]} />
              <meshStandardMaterial color={OAK} roughness={0.82} />
            </mesh>
          ))
        )}

        <mesh position={[0.036, 0.567, 0]}>
          <cylinderGeometry args={[0.089, 0.1, 0.032, 20]} />
          <meshStandardMaterial color="#725740" roughness={0.7} />
        </mesh>
        <mesh position={[0.036, 0.666, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.18, 12]} />
          <meshStandardMaterial color="#725740" roughness={0.7} />
        </mesh>
        <mesh position={[0.036, 0.782, 0]}>
          <sphereGeometry args={[0.144, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color="#e8d7b9"
            roughness={0.86}
            emissive="#a96932"
            emissiveIntensity={night ? 0.75 : 0.4}
          />
        </mesh>
        <mesh position={[0.036, 0.782, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.143, 24]} />
          <meshStandardMaterial
            color="#ffe3b1"
            emissive="#f3bb76"
            emissiveIntensity={night ? 1.1 : 0.6}
          />
        </mesh>
        <pointLight
          position={[0.036, 0.745, 0]}
          color="#ffd09a"
          intensity={night ? 1.2 : 0.75}
          distance={night ? 2 : 1.5}
        />
      </group>
    </group>
  )
}
