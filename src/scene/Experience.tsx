import { Stats } from '@react-three/drei'
import { useControls } from 'leva'
import Lighting from '@/scene/Lighting'
import DeskScene from '@/scene/DeskScene'
import CameraRig from '@/scene/CameraRig'
import PostProcessing from '@/scene/PostProcessing'
import PowerSequence from '@/scene/PowerSequence'
import FreecamController from '@/editor/FreecamController'
import SceneEditor from '@/editor/SceneEditor'

// @ts-ignore
const DEBUG = import.meta.env.VITE_DEBUG === 'true'

export default function Experience() {
  const { showPerf } = useControls(
    'Debug',
    { showPerf: { value: true, label: 'Show Perf' } },
    { render: () => DEBUG }
  )

  return (
    <>
      {DEBUG && showPerf && <Stats />}

      <PowerSequence />
      <Lighting />
      <DeskScene />
      <CameraRig />
      <PostProcessing />

      {DEBUG && (
        <>
          <FreecamController />
          <SceneEditor />
        </>
      )}
    </>
  )
}
