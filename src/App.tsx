import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Loader } from '@react-three/drei'
import Experience from '@/scene/core/Experience'
import CameraUI from '@/components/CameraUI'
import MobileWarning from '@/components/MobileWarning'
import WipBadge from '@/components/WipBadge'
import AudioUnlock from '@/components/AudioUnlock'
import MuteToggle from '@/components/MuteToggle'
import FullscreenOverlay from '@/os/window/FullscreenOverlay'
import ScreenPortal from '@/os/window/ScreenPortal'
import EditorPanel from '@/editor/EditorPanel'

// @ts-ignore
const DEBUG = import.meta.env.VITE_DEBUG === 'true'

export default function App() {
  return (
    <>
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 1.8, 3.2], fov: 50 }}
        shadows
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
      <Loader />
      <CameraUI />
      <FullscreenOverlay />
      <ScreenPortal />
      <MobileWarning />
      <WipBadge />
      <AudioUnlock />
      <MuteToggle />
      {DEBUG && <EditorPanel />}
    </>
  )
}
