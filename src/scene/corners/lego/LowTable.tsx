import { TABLE_TOP_Y, TABLETOP_THICKNESS } from './bricks'

// ─── Table basse ───────────────────────────────────────────────────────────────

export function LowTable() {
  const legHeight = TABLE_TOP_Y - TABLETOP_THICKNESS
  return (
    <group>
      {/* Plateau — top en TABLE_TOP_Y */}
      <mesh position={[0, TABLE_TOP_Y - TABLETOP_THICKNESS / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, TABLETOP_THICKNESS, 0.6]} />
        <meshStandardMaterial color="#8a7257" roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Pieds — du sol jusqu'au dessous du plateau */}
      {[
        [-0.4, 0.26],
        [0.4, 0.26],
      ].flatMap(([x, z]) =>
        [z, -z].map((zz) => (
          <mesh key={`${x}-${zz}`} position={[x, legHeight / 2, zz]} castShadow>
            <boxGeometry args={[0.04, legHeight, 0.04]} />
            <meshStandardMaterial color="#5a4632" roughness={0.7} />
          </mesh>
        ))
      )}
    </group>
  )
}
