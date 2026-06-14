import Hotspot from '@/scene/camera/Hotspot'
import Editable from '@/editor/Editable'
import { useCameraStore } from '@/store/useCameraStore'
import { Table } from './Table'
import { Breadboard } from './Breadboard'
import { SolderingIron } from './SolderingIron'
import { Multimeter } from './Multimeter'
import { Oscilloscope } from './Oscilloscope'

// ─── Workbench (export) ─────────────────────────────────────────────────────────
//
// Établi électronique, coin atelier (mur du fond droit, x≈2.4, z≈-3.6). L'oscilloscope
// affiche la waveform réelle du master gain (`getAnalyser`) uniquement quand le POI
// 'workbench' est actif — perf (pas de lecture analyser ni de redraw canvas en permanence).
// La LED de la breadboard reflète la progression du mini-jeu Circuit Lab (`useCircuitStore`).

export default function Workbench() {
  const activePoi = useCameraStore((s) => s.poi)
  const poiActive = activePoi === 'workbench'

  return (
    <Hotspot poi="workbench" label="Établi électronique" position={[2.4, 0, -3.6]}>
      <Editable id="workbench" label="Établi électronique">
        <Table />
        <Breadboard />
        <SolderingIron />
        <Multimeter />
        <Oscilloscope active={poiActive} />
      </Editable>
    </Hotspot>
  )
}
