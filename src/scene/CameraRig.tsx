import { useEffect, useRef } from 'react'
import { CameraControls } from '@react-three/drei'
import { useCameraStore } from '@/store/useCameraStore'
import { POIS } from '@/scene/pois'

/** Bornes de distance par défaut (vue d'ensemble) — réappliquées quand le POI actif n'en définit pas. */
const DEFAULT_MIN_DISTANCE = 0.6
const DEFAULT_MAX_DISTANCE = 7

export default function CameraRig() {
  const ref = useRef<CameraControls>(null)
  const poi = useCameraStore((s) => s.poi)

  useEffect(() => {
    const controls = ref.current
    if (!controls) return
    const p = POIS[poi]

    controls.minDistance = p.minDist ?? DEFAULT_MIN_DISTANCE
    controls.maxDistance = p.maxDist ?? DEFAULT_MAX_DISTANCE

    void controls.setLookAt(
      p.pos[0], p.pos[1], p.pos[2],
      p.target[0], p.target[1], p.target[2],
      true
    )
  }, [poi])

  return (
    <CameraControls
      ref={ref}
      makeDefault
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.1}
      minAzimuthAngle={-Math.PI / 2.2}
      maxAzimuthAngle={Math.PI / 2.2}
      minDistance={DEFAULT_MIN_DISTANCE}
      maxDistance={DEFAULT_MAX_DISTANCE}
    />
  )
}
