import { Color, DoubleSide } from 'three'
import Editable from '@/editor/Editable'
import { ROOM_BACK_Z, ROOM_DEPTH, ROOM_FRONT_Z, ROOM_WIDTH } from '@/scene/roomLayout'
import { Bedroom } from './Bedroom'
import { HousePlantModel } from './HousePlantModel'

type Vec3 = [number, number, number]

const WALL_HEIGHT = 2.9
const WALL_X = ROOM_WIDTH / 2
const ROOM_CENTER_Z = (ROOM_BACK_Z + ROOM_FRONT_Z) / 2
const PLASTER = '#ded7c9'
const SAGE = '#a8ad99'
const TRIM = '#eee7da'
const OAK = '#b18760'
const BRONZE = '#42382e'

const WINDOW_Z = -0.65
const WINDOW_Y = 1.85
const WINDOW_WIDTH = 2.15
const WINDOW_HEIGHT = 1.55
const WINDOW_BOTTOM = WINDOW_Y - WINDOW_HEIGHT / 2
const WINDOW_TOP = WINDOW_Y + WINDOW_HEIGHT / 2
const FRAME_EDGE = 0.055
const PANE_WIDTH = WINDOW_WIDTH - 2 * FRAME_EDGE
const PANE_HEIGHT = WINDOW_HEIGHT - 2 * FRAME_EDGE

const sky = new Color('#a6bed3')
const horizon = new Color('#e5dfd0')
const SKY_COLORS = new Float32Array([...sky, ...sky, ...horizon, ...horizon])

const BOOKS: [number, number, string][] = [
  [0.04, 0.22, '#905a47'],
  [0.035, 0.18, '#536674'],
  [0.05, 0.25, '#63715a'],
  [0.03, 0.2, '#ad8057'],
  [0.045, 0.16, '#736373'],
  [0.04, 0.21, '#bba072'],
  [0.035, 0.17, '#526063'],
  [0.05, 0.23, '#875445'],
]

function Panel({
  position,
  width,
  height,
  color = PLASTER,
}: {
  position: Vec3
  width: number
  height: number
  color?: string
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <planeGeometry args={[width, height]} />
      {/* Les murs se voient de l'intérieur et bloquent la lumière des deux côtés. */}
      <meshStandardMaterial color={color} roughness={0.96} shadowSide={DoubleSide} />
    </mesh>
  )
}

function Block({ position, size, color }: { position: Vec3; size: Vec3; color: string }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.83} />
    </mesh>
  )
}

function WallTrim({ width, baseboard = true }: { width: number; baseboard?: boolean }) {
  return (
    <>
      {baseboard && (
        <Block position={[0, 0.054, 0.011]} size={[width, 0.108, 0.022]} color={TRIM} />
      )}
      <Block position={[0, WALL_HEIGHT - 0.028, 0.012]} size={[width, 0.056, 0.024]} color={TRIM} />
    </>
  )
}

function BackWall() {
  const doorWidth = 1.05
  const doorHeight = 2.17
  const wingWidth = (ROOM_WIDTH - doorWidth) / 2
  const wingCenter = (ROOM_WIDTH + doorWidth) / 4

  return (
    <group position={[0, 0, ROOM_BACK_Z]}>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * wingCenter, 0, 0]}>
          <Panel position={[0, WALL_HEIGHT / 2, 0]} width={wingWidth} height={WALL_HEIGHT} />
          <Block position={[0, 0.054, 0.011]} size={[wingWidth, 0.108, 0.022]} color={TRIM} />
        </group>
      ))}
      <Panel
        position={[0, (WALL_HEIGHT + doorHeight) / 2, 0]}
        width={doorWidth}
        height={WALL_HEIGHT - doorHeight}
      />
      <WallTrim width={ROOM_WIDTH} baseboard={false} />

      <Block
        position={[0, doorHeight / 2, 0.006]}
        size={[doorWidth, doorHeight, 0.05]}
        color={OAK}
      />
      {[-1, 1].map((side) => (
        <Block
          key={side}
          position={[side * doorWidth / 2, doorHeight / 2, 0.036]}
          size={[0.075, doorHeight, 0.06]}
          color={TRIM}
        />
      ))}
      <Block position={[0, doorHeight + 0.028, 0.036]} size={[1.125, 0.075, 0.06]} color={TRIM} />
      <Block position={[0, 1.53, 0.034]} size={[0.76, 0.89, 0.026]} color="#9e7855" />
      <Block position={[0, 1.53, 0.05]} size={[0.69, 0.82, 0.019]} color={OAK} />
      <Block position={[0, 0.49, 0.034]} size={[0.76, 0.67, 0.026]} color="#9e7855" />
      <Block position={[0, 0.49, 0.05]} size={[0.69, 0.6, 0.019]} color={OAK} />
      <Block position={[0.435, 1.02, 0.046]} size={[0.043, 0.15, 0.024]} color={BRONZE} />
      <Block position={[0.39, 1.06, 0.08]} size={[0.14, 0.028, 0.035]} color={BRONZE} />
    </group>
  )
}

function Window() {
  return (
    <group position={[-WINDOW_Z, WINDOW_Y, 0]}>
      <Editable id="window" label="Fenêtre">
        {[-1, 1].map((side) => (
          <group key={side}>
            <Block
              position={[(side * (WINDOW_WIDTH - FRAME_EDGE)) / 2, 0, -0.05]}
              size={[FRAME_EDGE, WINDOW_HEIGHT, 0.14]}
              color={TRIM}
            />
            <Block
              position={[0, (side * (WINDOW_HEIGHT - FRAME_EDGE)) / 2, -0.05]}
              size={[PANE_WIDTH, FRAME_EDGE, 0.14]}
              color={TRIM}
            />
            <Block
              position={[0, side * 0.245, -0.04]}
              size={[PANE_WIDTH, 0.036, 0.06]}
              color={TRIM}
            />
          </group>
        ))}
        <Block position={[0, 0, -0.04]} size={[0.048, PANE_HEIGHT, 0.06]} color={TRIM} />

        {/* Seuls le cadre et les croisillons projettent une ombre sur l'ouverture. */}
        <mesh position={[0, 0, -0.084]}>
          <planeGeometry args={[PANE_WIDTH, PANE_HEIGHT]} />
          <meshStandardMaterial color="#d6e4ee" transparent opacity={0.18} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0, -0.118]}>
          <planeGeometry args={[PANE_WIDTH, PANE_HEIGHT]}>
            <bufferAttribute attach="attributes-color" args={[SKY_COLORS, 3]} />
          </planeGeometry>
          <meshBasicMaterial vertexColors />
        </mesh>
      </Editable>
      <Block
        position={[0, -WINDOW_HEIGHT / 2 - 0.028, 0.013]}
        size={[2.25, 0.056, 0.245]}
        color={TRIM}
      />

      <mesh position={[0, 0.94, 0.136]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.017, 0.017, 2.88, 12]} />
        <meshStandardMaterial color={BRONZE} roughness={0.58} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 1.248, 0, 0.129]}>
          {Array.from({ length: 7 }, (_, index) => (
            <mesh
              key={index}
              position={[(index - 3) * 0.044, -0.414, index % 2 === 0 ? 0.025 : 0]}
              castShadow
              receiveShadow
            >
              <cylinderGeometry args={[0.031, 0.04, 2.66, 8]} />
              <meshStandardMaterial color={index % 2 === 0 ? '#929b82' : '#858e75'} roughness={1} />
            </mesh>
          ))}
        </group>
      ))}

      <group position={[0, -1.36, 0.065]}>
        <Block position={[0, 0, 0]} size={[1.52, 0.62, 0.05]} color={TRIM} />
        {Array.from({ length: 15 }, (_, index) => (
          <mesh key={index} position={[(index - 7) * 0.098, 0, 0.026]} receiveShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.59, 8]} />
            <meshStandardMaterial color={TRIM} roughness={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Shelf() {
  let bookOffset = 0

  return (
    <Editable id="shelf" label="Étagère" position={[2.66, 1.95, 0]}>
      <Block position={[0, 0, 0.138]} size={[1.4, 0.06, 0.3]} color={OAK} />
      {[-0.49, 0.49].map((offset) => (
        <Block
          key={offset}
          position={[offset, -0.075, 0.028]}
          size={[0.06, 0.1, 0.08]}
          color={OAK}
        />
      ))}
      {BOOKS.map(([width, height, color], index) => {
        const position = -0.53 + bookOffset + width / 2
        bookOffset += width + 0.012
        return (
          <Block
            key={index}
            position={[position, 0.03 + height / 2, 0.158]}
            size={[width, height, 0.15]}
            color={color}
          />
        )
      })}
    </Editable>
  )
}

function LeftWall() {
  const windowCenter = -WINDOW_Z
  const leftEdge = windowCenter - WINDOW_WIDTH / 2
  const rightEdge = windowCenter + WINDOW_WIDTH / 2
  const leftWidth = leftEdge + ROOM_FRONT_Z
  const rightWidth = -ROOM_BACK_Z - rightEdge

  return (
    <group position={[-WALL_X, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <Panel
        position={[-ROOM_FRONT_Z + leftWidth / 2, WALL_HEIGHT / 2, 0]}
        width={leftWidth}
        height={WALL_HEIGHT}
      />
      <Panel
        position={[-ROOM_BACK_Z - rightWidth / 2, WALL_HEIGHT / 2, 0]}
        width={rightWidth}
        height={WALL_HEIGHT}
      />
      <Panel
        position={[windowCenter, WINDOW_BOTTOM / 2, 0]}
        width={WINDOW_WIDTH}
        height={WINDOW_BOTTOM}
      />
      <Panel
        position={[windowCenter, (WALL_HEIGHT + WINDOW_TOP) / 2, 0]}
        width={WINDOW_WIDTH}
        height={WALL_HEIGHT - WINDOW_TOP}
      />
      <group position={[-ROOM_CENTER_Z, 0, 0]}>
        <WallTrim width={ROOM_DEPTH} />
      </group>
      <Window />
      <Shelf />
    </group>
  )
}

function Pendant() {
  return (
    <group position={[0, WALL_HEIGHT, -0.3]}>
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.086, 0.086, 0.04, 20]} />
        <meshStandardMaterial color={BRONZE} roughness={0.65} />
      </mesh>
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.009, 0.009, 0.24, 8]} />
        <meshStandardMaterial color={BRONZE} roughness={0.65} />
      </mesh>
      <mesh position={[0, -0.405, 0]}>
        <cylinderGeometry args={[0.32, 0.34, 0.27, 40]} />
        <meshStandardMaterial
          color="#e3c89f"
          roughness={0.94}
          emissive="#7b542d"
          emissiveIntensity={0.26}
        />
      </mesh>
      <mesh position={[0, -0.541, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.318, 40]} />
        <meshStandardMaterial color="#f0d6ad" emissive="#efbc79" emissiveIntensity={0.28} />
      </mesh>
    </group>
  )
}

export function Room() {
  return (
    <group>
      <BackWall />
      <LeftWall />
      <group position={[WALL_X, 0, ROOM_CENTER_Z]} rotation={[0, -Math.PI / 2, 0]}>
        <Panel
          position={[0, WALL_HEIGHT / 2, 0]}
          width={ROOM_DEPTH}
          height={WALL_HEIGHT}
          color={SAGE}
        />
        <WallTrim width={ROOM_DEPTH} />
        <Editable id="photo" label="Cadre photo" position={[-1.93, 1.73, 0]}>
          <Block position={[0, 0, 0.018]} size={[0.39, 0.49, 0.035]} color={BRONZE} />
          <Block position={[0, 0, 0.038]} size={[0.345, 0.445, 0.011]} color="#e3d8c6" />
          <Block position={[0, 0, 0.046]} size={[0.282, 0.35, 0.012]} color="#8f9696" />
          <Block position={[0, -0.083, 0.053]} size={[0.282, 0.104, 0.005]} color="#777f6a" />
        </Editable>
      </group>
      <group position={[0, WALL_HEIGHT, ROOM_CENTER_Z]} rotation={[Math.PI / 2, 0, 0]}>
        <Panel position={[0, 0, 0]} width={ROOM_WIDTH} height={ROOM_DEPTH} color="#e9e0d1" />
      </group>
      <Pendant />
      <Bedroom />

      <Editable id="plant" label="Plante" position={[-3.31, 0.522, -2.52]}>
        <HousePlantModel />
      </Editable>
    </group>
  )
}
