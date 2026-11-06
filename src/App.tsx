import { Suspense, useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Experience from '@/scene/core/Experience'
import SceneReady from '@/scene/core/SceneReady'
import { POIS } from '@/scene/camera/pois'
import CameraUI from '@/components/CameraUI'
import MobileWarning from '@/components/MobileWarning'
import WipBadge from '@/components/WipBadge'
import AudioUnlock from '@/components/AudioUnlock'
import MuteToggle from '@/components/MuteToggle'
import LightingToggle from '@/components/LightingToggle'
import SceneLoader from '@/components/SceneLoader'
import FullscreenOverlay from '@/os/window/FullscreenOverlay'
import ScreenPortal from '@/os/window/ScreenPortal'
import EditorPanel from '@/editor/EditorPanel'
import '@/components/sceneControls.css'

const DEBUG = import.meta.env.VITE_DEBUG === 'true'

export default function App() {
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])

  return (
    <>
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: POIS.overview.pos, fov: 57 }}
        shadows
        dpr={[1, 1.5]}
        // Exposition légèrement resserrée (défaut three = 1) : les surfaces dominantes de la
        // pièce sont claires (mur, sol) et l'éclairage cumule IBL + hemisphere + key + bloom
        // (seuil 0.85 dans PostProcessing) — sans ce calage les hautes lumières crament/bavent
        // dans le bloom au lieu de rester lisibles. Tone mapping = ACESFilmic (défaut R3F), conservé.
        gl={{ toneMappingExposure: 0.95 }}
      >
        <Suspense fallback={null}>
          <Experience />
          {!ready && <SceneReady onReady={onReady} />}
        </Suspense>
      </Canvas>
      <SceneLoader ready={ready} />
      {ready && <CameraUI />}
      <FullscreenOverlay />
      <ScreenPortal />
      <MobileWarning />
      <WipBadge />
      <AudioUnlock />
      {ready && (
        <div className="scene-controls">
          <LightingToggle />
          <MuteToggle />
        </div>
      )}
      {DEBUG && <EditorPanel />}
    </>
  )
}
