import type { MutableRefObject } from 'react'
import { Geometry, Base, Addition, Subtraction } from '@react-three/csg'
import { GuitarString } from './GuitarString'
import { STRING_COUNT, STRING_LENGTH } from './constants'

const STRING_SPACING = 0.026

const BODY_COLOR = '#a0682f'
const BODY_DARK = '#7a4d22'
const NECK_COLOR = '#3d2b1f'
const HEADSTOCK_COLOR = '#2b1d14'
const STAND_COLOR = '#2a2a2a'

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

// ─── Corps + manche + stand ──────────────────────────────────────────────────

interface GuitarModelProps {
  stringTriggerRef: MutableRefObject<number[]>
  interactive: boolean
}

export function GuitarModel({ stringTriggerRef, interactive }: GuitarModelProps) {
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
