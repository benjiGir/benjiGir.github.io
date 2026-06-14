// ─── Desk frame (static) ──────────────────────────────────────────────────────

export function DeskFrame() {
  const legPositions: [number, number, number][] = [
    [0.64, 0.375, 0.32],
    [-0.64, 0.375, 0.32],
    [0.64, 0.375, -0.32],
    [-0.64, 0.375, -0.32],
  ]
  return (
    <>
      {legPositions.map((pos, i) => (
        <mesh key={i} position={pos} castShadow receiveShadow>
          <boxGeometry args={[0.05, 0.72, 0.05]} />
          <meshStandardMaterial color="#444444" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
    </>
  )
}
