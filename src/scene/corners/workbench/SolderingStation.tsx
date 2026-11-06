import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import { CatmullRomCurve3, SRGBColorSpace, Vector3 } from 'three'

const CABLE = new CatmullRomCurve3([
  new Vector3(0.327, 0.931, 0.048),
  new Vector3(0.307, 0.928, 0.111),
  new Vector3(0.31, 0.838, 0.17),
  new Vector3(0.362, 0.768, 0.172),
  new Vector3(0.454, 0.767, 0.077),
  new Vector3(0.43, 0.779, -0.03),
  new Vector3(0.435, 0.796, -0.107),
])

export function SolderingStation() {
  const display = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 96
    const context = canvas.getContext('2d')
    if (!context) return canvas

    context.fillStyle = '#141f20'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#f6aa65'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.font = 'bold 58px monospace'
    context.fillText('320 °C', 128, 51)
    return canvas
  }, [])

  return (
    <group>
      <group position={[0.487, 0.824, -0.202]}>
        <RoundedBox args={[0.235, 0.128, 0.184]} radius={0.01} castShadow receiveShadow>
          <meshStandardMaterial color="#3c494d" roughness={0.68} />
        </RoundedBox>
        <mesh position={[-0.034, 0.017, 0.093]}>
          <planeGeometry args={[0.108, 0.04]} />
          <meshBasicMaterial>
            <canvasTexture attach="map" args={[display]} colorSpace={SRGBColorSpace} />
          </meshBasicMaterial>
        </mesh>
        <mesh position={[0.064, -0.012, 0.099]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.022, 0.024, 0.018, 16]} />
          <meshStandardMaterial color="#222829" roughness={0.65} />
        </mesh>
        <mesh position={[0.064, 0.003, 0.109]}>
          <boxGeometry args={[0.003, 0.009, 0.002]} />
          <meshStandardMaterial color="#bdb2a1" roughness={0.67} />
        </mesh>
        <mesh position={[-0.052, -0.028, 0.093]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.009, 0.009, 0.006, 12]} />
          <meshStandardMaterial color="#1d2425" roughness={0.65} />
        </mesh>
        {[-0.04, -0.024, -0.008, 0.008, 0.024, 0.04].map((x) => (
          <mesh key={x} position={[x, 0.064, -0.034]}>
            <boxGeometry args={[0.006, 0.002, 0.052]} />
            <meshStandardMaterial color="#2a3437" roughness={0.8} />
          </mesh>
        ))}
      </group>
      <mesh>
        <tubeGeometry args={[CABLE, 32, 0.0035, 6, false]} />
        <meshStandardMaterial color="#242a2b" roughness={0.91} />
      </mesh>
    </group>
  )
}
