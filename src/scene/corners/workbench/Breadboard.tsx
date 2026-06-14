import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCircuitStore } from '@/store/useCircuitStore'

const BOARD_COLOR = '#e8e4d8'

// LED de la breadboard : rouge tant que le Circuit Lab n'a livré aucun niveau, vert une fois
// au moins un niveau résolu (changement de couleur = feedback de `useCircuitStore`).
const LED_OFF_COLOR = '#7a1a1a'
const LED_ON_COLOR = '#22c55e'
const LED_ON_COLOR_UNSOLVED = '#ef4444'

// ─── Breadboard + LED clignotante ───────────────────────────────────────────────

export function Breadboard() {
  const ledMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const blinkRef = useRef(0)
  const solvedLevels = useCircuitStore((s) => s.solvedLevels)

  useFrame((_, delta) => {
    const mat = ledMatRef.current
    if (!mat) return
    const solved = solvedLevels > 0

    blinkRef.current += delta
    // Clignotement plus rapide une fois un niveau résolu (feedback "circuit actif")
    const period = solved ? 0.5 : 1.4
    const phase = (blinkRef.current % period) / period
    const on = phase < 0.5

    if (on) {
      mat.color.set(solved ? LED_ON_COLOR : LED_ON_COLOR_UNSOLVED)
      mat.emissive.set(solved ? LED_ON_COLOR : LED_ON_COLOR_UNSOLVED)
      mat.emissiveIntensity = solved ? 2.2 : 1.2
    } else {
      mat.color.set(LED_OFF_COLOR)
      mat.emissive.set(LED_OFF_COLOR)
      mat.emissiveIntensity = 0.15
    }
  })

  // Petite grille de trous (instanciée pour l'aspect breadboard, géométrie figée)
  const holes = useMemo(() => {
    const positions: [number, number][] = []
    for (let x = -0.085; x <= 0.085; x += 0.017) {
      for (let z = -0.04; z <= 0.04; z += 0.017) {
        positions.push([x, z])
      }
    }
    return positions
  }, [])

  const holeGeo = useMemo(() => new THREE.CylinderGeometry(0.0015, 0.0015, 0.006, 6), [])
  const holeMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#9b9488', roughness: 0.6 }),
    []
  )

  return (
    <group position={[-0.32, 0.766, -0.08]}>
      {/* Plaque */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.012, 0.14]} />
        <meshStandardMaterial color={BOARD_COLOR} roughness={0.6} />
      </mesh>
      {/* Trous (instancing via Instances serait sur-ingénierie ici : ~50 cylindres fins, coût
          négligeable et géométrie/matériau partagés via useMemo) */}
      {holes.map(([x, z], i) => (
        <mesh key={i} geometry={holeGeo} material={holeMat} position={[x, 0.007, z]} />
      ))}
      {/* Quelques composants posés (résistances) */}
      <mesh position={[-0.05, 0.012, 0.02]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.004, 0.004, 0.03, 8]} />
        <meshStandardMaterial color="#caa472" roughness={0.5} />
      </mesh>
      <mesh position={[0.04, 0.012, -0.015]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.004, 0.004, 0.03, 8]} />
        <meshStandardMaterial color="#caa472" roughness={0.5} />
      </mesh>
      {/* LED — dôme hémisphérique émissif */}
      <mesh position={[0.06, 0.018, 0.03]} castShadow>
        <sphereGeometry args={[0.012, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial ref={ledMatRef} color={LED_OFF_COLOR} emissive={LED_OFF_COLOR} />
      </mesh>
      {/* Pattes de la LED */}
      <mesh position={[0.057, 0.006, 0.03]} castShadow>
        <cylinderGeometry args={[0.0008, 0.0008, 0.012, 4]} />
        <meshStandardMaterial color="#999" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.063, 0.006, 0.03]} castShadow>
        <cylinderGeometry args={[0.0008, 0.0008, 0.012, 4]} />
        <meshStandardMaterial color="#999" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}
