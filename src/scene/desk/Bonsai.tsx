import { useEffect, useMemo } from 'react'
import {
  BufferAttribute,
  type BufferGeometry,
  Color,
  CylinderGeometry,
  Quaternion,
  SphereGeometry,
  Vector3,
} from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

const UP = new Vector3(0, 1, 0)

function branch(start: Vector3, end: Vector3, base: number, tip: number) {
  const direction = end.clone().sub(start)
  const length = direction.length()
  const rotation = new Quaternion().setFromUnitVectors(UP, direction.normalize())
  const center = start.clone().lerp(end, 0.5)

  return new CylinderGeometry(tip, base, length, 6)
    .applyQuaternion(rotation)
    .translate(center.x, center.y, center.z)
}

function makeBonsai() {
  const parts: BufferGeometry[] = []

  function add(geometry: BufferGeometry, hex: string) {
    const { r, g, b } = new Color(hex)
    const colors = new Float32Array(geometry.attributes.position.count * 3)
    for (let i = 0; i < colors.length; i += 3) {
      colors[i] = r
      colors[i + 1] = g
      colors[i + 2] = b
    }
    geometry.setAttribute('color', new BufferAttribute(colors, 3))
    parts.push(geometry)
  }

  add(
    new CylinderGeometry(0.103, 0.078, 0.036, 4)
      .rotateY(Math.PI / 4)
      .scale(1, 1, 0.72)
      .translate(0, 0.018, 0),
    '#3c5555'
  )
  add(
    new CylinderGeometry(0.109, 0.103, 0.012, 4)
      .rotateY(Math.PI / 4)
      .scale(1, 1, 0.72)
      .translate(0, 0.042, 0),
    '#526d68'
  )
  add(
    new CylinderGeometry(0.089, 0.089, 0.002, 4)
      .rotateY(Math.PI / 4)
      .scale(1, 1, 0.72)
      .translate(0, 0.048, 0),
    '#584535'
  )

  const root = new Vector3(0, 0.048, 0.005)
  const bend = new Vector3(-0.023, 0.106, 0.01)
  const fork = new Vector3(0.008, 0.165, -0.004)
  const bark = '#72513b'
  add(branch(root, bend, 0.017, 0.012), bark)
  add(branch(bend, fork, 0.013, 0.008), bark)
  add(branch(fork, new Vector3(0.02, 0.212, -0.007), 0.009, 0.003), bark)
  add(branch(bend, new Vector3(-0.092, 0.143, 0.012), 0.009, 0.003), bark)
  add(branch(fork, new Vector3(0.091, 0.176, 0.024), 0.007, 0.003), bark)

  // Des plateaux de feuillage asymétriques laissent apparaître le tronc.
  add(
    new SphereGeometry(1, 9, 6).scale(0.064, 0.028, 0.047).translate(-0.088, 0.149, 0.013),
    '#3f633f'
  )
  add(
    new SphereGeometry(1, 9, 6).scale(0.057, 0.024, 0.044).translate(0.092, 0.177, 0.024),
    '#557548'
  )
  add(
    new SphereGeometry(1, 9, 6).scale(0.062, 0.028, 0.049).translate(0.014, 0.218, -0.01),
    '#61804b'
  )
  add(
    new SphereGeometry(1, 9, 6).scale(0.041, 0.021, 0.034).translate(-0.024, 0.217, 0.012),
    '#507048'
  )

  const geometry = mergeGeometries(parts)
  for (const part of parts) part.dispose()
  return geometry
}

export function Bonsai() {
  const geometry = useMemo(() => makeBonsai(), [])
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.83} />
    </mesh>
  )
}
