import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CameraControls, CameraControlsImpl } from '@react-three/drei'
import { Box3, MathUtils, PerspectiveCamera, Ray, Vector3 } from 'three'
import { useEditorStore } from '@/editor/useEditorStore'
import { useCameraStore } from '@/store/useCameraStore'
import { useScreenStore } from '@/store/useScreenStore'
import { ROOM_BACK_Z, ROOM_FRONT_Z, ROOM_WIDTH } from '@/scene/roomLayout'
import { POIS, type PoiId } from './pois'

const { ACTION } = CameraControlsImpl

// Marge intérieure sur les murs, le sol et le plafond (à 2,9 m).
// Le côté ouvert à l'avant conserve la position de départ de la vue d'ensemble.
const ROOM_BOUNDS = new Box3(
  new Vector3(-ROOM_WIDTH / 2 + 0.18, 0.18, ROOM_BACK_Z + 0.18),
  new Vector3(ROOM_WIDTH / 2 - 0.18, 2.72, ROOM_FRONT_Z - 0.03)
)
const TARGET_BOUNDS = ROOM_BOUNDS.clone().expandByScalar(-0.08)
const roomRay = new Ray()
const moveTarget = new Vector3()
const movePosition = new Vector3()
const moveDirection = new Vector3()
const forward = new Vector3()
const NAVIGATION_KEYS = new Set([
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'ArrowUp',
  'ArrowLeft',
  'ArrowDown',
  'ArrowRight',
])

function canUseNavigationKeys() {
  return (
    useCameraStore.getState().poi === 'overview' &&
    !useEditorStore.getState().enabled &&
    !useScreenStore.getState().isFullscreen
  )
}

function placeView(controls: CameraControls, poi: PoiId, overviewShift: number, animate: boolean) {
  const { pos, target: baseTarget, minDist, maxDist } = POIS[poi]
  const target = [baseTarget[0] + overviewShift, baseTarget[1], baseTarget[2]] as const
  const x = pos[0] - target[0]
  const y = pos[1] - target[1]
  const z = pos[2] - target[2]
  const azimuth = Math.atan2(x, z)
  const polar = Math.atan2(Math.hypot(x, z), y)
  const overview = poi === 'overview'
  const orbit = poi === 'screen' ? 0.07 : 0.12

  controls.cancel()
  controls.setBoundary(TARGET_BOUNDS)
  controls.minDistance = overview ? 0.95 : minDist
  controls.maxDistance = overview ? 6.2 : Math.max(maxDist, Math.hypot(x, y, z))
  controls.minAzimuthAngle = overview ? azimuth - 1.05 : azimuth - orbit
  controls.maxAzimuthAngle = overview ? azimuth + 1.05 : azimuth + orbit
  controls.minPolarAngle = overview ? 0.95 : polar - 0.13
  controls.maxPolarAngle = overview ? 1.92 : polar + (poi === 'screen' ? 0.055 : 0.13)

  controls.mouseButtons.right = overview ? ACTION.TRUCK : ACTION.NONE
  controls.touches.two = overview ? ACTION.TOUCH_DOLLY_TRUCK : ACTION.TOUCH_DOLLY
  controls.touches.three = ACTION.NONE

  return controls.setLookAt(...pos, ...target, animate)
}

export default function CameraRig() {
  const ref = useRef<CameraControls>(null)
  const canvas = useThree((s) => s.gl.domElement)
  const camera = useThree((s) => s.camera)
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height))
  const poi = useCameraStore((s) => s.poi)
  const viewRequest = useCameraStore((s) => s.viewRequest)
  const view = useMemo(() => ({ poi, viewRequest }), [poi, viewRequest])
  const appliedView = useRef<typeof view | null>(null)
  const transitioning = useRef(false)
  const keys = useRef(new Set<string>())
  const moveVelocity = useRef(new Vector3())

  useLayoutEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return

    // Garde les deux côtés de la pièce lisibles quand la fenêtre se rétrécit.
    const roomFov = MathUtils.radToDeg(2 * Math.atan(1.02 / Math.max(aspect, 0.1)))
    camera.fov = MathUtils.clamp(roomFov, 52, 73)
    camera.updateProjectionMatrix()
  }, [aspect, camera])

  useEffect(() => {
    const previousTabIndex = canvas.getAttribute('tabindex')
    const previousLabel = canvas.getAttribute('aria-label')
    canvas.tabIndex = 0
    canvas.setAttribute(
      'aria-label',
      'Chambre en 3D. Flèches ou ZQSD pour se déplacer en vue d’ensemble.'
    )

    const clearKeys = () => {
      keys.current.clear()
      moveVelocity.current.set(0, 0, 0)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.target !== canvas ||
        event.defaultPrevented ||
        event.isComposing ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        !NAVIGATION_KEYS.has(event.code) ||
        !canUseNavigationKeys()
      ) {
        return
      }

      event.preventDefault()
      if (!event.repeat) keys.current.add(event.code)
    }
    const onKeyUp = (event: KeyboardEvent) => {
      keys.current.delete(event.code)
    }

    canvas.addEventListener('keydown', onKeyDown)
    canvas.addEventListener('keyup', onKeyUp)
    canvas.addEventListener('blur', clearKeys)
    window.addEventListener('blur', clearKeys)
    return () => {
      canvas.removeEventListener('keydown', onKeyDown)
      canvas.removeEventListener('keyup', onKeyUp)
      canvas.removeEventListener('blur', clearKeys)
      window.removeEventListener('blur', clearKeys)
      if (previousTabIndex === null) canvas.removeAttribute('tabindex')
      else canvas.setAttribute('tabindex', previousTabIndex)
      if (previousLabel === null) canvas.removeAttribute('aria-label')
      else canvas.setAttribute('aria-label', previousLabel)
      clearKeys()
    }
  }, [canvas])

  useFrame((_, delta) => {
    const controls = ref.current
    if (!controls) return

    if (useEditorStore.getState().enabled) {
      // La freecam écrit sa propre pose. Restaure le cadrage du POI à la sortie.
      appliedView.current = null
      keys.current.clear()
      moveVelocity.current.set(0, 0, 0)
      return
    }

    if (appliedView.current !== view) {
      const animate =
        appliedView.current !== null &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      appliedView.current = view
      transitioning.current = animate
      keys.current.clear()
      moveVelocity.current.set(0, 0, 0)
      const overviewShift =
        view.poi === 'overview' ? -2.6 * MathUtils.clamp((1.15 - aspect) / 0.69, 0, 1) : 0
      void placeView(controls, view.poi, overviewShift, animate).then(() => {
        if (appliedView.current === view) transitioning.current = false
      })
    }

    if (!canUseNavigationKeys()) {
      keys.current.clear()
      moveVelocity.current.set(0, 0, 0)
      return
    }

    if (transitioning.current || controls.currentAction !== ACTION.NONE) {
      moveVelocity.current.set(0, 0, 0)
      return
    }

    const held = keys.current
    const velocity = moveVelocity.current
    if (held.size === 0 && velocity.lengthSq() < 0.0001) return

    const depth =
      Number(held.has('KeyW') || held.has('ArrowUp')) -
      Number(held.has('KeyS') || held.has('ArrowDown'))
    const strafe =
      Number(held.has('KeyD') || held.has('ArrowRight')) -
      Number(held.has('KeyA') || held.has('ArrowLeft'))
    forward.set(0, 0, -1).applyQuaternion(camera.quaternion).setY(0).normalize()
    moveDirection
      .set(forward.x * depth - forward.z * strafe, 0, forward.z * depth + forward.x * strafe)
      .normalize()
      .multiplyScalar(1.8)

    const step = Math.min(delta, 0.05)
    velocity.lerp(moveDirection, 1 - Math.exp(-16 * step))
    if (velocity.lengthSq() < 0.0001) return

    controls.getTarget(moveTarget, false)
    // Repart de la position visible si l'orbite a été raccourcie contre un mur.
    const visibleDistance = camera.position.distanceTo(moveTarget)
    if (visibleDistance < controls.distance - 0.0001) controls.distance = visibleDistance

    movePosition.copy(camera.position).addScaledVector(velocity, step)
    ROOM_BOUNDS.clampPoint(movePosition, movePosition)
    moveTarget.add(movePosition.sub(camera.position))
    void controls.moveTo(moveTarget.x, moveTarget.y, moveTarget.z)
  }, -2)

  useFrame(() => {
    const controls = ref.current
    if (
      !controls ||
      useEditorStore.getState().enabled ||
      ROOM_BOUNDS.containsPoint(camera.position)
    ) {
      return
    }

    // Raccourcit le rayon d'orbite au mur, sans modifier la direction du regard.
    controls.getTarget(roomRay.origin, false)
    roomRay.direction.subVectors(camera.position, roomRay.origin)
    if (!roomRay.intersectBox(ROOM_BOUNDS, camera.position)) {
      ROOM_BOUNDS.clampPoint(camera.position, camera.position)
    }
    camera.updateMatrixWorld()
  }, -0.5)

  return <CameraControls ref={ref} domElement={canvas} makeDefault />
}
