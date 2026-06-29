import * as THREE from 'three'
import type { EditableEntry } from '@/editor/useEditorStore'

// Auto-fit / snapping du gizmo de translate (éditeur de scène, dev only) : pendant un drag,
// calcule une correction de position pour que l'objet déplacé se cale flush contre le sol, les
// murs, ou la surface d'un autre objet éditable au lieu de les traverser. Tout est calculé en
// repère MONDE (AABB via Box3.setFromObject), puis converti en delta LOCAL au parent de l'objet
// avant d'être appliqué — voir `worldDeltaToLocal`.

// ─── Surfaces intérieures de la pièce ──────────────────────────────────────────
// Déduites de la géométrie de src/scene/desk/Room.tsx. À RECALCULER si la pièce change
// (épaisseur de mur, position des murs...).
//   - Sol : plan y = 0 (les objets reposent à y ≥ 0).
//   - Mur du fond : mesh centré z = -4, épaisseur 0.08 → face intérieure z = -3.96.
//   - Mur gauche : mesh centré x = -4, épaisseur 0.08 → face intérieure x = -3.96.
const FLOOR_Y = 0
const BACK_WALL_Z = -3.96
const LEFT_WALL_X = -3.96

// Distance en-deçà de laquelle une face de l'AABB déplacée est aimantée flush contre une
// surface (mur/sol/autre objet). Aussi la marge de tolérance qui empêche l'interpénétration.
export const SNAP_DIST = 0.08

// ─── Temporaires hoistés (zéro allocation par frame de drag) ──────────────────
const tmpBox = new THREE.Box3()
const tmpWorldDelta = new THREE.Vector3()
const tmpLocalDelta = new THREE.Vector3()
const tmpParentPosition = new THREE.Vector3()
const tmpParentScale = new THREE.Vector3()
const tmpParentQuatInverse = new THREE.Quaternion()

// ─── Cache des AABB des autres entités, snapshotté à onMouseDown ──────────────
// Les autres objets ne bougent pas pendant le drag courant : on évite de refaire
// `Box3.setFromObject` (traversée de toute la hiérarchie) sur chacun à chaque mousemove.
let otherEntityBoxes: { id: string; box: THREE.Box3 }[] = []

/**
 * Snapshotte les AABB monde de toutes les entités du registry SAUF celle en cours de drag.
 * À appeler à `onMouseDown` (début de drag), une seule fois.
 */
export function snapshotOtherEntities(
  registry: Map<string, EditableEntry>,
  draggedId: string
): void {
  otherEntityBoxes = []
  registry.forEach((entry, id) => {
    if (id === draggedId) return
    const box = new THREE.Box3().setFromObject(entry.object)
    if (!box.isEmpty()) otherEntityBoxes.push({ id, box })
  })
}

/** Vide le cache de snapshot. À appeler à `onMouseUp` (fin de drag). */
export function clearSnapshot(): void {
  otherEntityBoxes = []
}

/**
 * Convertit un delta exprimé en repère MONDE en delta LOCAL au parent d'un objet, en tenant
 * compte de la rotation ET de l'échelle monde du parent (un simple `object.position.add(delta)`
 * serait faux dès que le parent est tourné/scalé — cf. l'entité `guitar` sous un groupe pivoté).
 *
 * On ne peut pas utiliser `parent.worldToLocal` sur un point ici : cette méthode inclut la
 * translation du parent, alors qu'on veut transformer un VECTEUR (différence de deux points),
 * donc seulement rotation + échelle, sans translation. On extrait la composante
 * rotation+échelle de la matrice monde du parent et on l'inverse.
 */
function worldDeltaToLocal(parent: THREE.Object3D, worldDelta: THREE.Vector3): THREE.Vector3 {
  // `tmpParentPosition` n'est qu'un réceptacle jetable pour la translation (ignorée : on ne
  // transforme qu'un vecteur-delta, pas un point) — il ne faut pas écraser `worldDelta` lui-même.
  parent.matrixWorld.decompose(tmpParentPosition, tmpParentQuatInverse, tmpParentScale)
  tmpParentQuatInverse.invert()
  tmpLocalDelta.copy(worldDelta).applyQuaternion(tmpParentQuatInverse).divide(tmpParentScale)
  return tmpLocalDelta
}

/**
 * Calcule la correction à appliquer sur un axe pour qu'une face MIN de l'AABB déplacée (sol, ou
 * mur où l'intérieur de la pièce est à coordonnée croissante) reste flush contre `surface` —
 * uniquement si elle la pénètre ou s'en approche à moins de SNAP_DIST. Les 3 surfaces de la pièce
 * (sol, mur fond, mur gauche) sont toutes des bornes MIN dans ce repère : pas besoin d'une
 * variante borne MAX pour l'instant.
 * Retourne 0 si aucune correction n'est nécessaire sur cet axe.
 */
function floorOrWallCorrection(aabbMin: number, surface: number): number {
  const penetration = surface - aabbMin
  return penetration > -SNAP_DIST ? penetration : 0
}

/**
 * Teste l'AABB déplacée contre une AABB fixe (autre entité) : si elles se chevauchent sur 2 axes
 * et s'approchent/pénètrent sur le 3e à moins de SNAP_DIST, renvoie la correction à appliquer sur
 * cet axe (et l'axe concerné) pour caler flush contre la face la plus proche. On choisit l'axe de
 * moindre pénétration/distance parmi les 3 candidats (x/y/z) pour ne pas faire sauter l'objet de
 * façon incohérente. Retourne null si aucun snap ne s'applique.
 */
function nearestObjectAxisCorrection(
  moved: THREE.Box3,
  fixed: THREE.Box3
): { axis: 'x' | 'y' | 'z'; delta: number; distance: number } | null {
  const axes: Array<'x' | 'y' | 'z'> = ['x', 'y', 'z']
  let best: { axis: 'x' | 'y' | 'z'; delta: number; distance: number } | null = null

  for (const axis of axes) {
    const otherAxes = axes.filter((a) => a !== axis)
    // Chevauchement requis sur les 2 AUTRES axes (sinon les objets ne sont pas "en face" l'un de
    // l'autre sur cet axe — pas de sens à se caler dessus/contre).
    const overlaps = otherAxes.every(
      (a) => moved.min[a] <= fixed.max[a] + SNAP_DIST && moved.max[a] >= fixed.min[a] - SNAP_DIST
    )
    if (!overlaps) continue

    // Sur l'axe testé, deux faces candidates : moved.max contre fixed.min (on s'approche par le
    // bas/devant), ou moved.min contre fixed.max (on s'approche par le haut/derrière). On retient
    // la plus proche des deux.
    const distAboveBelow = fixed.min[axis] - moved.max[axis] // >0 si moved est encore au-dessus
    const distBelowAbove = moved.min[axis] - fixed.max[axis] // >0 si moved est encore en-dessous

    if (Math.abs(distAboveBelow) <= SNAP_DIST && distAboveBelow <= distBelowAbove) {
      const candidate = { axis, delta: distAboveBelow, distance: Math.abs(distAboveBelow) }
      if (!best || candidate.distance < best.distance) best = candidate
    }
    if (Math.abs(distBelowAbove) <= SNAP_DIST && distBelowAbove <= distAboveBelow) {
      const candidate = { axis, delta: -distBelowAbove, distance: Math.abs(distBelowAbove) }
      if (!best || candidate.distance < best.distance) best = candidate
    }
  }

  return best
}

/**
 * Calcule et applique le snap (sol / murs / autres objets) à l'objet en cours de drag, en mutant
 * directement `object.position`. Résout les corrections AXE PAR AXE (un cumul x/y/z indépendant,
 * jamais deux corrections contradictoires sur le même axe) :
 *   1. Sol et murs d'abord (clamp + aimantation).
 *   2. Autres objets ensuite, uniquement sur les axes pas déjà saturés par un mur/le sol — on
 *      retient l'axe de moindre pénétration parmi tous les objets, et seulement si l'axe choisi
 *      n'a pas de correction mur/sol déjà appliquée (sinon collision de contraintes).
 *
 * À appeler depuis `onObjectChange`, AVANT `setOverride` (le snap doit être reflété dans
 * l'override sauvegardé).
 */
export function applySnap(object: THREE.Object3D): void {
  tmpBox.setFromObject(object)
  if (tmpBox.isEmpty()) return

  const correction = { x: 0, y: 0, z: 0 }
  const lockedAxis = { x: false, y: false, z: false }

  // ── 1. Sol et murs (toujours prioritaires) ──
  const floorDelta = floorOrWallCorrection(tmpBox.min.y, FLOOR_Y)
  if (floorDelta !== 0) {
    correction.y = floorDelta
    lockedAxis.y = true
  }
  const backWallDelta = floorOrWallCorrection(tmpBox.min.z, BACK_WALL_Z)
  if (backWallDelta !== 0) {
    correction.z = backWallDelta
    lockedAxis.z = true
  }
  const leftWallDelta = floorOrWallCorrection(tmpBox.min.x, LEFT_WALL_X)
  if (leftWallDelta !== 0) {
    correction.x = leftWallDelta
    lockedAxis.x = true
  }

  // ── 2. Autres objets éditables (cache snapshotté à onMouseDown) ──
  // On teste sur l'AABB déjà décalée par la correction mur/sol ci-dessus (résolution séquentielle :
  // d'abord les murs, puis les objets sur ce qui reste), pour que la décision "contre quelle face"
  // se base sur la position finale plutôt que sur la position pré-snap-mur. `tmpWorldDelta` est
  // réutilisé comme vecteur de décalage jetable (pas encore utilisé à ce stade de la fonction).
  tmpWorldDelta.set(correction.x, correction.y, correction.z)
  tmpBox.min.add(tmpWorldDelta)
  tmpBox.max.add(tmpWorldDelta)

  let bestObjectCorrection: { axis: 'x' | 'y' | 'z'; delta: number; distance: number } | null = null
  for (const { box } of otherEntityBoxes) {
    const candidate = nearestObjectAxisCorrection(tmpBox, box)
    if (!candidate) continue
    if (lockedAxis[candidate.axis]) continue // axe déjà saturé par un mur/le sol, on ne contredit pas
    if (!bestObjectCorrection || candidate.distance < bestObjectCorrection.distance) {
      bestObjectCorrection = candidate
    }
  }
  if (bestObjectCorrection) {
    correction[bestObjectCorrection.axis] += bestObjectCorrection.delta
  }

  if (correction.x === 0 && correction.y === 0 && correction.z === 0) return

  // Le delta est calculé en MONDE ; `object.position` est LOCAL à son parent direct — conversion
  // obligatoire dès que ce parent est tourné/scalé (ex. entité sous un groupe pivoté).
  tmpWorldDelta.set(correction.x, correction.y, correction.z)
  if (object.parent) {
    const local = worldDeltaToLocal(object.parent, tmpWorldDelta)
    object.position.add(local)
  } else {
    object.position.add(tmpWorldDelta)
  }
}
