import { Stats } from '@react-three/drei'
import { useControls } from 'leva'
import Lighting from './Lighting'
import DeskScene from '@/scene/desk/DeskScene'
import CameraRig from '@/scene/camera/CameraRig'
import PostProcessing from './PostProcessing'
import PowerSequence from './PowerSequence'
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
