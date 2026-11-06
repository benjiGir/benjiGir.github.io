import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GAME_HEIGHT, GAME_WIDTH } from '@/lib/games/types'
import { CRT_VERTEX_SHADER, CRT_FRAGMENT_SHADER } from './crtShader'

export const TV_SCREEN_WIDTH = 0.48
export const TV_SCREEN_HEIGHT = TV_SCREEN_WIDTH * (GAME_HEIGHT / GAME_WIDTH)
const CORNER_RADIUS = 0.027
const GLASS_CROWN = 0.022

interface TvScreenProps {
  texture: THREE.CanvasTexture
  on: boolean
}

export function TvScreen({ texture, on }: TvScreenProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const geometry = useMemo(() => {
    const halfWidth = TV_SCREEN_WIDTH / 2
    const halfHeight = TV_SCREEN_HEIGHT / 2
    const geo = new THREE.PlaneGeometry(2, 2, 32, 36)
    const positions = geo.attributes.position
    const uvs = geo.attributes.uv

    for (let i = 0; i < positions.count; i++) {
      // On resserre les rangées près des bords haut et bas pour détailler les coins arrondis.
      const y = halfHeight * Math.sin((positions.getY(i) * Math.PI) / 2)
      const cornerY = Math.max(0, Math.abs(y) - halfHeight + CORNER_RADIUS)
      const rowHalfWidth =
        halfWidth - CORNER_RADIUS + Math.sqrt(CORNER_RADIUS * CORNER_RADIUS - cornerY * cornerY)
      const x = positions.getX(i) * rowHalfWidth
      const u = x / halfWidth
      const v = y / halfHeight

      // Les UV suivent le rectangle 4:3 d'origine. Seuls les coins déjà noirs sont découpés.
      positions.setXYZ(i, x, y, GLASS_CROWN * (1 - (u * u + v * v) / 2))
      uvs.setXY(i, (u + 1) / 2, (v + 1) / 2)
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  useEffect(() => () => geometry.dispose(), [geometry])

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
    <>
      <mesh geometry={geometry}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={CRT_VERTEX_SHADER}
          fragmentShader={CRT_FRAGMENT_SHADER}
          uniforms={uniforms}
          toneMapped={false}
        />
      </mesh>
      {/* Le reflet du verre s'ajoute à l'image du tube et reste visible quand il est éteint. */}
      <mesh geometry={geometry} position={[0, 0, 0.0005]}>
        <meshPhysicalMaterial
          color="#45535e"
          roughness={0.23}
          clearcoat={0.8}
          clearcoatRoughness={0.18}
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}
