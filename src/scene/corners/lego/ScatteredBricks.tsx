import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { SCATTERED_BRICKS, SCATTERED_ORIGIN, setBrickInstance } from './bricks'

// ─── Briques éparses (statiques) ─────────────────────────────────────────────────

export function ScatteredBricks() {
  const brickMeshRef = useRef<THREE.InstancedMesh>(null)
  const studMeshRef = useRef<THREE.InstancedMesh>(null)

  const totalStuds = useMemo(
    () => SCATTERED_BRICKS.reduce((sum, b) => sum + b.studsX * b.studsZ, 0),
    []
  )

  useEffect(() => {
    const brickMesh = brickMeshRef.current
    const studMesh = studMeshRef.current
    if (!brickMesh) return

    let studCursor = 0
    for (let i = 0; i < SCATTERED_BRICKS.length; i++) {
      const brick = SCATTERED_BRICKS[i]
      const count = brick.studsX * brick.studsZ
      const indices: number[] = []
      for (let k = 0; k < count; k++) indices.push(studCursor++)
      setBrickInstance(brickMesh, studMesh, i, indices, brick, 0)
    }
    brickMesh.instanceMatrix.needsUpdate = true
    if (brickMesh.instanceColor) brickMesh.instanceColor.needsUpdate = true
    if (studMesh) {
      studMesh.instanceMatrix.needsUpdate = true
      if (studMesh.instanceColor) studMesh.instanceColor.needsUpdate = true
    }
  }, [])

  return (
    <group position={SCATTERED_ORIGIN}>
      <instancedMesh
        ref={brickMeshRef}
        args={[undefined, undefined, SCATTERED_BRICKS.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={studMeshRef} args={[undefined, undefined, totalStuds]} castShadow>
        <cylinderGeometry args={[1, 1, 1, 12]} />
        <meshStandardMaterial roughness={0.4} />
      </instancedMesh>
    </group>
  )
}
