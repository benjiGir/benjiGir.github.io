import { RoundedBox } from '@react-three/drei'
import { CatmullRomCurve3, Vector3 } from 'three'

const JUMPER = new CatmullRomCurve3([
  new Vector3(-0.621, 0.768, 0.23),
  new Vector3(-0.649, 0.777, 0.195),
  new Vector3(-0.637, 0.784, 0.153),
  new Vector3(-0.594, 0.773, 0.139),
])

function ComponentTray() {
  return (
    <group position={[-0.51, 0.76, -0.188]}>
      <mesh position={[0, 0.006, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.282, 0.012, 0.17]} />
        <meshStandardMaterial color="#505956" roughness={0.83} />
      </mesh>
      {[-0.135, -0.049, 0.044, 0.135].map((x) => (
        <mesh key={x} position={[x, 0.023, 0]}>
          <boxGeometry args={[0.01, 0.034, 0.162]} />
          <meshStandardMaterial color="#6b7773" roughness={0.8} />
        </mesh>
      ))}
      {[-0.08, 0.08].map((z) => (
        <mesh key={z} position={[0, 0.023, z]}>
          <boxGeometry args={[0.282, 0.034, 0.01]} />
          <meshStandardMaterial color="#6b7773" roughness={0.8} />
        </mesh>
      ))}
      {[[-0.104, -0.019], [-0.082, 0.026], [0.006, 0.018]].map(([x, z]) => (
        <mesh key={x} position={[x, 0.019, z]} rotation={[0, x * 6, 0]}>
          <boxGeometry args={[0.023, 0.012, 0.039]} />
          <meshStandardMaterial color="#232b2d" roughness={0.75} />
        </mesh>
      ))}
      <mesh position={[0.085, 0.026, -0.008]}>
        <cylinderGeometry args={[0.017, 0.017, 0.028, 14]} />
        <meshStandardMaterial color="#c39251" metalness={0.34} roughness={0.57} />
      </mesh>
    </group>
  )
}

function PrototypeBoard() {
  return (
    <group position={[-0.212, 0.769, 0.225]} rotation={[0, -0.13, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.128, 0.008, 0.073]} />
        <meshStandardMaterial color="#237668" roughness={0.68} />
      </mesh>
      <mesh position={[-0.011, 0.009, 0]} castShadow>
        <boxGeometry args={[0.05, 0.012, 0.037]} />
        <meshStandardMaterial color="#212e31" roughness={0.63} />
      </mesh>
      {[-0.029, -0.017, -0.005, 0.007].map((x) => (
        <mesh key={x} position={[x, 0.007, 0]}>
          <boxGeometry args={[0.004, 0.004, 0.053]} />
          <meshStandardMaterial color="#b4b9a4" metalness={0.56} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0.048, 0.01, 0.008]}>
        <boxGeometry args={[0.024, 0.014, 0.029]} />
        <meshStandardMaterial color="#b9b9b0" metalness={0.52} roughness={0.43} />
      </mesh>
    </group>
  )
}

function DesolderingPump() {
  return (
    <group position={[0.176, 0.775, 0.244]} rotation={[0, -0.17, Math.PI / 2]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.014, 0.014, 0.132, 16]} />
        <meshStandardMaterial color="#75979f" metalness={0.48} roughness={0.44} />
      </mesh>
      <mesh position={[0, -0.054, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.032, 16]} />
        <meshStandardMaterial color="#333d40" roughness={0.78} />
      </mesh>
      <mesh position={[0, 0.078, 0]}>
        <cylinderGeometry args={[0.005, 0.013, 0.026, 12]} />
        <meshStandardMaterial color="#d6d0b8" roughness={0.84} />
      </mesh>
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.009, 0.009, 0.021, 12]} />
        <meshStandardMaterial color="#252b2e" roughness={0.75} />
      </mesh>
      <mesh position={[0.014, -0.023, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.005, 0.005, 0.004, 10]} />
        <meshStandardMaterial color="#303d41" roughness={0.75} />
      </mesh>
    </group>
  )
}

export function BenchSupplies() {
  return (
    <group>
      <RoundedBox
        position={[-0.409, 0.7625, 0.119]}
        args={[0.565, 0.005, 0.351]}
        radius={0.002}
        receiveShadow
      >
        <meshStandardMaterial color="#3a6467" roughness={0.95} />
      </RoundedBox>
      <mesh position={[-0.409, 0.7652, 0.281]}>
        <boxGeometry args={[0.531, 0.001, 0.003]} />
        <meshStandardMaterial color="#699b97" roughness={0.94} />
      </mesh>
      <mesh>
        <tubeGeometry args={[JUMPER, 20, 0.0025, 5, false]} />
        <meshStandardMaterial color="#e7aa60" roughness={0.75} />
      </mesh>
      <PrototypeBoard />
      <ComponentTray />
      <DesolderingPump />
    </group>
  )
}
