import { useRef, type MutableRefObject } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { playPluck } from '@/lib/audio'
import { STRING_FREQS, STRING_LENGTH } from './constants'

const STRING_RADIUS = 0.0014
const STRING_COLOR = '#d8d2c4'
const STRING_HOT_COLOR = '#ffd86b'

// ─── Corde individuelle ──────────────────────────────────────────────────────
//
// Chaque corde est cliquable indépendamment (pince → `playPluck`) et vibre
// brièvement (oscillation amortie de l'échelle Z, mutation directe du mesh —
// pas d'allocation par frame).

interface GuitarStringProps {
  index: number
  x: number
  /** Déclenché par le mini-jeu Simon pour rejouer/illuminer une corde précise. */
  triggerRef: MutableRefObject<number[]>
  /** Cordes cliquables uniquement quand le POI 'guitar' est actif. */
  interactive: boolean
}

export function GuitarString({ index, x, triggerRef, interactive }: GuitarStringProps) {
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
