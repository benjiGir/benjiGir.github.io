import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { CatmullRomCurve3, SRGBColorSpace, Vector3 } from 'three'
import { CABINET_TOP_Y } from './retroLayout'

const SHELL = '#44404a'
const LOWER_SHELL = '#29282d'
const TRIM = '#a69ca3'
const BUTTON = '#282932'
const CARTRIDGE_RED = '#924f52'

const PAD_CABLE = new CatmullRomCurve3([
  new Vector3(-0.09, 0.022, 0.105),
  new Vector3(-0.101, 0.012, 0.136),
  new Vector3(-0.135, 0.006, 0.174),
  new Vector3(-0.105, 0.006, 0.207),
  new Vector3(-0.033, 0.007, 0.202),
  new Vector3(0.014, 0.016, 0.168),
])

function makePongLabel() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  ctx.fillStyle = '#1f272a'
  ctx.fillRect(0, 0, 256, 128)
  ctx.fillStyle = '#c27363'
  ctx.fillRect(0, 0, 256, 13)
  ctx.fillStyle = '#91b6a6'
  ctx.fillRect(16, 69, 6, 28)
  ctx.fillRect(234, 50, 6, 28)
  ctx.fillRect(204, 76, 8, 8)
  ctx.fillStyle = '#e9d9b7'
  ctx.textAlign = 'center'
  ctx.font = 'bold 54px monospace'
  ctx.fillText('PONG', 127, 79)
  ctx.font = 'bold 15px monospace'
  ctx.fillText('SÉRIE ARCADE  01', 128, 106)
  return canvas
}

function Cartridge({ color, label }: { color: string; label?: HTMLCanvasElement }) {
  return (
    <>
      <RoundedBox args={[0.126, 0.074, 0.02]} radius={0.004} smoothness={2} castShadow>
        <meshStandardMaterial color={color} roughness={0.82} />
      </RoundedBox>
      <mesh position={[0, 0.007, 0.0105]}>
        <planeGeometry args={[0.103, 0.045]} />
        {label ? (
          <meshStandardMaterial roughness={0.86}>
            <canvasTexture attach="map" args={[label]} colorSpace={SRGBColorSpace} />
          </meshStandardMaterial>
        ) : (
          <meshStandardMaterial color="#c4b698" roughness={0.88} />
        )}
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.053, -0.019, 0.01]}>
          <boxGeometry args={[0.012, 0.013, 0.003]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
    </>
  )
}

function Gamepad() {
  return (
    <group position={[0.017, 0, 0.214]} rotation={[0, 0.12, 0]}>
      <RoundedBox
        position={[0, 0.012, 0]}
        args={[0.154, 0.024, 0.092]}
        radius={0.011}
        smoothness={3}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={LOWER_SHELL} roughness={0.65} />
      </RoundedBox>
      <RoundedBox
        position={[0, 0.023, 0]}
        args={[0.145, 0.008, 0.082]}
        radius={0.003}
        smoothness={2}
        receiveShadow
      >
        <meshStandardMaterial color={TRIM} roughness={0.79} />
      </RoundedBox>
      <group position={[-0.043, 0.028, 0.004]}>
        <mesh>
          <cylinderGeometry args={[0.018, 0.018, 0.002, 16]} />
          <meshStandardMaterial color="#80767f" roughness={0.86} />
        </mesh>
        <mesh position={[0, 0.002, 0]}>
          <boxGeometry args={[0.03, 0.005, 0.011]} />
          <meshStandardMaterial color={BUTTON} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.002, 0]}>
          <boxGeometry args={[0.011, 0.005, 0.03]} />
          <meshStandardMaterial color={BUTTON} roughness={0.7} />
        </mesh>
      </group>
      {[[-0.007, 0.014], [0.01, 0.014]].map(([x, z]) => (
        <mesh key={x} position={[x, 0.028, z]} rotation={[0, 0.24, 0]}>
          <boxGeometry args={[0.011, 0.003, 0.006]} />
          <meshStandardMaterial color="#57515b" roughness={0.84} />
        </mesh>
      ))}
      {[[0.034, 0.009], [0.055, -0.009]].map(([x, z], index) => (
        <mesh key={x} position={[x, 0.029, z]} castShadow>
          <cylinderGeometry args={[0.0085, 0.0085, 0.006, 12]} />
          <meshStandardMaterial color={index === 0 ? '#9c575d' : '#623f53'} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

interface ConsoleProps {
  on: boolean
  canStart: boolean
  onStart: (event: ThreeEvent<MouseEvent>) => void
}

export function Console({ on, canStart, onStart }: ConsoleProps) {
  const label = useMemo(() => makePongLabel(), [])
  const action = canStart ? onStart : undefined
  const showPointer = canStart ? () => (document.body.style.cursor = 'pointer') : undefined
  const hidePointer = canStart ? () => (document.body.style.cursor = 'auto') : undefined

  return (
    <group position={[0.31, CABINET_TOP_Y, -0.064]}>
      <RoundedBox
        position={[0, 0.014, 0]}
        args={[0.31, 0.028, 0.216]}
        radius={0.009}
        smoothness={3}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={LOWER_SHELL} roughness={0.76} />
      </RoundedBox>
      <RoundedBox
        position={[0, 0.036, -0.008]}
        args={[0.298, 0.032, 0.195]}
        radius={0.008}
        smoothness={3}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={SHELL} roughness={0.64} />
      </RoundedBox>
      <mesh position={[0.001, 0.0525, -0.034]}>
        <boxGeometry args={[0.151, 0.002, 0.033]} />
        <meshStandardMaterial color="#201f26" roughness={0.92} />
      </mesh>
      <group
        position={[0, 0.083, -0.034]}
        onClick={action}
        onPointerOver={showPointer}
        onPointerOut={hidePointer}
      >
        <Cartridge color={CARTRIDGE_RED} label={label} />
      </group>
      <mesh position={[0, 0.02, 0.108]}>
        <boxGeometry args={[0.246, 0.013, 0.003]} />
        <meshStandardMaterial color="#777178" roughness={0.69} />
      </mesh>
      {[-0.09, -0.04].map((x) => (
        <mesh key={x} position={[x, 0.021, 0.111]}>
          <boxGeometry args={[0.027, 0.011, 0.006]} />
          <meshStandardMaterial color={BUTTON} roughness={0.84} />
        </mesh>
      ))}
      <group
        position={[0.098, 0.054, 0.052]}
        onClick={action}
        onPointerOver={showPointer}
        onPointerOut={hidePointer}
      >
        <mesh>
          <boxGeometry args={[0.052, 0.01, 0.032]} />
          <meshStandardMaterial color="#86646c" roughness={0.63} />
        </mesh>
        <mesh position={[0, 0.0052, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.0048, 0.0062, 16, 1, Math.PI * 0.68, Math.PI * 1.64]} />
          <meshStandardMaterial color="#dfcfc0" roughness={0.84} />
        </mesh>
        <mesh position={[0, 0.0052, -0.0042]}>
          <boxGeometry args={[0.0014, 0.001, 0.006]} />
          <meshStandardMaterial color="#dfcfc0" roughness={0.84} />
        </mesh>
      </group>
      <mesh position={[0.106, 0.021, 0.111]}>
        <boxGeometry args={[0.015, 0.006, 0.002]} />
        <meshStandardMaterial
          color={on ? '#a6df8e' : '#393d35'}
          emissive="#84d66f"
          emissiveIntensity={on ? 0.55 : 0}
        />
      </mesh>
      {[-0.028, -0.008, 0.012, 0.032].map((z) => (
        <mesh key={z} position={[-0.113, 0.0525, z]}>
          <boxGeometry args={[0.043, 0.0015, 0.004]} />
          <meshStandardMaterial color="#2e2d34" roughness={0.84} />
        </mesh>
      ))}
      <mesh>
        <tubeGeometry args={[PAD_CABLE, 28, 0.003, 6, false]} />
        <meshStandardMaterial color="#242428" roughness={0.88} />
      </mesh>
      <Gamepad />
      <group position={[0.237, 0, -0.003]}>
        <group position={[0, 0.0105, 0.014]} rotation={[-Math.PI / 2, 0, 0.12]}>
          <Cartridge color="#485a67" />
        </group>
        <group position={[0, 0.022, -0.065]} rotation={[-1.21, 0, -0.08]}>
          <Cartridge color="#6c7b69" />
        </group>
      </group>
    </group>
  )
}
