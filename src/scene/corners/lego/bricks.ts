import { damp } from 'maath/easing'
import * as THREE from 'three'

// ─── Constantes ────────────────────────────────────────────────────────────────
//
// Unité lego ≈ taille d'un stud (tenon) en plan : 1 unité = 0.04 m. Hauteur d'une brique
// (sans tenons) = 0.024 m, tenon = cylindre de rayon 0.012, hauteur 0.006.

export const UNIT = 0.04
export const BRICK_H = 0.024
export const STUD_R = 0.012
export const STUD_H = 0.006

export const TABLE_TOP_Y = 0.32
export const PLATE_THICKNESS = 0.01
// Surface utile du plateau (dessus de la plaque de base)
export const PLATE_TOP_Y = TABLE_TOP_Y + PLATE_THICKNESS

export const COLORS = {
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
export const TABLETOP_THICKNESS = 0.03

// ─── Description d'une brique ───────────────────────────────────────────────────
//
// `studs` : nombre de tenons en (X, Z) — taille de la brique en unités lego.
// `pos` : centre de la brique relatif au plateau (en mètres), `pos[1]` = altitude de la base
// de la brique (la base repose sur PLATE_TOP_Y + n * BRICK_H pour empiler proprement).

export interface BrickDef {
  studsX: number
  studsZ: number
  height: number
  pos: [number, number, number]
  color: string
  /** Rotation Y (radians), pour orienter les briques 1xN. */
  rotY?: number
}

/** Roue (cylindre couché) — trop peu nombreuses pour justifier l'instancing (4 au total). */
export interface WheelDef {
  pos: [number, number, number]
  radius: number
  width: number
  color: string
}

// Centre du plateau de montage (côté gauche de la table, pour laisser la tour à droite)
export const PLATE_CENTER: [number, number, number] = [-0.18, PLATE_TOP_Y, 0]
export const PLATE_SIZE: [number, number] = [0.4, 0.32] // en mètres (X, Z)

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

export interface CarStep {
  bricks: BrickDef[]
  wheels: WheelDef[]
}

export const CAR_STEPS: CarStep[] = [
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

export const CAR_TOTAL_STEPS = CAR_STEPS.length

// ─── Briques éparses (décor statique) ────────────────────────────────────────────
//
// Quelques briques posées en vrac directement sur le plateau de la table (pas sur la plaque
// verte), entre le set en cours de montage et la tour physique. Statiques (pas d'animation) —
// instanciées pour limiter le coût. `pos[1]` est exprimé directement sur la surface de la
// table (TABLE_TOP_Y) — pas d'épaisseur de plaque ici, donc pas d'écart vertical parasite.
export const SCATTERED_ORIGIN: [number, number, number] = [0.1, TABLE_TOP_Y, 0]

// `pos` est relatif à SCATTERED_ORIGIN — y=0 pose la brique directement sur la table.
export const SCATTERED_BRICKS: BrickDef[] = [
  { studsX: 2, studsZ: 1, height: BRICK_H, pos: [0.04, 0, 0.08], color: COLORS.green, rotY: 0.3 },
  { studsX: 1, studsZ: 1, height: BRICK_H, pos: [0.1, 0, 0.13], color: COLORS.red, rotY: -0.5 },
  { studsX: 2, studsZ: 2, height: BRICK_H, pos: [0.02, 0, -0.08], color: COLORS.white, rotY: 0.9 },
  { studsX: 1, studsZ: 1, height: BRICK_H, pos: [0.12, 0, -0.1], color: COLORS.yellow, rotY: 0.2 },
  { studsX: 1, studsZ: 2, height: BRICK_H, pos: [-0.04, 0, 0.15], color: COLORS.blue, rotY: -0.3 },
]

// ─── Tour de briques physique (rapier) ───────────────────────────────────────────
//
// Posée directement sur la table (à droite du plateau de montage et des briques éparses) — le
// socle fixe ajoute sa propre épaisseur, donc on part de TABLE_TOP_Y (pas PLATE_TOP_Y).
export const TOWER_POS: [number, number, number] = [0.32, TABLE_TOP_Y, 0]
export const TOWER_BRICK_SIZE: [number, number, number] = [UNIT * 2, BRICK_H, UNIT * 2]
export const TOWER_COLORS = [COLORS.red, COLORS.yellow, COLORS.blue, COLORS.green, COLORS.white]

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
export function setBrickInstance(
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

// Échelle quasi nulle utilisée pour "cacher" une instance hors champ (sous le plateau).
const HIDDEN_SCALE = 0.0001

/**
 * Place l'instance `index` (et ses tenons éventuels) hors champ — utilisé pour les pièces pas
 * encore révélées par l'étape courante. Réutilise les mêmes scratch `tmp*` que
 * `setBrickInstance` (jamais utilisés simultanément dans la même frame).
 */
export function hideBrickInstance(
  mesh: THREE.InstancedMesh,
  studMesh: THREE.InstancedMesh | null,
  index: number,
  studIndices: number[]
) {
  tmpMatrix.compose(
    tmpPos.set(0, -5, 0),
    tmpQuat.identity(),
    tmpScale.set(HIDDEN_SCALE, HIDDEN_SCALE, HIDDEN_SCALE)
  )
  mesh.setMatrixAt(index, tmpMatrix)
  if (studMesh) {
    for (const si of studIndices) studMesh.setMatrixAt(si, tmpMatrix)
  }
}

// ─── Animation de chute (plateau de montage) ─────────────────────────────────────

// Hauteur de chute d'arrivée (animation flottante) — chaque pièce nouvellement révélée part
// d'un offset positif et redescend vers 0 (sa position finale).
export const FALL_HEIGHT = 0.35

/**
 * Anime un tableau d'offsets de chute vers leurs cibles (0 = en place, FALL_HEIGHT = caché en
 * hauteur). `dampObj` est un objet réutilisé (mutation in-place) pour éviter une allocation par
 * pièce/frame avec `maath`'s `damp`.
 */
export function stepOffsets(
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
