const SOLDER_STAND_COLOR = '#4b4b4b'

// ─── Fer à souder sur support ────────────────────────────────────────────────────

export function SolderingIron() {
  return (
    <group position={[0.28, 0.77, 0.08]}>
      {/* Support (anneau métallique sur socle) */}
      <mesh position={[0, 0.012, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.035, 0.04, 0.02, 16]} />
        <meshStandardMaterial color={SOLDER_STAND_COLOR} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.045, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.025, 0.004, 8, 16]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Manche du fer, posé en biais dans l'anneau */}
      <group position={[0.01, 0.05, 0]} rotation={[0, 0, Math.PI / 5]}>
        <mesh position={[0, 0.07, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.014, 0.16, 12]} />
          <meshStandardMaterial color="#222" roughness={0.6} />
        </mesh>
        {/* Panne (pointe métallique) */}
        <mesh position={[0, -0.02, 0]} castShadow>
          <coneGeometry args={[0.005, 0.05, 8]} />
          <meshStandardMaterial color="#cfcfcf" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Petite zone chauffante émissive (pointe légèrement rouge) */}
        <mesh position={[0, -0.04, 0]}>
          <sphereGeometry args={[0.006, 8, 8]} />
          <meshStandardMaterial color="#ff5533" emissive="#aa2200" emissiveIntensity={0.6} />
        </mesh>
      </group>
    </group>
  )
}
