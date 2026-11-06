import Robot from '@/scene/corners/robot/Robot'
import Guitar from '@/scene/corners/guitar/Guitar'
import Workbench from '@/scene/corners/workbench/Workbench'
import RetroCorner from '@/scene/corners/retro/RetroCorner'
import LegoCorner from '@/scene/corners/lego/LegoCorner'
import Editable from '@/editor/Editable'
import { DESK_POSITION, ROBOT_MAT_CENTER } from '@/scene/roomLayout'
import { Floor } from './Floor'
import { Room } from './Room'
import { DeskModel } from './DeskModel'
import { Monitor } from './Monitor'
import { Tower } from './Tower'
import { Keyboard } from './Keyboard'
import { Mouse } from './Mouse'
import { DeskLamp } from './DeskLamp'
import { Chair } from './Chair'

export default function DeskScene() {
  return (
    <group>
      <Floor />
      <Room />
      <group position={DESK_POSITION} rotation={[0, Math.PI / 2, 0]}>
        <Editable id="desk" label="Bureau">
          <DeskModel />
        </Editable>
        <Monitor />
        <Tower />
        <Keyboard />
        <Mouse />
        <DeskLamp />
        <Chair />
      </group>
      <mesh position={[ROBOT_MAT_CENTER[0], 0.004, ROBOT_MAT_CENTER[1]]} receiveShadow>
        <boxGeometry args={[1.34, 0.008, 1.34]} />
        <meshStandardMaterial color="#526d7c" roughness={0.95} />
      </mesh>
      <Robot />
      <Guitar />
      <Workbench />
      <RetroCorner />
      <LegoCorner />
    </group>
  )
}
