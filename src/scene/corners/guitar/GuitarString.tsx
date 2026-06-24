import { useRef, useMemo, type MutableRefObject } from 'react'
import { useFrame, type ThreeEvent, type ThreeElements } from '@react-three/fiber'
import * as THREE from 'three'
import { playPluck } from '@/lib/audio'
import { STRING_FREQS } from './constants'

const STRING_HOT_COLOR = '#ffd86b'

// ─── Corde individuelle (géométrie GLB) ──────────────────────────────────────
//
// Chaque corde réutilise la géométrie + le transform exacts du node `Strings` du modèle GLB,
// avec un matériau cloné (les 6 cordes partagent une seule instance de matériau dans le GLB —
// sans clone, le glow d'une corde illuminerait les 6). Cliquable indépendamment (pince →
// `playPluck`) et vibre brièvement (oscillation amortie de l'échelle, mutation directe du mesh —
// pas d'allocation par frame).

interface GuitarStringProps {
  index: number
  geometry: THREE.BufferGeometry
  baseMaterial: THREE.MeshStandardMaterial
  /** Transform exact du node `Strings...` dans le GLB (position/rotation/scale). */
  position: ThreeElements['mesh']['position']
  rotation: ThreeElements['mesh']['rotation']
  scale: ThreeElements['mesh']['scale']
  /** Rayon du hitbox de clic, dans l'espace local de la corde (avant application de `scale`),
   *  dérivé par GuitarModel de l'espacement réel entre cordes — pas de la géométrie brute. */
  hitboxRadius: number
  /** Déclenché par le mini-jeu Simon pour rejouer/illuminer une corde précise. */
  triggerRef: MutableRefObject<number[]>
  /** Cordes cliquables uniquement quand le POI 'guitar' est actif. */
  interactive: boolean
}

export function GuitarString({
  index,
  geometry,
  baseMaterial,
  position,
  rotation,
  scale,
  hitboxRadius,
  triggerRef,
  interactive,
}: GuitarStringProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const vibration = useRef(0) // >0 = en cours de vibration, valeur = temps restant

  // Clone par corde : le GLB ne fournit qu'une seule instance de `materials.Strings` partagée
  // par les 6 meshes. Sans clone, animer `emissiveIntensity` sur l'une illuminerait les 6.
  const material = useMemo(() => {
    const m = baseMaterial.clone()
    m.emissive = new THREE.Color(STRING_HOT_COLOR)
    m.emissiveIntensity = 0
    return m
  }, [baseMaterial])

  // Longueur du collider de clic dérivée de la bounding box de la géométrie réelle (calcul
  // unique, pas par frame). Toutes les cordes partagent la même `rotation: [-π/2, 0, 0]` dans
  // le GLB : structurellement, l'axe long de la géométrie BRUTE (avant cette rotation) est
  // donc l'axe X local (une rotation autour de X ne change pas les coordonnées X, et les
  // positions des autres pièces confirment que l'axe manche/cordes est X local) — pas besoin
  // de détection dynamique par tri. Le rayon, lui, vient de `hitboxRadius` (prop), dérivé par
  // GuitarModel de l'espacement réel entre cordes plutôt que de la géométrie brute.
  const hitboxLength = useMemo(() => {
    geometry.computeBoundingBox()
    const box = geometry.boundingBox ?? new THREE.Box3()
    return box.max.x - box.min.x
  }, [geometry])
  // Aligne l'axe Y natif du cylindre sur l'axe X de la géométrie (axe long réel).
  const hitboxRotation: [number, number, number] = [0, 0, Math.PI / 2]

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
      // Oscillation amortie de l'échelle X/Z (la corde "bouge" visuellement, son axe long
      // étant Y dans le repère local du node GLB)
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

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh ref={meshRef} geometry={geometry}>
        <primitive ref={matRef} object={material} attach="material" />
      </mesh>
      {/* Élargit la zone de clic (cylindre invisible aligné sur l'axe long de la corde) sans
          changer la géométrie visible — la corde réelle est bien trop fine pour être visée
          précisément. */}
      {interactive && (
        <mesh
          visible={false}
          rotation={hitboxRotation}
          onClick={handleClick}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          <cylinderGeometry args={[hitboxRadius, hitboxRadius, hitboxLength, 6]} />
          <meshBasicMaterial />
        </mesh>
      )}
    </group>
  )
}
