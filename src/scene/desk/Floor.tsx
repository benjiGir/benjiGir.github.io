import { useLayoutEffect, useRef } from 'react'
import { Color, Matrix4, type InstancedMesh } from 'three'
import { ROOM_BACK_Z, ROOM_DEPTH, ROOM_WIDTH } from '@/scene/roomLayout'

const ROWS = 39
const PLANK_LENGTH = 1.7
const SEAM = 0.003
const OAK = ['#c7a682', '#c9aa88', '#c2a17d', '#ceaf8a', '#c8a580', '#c4a583'].map(
  (color) => new Color(color)
)

interface Plank {
  x: number
  z: number
  width: number
  length: number
  color: Color
}

const PLANKS = Array.from({ length: ROWS }, (_, row) => {
  const rowWidth = ROOM_WIDTH / ROWS
  const planks: Plank[] = []
  const offset = ((row * 0.61) % PLANK_LENGTH) - PLANK_LENGTH
  const x = -ROOM_WIDTH / 2 + (row + 0.5) * rowWidth

  for (let start = offset; start < ROOM_DEPTH; start += PLANK_LENGTH) {
    const front = Math.min(ROOM_DEPTH, start + PLANK_LENGTH)
    const back = Math.max(0, start)
    const length = front - back
    if (length <= SEAM) continue

    const column = planks.length
    planks.push({
      x,
      z: ROOM_BACK_Z + (back + front) / 2,
      width: rowWidth - SEAM,
      length: length - SEAM,
      color: OAK[(row * 7 + column * 5 + row * column) % OAK.length],
    })
  }

  return planks
}).flat()

export function Floor() {
  const planksRef = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = planksRef.current
    if (!mesh) return

    const matrix = new Matrix4()
    PLANKS.forEach(({ x, z, width, length, color }, index) => {
      matrix.makeScale(width, 0.018, length).setPosition(x, -0.009, z)
      mesh.setMatrixAt(index, matrix)
      mesh.setColorAt(index, color)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [])

  return (
    <group>
      <mesh position={[0, -0.022, ROOM_BACK_Z + ROOM_DEPTH / 2]} receiveShadow>
        <boxGeometry args={[ROOM_WIDTH, 0.04, ROOM_DEPTH]} />
        <meshStandardMaterial color="#9d8165" roughness={0.94} />
      </mesh>
      <instancedMesh ref={planksRef} args={[undefined, undefined, PLANKS.length]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.82} />
      </instancedMesh>
    </group>
  )
}
