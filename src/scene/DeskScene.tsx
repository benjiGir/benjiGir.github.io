import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { usePowerStore } from '@/store/usePowerStore'
import { useDeskStore } from '@/store/useDeskStore'
import { useScreenStore } from '@/store/useScreenStore'
import ScreenContent from '@/os/ScreenContent'
import { playClick } from '@/lib/audio'

// ─── Floor ────────────────────────────────────────────────────────────────────

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[12, 12]} />
      <meshStandardMaterial color="#b0a89a" roughness={0.9} metalness={0.0} />
    </mesh>
  )
}

// ─── Desk frame (static) ──────────────────────────────────────────────────────

function DeskFrame() {
  const legPositions: [number, number, number][] = [
    [0.64, 0.375, 0.32],
    [-0.64, 0.375, 0.32],
    [0.64, 0.375, -0.32],
    [-0.64, 0.375, -0.32],
  ]
  return (
    <>
      {legPositions.map((pos, i) => (
        <mesh key={i} position={pos} castShadow receiveShadow>
          <boxGeometry args={[0.05, 0.72, 0.05]} />
          <meshStandardMaterial color="#444444" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
    </>
  )
}

// ─── Sit-stand toggle button ───────────────────────────────────────────────────

function SitStandPanel() {
  const [hovered, setHovered] = useState(false)
  const { isStanding, toggleHeight } = useDeskStore()

  return (
    <mesh
      position={[0.668, 0.45, 0.32]}
      onClick={() => { playClick(); toggleHeight() }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer'
        setHovered(true)
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
        setHovered(false)
      }}
    >
      <boxGeometry args={[0.015, 0.04, 0.03]} />
      <meshStandardMaterial
        color={isStanding ? '#3399ff' : hovered ? '#aaaaaa' : '#888888'}
        roughness={0.3}
        metalness={0.7}
        emissive={isStanding ? '#0055cc' : '#000000'}
        emissiveIntensity={isStanding ? 0.6 : 0}
      />
    </mesh>
  )
}

// ─── Desk top ─────────────────────────────────────────────────────────────────

function DeskTop() {
  return (
    <mesh position={[0, 0.735, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.4, 0.03, 0.7]} />
      <meshStandardMaterial color="#7a5c3a" roughness={0.6} metalness={0.05} />
    </mesh>
  )
}

// ─── Monitor ──────────────────────────────────────────────────────────────────

function Monitor() {
  const power = usePowerStore((s) => s.power)
  const isFullscreen = useScreenStore((s) => s.isFullscreen)
  const screenMatRef = useRef<THREE.MeshStandardMaterial>(null)

  useFrame((_, delta) => {
    if (!screenMatRef.current) return
    const target = power === 'off' ? 0 : power === 'booting' ? 0.6 : 1.2
    screenMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      screenMatRef.current.emissiveIntensity,
      target,
      1 - Math.exp(-delta * 2.5)
    )
  })

  return (
    <group position={[0, 0, -0.2]}>
      {/* Stand base */}
      <mesh position={[0, 0.76, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.28, 0.02, 0.16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Stand column */}
      <mesh position={[0, 0.84, 0]} castShadow>
        <boxGeometry args={[0.04, 0.16, 0.04]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Bezel */}
      <mesh position={[0, 1.13, 0]} castShadow>
        <boxGeometry args={[0.75, 0.45, 0.04]} />
        <meshStandardMaterial color="#111111" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Dalle (Monitor_Screen) */}
      <mesh name="Monitor_Screen" position={[0, 1.13, 0.022]}>
        <boxGeometry args={[0.685, 0.385, 0.001]} />
        <meshStandardMaterial
          ref={screenMatRef}
          color="#04040e"
          emissive="#a0b4ff"
          emissiveIntensity={0}
          roughness={0.05}
          metalness={0.1}
        />
      </mesh>
      {/* Contenu HTML — masqué en fullscreen (rendu dans FullscreenOverlay à la place) */}
      {power !== 'off' && !isFullscreen && (
        <Html transform scale={0.0215} position={[0, 1.13, 0.025]}>
          <div style={{ width: 1280, height: 720, overflow: 'hidden', borderRadius: 4 }}>
            <ScreenContent />
          </div>
        </Html>
      )}
    </group>
  )
}

// ─── Tower ────────────────────────────────────────────────────────────────────

function Tower() {
  const [hovered, setHovered] = useState(false)
  const power = usePowerStore((s) => s.power)
  const pressPower = usePowerStore((s) => s.pressPower)
  const ledMatRef = useRef<THREE.MeshStandardMaterial>(null)

  const ledColor = '#00ff44'

  useFrame(({ clock }, delta) => {
    if (!ledMatRef.current) return
    if (power === 'booting') {
      ledMatRef.current.emissiveIntensity = Math.sin(clock.elapsedTime * 9) > 0 ? 5 : 0
    } else {
      const target = power === 'on' ? 3 : 0
      ledMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        ledMatRef.current.emissiveIntensity,
        target,
        1 - Math.exp(-delta * 4)
      )
    }
  })

  return (
    <group position={[0.48, 0.97, -0.17]}>
      <mesh name="Tower_Body" castShadow receiveShadow>
        <boxGeometry args={[0.18, 0.44, 0.38]} />
        <meshStandardMaterial color="#1e1e1e" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Bouton power — face avant */}
      <mesh
        name="Tower_PowerButton"
        position={[0, 0.12, 0.193]}
        rotation={[Math.PI / 2, 0, 0]}
        onClick={power === 'off' ? () => { playClick(); pressPower() } : undefined}
        onPointerOver={() => {
          if (power === 'off') document.body.style.cursor = 'pointer'
          setHovered(true)
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
          setHovered(false)
        }}
        castShadow
      >
        <cylinderGeometry args={[0.012, 0.012, 0.008, 16]} />
        <meshStandardMaterial
          color={hovered && power === 'off' ? '#ffffff' : '#cccccc'}
          roughness={0.2}
          metalness={0.9}
          emissive={hovered && power === 'off' ? '#ffffff' : '#000000'}
          emissiveIntensity={hovered && power === 'off' ? 0.4 : 0}
        />
      </mesh>
      {/* LED — face avant */}
      <mesh name="Tower_LED" position={[0.05, 0.12, 0.193]}>
        <sphereGeometry args={[0.008, 12, 12]} />
        <meshStandardMaterial
          ref={ledMatRef}
          color={ledColor}
          emissive={ledColor}
          emissiveIntensity={0}
        />
      </mesh>
    </group>
  )
}

// ─── Lift group ───────────────────────────────────────────────────────────────

function DeskLiftGroup() {
  const ref = useRef<THREE.Group>(null)
  const isStanding = useDeskStore((s) => s.isStanding)

  useFrame((_, delta) => {
    if (!ref.current) return
    const target = isStanding ? 0.3 : 0
    ref.current.position.y = THREE.MathUtils.lerp(
      ref.current.position.y,
      target,
      1 - Math.exp(-delta * 3)
    )
  })

  return (
    <group ref={ref}>
      <DeskTop />
      <Monitor />
      <Tower />
    </group>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function DeskScene() {
  return (
    <group>
      <Floor />
      <DeskFrame />
      <SitStandPanel />
      <DeskLiftGroup />
    </group>
  )
}
