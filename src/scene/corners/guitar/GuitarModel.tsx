import { useMemo, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import type { GLTF } from 'three-stdlib'
import { GuitarString } from './GuitarString'

// ─── Modèle GLB (Epiphone Les Paul Standard) ─────────────────────────────────
//
// Source : https://sketchfab.com/3d-models/epiphone-les-paul-standard-bd6d9c5cb48743288106cfa1d527932c
// Auteur : proudlove1, licence CC-BY-4.0.
//
// Le GLB est exporté à une échelle "réelle" énorme (le manche s'étend sur ~2060 unités selon
// l'axe X local, têtière vers +X, corps vers -X) et chaque mesh porte déjà une rotation
// [-π/2, 0, 0] le rendant Y-up. `MODEL_SCALE/POSITION` + le quaternion `NECK_SIGN/FACE_SIGN`
// ramènent l'ensemble à l'échelle de la scène (~1.3 unité de long), manche vers le haut, posé
// sur le stand au sol (y=0).
//
// AJUSTER À L'ŒIL — ces constantes sont les seules à retoucher si l'orientation/taille ne
// convient pas :
// - MODEL_SCALE : taille globale (≈1.3 unité de long avec 0.00065)
// - NECK_SIGN / FACE_SIGN ci-dessous : orientation (voir commentaire dédié)
// - MODEL_POSITION : recentre le bas du corps sur y=0 (niveau du stand).
const MODEL_SCALE = 0.00065
const MODEL_POSITION: [number, number, number] = [0, 0.39, 0]

// Le GLB a ses axes locaux établis ainsi : manche le long de X local (têtière vers +X, corps/
// strap-peg vers -X), épaisseur du corps le long de Y local (faible amplitude), largeur/cordes
// le long de Z local (Mi grave à z≈-40, Mi aigu à z≈+41). Une simple rotation Euler ne suffit
// pas à remapper proprement ces 3 axes vers le repère monde (manche → haut, face → pièce) sans
// retourner la guitare de profil : on construit donc une permutation d'axes via une matrice de
// base, convertie en quaternion.
//
// ±1 : sens du manche une fois redressé. +1 = tête de manche (x local positif) pointe vers le
// haut. Si la guitare apparaît tête en bas, inverser ce signe.
const NECK_SIGN = 1
// ±1 : quelle face du local Y (épaisseur du corps) regarde vers la pièce (+Z monde = face
// avant). Si c'est le dos de la guitare qui fait face à la pièce, inverser ce signe.
const FACE_SIGN = 1
// Déduit pour garantir une rotation propre (déterminant +1, pas de mirroring) — ne pas rendre
// indépendant. Si l'ordre des cordes (grave/aigu) apparaît inversé gauche-droite à l'écran, il
// faudra inverser l'un des deux signes ci-dessus : ça inversera aussi haut/bas ou avant/arrière
// en même temps, c'est la contrainte du déterminant (rotation propre vs symétrie).
const STRING_ORDER_SIGN = NECK_SIGN * FACE_SIGN

const STAND_COLOR = '#2a2a2a'

// Mapping cordes GLB → fréquences EADGBE (ordonné par z croissant = grave → aigu dans
// l'espace local du GLB). Position/rotation/scale copiés tels quels depuis le node correspondant.
const STRING_NODES: Array<{
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number] | number
}> = [
  // index 0 → 82.41 (Mi grave) — StringElow_med001
  { position: [0, 21.478, -39.858], rotation: [-Math.PI / 2, 0, 0], scale: 100 },
  // index 1 → 110 (La) — StringA_01003
  { position: [0, 21.478, -23.676], rotation: [-Math.PI / 2, 0, 0], scale: [100, 90.41, 100] },
  // index 2 → 146.83 (Ré) — StringD_01003
  { position: [0, 21.478, -7.494], rotation: [-Math.PI / 2, 0, 0], scale: 100 },
  // index 3 → 196 (Sol) — StringG_01001
  { position: [0, 21.478, 8.687], rotation: [-Math.PI / 2, 0, 0], scale: [100, 90.41, 100] },
  // index 4 → 246.94 (Si) — StringB_01001
  { position: [0, 21.478, 24.869], rotation: [-Math.PI / 2, 0, 0], scale: [100, 90.41, 100] },
  // index 5 → 329.63 (Mi aigu) — StringEhigh_01001
  { position: [0, 21.478, 41.268], rotation: [-Math.PI / 2, 0, 0], scale: 100 },
]

type GLTFResult = GLTF & {
  nodes: {
    Pickup_med001_SmallbitsBake_0: THREE.Mesh
    Pickupbase_med001_SmallbitsBake_0: THREE.Mesh
    Pickguard_med001_SmallbitsBake_0: THREE.Mesh
    Pickguardsupport_med001_SmallbitsBake_0: THREE.Mesh
    TuningPegBase_med001_SmallbitsBake_0: THREE.Mesh
    TuningPegKnob_med001_SmallbitsBake_0: THREE.Mesh
    TuningPeg_med001_SmallbitsBake_0: THREE.Mesh
    HeadPlate_med001_SmallbitsBake_0: THREE.Mesh
    TogglePlate_med001_SmallbitsBake_0: THREE.Mesh
    TogglePlateRing_med001_SmallbitsBake_0: THREE.Mesh
    ToggleSwitch_med001_SmallbitsBake_0: THREE.Mesh
    StrapPeg_med001_SmallbitsBake_0: THREE.Mesh
    KnobInner_01_med001_SmallbitsBake_0: THREE.Mesh
    Bridge02_med001_SmallbitsBake_0: THREE.Mesh
    BridgePost02_med001_SmallbitsBake_0: THREE.Mesh
    BridgeWedge_med001_SmallbitsBake_0: THREE.Mesh
    Bridge01_med001_SmallbitsBake_0: THREE.Mesh
    BridgePost01_med003_SmallbitsBake_0: THREE.Mesh
    InputJack_med001_SmallbitsBake_0: THREE.Mesh
    StringElow_med001_Strings_0: THREE.Mesh
    KnobTrans_med001_Refractive_0: THREE.Mesh
    KnobInner_med001_SmallbitsBake_0: THREE.Mesh
    Neck_med001_MainBake_0: THREE.Mesh
    Nut_med001_MainBake_0: THREE.Mesh
    BridgeWedge_med002_SmallbitsBake_0: THREE.Mesh
    BridgeWedge_med003_SmallbitsBake_0: THREE.Mesh
    BridgeWedge_med004_SmallbitsBake_0: THREE.Mesh
    BridgeWedge_med005_SmallbitsBake_0: THREE.Mesh
    BridgeWedge_med006_SmallbitsBake_0: THREE.Mesh
    KnobTrans_med002_Refractive_0: THREE.Mesh
    KnobTrans_med003_Refractive_0: THREE.Mesh
    KnobTrans_med004_Refractive_0: THREE.Mesh
    TuningPegBase_med002_SmallbitsBake_0: THREE.Mesh
    TuningPegKnob_med002_SmallbitsBake_0: THREE.Mesh
    TuningPeg_med002_SmallbitsBake_0: THREE.Mesh
    TuningPegBase_med003_SmallbitsBake_0: THREE.Mesh
    TuningPegKnob_med003_SmallbitsBake_0: THREE.Mesh
    TuningPeg_med003_SmallbitsBake_0: THREE.Mesh
    TuningPegBase_med004_SmallbitsBake_0: THREE.Mesh
    TuningPegKnob_med004_SmallbitsBake_0: THREE.Mesh
    TuningPeg_med004_SmallbitsBake_0: THREE.Mesh
    TuningPegBase_med005_SmallbitsBake_0: THREE.Mesh
    TuningPegKnob_med005_SmallbitsBake_0: THREE.Mesh
    TuningPeg_med005_SmallbitsBake_0: THREE.Mesh
    TuningPegBase_med006_SmallbitsBake_0: THREE.Mesh
    TuningPegKnob_med006_SmallbitsBake_0: THREE.Mesh
    TuningPeg_med006_SmallbitsBake_0: THREE.Mesh
    StrapPeg_med002_SmallbitsBake_0: THREE.Mesh
    StringG_01001_Strings_0: THREE.Mesh
    StringB_01001_Strings_0: THREE.Mesh
    StringEhigh_01001_Strings_0: THREE.Mesh
    StringA_01003_Strings_0: THREE.Mesh
    StringD_01003_Strings_0: THREE.Mesh
    Pickup_med002_SmallbitsBake_0: THREE.Mesh
    Pickupbase_med002_SmallbitsBake_0: THREE.Mesh
    KnobInner_01_med002_SmallbitsBake_0: THREE.Mesh
    KnobInner_med002_SmallbitsBake_0: THREE.Mesh
    KnobInner_01_med003_SmallbitsBake_0: THREE.Mesh
    KnobInner_med003_SmallbitsBake_0: THREE.Mesh
    KnobInner_01_med004_SmallbitsBake_0: THREE.Mesh
    KnobInner_med004_SmallbitsBake_0: THREE.Mesh
    Body_med001_MainBake_0: THREE.Mesh
  }
  materials: {
    SmallbitsBake: THREE.MeshStandardMaterial
    Strings: THREE.MeshStandardMaterial
    Refractive: THREE.MeshPhysicalMaterial
    MainBake: THREE.MeshStandardMaterial
  }
}

interface GuitarModelProps {
  stringTriggerRef: MutableRefObject<number[]>
  interactive: boolean
}

export function GuitarModel({ stringTriggerRef, interactive }: GuitarModelProps) {
  const { nodes, materials } = useGLTF('/models/guitar.glb') as unknown as GLTFResult

  // Quaternion de permutation d'axes (cf. commentaire NECK_SIGN/FACE_SIGN plus haut) : envoie
  // X local (manche) → Y monde, Y local (épaisseur) → Z monde, Z local (cordes) → X monde.
  const modelQuaternion = useMemo(() => {
    const basis = new THREE.Matrix4().makeBasis(
      new THREE.Vector3(0, NECK_SIGN, 0), // image de l'axe local X (manche)
      new THREE.Vector3(0, 0, FACE_SIGN), // image de l'axe local Y (épaisseur)
      new THREE.Vector3(STRING_ORDER_SIGN, 0, 0), // image de l'axe local Z (largeur/cordes)
    )
    return new THREE.Quaternion().setFromRotationMatrix(basis)
  }, [])

  // Espacement moyen réel entre cordes adjacentes (référentiel parent, donc PAS affecté par le
  // `scale` interne du GLB) : sert à dimensionner un hitbox de clic proportionné à l'écart
  // réel entre cordes plutôt qu'à la géométrie brute (bien trop fine et non représentative une
  // fois mise à l'échelle).
  const stringHitboxRadius = useMemo(() => {
    const zPositions = STRING_NODES.map((n) => n.position[2])
    const spacings = zPositions.slice(1).map((z, i) => z - zPositions[i])
    const avgSpacing = spacings.reduce((sum, s) => sum + s, 0) / spacings.length
    const targetRadius = avgSpacing * 0.35
    // Composante d'échelle interne du GLB (X/Z) à neutraliser pour revenir dans l'espace local
    // de la corde, où `cylinderGeometry` sera dimensionné dans GuitarString.
    const scaleXZ = 100
    return targetRadius / scaleXZ
  }, [])

  // Liste des 6 cordes interactives, dérivée des nodes GLB + du mapping fréquences.
  const stringNodes = useMemo(() => {
    const geometries = [
      nodes.StringElow_med001_Strings_0.geometry,
      nodes.StringA_01003_Strings_0.geometry,
      nodes.StringD_01003_Strings_0.geometry,
      nodes.StringG_01001_Strings_0.geometry,
      nodes.StringB_01001_Strings_0.geometry,
      nodes.StringEhigh_01001_Strings_0.geometry,
    ]
    return geometries.map((geometry, i) => ({ geometry, ...STRING_NODES[i] }))
  }, [nodes])

  return (
    <group>
      {/* ── Modèle GLB (corps, manche, mécaniques, micros, knobs, bridge…) ── */}
      <group position={MODEL_POSITION} quaternion={modelQuaternion} scale={MODEL_SCALE}>
        <group
          name="TuningPeg_med001"
          position={[1294.181, -107.717, 46.809]}
          rotation={[1.57, -0.296, 3.14]}
          scale={100}
        >
          <mesh
            name="TuningPeg_med001_SmallbitsBake_0"
            geometry={nodes.TuningPeg_med001_SmallbitsBake_0.geometry}
            material={materials.SmallbitsBake}
          />
          <mesh
            name="TuningPegBase_med001_SmallbitsBake_0"
            geometry={nodes.TuningPegBase_med001_SmallbitsBake_0.geometry}
            material={materials.SmallbitsBake}
            position={[0.01, 0.001, 0.319]}
          />
          <mesh
            name="TuningPegKnob_med001_SmallbitsBake_0"
            geometry={nodes.TuningPegKnob_med001_SmallbitsBake_0.geometry}
            material={materials.SmallbitsBake}
            position={[0.01, -0.445, 0.447]}
            rotation={[0, -1.193, 0]}
          />
        </group>
        <group
          name="TuningPeg_med002"
          position={[1378.214, -133.35, 46.196]}
          rotation={[1.57, -0.296, -3.115]}
          scale={100}
        >
          <mesh
            name="TuningPeg_med002_SmallbitsBake_0"
            geometry={nodes.TuningPeg_med002_SmallbitsBake_0.geometry}
            material={materials.SmallbitsBake}
          />
          <mesh
            name="TuningPegBase_med002_SmallbitsBake_0"
            geometry={nodes.TuningPegBase_med002_SmallbitsBake_0.geometry}
            material={materials.SmallbitsBake}
            position={[0.01, 0.001, 0.319]}
          />
          <mesh
            name="TuningPegKnob_med002_SmallbitsBake_0"
            geometry={nodes.TuningPegKnob_med002_SmallbitsBake_0.geometry}
            material={materials.SmallbitsBake}
            position={[0.01, -0.445, 0.447]}
            rotation={[-Math.PI, 0.231, Math.PI]}
          />
        </group>
        <group
          name="TuningPeg_med003"
          position={[1462.248, -158.982, 45.584]}
          rotation={[1.57, -0.296, -3.132]}
          scale={100}
        >
          <mesh
            name="TuningPeg_med003_SmallbitsBake_0"
            geometry={nodes.TuningPeg_med003_SmallbitsBake_0.geometry}
            material={materials.SmallbitsBake}
          />
          <mesh
            name="TuningPegBase_med003_SmallbitsBake_0"
            geometry={nodes.TuningPegBase_med003_SmallbitsBake_0.geometry}
            material={materials.SmallbitsBake}
            position={[0.01, 0.001, 0.319]}
          />
          <mesh
            name="TuningPegKnob_med003_SmallbitsBake_0"
            geometry={nodes.TuningPegKnob_med003_SmallbitsBake_0.geometry}
            material={materials.SmallbitsBake}
            position={[0.01, -0.445, 0.447]}
            rotation={[0, 1.165, 0]}
          />
        </group>
        <group
          name="TuningPeg_med004"
          position={[1294.181, -107.717, -46.935]}
          rotation={[1.57, -0.296, -0.001]}
          scale={100}
        >
          <mesh
            name="TuningPeg_med004_SmallbitsBake_0"
            geometry={nodes.TuningPeg_med004_SmallbitsBake_0.geometry}
            material={materials.SmallbitsBake}
          />
          <mesh
            name="TuningPegKnob_med004_SmallbitsBake_0"
            geometry={nodes.TuningPegKnob_med004_SmallbitsBake_0.geometry}
            material={materials.SmallbitsBake}
            position={[0.01, -0.445, 0.447]}
            rotation={[-0.001, 0.921, 0.001]}
          />
        </group>
        <group
          name="TuningPeg_med005"
          position={[1378.214, -133.35, -45.702]}
          rotation={[1.57, -0.296, 0.027]}
          scale={100}
        >
          <mesh
            name="TuningPeg_med005_SmallbitsBake_0"
            geometry={nodes.TuningPeg_med005_SmallbitsBake_0.geometry}
            material={materials.SmallbitsBake}
          />
          <mesh
            name="TuningPegKnob_med005_SmallbitsBake_0"
            geometry={nodes.TuningPegKnob_med005_SmallbitsBake_0.geometry}
            material={materials.SmallbitsBake}
            position={[0.01, -0.445, 0.447]}
            rotation={[-0.056, -1.104, -0.036]}
          />
        </group>
        <group
          name="TuningPeg_med006"
          position={[1462.248, -158.982, -45.663]}
          rotation={[1.57, -0.296, 0.01]}
          scale={100}
        >
          <mesh
            name="TuningPeg_med006_SmallbitsBake_0"
            geometry={nodes.TuningPeg_med006_SmallbitsBake_0.geometry}
            material={materials.SmallbitsBake}
          />
          <mesh
            name="TuningPegKnob_med006_SmallbitsBake_0"
            geometry={nodes.TuningPegKnob_med006_SmallbitsBake_0.geometry}
            material={materials.SmallbitsBake}
            position={[0.01, -0.445, 0.447]}
            rotation={[-3.135, -0.378, -3.12]}
          />
        </group>
        <mesh
          name="Pickup_med001_SmallbitsBake_0"
          geometry={nodes.Pickup_med001_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[102.38, -1.282, 0]}
          rotation={[-Math.PI / 2, 0.064, 0]}
          scale={100}
        />
        <mesh
          name="Pickupbase_med001_SmallbitsBake_0"
          geometry={nodes.Pickupbase_med001_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[102.094, 0.196, 0]}
          rotation={[-Math.PI / 2, 0.047, 0]}
          scale={100}
        />
        <mesh
          name="Pickguard_med001_SmallbitsBake_0"
          geometry={nodes.Pickguard_med001_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[0, 3.927, 0]}
          rotation={[-1.573, 0.03, 0]}
          scale={100}
        />
        <mesh
          name="Pickguardsupport_med001_SmallbitsBake_0"
          geometry={nodes.Pickguardsupport_med001_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[-65.335, -26.47, 210.573]}
          rotation={[-Math.PI / 2, 0, 0.644]}
          scale={100}
        />
        <mesh
          name="HeadPlate_med001_SmallbitsBake_0"
          geometry={nodes.HeadPlate_med001_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[1211.296, -80.057, 0]}
          rotation={[-Math.PI / 2, 0.299, 0]}
          scale={100}
        />
        <mesh
          name="TogglePlate_med001_SmallbitsBake_0"
          geometry={nodes.TogglePlate_med001_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[198.461, -11.939, -192.061]}
          rotation={[-1.667, 0.011, 0.001]}
          scale={100}
        />
        <mesh
          name="TogglePlateRing_med001_SmallbitsBake_0"
          geometry={nodes.TogglePlateRing_med001_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[198.441, -6.736, -192.702]}
          rotation={[-1.661, 0.013, 0.002]}
          scale={100}
        />
        <mesh
          name="ToggleSwitch_med001_SmallbitsBake_0"
          geometry={nodes.ToggleSwitch_med001_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[198.411, -16.575, -191.616]}
          rotation={[-2.109, 0.009, 0.006]}
          scale={100}
        />
        <mesh
          name="StrapPeg_med001_SmallbitsBake_0"
          geometry={nodes.StrapPeg_med001_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[-601.388, -65.242, 0.913]}
          rotation={[Math.PI / 2, -Math.PI / 2, 0]}
          scale={100}
        />
        <mesh
          name="KnobInner_01_med001_SmallbitsBake_0"
          geometry={nodes.KnobInner_01_med001_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[-435.469, 0.298, 164.565]}
          rotation={[-1.476, -0.109, 0.003]}
          scale={100}
        />
        <mesh
          name="Bridge02_med001_SmallbitsBake_0"
          geometry={nodes.Bridge02_med001_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[-222.95, 25.306, 0]}
          rotation={[-Math.PI / 2, 0, 0.039]}
          scale={100}
        />
        <mesh
          name="BridgePost02_med001_SmallbitsBake_0"
          geometry={nodes.BridgePost02_med001_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[-219.881, 17.686, 77.686]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
        <mesh
          name="BridgeWedge_med001_SmallbitsBake_0"
          geometry={nodes.BridgeWedge_med001_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[-216.767, 30.511, 51.696]}
          rotation={[-Math.PI / 2, 0, -3.102]}
          scale={100}
        />
        <mesh
          name="Bridge01_med001_SmallbitsBake_0"
          geometry={nodes.Bridge01_med001_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[-309.97, 10.296, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
        <mesh
          name="BridgePost01_med003_SmallbitsBake_0"
          geometry={nodes.BridgePost01_med003_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[-306.867, 17.771, 75.538]}
          rotation={[-Math.PI / 2, 0, 0.287]}
          scale={100}
        />
        <mesh
          name="InputJack_med001_SmallbitsBake_0"
          geometry={nodes.InputJack_med001_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[-464.233, -66.207, 287.144]}
          rotation={[0, -0.611, 0]}
          scale={100}
        />
        <mesh
          name="KnobTrans_med001_Refractive_0"
          geometry={nodes.KnobTrans_med001_Refractive_0.geometry}
          material={materials.Refractive}
          position={[-437.47, 18.566, 166.297]}
          rotation={[-1.476, -0.109, 0.003]}
          scale={100}
        />
        <mesh
          name="KnobInner_med001_SmallbitsBake_0"
          geometry={nodes.KnobInner_med001_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[-435.469, 0.298, 164.565]}
          rotation={[-1.476, -0.109, 0.003]}
          scale={100}
        />
        <mesh
          name="Neck_med001_MainBake_0"
          geometry={nodes.Neck_med001_MainBake_0.geometry}
          material={materials.MainBake}
          position={[0, -19.438, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
        <mesh
          name="Nut_med001_MainBake_0"
          geometry={nodes.Nut_med001_MainBake_0.geometry}
          material={materials.MainBake}
          position={[0, -19.438, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
        <mesh
          name="BridgeWedge_med002_SmallbitsBake_0"
          geometry={nodes.BridgeWedge_med002_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[-220.929, 30.511, 30.833]}
          rotation={[-Math.PI / 2, 0, -3.102]}
          scale={100}
        />
        <mesh
          name="BridgeWedge_med003_SmallbitsBake_0"
          geometry={nodes.BridgeWedge_med003_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[-224.031, 30.511, 10.398]}
          rotation={[-Math.PI / 2, 0, -3.102]}
          scale={100}
        />
        <mesh
          name="BridgeWedge_med004_SmallbitsBake_0"
          geometry={nodes.BridgeWedge_med004_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[-224.524, 30.511, -10.069]}
          rotation={[-Math.PI / 2, 0, 0.039]}
          scale={100}
        />
        <mesh
          name="BridgeWedge_med005_SmallbitsBake_0"
          geometry={nodes.BridgeWedge_med005_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[-227.305, 30.511, -30.932]}
          rotation={[-Math.PI / 2, 0, 0.039]}
          scale={100}
        />
        <mesh
          name="BridgeWedge_med006_SmallbitsBake_0"
          geometry={nodes.BridgeWedge_med006_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[-229.124, 30.511, -51.688]}
          rotation={[-Math.PI / 2, 0, 0.039]}
          scale={100}
        />
        <mesh
          name="KnobTrans_med002_Refractive_0"
          geometry={nodes.KnobTrans_med002_Refractive_0.geometry}
          material={materials.Refractive}
          position={[-379.176, 11.411, 260.715]}
          rotation={[-1.445, -0.049, -0.003]}
          scale={100}
        />
        <mesh
          name="KnobTrans_med003_Refractive_0"
          geometry={nodes.KnobTrans_med003_Refractive_0.geometry}
          material={materials.Refractive}
          position={[-302.657, 21.379, 165.941]}
          rotation={[-1.529, 0.011, 0]}
          scale={100}
        />
        <mesh
          name="KnobTrans_med004_Refractive_0"
          geometry={nodes.KnobTrans_med004_Refractive_0.geometry}
          material={materials.Refractive}
          position={[-242.182, 10.924, 268.315]}
          rotation={[-1.437, 0.026, -0.003]}
          scale={100}
        />
        <mesh
          name="TuningPegBase_med004_SmallbitsBake_0"
          geometry={nodes.TuningPegBase_med004_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[1283.937, -137.934, -46.954]}
          rotation={[1.57, -0.296, 3.14]}
          scale={100}
        />
        <mesh
          name="TuningPegBase_med005_SmallbitsBake_0"
          geometry={nodes.TuningPegBase_med005_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[1367.972, -163.567, -45.748]}
          rotation={[1.57, -0.296, -3.115]}
          scale={100}
        />
        <mesh
          name="TuningPegBase_med006_SmallbitsBake_0"
          geometry={nodes.TuningPegBase_med006_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[1452.004, -189.199, -45.693]}
          rotation={[1.57, -0.296, -3.132]}
          scale={100}
        />
        <mesh
          name="StrapPeg_med002_SmallbitsBake_0"
          geometry={nodes.StrapPeg_med002_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[325.661, -63.203, -124.39]}
          rotation={[Math.PI, 1.34, Math.PI / 2]}
          scale={100}
        />
        <mesh
          name="Pickup_med002_SmallbitsBake_0"
          geometry={nodes.Pickup_med002_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[-115.494, 9.913, 0]}
          rotation={[-Math.PI / 2, 0.044, -Math.PI]}
          scale={100}
        />
        <mesh
          name="Pickupbase_med002_SmallbitsBake_0"
          geometry={nodes.Pickupbase_med002_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[-115.984, 7.74, 0]}
          rotation={[-Math.PI / 2, 0.027, 0]}
          scale={100}
        />
        <mesh
          name="KnobInner_01_med002_SmallbitsBake_0"
          geometry={nodes.KnobInner_01_med002_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[-302.857, 2.923, 165.162]}
          rotation={[-1.529, 0.011, 0]}
          scale={100}
        />
        <mesh
          name="KnobInner_med002_SmallbitsBake_0"
          geometry={nodes.KnobInner_med002_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[-302.857, 2.923, 165.162]}
          rotation={[-1.529, 0.011, 0]}
          scale={100}
        />
        <mesh
          name="KnobInner_01_med003_SmallbitsBake_0"
          geometry={nodes.KnobInner_01_med003_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[-242.673, -7.463, 265.842]}
          rotation={[-1.437, 0.026, -0.003]}
          scale={100}
        />
        <mesh
          name="KnobInner_med003_SmallbitsBake_0"
          geometry={nodes.KnobInner_med003_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[-242.673, -7.463, 265.842]}
          rotation={[-1.437, 0.026, -0.003]}
          scale={100}
        />
        <mesh
          name="KnobInner_01_med004_SmallbitsBake_0"
          geometry={nodes.KnobInner_01_med004_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[-378.274, -6.802, 258.411]}
          rotation={[-1.445, -0.049, -0.003]}
          scale={100}
        />
        <mesh
          name="KnobInner_med004_SmallbitsBake_0"
          geometry={nodes.KnobInner_med004_SmallbitsBake_0.geometry}
          material={materials.SmallbitsBake}
          position={[-378.274, -6.802, 258.411]}
          rotation={[-1.445, -0.049, -0.003]}
          scale={100}
        />
        <mesh
          name="Body_med001_MainBake_0"
          geometry={nodes.Body_med001_MainBake_0.geometry}
          material={materials.MainBake}
          position={[0, -19.438, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />

        {/* ── Cordes interactives (matériau cloné par corde, collider de clic, glow Simon) ── */}
        {stringNodes.map((node, i) => (
          <GuitarString
            key={i}
            index={i}
            geometry={node.geometry}
            baseMaterial={materials.Strings}
            position={node.position}
            rotation={node.rotation}
            scale={node.scale}
            hitboxRadius={stringHitboxRadius}
            triggerRef={stringTriggerRef}
            interactive={interactive}
          />
        ))}
      </group>

      {/* ── Stand au sol (façon stand A-frame, à l'échelle de la scène) ── */}
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

useGLTF.preload('/models/guitar.glb')
