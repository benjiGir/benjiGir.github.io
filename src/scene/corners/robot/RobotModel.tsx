import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { playBeep } from '@/lib/audio'
import {
  useRobotStore,
  cellToWorld,
  DIRECTION_ANGLES,
  type Direction,
} from '@/store/useRobotStore'
import { Head } from './parts/Head'
import { Arm } from './parts/Arm'
import { Leg } from './parts/Leg'
import { TargetMarker } from './parts/TargetMarker'
import type { GazeTarget, RobotModelHandle } from './types'

// ─── Constantes ────────────────────────────────────────────────────────────────

const STEP_DURATION = 0.6 // secondes par instruction (cf. PLAN.md)
// Échelle globale du robot : les primitives ci-dessous sont modélisées pour un robot d'environ
// 40cm ; ce facteur le porte aux ~60cm visés (gabarit façon NAO).
const ROBOT_SCALE = 1.5
// Décalage vertical (avant mise à l'échelle) pour que les pieds touchent le sol (y=0 monde).
const ROBOT_Y_OFFSET = 0.045

// Couleurs
const BODY_COLOR = '#f4f4f6'
const ACCENT_COLOR = '#2b6cb0'
const LED_COLOR = '#3ddc84'

// ─── RobotModel ──────────────────────────────────────────────────────────────
//
// Géométrie + animation (idle, marche case-par-case, danse, bip, échec) du robot NAO,
// pilotées par `useRobotStore`. Réutilisable telle quelle dans la scène principale
// (`scene/corners/robot/Robot.tsx`, qui ajoute le Hotspot + le suivi du regard) et dans la
// mini-scène de feedback de l'app RobotLab (`os/apps/RobotLabApp.tsx`).
//
// `ref` expose `{ head, gaze }` : `head` est le group de la tête (pour un éventuel raycast/
// look-at externe) et `gaze` une référence mutable `{ yaw, pitch }` que l'appelant peut écrire
// chaque frame pour orienter le regard (cf. commentaire dans `parts/Head.tsx`).

const RobotModel = forwardRef<RobotModelHandle>(function RobotModel(_, ref) {
  const groupRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)
  const ledMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const walkPhase = useRef(0)
  const stepTimer = useRef(0)
  const danceAnim = useRef(0)
  const failResetTimer = useRef<number | null>(null)
  const lastBeepTick = useRef(0)
  const lastDanceTick = useRef(0)
  const gazeRef = useRef<GazeTarget>({ yaw: 0, pitch: 0 })

  const [greetTrigger, setGreetTrigger] = useState(0)
  const [failTrigger, setFailTrigger] = useState(0)

  useImperativeHandle(
    ref,
    () => ({
      get head() {
        return headRef.current
      },
      gaze: gazeRef,
    }),
    []
  )

  // Visuel courant — interpolé en continu vers la cible logique du store
  const visual = useRef({ x: 0, z: 0, angle: 0 })
  const initialized = useRef(false)

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return

    const { col, row, dir, runState, currentStep, step, beepTick, danceTick, resetToLevelStart } =
      useRobotStore.getState()

    const [targetX, targetZ] = cellToWorld(col, row)
    const targetAngle = DIRECTION_ANGLES[dir as Direction]

    if (!initialized.current) {
      visual.current = { x: targetX, z: targetZ, angle: targetAngle }
      initialized.current = true
    }

    // ── Cadencement de l'exécution : ~1 instruction / 600ms ──
    if (runState === 'running' && currentStep !== null && failResetTimer.current === null) {
      stepTimer.current += delta
      if (stepTimer.current >= STEP_DURATION) {
        stepTimer.current = 0
        step()
      }
    } else {
      stepTimer.current = 0
    }

    // ── Échec : petit délai pour laisser jouer l'animation "non" puis retour au départ ──
    if (runState === 'fail' && failResetTimer.current === null) {
      setFailTrigger((t) => t + 1)
      failResetTimer.current = state.clock.elapsedTime
    }
    if (failResetTimer.current !== null) {
      if (state.clock.elapsedTime - failResetTimer.current > 0.9) {
        failResetTimer.current = null
        resetToLevelStart()
        const after = useRobotStore.getState()
        const [resetX, resetZ] = cellToWorld(after.col, after.row)
        visual.current = {
          x: resetX,
          z: resetZ,
          angle: DIRECTION_ANGLES[after.dir as Direction],
        }
      }
    }

    // ── Bip : son synthétisé déclenché une seule fois par tick ──
    if (beepTick !== lastBeepTick.current) {
      lastBeepTick.current = beepTick
      playBeep()
    }
    // ── Danse : déclenche une animation courte ──
    if (danceTick !== lastDanceTick.current) {
      lastDanceTick.current = danceTick
      danceAnim.current = 1.4
    }

    // ── Interpolation position/rotation vers la cible logique ──
    const damp = 1 - Math.exp(-delta * 6)
    visual.current.x = THREE.MathUtils.lerp(visual.current.x, targetX, damp)
    visual.current.z = THREE.MathUtils.lerp(visual.current.z, targetZ, damp)

    // Interpolation d'angle en gérant le wrap (-PI, PI]
    let angleDiff = targetAngle - visual.current.angle
    angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff))
    visual.current.angle += angleDiff * damp

    group.position.x = visual.current.x
    group.position.z = visual.current.z
    group.rotation.y = visual.current.angle

    // ── Marche procédurale : avance le cycle uniquement si on est en mouvement ──
    const moving =
      Math.abs(targetX - visual.current.x) > 0.005 || Math.abs(targetZ - visual.current.z) > 0.005
    if (moving) {
      walkPhase.current += delta * 10
    } else {
      walkPhase.current = THREE.MathUtils.lerp(walkPhase.current, 0, 1 - Math.exp(-delta * 4))
    }

    // ── Respiration idle (scale léger sur le buste) + échelle globale + offset au sol ──
    const body = bodyRef.current
    if (body) {
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.012
      body.scale.set(ROBOT_SCALE, ROBOT_SCALE * breathe, ROBOT_SCALE)
      body.position.y = ROBOT_Y_OFFSET * ROBOT_SCALE
    }

    // ── Danse : petite rotation/sautillement temporaire ──
    if (danceAnim.current > 0) {
      danceAnim.current -= delta
      const t = Math.max(danceAnim.current, 0)
      group.rotation.y += Math.sin(t * 14) * 0.3
      group.position.y = Math.abs(Math.sin(t * 10)) * 0.03
    } else {
      group.position.y = 0
    }

    // ── LED poitrine : pulsation douce, plus rapide pendant l'exécution ──
    if (ledMatRef.current) {
      const speed = runState === 'running' ? 6 : 2
      ledMatRef.current.emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * speed) * 0.4
    }
  })

  function handleClick() {
    setGreetTrigger((t) => t + 1)
  }

  return (
    <>
      <TargetMarker />
      <group ref={groupRef} onClick={handleClick}>
        <group ref={bodyRef}>
          {/* Buste */}
          <mesh position={[0, 0.155, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.075, 0.09, 8, 16]} />
            <meshStandardMaterial color={BODY_COLOR} roughness={0.4} metalness={0.1} />
          </mesh>
          {/* LED poitrine */}
          <mesh position={[0, 0.165, 0.075]}>
            <circleGeometry args={[0.018, 16]} />
            <meshStandardMaterial
              ref={ledMatRef}
              color={LED_COLOR}
              emissive={LED_COLOR}
              emissiveIntensity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Bassin */}
          <mesh position={[0, 0.07, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.06, 0.02, 8, 16]} />
            <meshStandardMaterial color={ACCENT_COLOR} roughness={0.5} metalness={0.15} />
          </mesh>

          <Head headRef={headRef} gazeRef={gazeRef} failTrigger={failTrigger} />
          <Arm side="left" walkPhase={walkPhase} greetTrigger={greetTrigger} />
          <Arm side="right" walkPhase={walkPhase} greetTrigger={greetTrigger} />
          <Leg side="left" walkPhase={walkPhase} />
          <Leg side="right" walkPhase={walkPhase} />
        </group>
      </group>
    </>
  )
})

export { RobotModel }
