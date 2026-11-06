import { useLayoutEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { CameraControls, CameraControlsImpl } from '@react-three/drei'
import { MathUtils, PerspectiveCamera } from 'three'
import { useCameraStore } from '@/store/useCameraStore'
import { ROOM_WIDTH } from '@/scene/roomLayout'
import { POIS } from './pois'

export default function CameraRig() {
  const ref = useRef<CameraControls>(null)
  const hasInitialPose = useRef(false)
  const poi = useCameraStore((s) => s.poi)
  const camera = useThree((s) => s.camera)
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height))
  const overviewShift =
    poi === 'overview' ? -2.6 * MathUtils.clamp((1.15 - aspect) / 0.69, 0, 1) : 0

  useLayoutEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return

    // Garde les deux côtés de la pièce lisibles quand la fenêtre se rétrécit.
    const roomFov = MathUtils.radToDeg(2 * Math.atan(1.02 / Math.max(aspect, 0.1)))
    camera.fov = MathUtils.clamp(roomFov, 52, 73)
    camera.updateProjectionMatrix()
  }, [aspect, camera])

  useLayoutEffect(() => {
    const controls = ref.current
    if (!controls) return

    const { pos, target: baseTarget, minDist, maxDist } = POIS[poi]
    const target = [baseTarget[0] + overviewShift, baseTarget[1], baseTarget[2]] as const
    const x = pos[0] - target[0]
    const y = pos[1] - target[1]
    const z = pos[2] - target[2]
    const azimuth = Math.atan2(x, z)
    const polar = Math.atan2(Math.hypot(x, z), y)
    const orbit = poi === 'overview' ? 0.34 : poi === 'screen' ? 0.07 : 0.12

    controls.minDistance = minDist
    controls.maxDistance = Math.max(maxDist, Math.hypot(x, y, z))
    const leftWallLimit = Math.asin(
      MathUtils.clamp((-ROOM_WIDTH / 2 + 0.48 - target[0]) / controls.maxDistance, -1, 1)
    )
    controls.minAzimuthAngle =
      overviewShift < 0 ? Math.max(-0.42, leftWallLimit) : azimuth - orbit
    controls.maxAzimuthAngle = azimuth + orbit
    controls.minPolarAngle = polar - 0.13
    controls.maxPolarAngle = polar + (poi === 'overview' ? 0.08 : poi === 'screen' ? 0.055 : 0.13)

    // Le panoramique libre permettrait de traverser les murs ou les meubles.
    controls.mouseButtons.right = CameraControlsImpl.ACTION.NONE
    controls.touches.two = CameraControlsImpl.ACTION.TOUCH_DOLLY
    controls.touches.three = CameraControlsImpl.ACTION.NONE

    void controls.setLookAt(...pos, ...target, hasInitialPose.current)
    hasInitialPose.current = true
  }, [overviewShift, poi])

  return <CameraControls ref={ref} makeDefault />
}
