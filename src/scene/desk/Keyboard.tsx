import Editable from '@/editor/Editable'

// ─── Keyboard ─────────────────────────────────────────────────────────────────

export function Keyboard() {
  return (
    <Editable
      id="keyboard"
      label="Clavier"
      position={[-0.05, 0.755, 0.16]}
      rotation={[-0.05, 0, 0]}
    >
      {/* Châssis */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.32, 0.015, 0.12]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Touches — grille simplifiée pour suggérer le clavier sans surcharger la scène */}
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 12 }).map((_, col) => (
          <mesh
            key={`${row}-${col}`}
            position={[-0.135 + col * 0.024, 0.011, -0.04 + row * 0.024]}
            castShadow
          >
            <boxGeometry args={[0.02, 0.006, 0.02]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.1} />
          </mesh>
        ))
      )}
    </Editable>
  )
}
