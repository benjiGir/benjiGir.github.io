import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CRT_VERTEX_SHADER, CRT_FRAGMENT_SHADER } from './crtShader'

// ─── Écran CRT ─────────────────────────────────────────────────────────────────
//
// Géométrie de l'écran légèrement bombée : plan subdivisé dont on pousse les sommets vers
// l'avant (axe Z local) en fonction de la distance au centre — effet "verre convexe".

interface TvScreenProps {
  texture: THREE.CanvasTexture
  on: boolean
}

export function TvScreen({ texture, on }: TvScreenProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(0.46, 0.36, 24, 18)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const d = Math.sqrt(x * x + y * y)
      pos.setZ(i, d * d * 0.18)
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  // L'écran démarre toujours éteint (`on: 0`) — la transition vers `on`/`off` est ensuite
  // gérée par mutation directe de `mat.uniforms.on.value` dans useFrame, sans recréer l'objet
  // uniforms (ce qui réinitialiserait `time`).
  const uniforms = useMemo(
    () => ({
      map: { value: texture },
      time: { value: 0 },
      on: { value: 0 },
    }),
    [texture]
  )

  useFrame((_, delta) => {
    const mat = materialRef.current
    if (!mat) return
    mat.uniforms.time.value += delta
    // Transition douce à l'allumage/extinction
    const target = on ? 1 : 0
    mat.uniforms.on.value += (target - mat.uniforms.on.value) * Math.min(1, delta * 6)
  })

  return (
    <mesh geometry={geometry} position={[0, 0, 0.001]}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={CRT_VERTEX_SHADER}
        fragmentShader={CRT_FRAGMENT_SHADER}
        uniforms={uniforms}
        toneMapped={false}
      />
    </mesh>
  )
}
