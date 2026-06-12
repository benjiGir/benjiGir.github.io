import { useEffect, useRef } from 'react'
import { useFrame, useStore, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useEditorStore } from '@/editor/useEditorStore'

// Le store R3F type `controls` comme THREE.EventDispatcher ; on caste vers la forme minimale
// réellement utilisée (CameraControls de drei expose `enabled` et `setLookAt`).
type ControlsLike = {
  enabled: boolean
  setLookAt: (
    px: number,
    py: number,
    pz: number,
    tx: number,
    ty: number,
    tz: number,
    enableTransition?: boolean
  ) => Promise<void>
}

// ─── Constantes de contrôle ─────────────────────────────────────────────────

/** Vitesse de translation par défaut (m/s). */
const DEFAULT_SPEED = 1.5
const MIN_SPEED = 0.1
const MAX_SPEED = 20
/** Facteur appliqué par cran de molette (sens haut = plus rapide). */
const WHEEL_SPEED_FACTOR = 1.15
/** Multiplicateur de vitesse quand Shift est maintenu. */
const BOOST_FACTOR = 4
/** Sensibilité souris → rotation (rad / pixel). */
const LOOK_SENSITIVITY = 0.0025
/** Limite de pitch pour éviter le retournement (gimbal flip) — un peu sous ±90°. */
const MAX_PITCH = Math.PI / 2 - 0.01

// ─── Objets temporaires hoistés (réutilisés en boucle, jamais alloués en frame) ────────────

const tmpForward = new THREE.Vector3()
const tmpForward3D = new THREE.Vector3()
const tmpRight = new THREE.Vector3()
const tmpUp = new THREE.Vector3(0, 1, 0)
const tmpMove = new THREE.Vector3()
const tmpEuler = new THREE.Euler(0, 0, 0, 'YXZ')
const tmpLookTarget = new THREE.Vector3()

/**
 * Caméra libre façon éditeur (Unity/Unreal), active uniquement en mode éditeur.
 *
 * Contrôles :
 * - Clic droit maintenu + déplacement souris : regarder (yaw/pitch).
 * - W/A/S/D (positions physiques — ZQSD en AZERTY) : avancer/reculer/strafe gauche-droite,
 *   relatif à l'orientation caméra (composante Y ignorée pour rester horizontal).
 * - Espace : monter (axe Y monde) — Ctrl gauche : descendre.
 * - Molette : ajuste la vitesse de déplacement (haut = plus rapide).
 * - Shift maintenu : multiplie la vitesse courante (boost).
 *
 * Pendant un drag du gizmo (`isDragging`), tous les inputs sont ignorés.
 */
export default function FreecamController() {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  // Store R3F brut (zustand) — utilisé pour lire `controls` via getState() dans l'effet, sans
  // s'y abonner : on doit pouvoir le muter (`.enabled = …`), ce que la règle
  // react-hooks/immutability interdit sur une valeur réactive issue d'un selector useThree.
  const store = useStore()
  const enabled = useEditorStore((s) => s.enabled)

  // État interne des inputs — refs pures, jamais de re-render.
  const speed = useRef(DEFAULT_SPEED)
  const keys = useRef<Record<string, boolean>>({})
  const looking = useRef(false)
  const yaw = useRef(0)
  const pitch = useRef(0)

  // À l'activation : initialise yaw/pitch depuis l'orientation courante de la caméra et
  // désactive CameraControls pour qu'il ne se batte pas avec la freecam.
  // À la désactivation : resynchronise CameraControls sur la pose courante de la caméra
  // (setLookAt sans transition) pour éviter tout saut, puis le réactive.
  useEffect(() => {
    const controls = store.getState().controls as unknown as ControlsLike | null

    if (enabled) {
      tmpEuler.setFromQuaternion(camera.quaternion, 'YXZ')
      yaw.current = tmpEuler.y
      pitch.current = tmpEuler.x
      if (controls) controls.enabled = false
      return
    }

    if (controls) {
      tmpForward3D.set(0, 0, -1).applyQuaternion(camera.quaternion)
      tmpLookTarget.copy(camera.position).addScaledVector(tmpForward3D, 1)
      void controls.setLookAt(
        camera.position.x,
        camera.position.y,
        camera.position.z,
        tmpLookTarget.x,
        tmpLookTarget.y,
        tmpLookTarget.z,
        false
      )
      controls.enabled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, store])

  // ─── Listeners DOM (clavier/souris) ───────────────────────────────────────

  useEffect(() => {
    if (!enabled) return
    const dom = gl.domElement

    const onKeyDown = (e: KeyboardEvent) => {
      if (useEditorStore.getState().isDragging) return
      keys.current[e.code] = true
    }
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false
    }

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 2) return
      if (useEditorStore.getState().isDragging) return
      looking.current = true
      dom.setPointerCapture(e.pointerId)
    }
    const onPointerUp = (e: PointerEvent) => {
      if (e.button !== 2) return
      looking.current = false
      if (dom.hasPointerCapture(e.pointerId)) dom.releasePointerCapture(e.pointerId)
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!looking.current) return
      if (useEditorStore.getState().isDragging) return
      yaw.current -= e.movementX * LOOK_SENSITIVITY
      pitch.current -= e.movementY * LOOK_SENSITIVITY
      pitch.current = THREE.MathUtils.clamp(pitch.current, -MAX_PITCH, MAX_PITCH)
    }

    const onWheel = (e: WheelEvent) => {
      if (useEditorStore.getState().isDragging) return
      e.preventDefault()
      const factor = e.deltaY < 0 ? WHEEL_SPEED_FACTOR : 1 / WHEEL_SPEED_FACTOR
      speed.current = THREE.MathUtils.clamp(speed.current * factor, MIN_SPEED, MAX_SPEED)
    }

    // Empêche le menu contextuel pendant tout le mode éditeur (clic droit = regarder).
    const onContextMenu = (e: Event) => e.preventDefault()

    // Quand la fenêtre/onglet perd le focus pendant un clic droit maintenu, on relâche
    // proprement l'état "regarder" pour éviter qu'il ne reste bloqué.
    const onBlur = () => {
      looking.current = false
      keys.current = {}
    }

    dom.addEventListener('keydown', onKeyDown)
    dom.addEventListener('keyup', onKeyUp)
    dom.addEventListener('pointerdown', onPointerDown)
    dom.addEventListener('pointerup', onPointerUp)
    dom.addEventListener('pointermove', onPointerMove)
    dom.addEventListener('wheel', onWheel, { passive: false })
    dom.addEventListener('contextmenu', onContextMenu)
    window.addEventListener('blur', onBlur)

    // Le canvas doit pouvoir recevoir le focus clavier pour capter keydown/keyup.
    if (!dom.hasAttribute('tabindex')) dom.setAttribute('tabindex', '0')

    return () => {
      dom.removeEventListener('keydown', onKeyDown)
      dom.removeEventListener('keyup', onKeyUp)
      dom.removeEventListener('pointerdown', onPointerDown)
      dom.removeEventListener('pointerup', onPointerUp)
      dom.removeEventListener('pointermove', onPointerMove)
      dom.removeEventListener('wheel', onWheel)
      dom.removeEventListener('contextmenu', onContextMenu)
      window.removeEventListener('blur', onBlur)
      keys.current = {}
      looking.current = false
    }
  }, [enabled, gl])

  // ─── Boucle de mise à jour ─────────────────────────────────────────────────

  useFrame((_, delta) => {
    if (!enabled) return
    if (useEditorStore.getState().isDragging) return

    // Orientation : applique yaw/pitch (ordre YXZ = pas de roll, comportement FPS classique).
    tmpEuler.set(pitch.current, yaw.current, 0, 'YXZ')
    camera.quaternion.setFromEuler(tmpEuler)

    // Translation relative aux axes caméra, restreinte au plan horizontal pour avant/strafe
    // (on ne veut pas "voler" en regardant le sol/plafond en avançant).
    tmpForward.set(0, 0, -1).applyQuaternion(camera.quaternion)
    tmpForward.y = 0
    if (tmpForward.lengthSq() > 0) tmpForward.normalize()

    tmpRight.set(1, 0, 0).applyQuaternion(camera.quaternion)
    tmpRight.y = 0
    if (tmpRight.lengthSq() > 0) tmpRight.normalize()

    tmpMove.set(0, 0, 0)
    const k = keys.current
    if (k['KeyW']) tmpMove.add(tmpForward)
    if (k['KeyS']) tmpMove.sub(tmpForward)
    if (k['KeyD']) tmpMove.add(tmpRight)
    if (k['KeyA']) tmpMove.sub(tmpRight)
    if (k['Space']) tmpMove.add(tmpUp)
    if (k['ControlLeft'] || k['ControlRight']) tmpMove.sub(tmpUp)

    if (tmpMove.lengthSq() > 0) {
      tmpMove.normalize()
      const boost = k['ShiftLeft'] || k['ShiftRight'] ? BOOST_FACTOR : 1
      camera.position.addScaledVector(tmpMove, speed.current * boost * delta)
    }

    // CameraControls reste monté et exécute son propre update() à chaque frame (priorité -1
    // côté drei) même quand `enabled = false` — il recalerait sinon la caméra sur son état
    // interne figé, écrasant ce qu'on vient de faire. On le tient donc synchronisé en continu
    // (sans transition ⇒ update() suivant n'a aucun delta à amortir, donc n'écrit rien).
    // Forward 3D (avec pitch, distinct du tmpForward horizontal utilisé pour le déplacement) :
    // sinon la cible de setLookAt serait toujours horizontale et CameraControls tirerait la
    // caméra vers le pitch 0 au prochain update().
    // setLookAt() est `async` (renvoie une Promise même sans transition) : micro-coût accepté
    // ici (cf. même pattern dans CameraRig.tsx), négligeable face au confort de cohabitation.
    const controls = store.getState().controls as unknown as ControlsLike | null
    if (controls) {
      tmpForward3D.set(0, 0, -1).applyQuaternion(camera.quaternion)
      tmpLookTarget.copy(camera.position).addScaledVector(tmpForward3D, 1)
      void controls.setLookAt(
        camera.position.x,
        camera.position.y,
        camera.position.z,
        tmpLookTarget.x,
        tmpLookTarget.y,
        tmpLookTarget.z,
        false
      )
    }
  })

  return null
}
