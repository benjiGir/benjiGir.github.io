import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { usePowerStore } from '@/store/usePowerStore'
import { useScreenStore } from '@/store/useScreenStore'
import Hotspot from '@/scene/camera/Hotspot'

// ─── Monitor ──────────────────────────────────────────────────────────────────

export function Monitor() {
  const power = usePowerStore((s) => s.power)
  const setDockedEl = useScreenStore((s) => s.setDockedEl)
  const isFullscreen = useScreenStore((s) => s.isFullscreen)
  const screenMatRef = useRef<THREE.MeshStandardMaterial>(null)

  useFrame((_, delta) => {
    if (!screenMatRef.current) return
    // Fondu progressif vers le noir pendant l'extinction plutôt qu'un saut brutal à 'off'
    const target = power === 'off' || power === 'shuttingDown' ? 0 : power === 'on' ? 1.2 : 0.6
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
      {/* Bezel + dalle — cliquables : zoom caméra sur l'écran (POI 'screen') */}
      <Hotspot poi="screen" label="Zoomer sur l'écran" position={[0, 1.13, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.75, 0.45, 0.04]} />
          <meshStandardMaterial color="#111111" roughness={0.5} metalness={0.4} />
        </mesh>
        {/* Dalle (Monitor_Screen) */}
        <mesh name="Monitor_Screen" position={[0, 0, 0.022]}>
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
      </Hotspot>
      {/* Conteneur cible du portail d'écran — ScreenContent y est projeté par <ScreenPortal />, ce qui
          le garde monté en permanence (état OS préservé) lors des bascules plein écran. */}
      {power !== 'off' && (
        <Html
          transform
          scale={0.0215}
          position={[0, 1.13, 0.025]}
          pointerEvents={isFullscreen ? 'none' : 'auto'}
        >
          <div
            ref={(el) => setDockedEl(el)}
            style={{ width: 1280, height: 720, overflow: 'hidden', borderRadius: 4 }}
          />
        </Html>
      )}
    </group>
  )
}
