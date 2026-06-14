const TABLE_COLOR = '#6b5640'
const TABLE_TOP_COLOR = '#8a7257'

// ─── Plan de travail ────────────────────────────────────────────────────────────

export function Table() {
  return (
    <group>
      {/* Plateau */}
      <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.04, 0.6]} />
        <meshStandardMaterial color={TABLE_TOP_COLOR} roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Caisson fermé jusqu'au sol (sous le plateau) */}
      <mesh position={[0, 0.36, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.72, 0.5]} />
        <meshStandardMaterial color={TABLE_COLOR} roughness={0.8} />
      </mesh>
    </group>
  )
}
