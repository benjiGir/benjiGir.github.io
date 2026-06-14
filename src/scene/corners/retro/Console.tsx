import type { ThreeEvent } from '@react-three/fiber'

const CONSOLE_COLOR = '#2b2b2b'
const PAD_COLOR = '#222226'
const CARTRIDGE_COLORS = ['#c0392b', '#2980b9', '#27ae60'] as const

// ─── Console + manette + cartouches ──────────────────────────────────────────────

interface ConsoleProps {
  onCartridgeClick: (e: ThreeEvent<MouseEvent>) => void
}

export function Console({ onCartridgeClick }: ConsoleProps) {
  // Position relative au groupe `Tv` (qui est à y=0.79, z=0.05 dans le groupe racine de
  // RetroCorner) :
  // - y = -0.245 → centre du boîtier (hauteur 0.045) posé sur le plateau du meuble (dessus à
  //   y≈0.5225 en coordonnées racine, soit 0.5225 + 0.0225 - 0.79 = -0.245)
  // - x = 0.54 → à droite de la TV, dans l'espace libre du plateau élargi
  // - z = 0 → centré sur la profondeur du plateau (z_world = 0.05, plateau ∈ [-0.18, 0.28])
  return (
    <group position={[0.54, -0.245, 0]}>
      {/* Boîtier console — légèrement réduit pour tenir à côté de la manette et des cartouches */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.26, 0.045, 0.2]} />
        <meshStandardMaterial color={CONSOLE_COLOR} roughness={0.5} />
      </mesh>
      {/* Fente cartouche */}
      <mesh position={[0, 0.026, -0.035]}>
        <boxGeometry args={[0.13, 0.006, 0.045]} />
        <meshStandardMaterial color="#111" roughness={0.6} />
      </mesh>
      {/* Bouton power */}
      <mesh position={[0.1, 0.026, 0.07]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.012, 12]} />
        <meshStandardMaterial color="#c0392b" roughness={0.4} />
      </mesh>

      {/* Manette posée devant la console (vers le bord avant du meuble) */}
      <group position={[-0.04, 0.026, 0.1]} rotation={[0, 0.25, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.018, 0.16]} />
          <meshStandardMaterial color={PAD_COLOR} roughness={0.55} />
        </mesh>
        {/* Croix directionnelle */}
        <mesh position={[-0.025, 0.011, 0.04]} castShadow>
          <boxGeometry args={[0.035, 0.006, 0.012]} />
          <meshStandardMaterial color="#444" roughness={0.5} />
        </mesh>
        <mesh position={[-0.025, 0.011, 0.04]} castShadow>
          <boxGeometry args={[0.012, 0.006, 0.035]} />
          <meshStandardMaterial color="#444" roughness={0.5} />
        </mesh>
        {/* Boutons d'action */}
        <mesh position={[0.03, 0.012, -0.04]} castShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.008, 12]} />
          <meshStandardMaterial color="#c0392b" roughness={0.4} />
        </mesh>
        <mesh position={[0.05, 0.012, -0.02]} castShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.008, 12]} />
          <meshStandardMaterial color="#2980b9" roughness={0.4} />
        </mesh>
      </group>

      {/* Cartouches empilées contre le flanc droit de la console — la première (rouge) lance
          Pong au clic */}
      {CARTRIDGE_COLORS.map((color, i) => (
        <mesh
          key={color}
          position={[0.16 + i * 0.018, 0.04, -0.04 + i * 0.04]}
          rotation={[0, -0.15, -Math.PI / 2 + 0.08]}
          castShadow
          receiveShadow
          onClick={i === 0 ? onCartridgeClick : undefined}
          onPointerOver={i === 0 ? () => (document.body.style.cursor = 'pointer') : undefined}
          onPointerOut={i === 0 ? () => (document.body.style.cursor = 'auto') : undefined}
        >
          <boxGeometry args={[0.045, 0.065, 0.012]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}
