import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDeskStore } from '@/store/useDeskStore'
import { DeskTop } from './DeskTop'
import { Monitor } from './Monitor'
import { Tower } from './Tower'
import { Keyboard } from './Keyboard'
import { Mouse } from './Mouse'
import { DeskLamp } from './DeskLamp'

// ─── Lift group ───────────────────────────────────────────────────────────────

export function DeskLiftGroup() {
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
      <Keyboard />
      <Mouse />
      <DeskLamp />
    </group>
  )
}
