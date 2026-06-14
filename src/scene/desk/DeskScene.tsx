import Robot from '@/scene/corners/robot/Robot'
import Guitar from '@/scene/corners/guitar/Guitar'
import Workbench from '@/scene/corners/workbench/Workbench'
import RetroCorner from '@/scene/corners/retro/RetroCorner'
import LegoCorner from '@/scene/corners/lego/LegoCorner'
import { Floor } from './Floor'
import { Room } from './Room'
import { DeskFrame } from './DeskFrame'
import { SitStandPanel } from './SitStandPanel'
import { DeskLiftGroup } from './DeskLiftGroup'

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function DeskScene() {
  return (
    <group>
      <Floor />
      <Room />
      {/* Bureau reculé contre le mur du fond (z=-4) — coordonnées internes inchangées */}
      <group position={[0, 0, -1.3]}>
        {/* Tapis sous le bureau, suit le décalage du groupe */}
        <mesh position={[0, 0.005, 0.2]} receiveShadow>
          <boxGeometry args={[2.2, 0.01, 1.8]} />
          <meshStandardMaterial color="#8b7355" roughness={0.95} metalness={0} />
        </mesh>
        <DeskFrame />
        <SitStandPanel />
        <DeskLiftGroup />
      </group>
      <Robot />
      <Guitar />
      <Workbench />
      <RetroCorner />
      <LegoCorner />
    </group>
  )
}
