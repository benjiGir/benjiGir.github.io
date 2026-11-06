import { useEffect, useMemo, useRef, type ComponentProps, type ReactNode, type RefObject } from 'react'
import { Html } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useEditorStore } from '@/editor/useEditorStore'
import { playClick, setMuted, unlockAudio } from '@/lib/audio'
import { ROBOT_MAT_CENTER } from '@/scene/roomLayout'
import { useAudioStore } from '@/store/useAudioStore'
import { useCameraStore, type PoiId } from '@/store/useCameraStore'
import { useScreenStore } from '@/store/useScreenStore'
import './hotspot.css'

type Destination = Exclude<PoiId, 'overview'>
type Point = readonly [number, number, number]
type Projection = NonNullable<ComponentProps<typeof Html>['calculatePosition']>

const MARKERS: Record<Destination, { position: Point; icon: string }> = {
  screen: {
    position: [0.06, 0.31, 0.21],
    icon: 'M3 4h18v12H3z M12 16v4m-4 0h8',
  },
  guitar: {
    position: [0.12, 0.98, 0.3],
    icon: 'M14 5v11a3 3 0 1 1-2-2.8V6l7-2v4l-5 1.5',
  },
  workbench: {
    position: [0.12, 1.25, 0.37],
    icon: 'M3 5h18v14H3z M5 12h4l2-4 2 8 2-4h4',
  },
  crt: {
    position: [-0.24, 1.13, 0.22],
    icon: 'M7 8h10c2 0 3 1 3.5 3l1 4c.5 2-1.5 3-3 2l-2.5-2H8l-2.5 2c-1.5 1-3.5 0-3-2l1-4C4 9 5 8 7 8z M8 10v4m-2-2h4m6-1h.01m2 2h.01',
  },
  legos: {
    position: [0.27, 0.43, 0.02],
    icon: 'M3 9h18v10H3z M6 9V5h4v4m4 0V5h4v4 M3 14h18',
  },
  robot: {
    // Le groupe est à l'origine du monde. Le repère reste associé au tapis.
    position: [ROBOT_MAT_CENTER[0], 0.58, ROBOT_MAT_CENTER[1] + 0.2],
    icon: 'M5 8h14v11H5z M12 8V4m-2 0h4 M2 12v4m20-4v4M9 12h.01m6 0h.01M9 16h6',
  },
}

const MARKER_LAYER = [7, 6]
const TAP_RADIUS_SQUARED = 25

interface HotspotProps {
  poi: Destination
  label: string
  position?: Point
  rotation?: Point
  onFocus?: () => void
  children: ReactNode
}

interface Press {
  pointerId: number
  x: number
  y: number
  dragged: boolean
}

type PointerStart = Pick<PointerEvent, 'pointerId' | 'clientX' | 'clientY' | 'button' | 'isPrimary'>

function movedBeyondTap(press: Press, event: Pick<MouseEvent, 'clientX' | 'clientY'>) {
  const dx = event.clientX - press.x
  const dy = event.clientY - press.y
  return dx * dx + dy * dy > TAP_RADIUS_SQUARED
}

function createProjection(buttonRef: RefObject<HTMLButtonElement | null>): Projection {
  const point = new Vector3()
  let current = [0, 0]
  let next = [0, 0]

  return (object, camera, size) => {
    point.setFromMatrixPosition(object.matrixWorld).project(camera)
    const x = ((point.x + 1) * size.width) / 2
    const y = ((1 - point.y) * size.height) / 2
    const button = buttonRef.current
    const offscreen = x < 18 || y < 18 || x > size.width - 18 || y > size.height - 18
    // Un repère sorti du cadre ne doit pas rester atteignable avec Tab.
    if (button && button.hidden !== offscreen) button.hidden = offscreen

    // Html conserve le dernier tableau. On alterne les buffers à chaque changement (eps = 0).
    if (x !== current[0] || y !== current[1]) {
      next[0] = x
      next[1] = y
      const previous = current
      current = next
      next = previous
    }

    return current
  }
}

export default function Hotspot({ poi, label, position, rotation, onFocus, children }: HotspotProps) {
  const overview = useCameraStore((s) => s.poi === 'overview')
  const editing = useEditorStore((s) => s.enabled)
  const fullscreen = useScreenStore((s) => s.isFullscreen)
  const enabled = overview && !editing && !fullscreen
  const pressRef = useRef<Press | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const projection = useMemo(() => createProjection(buttonRef), [])
  const marker = MARKERS[poi]

  useEffect(() => {
    if (!enabled) return

    // Le pointeur peut quitter le mesh ou le bouton puis revenir avant le clic.
    function trackPress(event: PointerEvent) {
      const press = pressRef.current
      if (!press || press.dragged) return

      if (event.type === 'pointerdown') {
        if (!event.isPrimary) press.dragged = true
      } else if (event.pointerId === press.pointerId) {
        if (event.type === 'pointercancel' || (event.buttons !== 0 && movedBeyondTap(press, event))) {
          press.dragged = true
        }
      }
    }

    window.addEventListener('pointerdown', trackPress, true)
    window.addEventListener('pointermove', trackPress, true)
    window.addEventListener('pointercancel', trackPress, true)

    return () => {
      window.removeEventListener('pointerdown', trackPress, true)
      window.removeEventListener('pointermove', trackPress, true)
      window.removeEventListener('pointercancel', trackPress, true)
      pressRef.current = null
    }
  }, [enabled])

  function startPress(event: PointerStart) {
    if (event.button !== 0 || !event.isPrimary) return
    pressRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      dragged: false,
    }
  }

  function consumeTap(event: Pick<MouseEvent, 'clientX' | 'clientY'>) {
    const press = pressRef.current
    pressRef.current = null
    return press !== null && !press.dragged && !movedBeyondTap(press, event)
  }

  function activate() {
    const camera = useCameraStore.getState()
    if (!enabled || camera.poi !== 'overview') return
    playClick()
    camera.focusOn(poi)
    onFocus?.()
  }

  function handleMeshClick(event: ThreeEvent<MouseEvent>) {
    if (event.button !== 0 || !consumeTap(event)) return
    event.stopPropagation()
    activate()
  }

  return (
    <group
      position={position}
      rotation={rotation}
      onPointerDown={enabled ? startPress : undefined}
      onClick={enabled ? handleMeshClick : undefined}
    >
      {children}
      {enabled && (
        <Html
          position={marker.position}
          calculatePosition={projection}
          eps={0}
          center
          zIndexRange={MARKER_LAYER}
          wrapperClass="scene-hotspot"
        >
          <button
            ref={buttonRef}
            type="button"
            className="scene-hotspot__button"
            data-poi={poi}
            aria-label={label}
            onPointerDown={(event) => {
              event.stopPropagation()
              startPress(event)
            }}
            onClick={(event) => {
              event.stopPropagation()
              if (event.detail !== 0) {
                if (!consumeTap(event)) return
                // Le pointerdown du bouton ne remonte ni aux contrôles caméra ni à AudioUnlock.
                unlockAudio()
                setMuted(useAudioStore.getState().muted)
              }
              activate()
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={marker.icon} />
            </svg>
            <span className="scene-hotspot__label" aria-hidden="true">
              {label}
            </span>
          </button>
        </Html>
      )}
    </group>
  )
}
