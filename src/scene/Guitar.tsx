import { useRef, useState, type MutableRefObject } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Geometry, Base, Addition, Subtraction } from '@react-three/csg'
import * as THREE from 'three'
import Hotspot from '@/scene/Hotspot'
import Editable from '@/editor/Editable'
import { useCameraStore } from '@/store/useCameraStore'
import { playPluck, playClick } from '@/lib/audio'

// ─── Constantes ────────────────────────────────────────────────────────────────

// Accordage standard EADGBE — fréquences à vide des 6 cordes (de la plus grave à la plus aiguë)
export const STRING_FREQS = [82.41, 110, 146.83, 196, 246.94, 329.63] as const

const STRING_COUNT = STRING_FREQS.length
const STRING_LENGTH = 0.78 // du sillet (haut du manche) au chevalet (sur la table)
const STRING_SPACING = 0.026
const STRING_RADIUS = 0.0014

const BODY_COLOR = '#a0682f'
const BODY_DARK = '#7a4d22'
const NECK_COLOR = '#3d2b1f'
const HEADSTOCK_COLOR = '#2b1d14'
const STRING_COLOR = '#d8d2c4'
const STRING_HOT_COLOR = '#ffd86b'
const STAND_COLOR = '#2a2a2a'

const HIGH_SCORE_KEY = 'guitar-simon-highscore'

// ─── Silhouette du corps (CSG) ────────────────────────────────────────────────
//
// Forme en "8" façon dreadnought : deux lobes circulaires (bas large / haut plus petit)
// qui se chevauchent, dont on soustrait deux cylindres latéraux pour creuser la taille
// (pincement de chaque côté). Tous les cylindres sont couchés (axe Z = épaisseur du corps).

const BODY_THICKNESS = 0.095
const LOWER_LOBE_RADIUS = 0.175
const LOWER_LOBE_Y = 0.195
const UPPER_LOBE_RADIUS = 0.135
const UPPER_LOBE_Y = 0.475
const WAIST_Y = (LOWER_LOBE_Y + UPPER_LOBE_Y) / 2 // 0.335 — pincement entre les deux lobes
const WAIST_CUT_RADIUS = 0.16
const WAIST_CUT_X = 0.21 // décalage latéral des cylindres de découpe (de part et d'autre)

// ─── Corde individuelle ──────────────────────────────────────────────────────
//
// Chaque corde est cliquable indépendamment (pince → `playPluck`) et vibre
// brièvement (oscillation amortie de l'échelle Z, mutation directe du mesh —
// pas d'allocation par frame).

interface StringProps {
  index: number
  x: number
  /** Déclenché par le mini-jeu Simon pour rejouer/illuminer une corde précise. */
  triggerRef: MutableRefObject<number[]>
  /** Cordes cliquables uniquement quand le POI 'guitar' est actif. */
  interactive: boolean
}

function GuitarString({ index, x, triggerRef, interactive }: StringProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const vibration = useRef(0) // >0 = en cours de vibration, valeur = temps restant

  useFrame((_, delta) => {
    const mesh = meshRef.current
    const mat = matRef.current
    if (!mesh || !mat) return

    // Le mini-jeu Simon peut déclencher cette corde sans clic direct (valeur 1 = trigger
    // visuel/sonore de lecture). La valeur 2 (clic utilisateur, posée par `handleClick`) n'est
    // PAS consommée ici — elle doit rester intacte pour `SimonPanel.useFrame`, qui s'exécute
    // après (sinon la validation de la séquence ne reçoit jamais le signal).
    if (triggerRef.current[index] === 1) {
      triggerRef.current[index] = 0
      vibration.current = 0.9
    }

    if (vibration.current > 0) {
      vibration.current -= delta
      const t = Math.max(vibration.current, 0)
      // Oscillation amortie de l'échelle X/Z (la corde "bouge" visuellement)
      const amp = (t / 0.9) * 0.9
      mesh.scale.x = 1 + Math.sin(t * 60) * amp
      mesh.scale.z = 1 + Math.sin(t * 60) * amp
      mat.emissiveIntensity = t / 0.9
    } else {
      mesh.scale.x = 1
      mesh.scale.z = 1
      mat.emissiveIntensity = 0
    }
  })

  function handleClick(e: ThreeEvent<MouseEvent>) {
    if (!interactive) return
    e.stopPropagation()
    vibration.current = 0.9
    playPluck(STRING_FREQS[index])
    // Signale au Simon qu'une corde a été pincée manuellement (front montant lu et consommé
    // dans `SimonPanel.useFrame`).
    triggerRef.current[index] = 2
  }

  // Élargit la zone de clic (cylindre invisible) sans changer la géométrie visible — une corde
  // de 1.4mm de rayon serait quasi impossible à viser précisément.
  return (
    <group position={[x, 0.62 + STRING_LENGTH / 2, 0.012]}>
      <mesh ref={meshRef}>
        <cylinderGeometry args={[STRING_RADIUS, STRING_RADIUS, STRING_LENGTH, 6]} />
        <meshStandardMaterial
          ref={matRef}
          color={STRING_COLOR}
          emissive={STRING_HOT_COLOR}
          emissiveIntensity={0}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      {interactive && (
        <mesh
          visible={false}
          onClick={handleClick}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          <cylinderGeometry args={[STRING_RADIUS * 5, STRING_RADIUS * 5, STRING_LENGTH, 6]} />
          <meshBasicMaterial />
        </mesh>
      )}
    </group>
  )
}

// ─── Corps + manche + stand ──────────────────────────────────────────────────

function GuitarModel({
  stringTriggerRef,
  interactive,
}: {
  stringTriggerRef: MutableRefObject<number[]>
  interactive: boolean
}) {
  // Positions X des 6 cordes, centrées sur l'axe de la guitare
  const stringXs = Array.from(
    { length: STRING_COUNT },
    (_, i) => (i - (STRING_COUNT - 1) / 2) * STRING_SPACING
  )

  return (
    <group>
      {/* ── Corps (table d'harmonie) — silhouette en "8" via CSG ── */}
      {/* Les cylindres sont couchés (rotation X = 90°) pour que leur axe pointe selon Z :
          le disque devient la table/le dos de la guitare (face avant/arrière), et la
          "hauteur" du cylindre devient l'épaisseur du corps. Deux lobes (Base + Addition) qui
          se chevauchent forment le "8", puis deux cylindres latéraux (Subtraction) creusent
          la taille de chaque côté. Géométrie figée à la création (pas de useFrame dessus). */}
      {/* NB : la rotation X=90° du mesh mappe l'axe local Z sur l'axe world Y (inversé) :
          un point local (x, 0, z) finit en world (x, -z, 0). Donc pour positionner un lobe
          à une hauteur world Y = +V, on lui donne un offset local Z = -V. */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <Geometry>
          <Base position={[0, 0, -LOWER_LOBE_Y]}>
            <cylinderGeometry args={[LOWER_LOBE_RADIUS, LOWER_LOBE_RADIUS, BODY_THICKNESS, 32]} />
          </Base>
          <Addition position={[0, 0, -UPPER_LOBE_Y]}>
            <cylinderGeometry args={[UPPER_LOBE_RADIUS, UPPER_LOBE_RADIUS, BODY_THICKNESS, 32]} />
          </Addition>
          {/* Pincement gauche */}
          <Subtraction position={[-WAIST_CUT_X, 0, -WAIST_Y]}>
            <cylinderGeometry
              args={[WAIST_CUT_RADIUS, WAIST_CUT_RADIUS, BODY_THICKNESS * 1.5, 32]}
            />
          </Subtraction>
          {/* Pincement droit */}
          <Subtraction position={[WAIST_CUT_X, 0, -WAIST_Y]}>
            <cylinderGeometry
              args={[WAIST_CUT_RADIUS, WAIST_CUT_RADIUS, BODY_THICKNESS * 1.5, 32]}
            />
          </Subtraction>
        </Geometry>
        <meshStandardMaterial color={BODY_COLOR} roughness={0.5} metalness={0.05} />
      </mesh>
      {/* Tranche arrière (légèrement plus sombre, fond du corps) — même silhouette, plus fine */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -BODY_THICKNESS / 2 - 0.005]}>
        <Geometry>
          <Base position={[0, 0, -LOWER_LOBE_Y]}>
            <cylinderGeometry
              args={[LOWER_LOBE_RADIUS * 0.97, LOWER_LOBE_RADIUS * 0.97, 0.01, 32]}
            />
          </Base>
          <Addition position={[0, 0, -UPPER_LOBE_Y]}>
            <cylinderGeometry
              args={[UPPER_LOBE_RADIUS * 0.97, UPPER_LOBE_RADIUS * 0.97, 0.01, 32]}
            />
          </Addition>
          <Subtraction position={[-WAIST_CUT_X, 0, -WAIST_Y]}>
            <cylinderGeometry args={[WAIST_CUT_RADIUS, WAIST_CUT_RADIUS, 0.02, 32]} />
          </Subtraction>
          <Subtraction position={[WAIST_CUT_X, 0, -WAIST_Y]}>
            <cylinderGeometry args={[WAIST_CUT_RADIUS, WAIST_CUT_RADIUS, 0.02, 32]} />
          </Subtraction>
        </Geometry>
        <meshStandardMaterial color={BODY_DARK} roughness={0.6} metalness={0} />
      </mesh>

      {/* Rosace / trou de la table (disque sombre, face avant = +Z = 0.0475) */}
      <mesh position={[0, 0.34, 0.0485]}>
        <circleGeometry args={[0.045, 24]} />
        <meshStandardMaterial color="#1a120b" roughness={0.9} />
      </mesh>
      {/* Chevalet */}
      <mesh position={[0, 0.225, 0.0495]} castShadow>
        <boxGeometry args={[0.1, 0.018, 0.014]} />
        <meshStandardMaterial color={NECK_COLOR} roughness={0.7} />
      </mesh>

      {/* ── Manche ── */}
      <mesh position={[0, 0.62 + STRING_LENGTH / 2 - 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.052, STRING_LENGTH + 0.16, 0.028]} />
        <meshStandardMaterial color={NECK_COLOR} roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Touche (façade plus claire) */}
      <mesh position={[0, 0.62 + STRING_LENGTH / 2 - 0.08, 0.0145]} castShadow>
        <boxGeometry args={[0.046, STRING_LENGTH + 0.14, 0.004]} />
        <meshStandardMaterial color="#1f1611" roughness={0.5} />
      </mesh>

      {/* Sillet (haut du manche) */}
      <mesh position={[0, 0.62 + STRING_LENGTH, 0.012]} castShadow>
        <boxGeometry args={[0.054, 0.012, 0.016]} />
        <meshStandardMaterial color="#e8e2d4" roughness={0.4} />
      </mesh>

      {/* ── Tête (porte-clés) ── */}
      <mesh position={[0, 0.62 + STRING_LENGTH + 0.07, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.075, 0.14, 0.022]} />
        <meshStandardMaterial color={HEADSTOCK_COLOR} roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Mécaniques (3 par côté) */}
      {[0, 1, 2].map((i) => (
        <group key={i}>
          <mesh
            position={[-0.045, 0.62 + STRING_LENGTH + 0.04 + i * 0.035, 0]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.006, 0.006, 0.03, 8]} />
            <meshStandardMaterial color="#c9c4b8" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh
            position={[0.045, 0.62 + STRING_LENGTH + 0.04 + i * 0.035, 0]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.006, 0.006, 0.03, 8]} />
            <meshStandardMaterial color="#c9c4b8" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* ── Cordes ── */}
      {stringXs.map((x, i) => (
        <GuitarString
          key={i}
          index={i}
          x={x}
          triggerRef={stringTriggerRef}
          interactive={interactive}
        />
      ))}

      {/* ── Stand au sol (façon stand A-frame) ── */}
      <group position={[0, 0, 0]}>
        {/* Base */}
        <mesh position={[0, 0.01, 0.12]} castShadow receiveShadow>
          <boxGeometry args={[0.22, 0.02, 0.22]} />
          <meshStandardMaterial color={STAND_COLOR} roughness={0.5} metalness={0.4} />
        </mesh>
        {/* Tige verticale arrière (support du dos de la guitare) */}
        <mesh position={[0, 0.18, 0.16]} rotation={[0.18, 0, 0]} castShadow>
          <cylinderGeometry args={[0.008, 0.008, 0.38, 8]} />
          <meshStandardMaterial color={STAND_COLOR} roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Bras gauche (support du corps, en U) */}
        <mesh position={[-0.1, 0.1, 0.05]} rotation={[0, 0, 0.5]} castShadow>
          <cylinderGeometry args={[0.007, 0.007, 0.16, 8]} />
          <meshStandardMaterial color={STAND_COLOR} roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Bras droit (support du corps, en U) */}
        <mesh position={[0.1, 0.1, 0.05]} rotation={[0, 0, -0.5]} castShadow>
          <cylinderGeometry args={[0.007, 0.007, 0.16, 8]} />
          <meshStandardMaterial color={STAND_COLOR} roughness={0.4} metalness={0.6} />
        </mesh>
      </group>
    </group>
  )
}

// ─── Mini-jeu Simon musical ──────────────────────────────────────────────────

type GameState = 'idle' | 'showing' | 'listening' | 'gameover'

function readHighScore(): number {
  try {
    const raw = localStorage.getItem(HIGH_SCORE_KEY)
    return raw ? Math.max(0, parseInt(raw, 10) || 0) : 0
  } catch {
    return 0
  }
}

function writeHighScore(score: number) {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(score))
  } catch {
    // localStorage indisponible (navigation privée…) — on ignore silencieusement
  }
}

const STRING_NAMES = ['Mi grave', 'La', 'Ré', 'Sol', 'Si', 'Mi aigu']

function SimonPanel({ stringTriggerRef }: { stringTriggerRef: MutableRefObject<number[]> }) {
  const [state, setState] = useState<GameState>('idle')
  const [sequence, setSequence] = useState<number[]>([])
  const [highScore, setHighScore] = useState(() => readHighScore())
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const stepRef = useRef(0) // index attendu dans la séquence pendant 'listening'
  const showTimeouts = useRef<number[]>([])

  function clearTimeouts() {
    showTimeouts.current.forEach((id) => clearTimeout(id))
    showTimeouts.current = []
  }

  function playSequence(seq: number[]) {
    setState('showing')
    seq.forEach((idx, i) => {
      const id = window.setTimeout(() => {
        setActiveIndex(idx)
        stringTriggerRef.current[idx] = 1
        playPluck(STRING_FREQS[idx])
        const offId = window.setTimeout(() => setActiveIndex(null), 320)
        showTimeouts.current.push(offId)
      }, i * 650)
      showTimeouts.current.push(id)
    })
    const endId = window.setTimeout(
      () => {
        stepRef.current = 0
        setState('listening')
      },
      seq.length * 650 + 200
    )
    showTimeouts.current.push(endId)
  }

  function startGame() {
    clearTimeouts()
    const first = [Math.floor(Math.random() * STRING_COUNT)]
    setSequence(first)
    playSequence(first)
  }

  function nextRound(seq: number[]) {
    const next = [...seq, Math.floor(Math.random() * STRING_COUNT)]
    setSequence(next)
    playSequence(next)
  }

  function handleStringPress(idx: number) {
    if (state !== 'listening') return
    if (idx === sequence[stepRef.current]) {
      stepRef.current += 1
      if (stepRef.current === sequence.length) {
        const score = sequence.length
        if (score > highScore) {
          setHighScore(score)
          writeHighScore(score)
        }
        const id = window.setTimeout(() => nextRound(sequence), 500)
        showTimeouts.current.push(id)
        setState('showing')
      }
    } else {
      const score = sequence.length - 1
      if (score > highScore) {
        setHighScore(score)
        writeHighScore(score)
      }
      setState('gameover')
    }
  }

  // Lit les clics utilisateur sur les cordes : `GuitarString.handleClick` écrit 2 dans
  // `stringTriggerRef[i]` (en plus de jouer le son/la vibration), consommé ici à la frame
  // suivante pour valider l'étape courante du Simon.
  useFrame(() => {
    const arr = stringTriggerRef.current
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === 2) {
        arr[i] = 0
        handleStringPress(i)
      }
    }
  })

  return (
    <Html position={[0.55, 0.6, 0]} transform distanceFactor={1.1} occlude={false}>
      <div
        style={{
          width: 190,
          padding: '12px 14px',
          borderRadius: 10,
          background: 'rgba(20,20,24,0.72)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.92)',
          fontSize: 12,
          fontFamily: 'system-ui, sans-serif',
          userSelect: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6, letterSpacing: 0.3 }}>Simon musical</div>
        <div style={{ opacity: 0.75, marginBottom: 8, fontSize: 11, lineHeight: 1.4 }}>
          {state === 'idle' && 'Mémorise puis rejoue la séquence en cliquant les cordes.'}
          {state === 'showing' && 'Écoute…'}
          {state === 'listening' &&
            `À toi : ${stepRef.current}/${sequence.length} (${STRING_NAMES[sequence[stepRef.current]] ?? ''})`}
          {state === 'gameover' && 'Raté ! Réessaie.'}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ opacity: 0.6, fontSize: 11 }}>
            Niveau : {state === 'idle' || state === 'gameover' ? 0 : sequence.length}
          </span>
          <span style={{ opacity: 0.6, fontSize: 11 }}>Record : {highScore}</span>
        </div>
        <button
          onClick={() => {
            playClick()
            startGame()
          }}
          style={{
            width: '100%',
            padding: '6px 0',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.18)',
            background:
              state === 'listening' || state === 'showing'
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(120,170,255,0.22)',
            color: 'rgba(255,255,255,0.92)',
            fontSize: 11,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {state === 'idle' && 'Démarrer'}
          {state === 'gameover' && 'Rejouer'}
          {(state === 'showing' || state === 'listening') && 'Recommencer'}
        </button>
        {/* Indicateur visuel de progression (6 pastilles = 6 cordes) */}
        <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
          {STRING_FREQS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 5,
                borderRadius: 3,
                background: activeIndex === i ? 'rgba(255,216,107,0.9)' : 'rgba(255,255,255,0.12)',
                transition: 'background 120ms',
              }}
            />
          ))}
        </div>
      </div>
    </Html>
  )
}

// ─── Guitar (export) ──────────────────────────────────────────────────────────
//
// Guitare acoustique sur stand, coin musique (mur gauche, juste après la fenêtre).
// Le Hotspot englobant gère le focus caméra (POI 'guitar') ; une fois le POI actif, chaque
// corde devient cliquable individuellement (pince + vibration) et le panneau Simon apparaît.
//
// `stringTriggerRef` est un canal de communication léger entre `SimonPanel` et les `GuitarString`
// (déclenchement visuel/sonore par index, valeurs : 0 = repos, 1 = "joue visuellement", 2 = "clic
// utilisateur à valider par le Simon"). Évite un store zustand pour une interaction aussi locale.

export default function Guitar() {
  const stringTriggerRef = useRef<number[]>(new Array(STRING_COUNT).fill(0))
  const activePoi = useCameraStore((s) => s.poi)
  const poiActive = activePoi === 'guitar'

  return (
    <Hotspot poi="guitar" label="Guitare" position={[-3.85, 0, 2.35]}>
      <Editable id="guitar" label="Guitare" rotation={[0, Math.PI / 2, 0]}>
        <GuitarModel stringTriggerRef={stringTriggerRef} interactive={poiActive} />
        {poiActive && <SimonPanel stringTriggerRef={stringTriggerRef} />}
      </Editable>
    </Hotspot>
  )
}
