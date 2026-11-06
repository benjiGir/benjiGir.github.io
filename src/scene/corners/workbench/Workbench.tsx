import { useMemo } from 'react'
import { Object3D } from 'three'
import Hotspot from '@/scene/camera/Hotspot'
import Editable from '@/editor/Editable'
import { useCameraStore } from '@/store/useCameraStore'
import { useLightingStore } from '@/store/useLightingStore'
import { useEditorStore } from '@/editor/useEditorStore'
import { WORKBENCH_POSITION } from '@/scene/roomLayout'
import { Table } from './Table'
import { Breadboard } from './Breadboard'
import { SolderingIron } from './SolderingIron'
import { Multimeter } from './Multimeter'
import { Oscilloscope } from './Oscilloscope'
import { BenchSupplies } from './BenchSupplies'
import { SolderingStation } from './SolderingStation'
import { ToolWall } from './ToolWall'

function WorkbenchLight() {
  const night = useLightingStore((s) => s.mode === 'night')
  const lightOverride = useEditorStore((s) => s.overrides.workbench?.light)
  const target = useMemo(() => {
    const object = new Object3D()
    object.position.set(0, 0.77, 0.14)
    return object
  }, [])

  return (
    <group>
      {[-0.455, 0.455].map((x) => (
        <mesh key={x} position={[x, 1.521, -0.271]}>
          <boxGeometry args={[0.026, 0.018, 0.15]} />
          <meshStandardMaterial color="#41423f" roughness={0.72} />
        </mesh>
      ))}
      <mesh position={[0, 1.521, -0.207]}>
        <boxGeometry args={[1.13, 0.027, 0.047]} />
        <meshStandardMaterial color="#41423f" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.507, -0.207]}>
        <boxGeometry args={[1.095, 0.004, 0.032]} />
        <meshStandardMaterial
          color="#f6e2bd"
          emissive="#ffdc9d"
          emissiveIntensity={night ? 1.05 : 0.32}
        />
      </mesh>
      <primitive object={target} />
      <spotLight
        position={[0, 1.5, -0.207]}
        target={target}
        angle={0.79}
        penumbra={0.8}
        color={lightOverride?.color ?? '#fff1d8'}
        intensity={lightOverride?.intensity ?? (night ? 1.8 : 0.72)}
        distance={2.1}
      />
    </group>
  )
}

// ─── Workbench (export) ─────────────────────────────────────────────────────────
//
// Établi électronique au fond à gauche. L'oscilloscope
// affiche la waveform réelle du master gain (`getAnalyser`) uniquement quand le POI
// 'workbench' est actif — perf (pas de lecture analyser ni de redraw canvas en permanence).
// La LED de la breadboard reflète la progression du mini-jeu Circuit Lab (`useCircuitStore`).

export default function Workbench() {
  const activePoi = useCameraStore((s) => s.poi)
  const poiActive = activePoi === 'workbench'

  return (
    <Hotspot poi="workbench" label="Établi électronique" position={WORKBENCH_POSITION}>
      <Editable id="workbench" label="Établi électronique">
        <Table />
        <ToolWall />
        <WorkbenchLight />
        <BenchSupplies />
        <Breadboard />
        <SolderingStation />
        <SolderingIron />
        <Multimeter />
        <group position={[0.022, 0, -0.085]}>
          <Oscilloscope active={poiActive} />
        </group>
      </Editable>
    </Hotspot>
  )
}
