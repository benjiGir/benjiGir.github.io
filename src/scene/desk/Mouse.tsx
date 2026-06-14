import Editable from '@/editor/Editable'

// ─── Mouse ────────────────────────────────────────────────────────────────────

export function Mouse() {
  return (
    <Editable
      id="mouse"
      label="Souris"
      position={[0.18, 0.7605, 0.18]}
      rotation={[0, 0.3, 0]}
      scale={[1, 0.6, 1.4]}
    >
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#333333" roughness={0.5} metalness={0.2} />
      </mesh>
    </Editable>
  )
}
