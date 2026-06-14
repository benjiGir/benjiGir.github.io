// ─── Floor ────────────────────────────────────────────────────────────────────

export function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[12, 12]} />
      <meshStandardMaterial color="#b0a89a" roughness={0.9} metalness={0.0} />
    </mesh>
  )
}
