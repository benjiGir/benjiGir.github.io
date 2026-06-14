import { useState } from 'react'
import { useDeskStore } from '@/store/useDeskStore'
import { playClick } from '@/lib/audio'

// ─── Sit-stand toggle button ───────────────────────────────────────────────────

export function SitStandPanel() {
  const [hovered, setHovered] = useState(false)
  const { isStanding, toggleHeight } = useDeskStore()

  return (
    <mesh
      position={[0.668, 0.45, 0.32]}
      onClick={() => {
        playClick()
        toggleHeight()
      }}
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
