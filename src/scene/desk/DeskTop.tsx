// ─── Desk top ─────────────────────────────────────────────────────────────────

export function DeskTop() {
  return (
    <mesh position={[0, 0.735, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.4, 0.03, 0.7]} />
      <meshStandardMaterial color="#7a5c3a" roughness={0.6} metalness={0.05} />
    </mesh>
  )
}
