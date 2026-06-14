const CABINET_COLOR = '#5a4632'
const CABINET_TOP_COLOR = '#6f5a40'

// ─── Meuble bas ──────────────────────────────────────────────────────────────────

export function Cabinet() {
  return (
    <group>
      {/* Caisson — élargi (1.15) pour laisser la place à la console à droite de la TV */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.15, 0.5, 0.42]} />
        <meshStandardMaterial color={CABINET_COLOR} roughness={0.8} />
      </mesh>
      {/* Plateau */}
      <mesh position={[0, 0.51, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.19, 0.025, 0.46]} />
        <meshStandardMaterial color={CABINET_TOP_COLOR} roughness={0.6} />
      </mesh>
      {/* Petite porte (façade) */}
      <mesh position={[0, 0.25, 0.211]}>
        <boxGeometry args={[1.05, 0.42, 0.005]} />
        <meshStandardMaterial color="#4a3a28" roughness={0.7} />
      </mesh>
      {/* Poignée */}
      <mesh position={[0.44, 0.25, 0.218]} castShadow>
        <cylinderGeometry args={[0.006, 0.006, 0.06, 8]} />
        <meshStandardMaterial color="#c9a96e" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}
