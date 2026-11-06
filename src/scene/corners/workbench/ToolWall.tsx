import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  LatheGeometry,
  Matrix4,
  Path,
  Quaternion,
  Shape,
  ShapeGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
  type BufferGeometry,
  type InstancedMesh,
} from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

const BOARD_Y = 1.22
const BOARD_FRONT = -0.33
const PITCH = 0.032
const COLUMNS = 40
const ROWS = 18
const QUARTER_TURN = Math.PI / 2
const Y_AXIS = new Vector3(0, 1, 0)

const FINISHES = {
  frame: { color: '#44413c', roughness: 0.64, metalness: 0.27 },
  edge: { color: '#666058', roughness: 0.56, metalness: 0.32 },
  steel: { color: '#b7bebd', roughness: 0.32, metalness: 0.56 },
  rubber: { color: '#292c2c', roughness: 0.9 },
  teal: { color: '#547f79', roughness: 0.62 },
  slate: { color: '#59676e', roughness: 0.69 },
  clay: { color: '#9b5d4c', roughness: 0.72 },
  ochre: { color: '#b28d51', roughness: 0.63 },
  paper: { color: '#d0c4a6', roughness: 0.88 },
  solder: { color: '#858e8b', roughness: 0.39, metalness: 0.52 },
}

type Point = [number, number, number]
type Profile = [number, number][]
type Finish = keyof typeof FINISHES
type AddPart = (finish: Finish, geometry: BufferGeometry) => void

function box([w, h, d]: Point, [x, y, z]: Point) {
  return new BoxGeometry(w, h, d).translate(x, y, z)
}

function rod(radius: number, from: Point, to: Point, sides = 8) {
  const start = new Vector3(...from)
  const end = new Vector3(...to)
  const direction = end.clone().sub(start)
  const rotation = new Quaternion().setFromUnitVectors(Y_AXIS, direction.clone().normalize())
  const center = start.lerp(end, 0.5)
  return new CylinderGeometry(radius, radius, direction.length(), sides)
    .applyQuaternion(rotation)
    .translate(center.x, center.y, center.z)
}

function disk(radius: number, depth: number, [x, y, z]: Point, sides = 16) {
  return new CylinderGeometry(radius, radius, depth, sides)
    .rotateX(QUARTER_TURN)
    .translate(x, y, z)
}

function plate(profile: Profile, thickness: number, bevel: number, hole?: Path) {
  const shape = new Shape(profile.map(([x, y]) => new Vector2(x, y)))
  if (hole) shape.holes.push(hole)
  const depth = thickness - bevel * 2
  return new ExtrudeGeometry(shape, {
    depth,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 1,
    curveSegments: 6,
  }).translate(0, 0, -depth / 2)
}

function mounted(add: AddPart, [x, y, z]: Point, tilt = 0): AddPart {
  return (finish, geometry) => add(finish, geometry.rotateZ(tilt).translate(x, y, z))
}

function screw(add: AddPart, [x, y, z]: Point, horizontal = false) {
  const head = disk(0.006, 0.003, [0, 0, 0], 12)
  const slot = box([0.007, 0.0012, 0.0006], [0, 0, 0.0016]).rotateZ(0.4)
  if (horizontal) {
    head.rotateX(-QUARTER_TURN)
    slot.rotateX(-QUARTER_TURN)
  }
  add('steel', head.translate(x, y, z))
  add('frame', slot.translate(x, y, z))
}

function buildFrame(add: AddPart) {
  for (const x of [-0.57, 0.57]) {
    // Le pied repose sur le chêne. Le montant recule derrière le panneau.
    add('frame', box([0.102, 0.012, 0.106], [x, 0.766, -0.305]))
    add('frame', box([0.032, 0.678, 0.028], [x, 1.111, -0.362]))
    add(
      'edge',
      plate([[-0.048, 0], [0.035, 0], [-0.048, 0.111]], 0.023, 0.001)
        .rotateY(-QUARTER_TURN)
        .translate(x, 0.772, -0.305),
    )
    for (const offset of [-0.034, 0.034]) screw(add, [x + offset, 0.773, -0.273], true)
  }

  for (const x of [-0.66, 0.66]) {
    add('frame', box([0.04, ROWS * PITCH, 0.032], [x, BOARD_Y, -0.338]))
    for (const y of [0.956, 1.484]) screw(add, [x, y, -0.321])
  }
  for (const y of [0.921, 1.519]) {
    add('frame', box([1.36, 0.022, 0.032], [0, y, -0.338]))
    add('edge', box([1.346, 0.003, 0.003], [0, y + 0.006, -0.321]))
  }
}

function hook(add: AddPart, [x, y, baseZ]: Point, tipZ: number) {
  const radius = 0.0032
  add('edge', disk(0.0075, 0.004, [x, y, baseZ + 0.001], 12))
  const elbow: Point = [x, y - 0.009, tipZ]
  add('steel', rod(radius, [x, y, baseZ], elbow))
  add('steel', rod(radius, [x, y - 0.011, tipZ], [x, y + 0.006, tipZ + 0.003]))
}

const LONG_JAW: Profile = [
  [-0.012, -0.016], [0.025, -0.054], [0.037, -0.05], [0.026, -0.013],
  [0.028, 0.017], [0.018, 0.051], [0.01, 0.092], [0.005, 0.111],
  [0, 0.107], [0.003, 0.055], [0.005, 0.033], [-0.013, 0.016],
]
const CUTTER_JAW: Profile = [
  [-0.011, -0.017], [0.025, -0.045], [0.038, -0.042], [0.025, -0.012],
  [0.032, 0.017], [0.028, 0.039], [0.013, 0.065], [0.003, 0.052],
  [0.004, 0.027], [-0.013, 0.015],
]
const GRIP: Profile = [
  [0.022, -0.038], [0.037, -0.039], [0.05, -0.076], [0.066, -0.138],
  [0.068, -0.161], [0.061, -0.175], [0.048, -0.172], [0.043, -0.151],
  [0.035, -0.112], [0.025, -0.076], [0.016, -0.052],
]

function pliers(add: AddPart, finish: 'teal' | 'clay', cutters: boolean) {
  const jaw = cutters ? CUTTER_JAW : LONG_JAW
  const gripLength = cutters ? 0.8 : 1
  for (const side of [-1, 1]) {
    const mirrored = (profile: Profile): Profile => profile.map(([x, y]) => [x * side, y])
    add('steel', plate(mirrored(jaw), 0.015, 0.0018).translate(0, 0, side * 0.004))
    add('rubber', plate(mirrored(GRIP), 0.029, 0.004).scale(1, gripLength, 1))
    add(
      finish,
      plate(mirrored(GRIP), 0.013, 0.003)
        .scale(0.76, gripLength * 0.85, 1)
        .translate(side * 0.01, -0.014, 0.011),
    )
    if (!cutters) {
      for (const y of [0.04, 0.049, 0.058]) {
        add('solder', rod(0.0011, [side * 0.005, y, 0.012], [side * 0.015, y + 0.004, 0.012]))
      }
    }
  }
  add('edge', disk(0.016, 0.004, [0, 0, 0.013]))
  add('steel', disk(0.009, 0.003, [0, 0, 0.016], 12))
}

function wrench(add: AddPart) {
  const outline: Profile = [
    [-0.016, 0.048], [-0.028, 0.06], [-0.032, 0.079], [-0.026, 0.097],
    [-0.012, 0.108], [0.008, 0.109], [0.025, 0.1], [0.032, 0.084],
    [0.03, 0.066], [0.02, 0.051], [0.011, 0.039], [0.012, -0.057],
    [0.028, -0.074], [0.037, -0.091], [0.035, -0.109], [0.023, -0.128],
    [0.013, -0.127], [0.018, -0.103], [0.01, -0.088], [-0.011, -0.086],
    [-0.022, -0.101], [-0.02, -0.125], [-0.03, -0.12], [-0.039, -0.102],
    [-0.037, -0.082], [-0.026, -0.066], [-0.012, -0.056], [-0.011, 0.036],
  ]
  const eye = new Path()
  eye.absarc(0, 0.079, 0.02, 0, Math.PI * 2, true)
  add('steel', plate(outline, 0.016, 0.0024, eye))
  add('solder', box([0.009, 0.085, 0.002], [0, -0.01, 0.0075]))
  hook(add, [0, 0.085, -0.044], 0.024)
}

function driver(add: AddPart, finish: Finish, shaft: number, flat: boolean, size: number) {
  const grip: Profile = [
    [0.011, 0], [0.013, 0.013], [0.022, 0.03], [0.023, 0.042],
    [0.021, 0.094], [0.017, 0.118], [0.011, 0.127], [0, 0.127],
  ]
  add('steel', rod(0.0045 * size, [0, -shaft + 0.01, 0], [0, 0.014, 0]))
  const tipY = -shaft + 0.0065
  const tip = flat
    ? box([0.011, 0.013, 0.003], [0, tipY, 0])
    : new CylinderGeometry(0.0045, 0.0014, 0.013, 4).translate(0, tipY, 0)
  add('steel', tip)
  add(finish, new LatheGeometry(grip.map(([r, y]) => new Vector2(r * size, y * size)), 16))
  add('rubber', rod(0.014 * size, [0, 0, 0], [0, 0.012 * size, 0], 12))
  for (let flute = 0; flute < 6; flute++) {
    const rib = rod(
      0.0032 * size,
      [0, 0.045 * size, 0.021 * size],
      [0, 0.093 * size, 0.0195 * size],
    )
    add('rubber', rib.rotateY(flute * Math.PI / 3))
  }
}

function buildTools(add: AddPart) {
  const longNose = mounted(add, [-0.51, 1.238, -0.286], 0.13)
  pliers(longNose, 'teal', false)
  hook(longNose, [-0.029, -0.016, -0.044], 0.021)
  hook(longNose, [0.029, -0.016, -0.044], 0.021)

  const cutters = mounted(add, [-0.324, 1.241, -0.286], -0.13)
  pliers(cutters, 'clay', true)
  hook(cutters, [-0.03, -0.013, -0.044], 0.021)
  hook(cutters, [0.03, -0.013, -0.044], 0.021)

  wrench(mounted(add, [-0.126, 1.291, -0.286], -0.22))

  // Les fourches prennent les manches par le col, juste au-dessus des tiges.
  add('frame', box([0.269, 0.026, 0.016], [0.138, 1.281, -0.323]))
  for (const x of [0.018, 0.258]) screw(add, [x, 1.281, -0.314])
  const drivers = [
    { x: 0.055, finish: 'ochre', shaft: 0.143, flat: true, size: 1 },
    { x: 0.139, finish: 'teal', shaft: 0.124, flat: false, size: 0.94 },
    { x: 0.219, finish: 'clay', shaft: 0.093, flat: false, size: 0.73 },
  ] as const
  for (const { x, finish, shaft, flat, size } of drivers) {
    driver(mounted(add, [x, 1.292, -0.273]), finish, shaft, flat, size)
    for (const side of [-1, 1]) {
      add('edge', box([0.008, 0.01, 0.064], [x + side * 0.011, 1.287, -0.284]))
    }
  }

  // Brucelles à pointes coudées, suspendues par leur talon.
  const tweezers = mounted(add, [0.168, 1.086, -0.292], -0.33)
  const tine: Profile = [
    [0.004, 0.013], [0.012, 0.003], [0.018, -0.06], [0.017, -0.103],
    [0.007, -0.125], [0.004, -0.123], [0.011, -0.099], [0.01, -0.061], [0, 0.009],
  ]
  tweezers('steel', plate(tine, 0.006, 0.001))
  tweezers('steel', plate(tine.map(([x, y]) => [-x, y]), 0.006, 0.001))
  tweezers('rubber', box([0.025, 0.02, 0.01], [0, 0.004, 0]))
  hook(tweezers, [0, 0.012, -0.038], 0.009)
}

function bin(add: AddPart, finish: 'teal' | 'slate') {
  const side: Profile = [
    [0, 0.003], [0.132, 0.003], [0.132, 0.045], [0.109, 0.065],
    [0.064, 0.105], [0, 0.105],
  ]
  for (const x of [-0.057, 0.057]) {
    add(finish, plate(side, 0.006, 0.0015).rotateY(-QUARTER_TURN).translate(x, 0, 0))
  }
  add(finish, box([0.111, 0.008, 0.13], [0, 0.004, 0.067]))
  add(finish, box([0.111, 0.105, 0.007], [0, 0.0525, 0.003]))
  add(finish, box([0.111, 0.042, 0.007], [0, 0.023, 0.13]))
  add(finish, box([0.122, 0.007, 0.012], [0, 0.045, 0.131]))
  add('rubber', box([0.064, 0.022, 0.003], [0, 0.022, 0.134]))
  add('paper', box([0.055, 0.015, 0.002], [0, 0.022, 0.136]))
  add('edge', box([0.028, 0.002, 0.001], [0.004, 0.022, 0.1373]))
}

function buildStorage(add: AddPart) {
  add('frame', box([0.315, 0.041, 0.017], [0.487, 1.325, -0.323]))
  add('edge', box([0.315, 0.012, 0.166], [0.487, 1.337, -0.249]))
  add('frame', box([0.315, 0.014, 0.008], [0.487, 1.342, -0.17]))
  for (const x of [0.36, 0.612]) screw(add, [x, 1.318, -0.314])

  const smallParts = mounted(add, [0.417, 1.343, -0.316])
  const fasteners = mounted(add, [0.555, 1.343, -0.316])
  bin(smallParts, 'teal')
  bin(fasteners, 'slate')
  const resistors = [[-0.032, 0.089, -0.25], [-0.005, 0.081, 0.16], [0.026, 0.092, -0.29]]
  for (const [x, z, tilt] of resistors) {
    const lead = rod(0.0017, [-0.015, 0, 0], [0.015, 0, 0])
    const body = rod(0.0045, [-0.006, 0, 0], [0.006, 0, 0])
    smallParts('steel', lead.rotateY(tilt).translate(x, 0.019, z))
    smallParts('ochre', body.rotateY(tilt).translate(x, 0.019, z))
  }
  for (const [x, z] of [[-0.029, 0.083], [0.009, 0.095], [0.029, 0.075]]) {
    fasteners('steel', rod(0.005, [x, 0.009, z], [x + 0.004, 0.027, z - 0.005], 6))
    fasteners('solder', rod(0.008, [x + 0.004, 0.027, z - 0.005], [x + 0.005, 0.033, z - 0.007], 6))
  }

  // Bobine d'étain sur un axe en porte-à-faux, avec flasques et spires apparentes.
  const spool = mounted(add, [0.49, 1.108, -0.279])
  spool('frame', box([0.066, 0.075, 0.009], [0, 0, -0.049]))
  spool('steel', rod(0.008, [0, 0, -0.051], [0, 0, 0.043], 12))
  spool('solder', disk(0.044, 0.036, [0, 0, 0], 24))
  for (const z of [-0.021, 0.021]) spool('teal', disk(0.051, 0.006, [0, 0, z], 24))
  for (const z of [-0.014, -0.007, 0, 0.007, 0.014]) {
    spool('steel', new TorusGeometry(0.044, 0.0012, 5, 24).translate(0, 0, z))
  }
  spool('paper', disk(0.036, 0.002, [0, 0, 0.0245], 24))
  spool('rubber', disk(0.015, 0.01, [0, 0, 0.029]))
  spool('steel', rod(0.0018, [0.039, -0.022, 0.009], [0.056, -0.046, 0.02]))
  spool('steel', rod(0.0018, [0.056, -0.046, 0.02], [0.054, -0.066, 0.026]))
}

function makePegTile() {
  const half = PITCH / 2
  const face = new Shape([
    new Vector2(-half, -half), new Vector2(half, -half),
    new Vector2(half, half), new Vector2(-half, half),
  ])
  const radius = 0.0065
  const sides = 12
  const rim = Array.from({ length: sides }, (_, i) => {
    const angle = i * Math.PI * 2 / sides
    return new Vector2(radius * Math.sin(angle), -radius * Math.cos(angle))
  })
  face.holes.push(new Path(rim))
  const front = new ShapeGeometry(face)
  // Le profil descendant oriente les normales vers l'intérieur du trou.
  const bore = new LatheGeometry([new Vector2(radius, 0), new Vector2(0.0056, -0.007)], sides)
    .rotateX(QUARTER_TURN)
  const tile = mergeGeometries([front, bore])
  front.dispose()
  bore.dispose()
  return tile
}

function makeWall() {
  const batches = new Map<Finish, BufferGeometry[]>()
  const add: AddPart = (finish, source) => {
    const geometry = source.index ? source.toNonIndexed() : source
    if (geometry !== source) source.dispose()
    const batch = batches.get(finish)
    if (batch) batch.push(geometry)
    else batches.set(finish, [geometry])
  }
  buildFrame(add)
  buildTools(add)
  buildStorage(add)

  // Le regroupement par finition conserve les nuances avec un seul maillage par matériau.
  const parts = Array.from(batches, ([finish, batch]) => {
    const geometry = mergeGeometries(batch)
    batch.forEach((part) => part.dispose())
    return { finish, geometry }
  })
  return { parts, tile: makePegTile() }
}

// Le fond plein sert aussi de surface de clic pour le Hotspot parent.
const skipRaycast = () => undefined

export function ToolWall() {
  const { parts, tile } = useMemo(() => makeWall(), [])
  const pegboard = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = pegboard.current
    if (!mesh) return

    const matrix = new Matrix4()
    for (let row = 0; row < ROWS; row++) {
      const y = BOARD_Y + (row + 0.5 - ROWS / 2) * PITCH
      for (let column = 0; column < COLUMNS; column++) {
        const x = (column + 0.5 - COLUMNS / 2) * PITCH
        mesh.setMatrixAt(row * COLUMNS + column, matrix.makeTranslation(x, y, BOARD_FRONT))
      }
    }
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [tile])

  useEffect(() => {
    return () => {
      tile.dispose()
      parts.forEach(({ geometry }) => geometry.dispose())
    }
  }, [parts, tile])

  return (
    <group>
      <mesh position={[0, BOARD_Y, -0.351]} castShadow>
        <boxGeometry args={[1.32, 0.604, 0.01]} />
        <meshStandardMaterial color="#252320" roughness={0.96} />
      </mesh>
      <instancedMesh
        ref={pegboard}
        args={[tile, undefined, ROWS * COLUMNS]}
        receiveShadow
        raycast={skipRaycast}
      >
        <meshStandardMaterial color="#504942" roughness={0.91} />
      </instancedMesh>
      {parts.map(({ finish, geometry }) => (
        <mesh key={finish} geometry={geometry} castShadow receiveShadow raycast={skipRaycast}>
          <meshStandardMaterial {...FINISHES[finish]} />
        </mesh>
      ))}
    </group>
  )
}
