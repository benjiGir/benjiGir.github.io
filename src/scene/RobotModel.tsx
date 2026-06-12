import { forwardRef, useImperativeHandle, useRef, useState, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { playBeep } from '@/lib/audio'
import {
  useRobotStore,
  cellToWorld,
  DIRECTION_ANGLES,
  LEVELS,
  type Direction,
} from '@/store/useRobotStore'

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
const EYE_COLOR = '#5ec8ff'
const LED_COLOR = '#3ddc84'

// ─── Marqueur de case cible ─────────────────────────────────────────────────────

export function TargetMarker() {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const levelIndex = useRobotStore((s) => s.levelIndex)
  const level = LEVELS[levelIndex]
  const [x, z] = cellToWorld(level.target.col, level.target.row)

  useFrame(({ clock }) => {
    if (!matRef.current) return
    // Pulsation douce pour signaler la cible sans être trop voyant
    matRef.current.emissiveIntensity = 0.8 + Math.sin(clock.elapsedTime * 2.5) * 0.4
  })

  return (
    <mesh position={[x, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.06, 0.09, 24]} />
      <meshStandardMaterial
        ref={matRef}
        color={LED_COLOR}
        emissive={LED_COLOR}
        emissiveIntensity={1}
        transparent
        opacity={0.85}
      />
    </mesh>
  )
}

// ─── Tête ────────────────────────────────────────────────────────────────────
//
// `gazeRef` est une référence mutable partagée : le composant englobant (ex. `Robot.tsx`,
// pour le suivi du regard sur POI actif) y écrit la direction de regard désirée chaque frame ;
// `Head` la lit dans son propre `useFrame` pour rester l'unique writer de `rotation` (évite
// que deux boucles `useFrame` se disputent la même propriété).

export interface GazeTarget {
  yaw: number
  pitch: number
}

function Head({
  headRef,
  gazeRef,
  failTrigger,
}: {
  headRef: MutableRefObject<THREE.Group | null>
  gazeRef: MutableRefObject<GazeTarget>
  failTrigger: number
}) {
  const eyeLMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const eyeRMatRef = useRef<THREE.MeshStandardMaterial>(null)

  const blinkTimer = useRef(THREE.MathUtils.randFloat(2, 5))
  const blinkPhase = useRef(0) // 0 = ouvert, >0 = en cours de clignement
  const failAnim = useRef(0) // >0 = animation "non" en cours (durée restante)
  const lastFailTrigger = useRef(failTrigger)

  // Démarre l'animation "non" (rotation latérale rapide de la tête) sur changement de trigger
  if (failTrigger !== lastFailTrigger.current) {
    lastFailTrigger.current = failTrigger
    failAnim.current = 0.6
  }

  useFrame((_, delta) => {
    if (!headRef.current) return

    // ── Clignement des yeux ──
    blinkTimer.current -= delta
    if (blinkTimer.current <= 0 && blinkPhase.current === 0) {
      blinkPhase.current = 0.12
      blinkTimer.current = THREE.MathUtils.randFloat(2.5, 6)
    }
    if (blinkPhase.current > 0) {
      blinkPhase.current -= delta
      const t = Math.max(blinkPhase.current, 0) / 0.12
      const scale = Math.abs(Math.sin(t * Math.PI)) < 0.05 ? 0.05 : Math.abs(Math.sin(t * Math.PI))
      const closed = 1 - scale
      if (eyeLMatRef.current) eyeLMatRef.current.emissiveIntensity = 1.4 * closed
      if (eyeRMatRef.current) eyeRMatRef.current.emissiveIntensity = 1.4 * closed
    } else {
      if (eyeLMatRef.current) eyeLMatRef.current.emissiveIntensity = 1.4
      if (eyeRMatRef.current) eyeRMatRef.current.emissiveIntensity = 1.4
    }

    // ── Animation "non" (échec) : rotation latérale rapide amortie ──
    if (failAnim.current > 0) {
      failAnim.current -= delta
      const t = Math.max(failAnim.current, 0)
      const shake = Math.sin(t * 28) * (t / 0.6) * 0.5
      headRef.current.rotation.y = shake
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        0,
        1 - Math.exp(-delta * 8)
      )
      return
    }

    // ── Suivi du regard (écrit par le composant englobant via `gazeRef`) ou retour au repos ──
    const damp = 1 - Math.exp(-delta * 5)
    headRef.current.rotation.y = THREE.MathUtils.lerp(
      headRef.current.rotation.y,
      gazeRef.current.yaw,
      damp
    )
    headRef.current.rotation.x = THREE.MathUtils.lerp(
      headRef.current.rotation.x,
      gazeRef.current.pitch,
      damp
    )
  })

  return (
    <group ref={headRef} position={[0, 0.235, 0]}>
      {/* Crâne */}
      <mesh castShadow>
        <sphereGeometry args={[0.07, 24, 24]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Visière */}
      <mesh position={[0, -0.005, 0.05]} castShadow>
        <boxGeometry args={[0.09, 0.045, 0.03]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Yeux émissifs */}
      <mesh position={[-0.022, -0.005, 0.066]}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshStandardMaterial
          ref={eyeLMatRef}
          color={EYE_COLOR}
          emissive={EYE_COLOR}
          emissiveIntensity={1.4}
        />
      </mesh>
      <mesh position={[0.022, -0.005, 0.066]}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshStandardMaterial
          ref={eyeRMatRef}
          color={EYE_COLOR}
          emissive={EYE_COLOR}
          emissiveIntensity={1.4}
        />
      </mesh>
      {/* Antenne */}
      <mesh position={[0, 0.075, 0]} castShadow>
        <cylinderGeometry args={[0.004, 0.004, 0.04, 8]} />
        <meshStandardMaterial color="#888888" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.097, 0]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshStandardMaterial
          color={ACCENT_COLOR}
          emissive={ACCENT_COLOR}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  )
}

// ─── Bras ────────────────────────────────────────────────────────────────────

function Arm({
  side,
  walkPhase,
  greetTrigger,
}: {
  side: 'left' | 'right'
  walkPhase: MutableRefObject<number>
  greetTrigger: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const sign = side === 'left' ? 1 : -1
  const greetAnim = useRef(0)
  const lastTrigger = useRef(greetTrigger)

  if (greetTrigger !== lastTrigger.current) {
    lastTrigger.current = greetTrigger
    // Seul le bras droit fait le salut
    if (side === 'right') greetAnim.current = 1
  }

  useFrame((_, delta) => {
    if (!groupRef.current) return

    if (side === 'right' && greetAnim.current > 0) {
      greetAnim.current -= delta * 0.7
      const t = Math.max(greetAnim.current, 0)
      // Lève le bras puis petit balancement façon salut
      const raise = Math.sin((1 - t) * Math.PI) // 0 -> 1 -> 0
      const wave = Math.sin((1 - t) * Math.PI * 6) * 0.25 * raise
      groupRef.current.rotation.z = -raise * 2.4 + wave
      groupRef.current.rotation.x = 0
      return
    }

    // Balancement de marche, sinon léger repos
    const swing = Math.sin(walkPhase.current) * 0.35 * sign
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      swing,
      1 - Math.exp(-delta * 8)
    )
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      0,
      1 - Math.exp(-delta * 8)
    )
  })

  return (
    <group ref={groupRef} position={[sign * 0.085, 0.16, 0]}>
      <mesh position={[0, -0.05, 0]} castShadow>
        <capsuleGeometry args={[0.018, 0.08, 6, 12]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.45} metalness={0.1} />
      </mesh>
    </group>
  )
}

// ─── Jambe ───────────────────────────────────────────────────────────────────

function Leg({ side, walkPhase }: { side: 'left' | 'right'; walkPhase: MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null)
  const sign = side === 'left' ? 1 : -1

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const swing = Math.sin(walkPhase.current + Math.PI) * 0.3 * sign
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      swing,
      1 - Math.exp(-delta * 8)
    )
  })

  return (
    <group ref={groupRef} position={[sign * 0.028, 0.06, 0]}>
      <mesh position={[0, -0.05, 0]} castShadow>
        <capsuleGeometry args={[0.02, 0.08, 6, 12]} />
        <meshStandardMaterial color={ACCENT_COLOR} roughness={0.5} metalness={0.15} />
      </mesh>
      {/* Pied */}
      <mesh position={[0, -0.105, 0.012]} castShadow>
        <boxGeometry args={[0.045, 0.018, 0.07]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  )
}

// ─── RobotModel ──────────────────────────────────────────────────────────────
//
// Géométrie + animation (idle, marche case-par-case, danse, bip, échec) du robot NAO,
// pilotées par `useRobotStore`. Réutilisable telle quelle dans la scène principale
// (`scene/Robot.tsx`, qui ajoute le Hotspot + le suivi du regard) et dans la mini-scène de
// feedback de l'app RobotLab (`os/apps/RobotLabApp.tsx`).
//
// `ref` expose `{ head, gaze }` : `head` est le group de la tête (pour un éventuel raycast/
// look-at externe) et `gaze` une référence mutable `{ yaw, pitch }` que l'appelant peut écrire
// chaque frame pour orienter le regard (cf. commentaire au-dessus de `Head`).

export interface RobotModelHandle {
  head: THREE.Group | null
  gaze: MutableRefObject<GazeTarget>
}

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
        const [resetX, resetZ] = cellToWorld(
          useRobotStore.getState().col,
          useRobotStore.getState().row
        )
        visual.current = {
          x: resetX,
          z: resetZ,
          angle: DIRECTION_ANGLES[useRobotStore.getState().dir as Direction],
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

export default RobotModel
