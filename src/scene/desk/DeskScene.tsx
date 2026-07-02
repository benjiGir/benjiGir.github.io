import Robot from '@/scene/corners/robot/Robot'
import Guitar from '@/scene/corners/guitar/Guitar'
import Workbench from '@/scene/corners/workbench/Workbench'
import RetroCorner from '@/scene/corners/retro/RetroCorner'
import LegoCorner from '@/scene/corners/lego/LegoCorner'
import Editable from '@/editor/Editable'
import { Floor } from './Floor'
import { Room } from './Room'
import { DeskModel } from './DeskModel'
import { Monitor } from './Monitor'
import { Tower } from './Tower'
import { Keyboard } from './Keyboard'
import { Mouse } from './Mouse'
import { DeskLamp } from './DeskLamp'
import {Chair} from "@/scene/desk/Chair.tsx";

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function DeskScene() {
  return (
    <group>
      <Floor />
      <Room />
      {/* Bureau reculé contre le mur du fond — coordonnées internes inchangées */}
      <group position={[0, 0, -1.3]}>
        {/* Tapis sous le bureau */}
        <mesh position={[0, 0.005, 0.2]} receiveShadow>
          <boxGeometry args={[2.2, 0.01, 1.8]} />
          <meshStandardMaterial color="#8b7355" roughness={0.95} metalness={0} />
        </mesh>
        {/* Bureau (GLB) — déplaçable/redimensionnable au gizmo via l'éditeur de scène.
            Transform de base À AJUSTER À L'ŒIL : l'échelle/orientation natives du GLB sont
            inconnues ; l'utilisateur calibrera ensuite dans l'éditeur (sauvé dans scene-overrides.json). */}
        <Editable id="desk" label="Bureau">
          <group scale={1} position={[0, 0, 0]}>
            <DeskModel />
          </group>
        </Editable>
        {/* Objets posés sur le bureau — placements pilotés par scene-overrides.json */}
        <Monitor />
        <Tower />
        <Keyboard />
        <Mouse />
        <DeskLamp />
        <Chair />
      </group>
      <Robot />
      <Guitar />
      <Workbench />
      <RetroCorner />
      <LegoCorner />
    </group>
  )
}
