import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { TvScreen } from './TvScreen'
import { Console } from './Console'

const TV_SHELL_COLOR = '#d8d3c4'
const TV_TRIM_COLOR = '#3a3a3a'

// ─── TV CRT ────────────────────────────────────────────────────────────────────
//
// Caisson bombé : boîte principale + face avant légèrement renflée (mesh sphérique aplati
// en guise de bombement, masqué derrière l'écran). L'écran est un plan légèrement convexe
// (segments + déplacement radial appliqué via une géométrie custom, voir `TvScreen`).

interface TvProps {
  texture: THREE.CanvasTexture
  on: boolean
  onCartridgeClick: (e: ThreeEvent<MouseEvent>) => void
}

export function Tv({ texture, on, onCartridgeClick }: TvProps) {
  return (
    <group position={[-0.22, 0.79, 0.05]}>
      {/* Caisson principal — demi-profondeur 0.25, face avant en z=0.25 */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.46, 0.5]} />
        <meshStandardMaterial color={TV_SHELL_COLOR} roughness={0.55} />
      </mesh>
      {/* Bezel (rebord fin) autour de l'écran — léger surplomb pour l'effet "verre bombé"
          sans recouvrir l'écran ni le cadre */}
      <mesh position={[0, 0, 0.252]}>
        <boxGeometry args={[0.56, 0.42, 0.012]} />
        <meshStandardMaterial color={TV_SHELL_COLOR} roughness={0.55} />
      </mesh>
      {/* Cadre sombre autour de l'écran */}
      <mesh position={[0, 0, 0.259]}>
        <boxGeometry args={[0.5, 0.4, 0.02]} />
        <meshStandardMaterial color={TV_TRIM_COLOR} roughness={0.5} />
      </mesh>
      {/* Écran (canvas + shader CRT) — légèrement en avant du cadre */}
      <group position={[0, 0, 0.27]}>
        <TvScreen texture={texture} on={on} />
      </group>
      {/* Boutons / molettes en façade */}
      <mesh position={[0.27, 0.16, 0.259]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.02, 12]} />
        <meshStandardMaterial color="#888" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.27, 0.1, 0.259]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.02, 12]} />
        <meshStandardMaterial color="#666" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Antenne (deux brins) */}
      <group position={[0, 0.23, -0.1]}>
        <mesh position={[-0.05, 0.12, 0]} rotation={[0, 0, 0.35]} castShadow>
          <cylinderGeometry args={[0.003, 0.003, 0.24, 6]} />
          <meshStandardMaterial color="#999" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.05, 0.12, 0]} rotation={[0, 0, -0.35]} castShadow>
          <cylinderGeometry args={[0.003, 0.003, 0.24, 6]} />
          <meshStandardMaterial color="#999" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      {/* Console posée devant la TV, sur le meuble */}
      <Console onCartridgeClick={onCartridgeClick} />
    </group>
  )
}
