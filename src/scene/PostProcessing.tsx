import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

export default function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom luminanceThreshold={0.85} luminanceSmoothing={0.4} intensity={0.35} mipmapBlur />
      <Vignette offset={0.25} darkness={0.55} />
    </EffectComposer>
  )
}
