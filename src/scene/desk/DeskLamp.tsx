import * as THREE from 'three'
import Editable from '@/editor/Editable'

// ─── Desk lamp ────────────────────────────────────────────────────────────────

export function DeskLamp() {
  const ARM_LEN = 0.24
  const HEAD_LEN = 0.1

  return (
    // Coin arrière-gauche du plateau — en symétrie avec la tour (arrière-droite),
    // loin du moniteur, du clavier et de la souris.
    <Editable id="desk-lamp" label="Lampe" position={[-0.55, 0.75, -0.27]}>
      {/* Base */}
      <mesh position={[0, 0.01, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.07, 0.08, 0.02, 24]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Colonne verticale — chaque pièce est chaînée à l'extrémité de la précédente
          via des groupes imbriqués, pour éviter tout décalage entre les segments. */}
      <group position={[0, 0.02, 0]}>
        <mesh position={[0, 0.14, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.28, 16]} />
          <meshStandardMaterial color="#1e1e1e" roughness={0.4} metalness={0.7} />
        </mesh>

        {/* Bras articulé — pivote depuis le sommet de la colonne, incliné vers le plateau */}
        <group position={[0, 0.28, 0]} rotation={[1.1, 0, -0.5]}>
          <mesh position={[0, ARM_LEN / 2, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, ARM_LEN, 16]} />
            <meshStandardMaterial color="#1e1e1e" roughness={0.4} metalness={0.7} />
          </mesh>

          {/* Tête / abat-jour — fixée à l'extrémité du bras, ouverture vers le plateau */}
          <group position={[0, 0.3, 0]}>
            <mesh position={[0, -HEAD_LEN / 2, 0]} rotation={[-1.5, 0, 0.5]} castShadow>
              <coneGeometry args={[0.05, HEAD_LEN, 24, 1, true]} />
              <meshStandardMaterial
                color="#1a1a1a"
                roughness={0.5}
                metalness={0.5}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Source lumineuse chaude projetée par l'ampoule — intensité modérée pour
                ne pas écraser l'éclairage global défini dans Lighting.tsx */}
            <spotLight
              position={[0, -HEAD_LEN, 0]}
              target-position={[0, -1, 0.3]}
              color="#ffd9a0"
              intensity={2.5}
              angle={0.5}
              penumbra={0.6}
              decay={2}
              distance={1.5}
              castShadow
            />
          </group>
        </group>
      </group>
    </Editable>
  )
}
