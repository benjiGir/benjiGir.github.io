import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { GLTF } from 'three-stdlib'
import { usePowerStore } from '@/store/usePowerStore'
import { useScreenStore } from '@/store/useScreenStore'
import Hotspot from '@/scene/camera/Hotspot'
import Editable from '@/editor/Editable'
import {Vector3} from "three";

// ─── Monitor ──────────────────────────────────────────────────────────────────
// Moniteur ultrawide (GLB Sketchfab, ex-FBX) repliant le JSX généré par gltfjsx au lieu d'un
// composant <Model> opaque, pour pouvoir : 1) référencer le mesh de la dalle (animation emissive),
// 2) aligner précisément le portail HTML de l'OS sur sa surface.

const MODEL_URL = '/models/monitorscreen.opt.glb'

type GLTFResult = GLTF & {
  nodes: {
    Ultrawide_Monitor_Screen_0: THREE.Mesh
    Ultrawide_Monitor_Body_0: THREE.Mesh
    Ultrawide_Monitor_Body_0_1: THREE.Mesh
    Ultrawide_Monitor_Lights_0: THREE.Mesh
  }
  materials: {
    Screen: THREE.MeshStandardMaterial
    Body: THREE.MeshStandardMaterial
    Lights: THREE.MeshStandardMaterial
  }
}

// ── Transform du modèle — À AJUSTER À L'ŒIL ────────────────────────────────────
// Calculé depuis la bounding box réelle du GLB (dalle centrée à x=0,y=0,z≈0.1335 dans le repère
// racine du modèle, taille 10.37×4.59, normale +Z) pour que son centre retombe sur la dalle
// procédurale qu'il remplace (largeur visible ≈0.685m). La hauteur y=1.13 est portée par le
// `<Hotspot>` parent (pour que sa tooltip reste au niveau de l'écran), donc le modèle est centré
// dessus (y=0 local). Le sous-arbre interne (Sketchfab_model > .fbx > RootNode > Ultrawide_Monitor)
// garde ses rotations imbriquées intactes — uniquement le groupe racine externe porte ce scale/position.
const MODEL_SCALE = 0.066
const MODEL_POSITION: readonly [number, number, number] = [0, 0, 0.013]

// ── Transform du portail HTML (bureau OS 1280×720) — À AJUSTER À L'ŒIL ─────────
// COMPROMIS D'ASPECT : la dalle GLB est en 21:9 (≈2.26:1) mais l'OS reste figé en 16:9 (1280×720,
// changer ces dimensions casserait les layouts des apps). On cale donc le bureau sur la HAUTEUR de
// la dalle (letterbox) plutôt que de l'étirer en largeur : le rendu DOM garde ses proportions
// natives, des bandes latérales apparaissent sur les côtés de l'écran (effet "fenêtre 16:9 sur
// moniteur ultrawide", cohérent visuellement). Pour étirer plein cadre à la place, remplacer
// HTML_SCALE par un tableau [scaleX, scaleY, 1] non-uniforme — <Html transform scale> accepte les
// deux formes (hérité de ThreeElements['group']).
const HTML_SCALE = new Vector3(0.0215, 0.017, 1)
const HTML_POSITION: readonly [number, number, number] = [0, 1.13, 0.025]

// Intensité crête du glow d'appoint émis par la dalle dans la pièce (à `target` max, cf. useFrame
// ci-dessous) — faible volontairement, c'est un rattrapage de contraste local, pas un fill.
const SCREEN_GLOW_MAX = 0.6

export function Monitor() {
  const power = usePowerStore((s) => s.power)
  const setDockedEl = useScreenStore((s) => s.setDockedEl)
  const isFullscreen = useScreenStore((s) => s.isFullscreen)

  const { nodes, materials } = useGLTF(MODEL_URL) as unknown as GLTFResult
  const screenMatRef = useRef<THREE.MeshStandardMaterial>(null)
  // Glow d'appoint de la dalle dans la pièce — même cible/lerp que l'émissive, voir useFrame.
  const screenGlowRef = useRef<THREE.PointLight>(null)

  useFrame((_, delta) => {
    if (!screenMatRef.current) return
    // Fondu progressif vers le noir pendant l'extinction plutôt qu'un saut brutal à 'off'
    const target = power === 'off' || power === 'shuttingDown' ? 0 : power === 'on' ? 1.2 : 0.6
    screenMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      screenMatRef.current.emissiveIntensity,
      target,
      1 - Math.exp(-delta * 2.5)
    )
    if (screenGlowRef.current) {
      // Portée volontairement faible : un glow d'appoint près de l'écran, pas une source qui
      // remplit la pièce. SCREEN_GLOW_MAX dose l'intensité crête (cf. constante en tête de fichier).
      screenGlowRef.current.intensity = THREE.MathUtils.lerp(
        screenGlowRef.current.intensity,
        target * SCREEN_GLOW_MAX,
        1 - Math.exp(-delta * 2.5)
      )
    }
  })

  // Tout le moniteur (modèle GLB + portail HTML) dans un seul <Editable> pour le rendre déplaçable
  // au gizmo : le modèle et le bureau bougent ensemble, donc le bureau reste calé sur la dalle. Le
  // <Hotspot> interne s'efface en mode édition (cf. Hotspot.tsx).
  return (
    <Editable id="monitor" label="Moniteur" position={[0, -0.1, 0]}>
      {/* Glow d'appoint de la dalle — léger pointLight devant l'écran, pas une lumière qui remplit
          la pièce (cf. SCREEN_GLOW_MAX). Pas de castShadow : juste du contraste local, le coût
          d'une ombre temps réel ne se justifie pas pour ce rattrapage. */}
      <pointLight
        ref={screenGlowRef}
        position={[0, 1.13, 0.15]}
        color="#a0b4ff"
        intensity={0}
        distance={1.4}
        decay={2}
      />
      {/* Moniteur GLB — cliquable : zoom caméra sur l'écran (POI 'screen') */}
      <Hotspot poi="screen" label="Zoomer sur l'écran" position={[0, 1.13, 0]}>
        <group position={MODEL_POSITION} scale={MODEL_SCALE} dispose={null}>
          <group name="Sketchfab_model" rotation={[Math.PI / 2, -0.00067, Math.PI]}>
            <group name="Ultrawide_Monitorfbx" rotation={[-Math.PI, 0, 0]} scale={0.01}>
              <group
                name="Ultrawide_Monitor"
                rotation={[0, 0, Math.PI / 2]}
                scale={[19.41187, 536.2063, 242.19763]}
              >
                {/* Dalle — matériau JSX dédié (pas materials.Screen du GLTF, qui réutilise la même
                    texture en baseColor ET emissiveMap pour simuler un faux contenu d'écran figé).
                    On reprend la teinte/logique emissive du moniteur procédural à l'identique. */}
                <mesh
                  name="Ultrawide_Monitor_Screen_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.Ultrawide_Monitor_Screen_0.geometry}
                >
                  <meshStandardMaterial
                    ref={screenMatRef}
                    color="#04040e"
                    emissive="#a0b4ff"
                    emissiveIntensity={0}
                    roughness={0.05}
                    metalness={0.1}
                  />
                </mesh>
                <mesh
                  name="Ultrawide_Monitor_Body_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.Ultrawide_Monitor_Body_0.geometry}
                  material={materials.Body}
                />
                <mesh
                  name="Ultrawide_Monitor_Body_0_1"
                  castShadow
                  receiveShadow
                  geometry={nodes.Ultrawide_Monitor_Body_0_1.geometry}
                  material={materials.Body}
                />
                <mesh
                  name="Ultrawide_Monitor_Lights_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.Ultrawide_Monitor_Lights_0.geometry}
                  material={materials.Lights}
                />
              </group>
            </group>
          </group>
        </group>
      </Hotspot>
      {/* Conteneur cible du portail d'écran — ScreenContent y est projeté par <ScreenPortal />, ce qui
          le garde monté en permanence (état OS préservé) lors des bascules plein écran. */}
      {power !== 'off' && (
        <Html
          transform
          scale={HTML_SCALE}
          position={HTML_POSITION}
          pointerEvents={isFullscreen ? 'none' : 'auto'}
        >
          <div
            ref={(el) => setDockedEl(el)}
            style={{ width: 1280, height: 720, overflow: 'hidden', borderRadius: 4 }}
          />
        </Html>
      )}
    </Editable>
  )
}

useGLTF.preload(MODEL_URL)
