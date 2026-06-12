import { useEffect, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Physics, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { damp } from 'maath/easing'
import * as THREE from 'three'
import Hotspot from '@/scene/Hotspot'
import Editable from '@/editor/Editable'
import { useCameraStore } from '@/store/useCameraStore'
import { useLegoStore } from '@/store/useLegoStore'
import { playClick } from '@/lib/audio'

// ─── Constantes ────────────────────────────────────────────────────────────────
//
// Unité lego ≈ taille d'un stud (tenon) en plan : 1 unité = 0.04 m. Hauteur d'une brique
// (sans tenons) = 0.024 m, tenon = cylindre de rayon 0.012, hauteur 0.006.

const UNIT = 0.04
const BRICK_H = 0.024
const STUD_R = 0.012
const STUD_H = 0.006

const TABLE_TOP_Y = 0.32
const PLATE_THICKNESS = 0.01
// Surface utile du plateau (dessus de la plaque de base)
const PLATE_TOP_Y = TABLE_TOP_Y + PLATE_THICKNESS

const COLORS = {
  red: '#c0392b',
  yellow: '#f1c40f',
  blue: '#2980b9',
  green: '#27ae60',
  white: '#ecf0f1',
  gray: '#7f8c8d',
  darkGray: '#3a3a3a',
} as const

// ─── Table basse ───────────────────────────────────────────────────────────────

// Épaisseur du plateau de la table — `TABLE_TOP_Y` désigne la surface supérieure du plateau
// (sur laquelle reposent la plaque verte et les briques), donc le mesh du plateau est centré
// un demi-épaisseur plus bas.
const TABLETOP_THICKNESS = 0.03

function LowTable() {
  const legHeight = TABLE_TOP_Y - TABLETOP_THICKNESS
  return (
    <group>
      {/* Plateau — top en TABLE_TOP_Y */}
      <mesh position={[0, TABLE_TOP_Y - TABLETOP_THICKNESS / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, TABLETOP_THICKNESS, 0.6]} />
        <meshStandardMaterial color="#8a7257" roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Pieds — du sol jusqu'au dessous du plateau */}
      {[
        [-0.4, 0.26],
        [0.4, 0.26],
      ].flatMap(([x, z]) =>
        [z, -z].map((zz) => (
          <mesh key={`${x}-${zz}`} position={[x, legHeight / 2, zz]} castShadow>
            <boxGeometry args={[0.04, legHeight, 0.04]} />
            <meshStandardMaterial color="#5a4632" roughness={0.7} />
          </mesh>
        ))
      )}
    </group>
  )
}

// ─── Description d'une brique ───────────────────────────────────────────────────
//
// `studs` : nombre de tenons en (X, Z) — taille de la brique en unités lego.
// `pos` : centre de la brique relatif au plateau (en mètres), `pos[1]` = altitude de la base
// de la brique (la base repose sur PLATE_TOP_Y + n * BRICK_H pour empiler proprement).

interface BrickDef {
  studsX: number
  studsZ: number
  height: number
  pos: [number, number, number]
  color: string
  /** Rotation Y (radians), pour orienter les briques 1xN. */
  rotY?: number
}

/** Roue (cylindre couché) — trop peu nombreuses pour justifier l'instancing (4 au total). */
interface WheelDef {
  pos: [number, number, number]
  radius: number
  width: number
  color: string
}

// Centre du plateau de montage (côté gauche de la table, pour laisser la tour à droite)
const PLATE_CENTER: [number, number, number] = [-0.18, PLATE_TOP_Y, 0]
const PLATE_SIZE: [number, number] = [0.4, 0.32] // en mètres (X, Z)

// ─── Modèle : petite voiture lego, ~9 étapes ─────────────────────────────────────
//
// Chaque étape ajoute un ou plusieurs groupes de briques. Empilage vertical : étage 0 = châssis
// (base sur le plateau), étage 1 = carrosserie, étage 2 = toit, étage 3 = antenne.

const Y0 = PLATE_TOP_Y // étage 0
const Y1 = Y0 + BRICK_H // étage 1
const Y2 = Y1 + BRICK_H // étage 2
const Y3 = Y2 + BRICK_H // étage 3

const WHEEL_RADIUS = 0.022
const WHEEL_WIDTH = 0.014
// Hauteur de l'axe des roues : le châssis (étage 0, hauteur BRICK_H, base à Y0) repose dessus —
// l'axe est à Y0, les roues dépassent légèrement sous le châssis (rayon > BRICK_H/2).
const WHEEL_AXLE_Y = Y0

interface CarStep {
  bricks: BrickDef[]
  wheels: WheelDef[]
}

const CAR_STEPS: CarStep[] = [
  // 1. Châssis — plaque longue 2x6 rouge
  {
    bricks: [{ studsX: 6, studsZ: 2, height: BRICK_H, pos: [0, Y0, 0], color: COLORS.red }],
    wheels: [],
  },
  // 2. Plancher — brique 1x6 rouge par-dessus
  {
    bricks: [
      { studsX: 6, studsZ: 1, height: BRICK_H, pos: [0, Y1, -UNIT * 0.5], color: COLORS.red },
    ],
    wheels: [],
  },
  // 3. Roues avant (cylindres gris foncé, dépassent sous le châssis)
  {
    bricks: [],
    wheels: [
      {
        pos: [-UNIT * 2, WHEEL_AXLE_Y, UNIT * 1.5],
        radius: WHEEL_RADIUS,
        width: WHEEL_WIDTH,
        color: COLORS.darkGray,
      },
      {
        pos: [-UNIT * 2, WHEEL_AXLE_Y, -UNIT * 1.5],
        radius: WHEEL_RADIUS,
        width: WHEEL_WIDTH,
        color: COLORS.darkGray,
      },
    ],
  },
  // 4. Roues arrière
  {
    bricks: [],
    wheels: [
      {
        pos: [UNIT * 2, WHEEL_AXLE_Y, UNIT * 1.5],
        radius: WHEEL_RADIUS,
        width: WHEEL_WIDTH,
        color: COLORS.darkGray,
      },
      {
        pos: [UNIT * 2, WHEEL_AXLE_Y, -UNIT * 1.5],
        radius: WHEEL_RADIUS,
        width: WHEEL_WIDTH,
        color: COLORS.darkGray,
      },
    ],
  },
  // 5. Flanc gauche — brique 1x6 bleue
  {
    bricks: [
      { studsX: 6, studsZ: 1, height: BRICK_H, pos: [0, Y2, UNIT * 0.5], color: COLORS.blue },
    ],
    wheels: [],
  },
  // 6. Flanc droit — brique 1x6 bleue
  {
    bricks: [
      { studsX: 6, studsZ: 1, height: BRICK_H, pos: [0, Y2, -UNIT * 0.5], color: COLORS.blue },
    ],
    wheels: [],
  },
  // 7. Cabine — deux briques 1x2 bleues fermant l'avant/arrière
  {
    bricks: [
      {
        studsX: 2,
        studsZ: 1,
        height: BRICK_H,
        pos: [UNIT * 2, Y2, 0],
        color: COLORS.blue,
        rotY: Math.PI / 2,
      },
      {
        studsX: 2,
        studsZ: 1,
        height: BRICK_H,
        pos: [-UNIT * 2, Y2, 0],
        color: COLORS.blue,
        rotY: Math.PI / 2,
      },
    ],
    wheels: [],
  },
  // 8. Toit — plaque 2x6 jaune
  {
    bricks: [{ studsX: 6, studsZ: 2, height: BRICK_H, pos: [0, Y3, 0], color: COLORS.yellow }],
    wheels: [],
  },
  // 9. Antenne — petit tenon gris au-dessus du toit
  {
    bricks: [
      {
        studsX: 1,
        studsZ: 1,
        height: BRICK_H * 1.4,
        pos: [UNIT * 2, Y3 + BRICK_H, 0],
        color: COLORS.gray,
      },
    ],
    wheels: [],
  },
]

const CAR_TOTAL_STEPS = CAR_STEPS.length

// ─── Briques éparses (décor statique) ────────────────────────────────────────────
//
// Quelques briques posées en vrac directement sur le plateau de la table (pas sur la plaque
// verte), entre le set en cours de montage et la tour physique. Statiques (pas d'animation) —
// instanciées pour limiter le coût. `pos[1]` est exprimé directement sur la surface de la
// table (TABLE_TOP_Y) — pas d'épaisseur de plaque ici, donc pas d'écart vertical parasite.
const SCATTERED_ORIGIN: [number, number, number] = [0.1, TABLE_TOP_Y, 0]

// `pos` est relatif à SCATTERED_ORIGIN — y=0 pose la brique directement sur la table.
const SCATTERED_BRICKS: BrickDef[] = [
  { studsX: 2, studsZ: 1, height: BRICK_H, pos: [0.04, 0, 0.08], color: COLORS.green, rotY: 0.3 },
  { studsX: 1, studsZ: 1, height: BRICK_H, pos: [0.1, 0, 0.13], color: COLORS.red, rotY: -0.5 },
  { studsX: 2, studsZ: 2, height: BRICK_H, pos: [0.02, 0, -0.08], color: COLORS.white, rotY: 0.9 },
  { studsX: 1, studsZ: 1, height: BRICK_H, pos: [0.12, 0, -0.1], color: COLORS.yellow, rotY: 0.2 },
  { studsX: 1, studsZ: 2, height: BRICK_H, pos: [-0.04, 0, 0.15], color: COLORS.blue, rotY: -0.3 },
]

// ─── Géométries/Helpers instancing ───────────────────────────────────────────────

const tmpMatrix = new THREE.Matrix4()
const tmpPos = new THREE.Vector3()
const tmpQuat = new THREE.Quaternion()
const tmpScale = new THREE.Vector3(1, 1, 1)
const tmpColor = new THREE.Color()
const tmpEuler = new THREE.Euler()

/**
 * Place la matrice/couleur de l'instance `i` pour une brique de taille (studsX × studsZ) à la
 * position et hauteur données. `yOffset` permet l'animation de chute (offset ajouté en Y).
 */
function setBrickInstance(
  mesh: THREE.InstancedMesh,
  studMesh: THREE.InstancedMesh | null,
  index: number,
  studIndices: number[],
  brick: BrickDef,
  yOffset: number
) {
  const [x, y, z] = brick.pos
  tmpPos.set(x, y + brick.height / 2 + yOffset, z)
  tmpEuler.set(0, brick.rotY ?? 0, 0)
  tmpQuat.setFromEuler(tmpEuler)
  tmpScale.set(brick.studsX * UNIT, brick.height, brick.studsZ * UNIT)
  tmpMatrix.compose(tmpPos, tmpQuat, tmpScale)
  mesh.setMatrixAt(index, tmpMatrix)
  tmpColor.set(brick.color)
  mesh.setColorAt(index, tmpColor)

  // Tenons par-dessus la brique (un par stud), uniquement pour les briques avec hauteur > 0
  if (studMesh && brick.height > 0) {
    let s = 0
    for (let sx = 0; sx < brick.studsX; sx++) {
      for (let sz = 0; sz < brick.studsZ; sz++) {
        const localX = (sx - (brick.studsX - 1) / 2) * UNIT
        const localZ = (sz - (brick.studsZ - 1) / 2) * UNIT
        // Rotation autour du centre de la brique
        const cos = Math.cos(brick.rotY ?? 0)
        const sin = Math.sin(brick.rotY ?? 0)
        const wx = localX * cos - localZ * sin
        const wz = localX * sin + localZ * cos
        tmpPos.set(x + wx, y + brick.height + STUD_H / 2 + yOffset, z + wz)
        tmpQuat.identity()
        // cylinderGeometry(1,1,1) a un rayon de base 1 → scale.x/z = rayon final (pas le diamètre)
        tmpScale.set(STUD_R, STUD_H, STUD_R)
        tmpMatrix.compose(tmpPos, tmpQuat, tmpScale)
        const studIdx = studIndices[s]
        studMesh.setMatrixAt(studIdx, tmpMatrix)
        studMesh.setColorAt(studIdx, tmpColor)
        s++
      }
    }
  }
}

// ─── Plateau de montage (voiture progressive) ────────────────────────────────────

interface BuildPlateProps {
  active: boolean
}

// Hauteur de chute d'arrivée (animation flottante) — chaque pièce nouvellement révélée part
// d'un offset positif et redescend vers 0 (sa position finale).
const FALL_HEIGHT = 0.35

/**
 * Anime un tableau d'offsets de chute vers leurs cibles (0 = en place, FALL_HEIGHT = caché en
 * hauteur). `dampObj` est un objet réutilisé (mutation in-place) pour éviter une allocation par
 * pièce/frame avec `maath`'s `damp`.
 */
function stepOffsets(
  offsets: Float32Array,
  visibleCount: number,
  delta: number,
  dampObj: { v: number }
) {
  for (let i = 0; i < offsets.length; i++) {
    const targetOffset = i < visibleCount ? 0 : FALL_HEIGHT
    const current = offsets[i]
    if (Math.abs(current - targetOffset) > 0.0005) {
      dampObj.v = current
      damp(dampObj, 'v', targetOffset, 0.18, delta)
      offsets[i] = dampObj.v
    } else {
      offsets[i] = targetOffset
    }
  }
}

function BuildPlate({ active }: BuildPlateProps) {
  const step = useLegoStore((s) => s.step)
  const next = useLegoStore((s) => s.next)

  const brickMeshRef = useRef<THREE.InstancedMesh>(null)
  const studMeshRef = useRef<THREE.InstancedMesh>(null)
  const wheelRefs = useRef<(THREE.Mesh | null)[]>([])

  // Liste plate des briques/roues (toutes étapes confondues) + nombre total de tenons.
  const {
    allBricks,
    allWheels,
    totalStuds,
    studIndicesPerBrick,
    brickStepRanges,
    wheelStepRanges,
  } = useMemo(() => {
    const bricks: BrickDef[] = []
    const wheels: WheelDef[] = []
    const studIndicesPerBrick: number[][] = []
    const brickStepRanges: Array<[number, number]> = []
    const wheelStepRanges: Array<[number, number]> = []
    let studCursor = 0
    for (const carStep of CAR_STEPS) {
      const brickStart = bricks.length
      for (const b of carStep.bricks) {
        bricks.push(b)
        const count = b.height > 0 ? b.studsX * b.studsZ : 0
        const indices: number[] = []
        for (let k = 0; k < count; k++) indices.push(studCursor++)
        studIndicesPerBrick.push(indices)
      }
      brickStepRanges.push([brickStart, bricks.length])

      const wheelStart = wheels.length
      for (const w of carStep.wheels) wheels.push(w)
      wheelStepRanges.push([wheelStart, wheels.length])
    }
    return {
      allBricks: bricks,
      allWheels: wheels,
      totalStuds: studCursor,
      studIndicesPerBrick,
      brickStepRanges,
      wheelStepRanges,
    }
  }, [])

  // Initialisées à FALL_HEIGHT : tant qu'aucune étape n'est validée (step === 0), toutes les
  // pièces sont "hors champ" sans animation parasite au montage.
  const brickOffsetsRef = useRef(new Float32Array(allBricks.length).fill(FALL_HEIGHT))
  const wheelOffsetsRef = useRef(new Float32Array(allWheels.length).fill(FALL_HEIGHT))
  // Objet réutilisé pour `damp()` (qui mute `obj[prop]`) — évite une allocation par pièce/frame
  const dampObjRef = useRef({ v: 0 })

  useFrame((_, delta) => {
    const brickMesh = brickMeshRef.current
    const studMesh = studMeshRef.current
    if (!brickMesh) return

    const visibleBricks = step === 0 ? 0 : brickStepRanges[step - 1][1]
    const visibleWheels = step === 0 ? 0 : wheelStepRanges[step - 1][1]

    stepOffsets(brickOffsetsRef.current, visibleBricks, delta, dampObjRef.current)
    stepOffsets(wheelOffsetsRef.current, visibleWheels, delta, dampObjRef.current)

    for (let i = 0; i < allBricks.length; i++) {
      const brick = allBricks[i]
      const visible = i < visibleBricks
      if (!visible) {
        // Brique pas encore révélée : la place hors champ (sous le plateau, invisible)
        tmpMatrix.compose(
          tmpPos.set(0, -5, 0),
          tmpQuat.identity(),
          tmpScale.set(0.0001, 0.0001, 0.0001)
        )
        brickMesh.setMatrixAt(i, tmpMatrix)
        if (studMesh) {
          for (const si of studIndicesPerBrick[i]) studMesh.setMatrixAt(si, tmpMatrix)
        }
        continue
      }
      const offset = brickOffsetsRef.current[i]
      setBrickInstance(brickMesh, studMesh, i, studIndicesPerBrick[i], brick, offset)
    }

    brickMesh.instanceMatrix.needsUpdate = true
    if (brickMesh.instanceColor) brickMesh.instanceColor.needsUpdate = true
    if (studMesh) {
      studMesh.instanceMatrix.needsUpdate = true
      if (studMesh.instanceColor) studMesh.instanceColor.needsUpdate = true
    }

    // Roues (meshes individuels — seulement 4, pas d'instancing nécessaire)
    for (let i = 0; i < allWheels.length; i++) {
      const wheelMesh = wheelRefs.current[i]
      if (!wheelMesh) continue
      const visible = i < visibleWheels
      const wheel = allWheels[i]
      if (!visible) {
        wheelMesh.visible = false
        continue
      }
      wheelMesh.visible = true
      wheelMesh.position.set(wheel.pos[0], wheel.pos[1] + wheelOffsetsRef.current[i], wheel.pos[2])
    }
  })

  function handlePlateClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    if (!active) return
    if (step >= CAR_TOTAL_STEPS) return
    playClick()
    next(CAR_TOTAL_STEPS)
  }

  return (
    <group
      position={PLATE_CENTER}
      onClick={handlePlateClick}
      onPointerOver={() => {
        if (active && step < CAR_TOTAL_STEPS) document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
      }}
    >
      {/* Plaque de base verte */}
      <mesh position={[0, -PLATE_THICKNESS / 2, 0]} receiveShadow>
        <boxGeometry args={[PLATE_SIZE[0], PLATE_THICKNESS, PLATE_SIZE[1]]} />
        <meshStandardMaterial color={COLORS.green} roughness={0.7} />
      </mesh>
      {/* Briques du modèle (instanciées) */}
      <instancedMesh
        ref={brickMeshRef}
        args={[undefined, undefined, allBricks.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.4} />
      </instancedMesh>
      {/* Tenons des briques (instanciés) */}
      {totalStuds > 0 && (
        <instancedMesh ref={studMeshRef} args={[undefined, undefined, totalStuds]} castShadow>
          <cylinderGeometry args={[1, 1, 1, 12]} />
          <meshStandardMaterial roughness={0.4} />
        </instancedMesh>
      )}
      {/* Roues (4 cylindres couchés, initialement invisibles) */}
      {allWheels.map((wheel, i) => (
        <mesh
          key={i}
          ref={(m) => {
            wheelRefs.current[i] = m
          }}
          rotation={[0, 0, Math.PI / 2]}
          visible={false}
          castShadow
        >
          <cylinderGeometry args={[wheel.radius, wheel.radius, wheel.width, 16]} />
          <meshStandardMaterial color={wheel.color} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Briques éparses (statiques) ─────────────────────────────────────────────────

function ScatteredBricks() {
  const brickMeshRef = useRef<THREE.InstancedMesh>(null)
  const studMeshRef = useRef<THREE.InstancedMesh>(null)

  const totalStuds = useMemo(
    () => SCATTERED_BRICKS.reduce((sum, b) => sum + b.studsX * b.studsZ, 0),
    []
  )

  useEffect(() => {
    const brickMesh = brickMeshRef.current
    const studMesh = studMeshRef.current
    if (!brickMesh) return

    let studCursor = 0
    for (let i = 0; i < SCATTERED_BRICKS.length; i++) {
      const brick = SCATTERED_BRICKS[i]
      const count = brick.studsX * brick.studsZ
      const indices: number[] = []
      for (let k = 0; k < count; k++) indices.push(studCursor++)
      setBrickInstance(brickMesh, studMesh, i, indices, brick, 0)
    }
    brickMesh.instanceMatrix.needsUpdate = true
    if (brickMesh.instanceColor) brickMesh.instanceColor.needsUpdate = true
    if (studMesh) {
      studMesh.instanceMatrix.needsUpdate = true
      if (studMesh.instanceColor) studMesh.instanceColor.needsUpdate = true
    }
  }, [])

  return (
    <group position={SCATTERED_ORIGIN}>
      <instancedMesh
        ref={brickMeshRef}
        args={[undefined, undefined, SCATTERED_BRICKS.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={studMeshRef} args={[undefined, undefined, totalStuds]} castShadow>
        <cylinderGeometry args={[1, 1, 1, 12]} />
        <meshStandardMaterial roughness={0.4} />
      </instancedMesh>
    </group>
  )
}

// ─── Tour de briques physique (rapier) ───────────────────────────────────────────
//
// Petite tour de 5 briques empilées, posée à droite du plateau. Chaque brique = un
// `RigidBody` dynamique. Cliquer la tour applique une impulsion latérale aléatoire sur
// chaque brique, la faisant s'écrouler.

// Posée directement sur la table (à droite du plateau de montage et des briques éparses) — le
// socle fixe ci-dessous ajoute sa propre épaisseur, donc on part de TABLE_TOP_Y (pas PLATE_TOP_Y).
const TOWER_POS: [number, number, number] = [0.32, TABLE_TOP_Y, 0]
const TOWER_BRICK_SIZE: [number, number, number] = [UNIT * 2, BRICK_H, UNIT * 2]
const TOWER_COLORS = [COLORS.red, COLORS.yellow, COLORS.blue, COLORS.green, COLORS.white]

function PhysicsTower() {
  const bodyRefs = useRef<RapierRigidBody[]>([])

  function handleTowerClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    playClick()
    for (const body of bodyRefs.current) {
      if (!body) continue
      // Impulsion latérale aléatoire + légère poussée vers le haut → effet "écroulement".
      // Ordres de grandeur calés sur la masse d'une brique (~1.5e-4 kg à densité par défaut) :
      // impulse = masse × Δv, on vise un Δv de l'ordre de 0.3-0.6 m/s.
      const ix = (Math.random() - 0.5) * 0.00012
      const iz = (Math.random() - 0.5) * 0.00012
      body.applyImpulse({ x: ix, y: 0.00004, z: iz }, true)
    }
  }

  return (
    <group position={TOWER_POS}>
      {/* Socle fixe — posé sur la table (pas embarqué dedans), sert d'appui à la tour */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.005, 0]} receiveShadow>
          <boxGeometry args={[0.14, 0.01, 0.14]} />
          <meshStandardMaterial color={COLORS.gray} roughness={0.6} />
        </mesh>
      </RigidBody>
      {/* Briques empilées — la première repose sur le socle (top du socle à y=0.01) */}
      {TOWER_COLORS.map((color, i) => (
        <RigidBody
          key={i}
          ref={(api) => {
            if (api) bodyRefs.current[i] = api
          }}
          position={[0, 0.01 + BRICK_H / 2 + i * BRICK_H + 0.002, 0]}
          colliders="cuboid"
          restitution={0.15}
          friction={0.6}
        >
          {/* Brique simple (sans tenons décoratifs : un mesh supplémentaire générerait un
              collider "cuboid" additionnel par brique avec `colliders="cuboid"`). Le clic est
              porté par le mesh (RigidBodyProps ne type pas onClick). */}
          <mesh
            castShadow
            receiveShadow
            onClick={handleTowerClick}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = 'auto')}
          >
            <boxGeometry args={TOWER_BRICK_SIZE} />
            <meshStandardMaterial color={color} roughness={0.4} />
          </mesh>
        </RigidBody>
      ))}
    </group>
  )
}

// ─── Panneau UI (Html) ────────────────────────────────────────────────────────────

interface BuildPanelProps {
  step: number
  onReset: () => void
}

function BuildPanel({ step, onReset }: BuildPanelProps) {
  const done = step >= CAR_TOTAL_STEPS

  return (
    <Html
      position={[0.15, PLATE_TOP_Y + 0.35, -0.2]}
      transform
      distanceFactor={1.1}
      occlude={false}
    >
      <div
        style={{
          width: 170,
          padding: '10px 12px',
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
        <div style={{ fontWeight: 600, marginBottom: 4, letterSpacing: 0.3 }}>Maquette Lego</div>
        <div style={{ opacity: 0.8, marginBottom: 8 }}>
          {done ? 'Voiture terminée !' : `Étape ${step} / ${CAR_TOTAL_STEPS}`}
        </div>
        <div style={{ opacity: 0.7, marginBottom: 8, fontSize: 11 }}>
          {done ? 'Clique sur reset pour tout démonter.' : 'Clique sur le plateau pour assembler.'}
        </div>
        <button
          onClick={onReset}
          style={{
            width: '100%',
            padding: '6px 0',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.92)',
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          Réinitialiser
        </button>
      </div>
    </Html>
  )
}

// ─── LegoCorner (export) ──────────────────────────────────────────────────────────
//
// Coin legos (premier plan droit, x≈2.6, z≈1.2) : table basse avec un plateau de montage
// (petite voiture en ~9 étapes, clic pour assembler progressivement), des briques éparses
// statiques, et une tour de briques physique (rapier) qui s'écroule au clic.
//
// `<Physics>` n'est monté qu'une fois le POI 'legos' visité au moins une fois
// (`useLegoStore.visited`) — évite de payer le coût d'initialisation de rapier (WASM) au
// chargement initial de la scène, pour un coin qui n'est peut-être jamais visité.

export default function LegoCorner() {
  const activePoi = useCameraStore((s) => s.poi)
  const poiActive = activePoi === 'legos'
  const step = useLegoStore((s) => s.step)
  const reset = useLegoStore((s) => s.reset)
  const visited = useLegoStore((s) => s.visited)
  const markVisited = useLegoStore((s) => s.markVisited)

  // `<Physics>` reste monté pour le reste de la session une fois `visited` passé à `true` —
  // le store ne revient jamais en arrière, donc pas besoin d'état local supplémentaire.
  useEffect(() => {
    if (poiActive) markVisited()
  }, [poiActive, markVisited])

  function handleReset() {
    playClick()
    reset()
  }

  return (
    <Hotspot poi="legos" label="Coin legos" position={[2.6, 0, 1.2]}>
      <Editable id="legos" label="Coin legos">
        <LowTable />
        <BuildPlate active={poiActive} />
        <ScatteredBricks />
      </Editable>
      {poiActive && <BuildPanel step={step} onReset={handleReset} />}
      {visited && (
        <Physics>
          <PhysicsTower />
        </Physics>
      )}
    </Hotspot>
  )
}
