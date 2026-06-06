import { useEffect, useRef } from 'react'
import { CameraControls } from '@react-three/drei'
import { useCameraStore } from '@/store/useCameraStore'

// Dalle écran centrée à y≈1.13, z≈-0.2
const PRESETS = {
  overview: { pos: [0, 1.8, 3.2] as const, target: [0, 0.75, 0] as const },
  screen: { pos: [0, 1.13, 0.85] as const, target: [0, 1.13, -0.2] as const },
}

export default function CameraRig() {
  const ref = useRef<CameraControls>(null)
  const preset = useCameraStore((s) => s.preset)

  useEffect(() => {
    const p = PRESETS[preset]
    ref.current?.setLookAt(
      p.pos[0], p.pos[1], p.pos[2],
      p.target[0], p.target[1], p.target[2],
      true
    )
  }, [preset])

  return (
    <CameraControls
      ref={ref}
      makeDefault
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.1}
      minAzimuthAngle={-Math.PI / 2.5}
      maxAzimuthAngle={Math.PI / 2.5}
      minDistance={0.6}
      maxDistance={5}
    />
  )
}
