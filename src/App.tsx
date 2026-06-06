import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Loader } from '@react-three/drei'
import Experience from '@/scene/Experience'
import CameraUI from '@/components/CameraUI'
import MobileWarning from '@/components/MobileWarning'
import AudioUnlock from '@/components/AudioUnlock'
import MuteToggle from '@/components/MuteToggle'
import FullscreenOverlay from '@/os/FullscreenOverlay'

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
      <MobileWarning />
      <AudioUnlock />
      <MuteToggle />
    </>
  )
}
