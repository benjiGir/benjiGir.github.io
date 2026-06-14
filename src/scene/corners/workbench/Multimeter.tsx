const MULTIMETER_COLOR = '#d97706'

// ─── Multimètre ──────────────────────────────────────────────────────────────────

export function Multimeter() {
  return (
    <group position={[0.45, 0.77, -0.12]} rotation={[0, -0.3, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.09, 0.02, 0.13]} />
        <meshStandardMaterial color={MULTIMETER_COLOR} roughness={0.6} />
      </mesh>
      {/* Écran */}
      <mesh position={[0, 0.011, -0.02]}>
        <boxGeometry args={[0.05, 0.002, 0.03]} />
        <meshStandardMaterial color="#9be8a8" emissive="#4ade80" emissiveIntensity={0.4} />
      </mesh>
      {/* Molette de sélection */}
      <mesh position={[0, 0.014, 0.04]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.012, 16]} />
        <meshStandardMaterial color="#1f2937" roughness={0.5} />
      </mesh>
      {/* Sondes (fils rouge/noir) */}
      <mesh position={[-0.03, 0.005, 0.07]} rotation={[0.3, 0, 0.2]}>
        <cylinderGeometry args={[0.0025, 0.0025, 0.06, 6]} />
        <meshStandardMaterial color="#cc2222" />
      </mesh>
      <mesh position={[0.03, 0.005, 0.07]} rotation={[0.3, 0, -0.2]}>
        <cylinderGeometry args={[0.0025, 0.0025, 0.06, 6]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  )
}
