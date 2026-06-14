import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getAnalyser } from '@/lib/audio'
import { Model as OscilloscopeModel } from './OscilloscopeModel'

// Modèle GLB de l'oscilloscope, calé visuellement sur l'établi (export FBX désordonné,
// échelle interne 0.01 déjà appliquée dans OscilloscopeModel.tsx).
const MODEL_SCALE = 0.03
const MODEL_POSITION: [number, number, number] = [0, 0.74, 0.04]
const MODEL_ROTATION: [number, number, number] = [0, -0.02, 0]

// Écran (overlay plan + texture canvas), calé sur la zone écran du modèle GLB.
const SCREEN_POSITION: [number, number, number] = [-0.08, 0.9, 0.22]
const SCREEN_ROTATION: [number, number, number] = [-0.12, -0.02, -0.01]
const SCREEN_WIDTH = 0.12
const SCREEN_HEIGHT = 0.105

// Résolution du canvas de l'oscilloscope (texture)
const SCOPE_TEX_W = 256
const SCOPE_TEX_H = 192

// ─── Oscilloscope ────────────────────────────────────────────────────────────────

export function Oscilloscope({ active }: { active: boolean }) {
  // Canvas 2D hors-écran utilisé comme texture de l'écran de l'oscillo
  const canvas = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = SCOPE_TEX_W
    c.height = SCOPE_TEX_H
    return c
  }, [])
  const ctx2d = useMemo(() => canvas.getContext('2d'), [canvas])
  const texture = useMemo(() => {
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [canvas])

  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null)

  // Dessin "écran éteint" une fois au montage (et quand on redevient inactif), pour ne pas
  // garder une frame figée d'une ancienne waveform.
  useEffect(() => {
    if (!ctx2d) return
    if (!active) {
      ctx2d.fillStyle = '#0a1f0f'
      ctx2d.fillRect(0, 0, SCOPE_TEX_W, SCOPE_TEX_H)
      texture.needsUpdate = true
    }
  }, [active, ctx2d, texture])

  useFrame(() => {
    // Perf : on ne dessine/met à jour la texture que lorsque le POI 'workbench' est actif —
    // évite un getByteTimeDomainData + redraw canvas à 60fps en permanence.
    if (!active || !ctx2d) return

    const analyser = getAnalyser()
    if (!dataArrayRef.current || dataArrayRef.current.length !== analyser.fftSize) {
      dataArrayRef.current = new Uint8Array(analyser.fftSize)
    }
    const data = dataArrayRef.current
    analyser.getByteTimeDomainData(data)

    // Fond + grille façon oscillo
    ctx2d.fillStyle = '#0a1f0f'
    ctx2d.fillRect(0, 0, SCOPE_TEX_W, SCOPE_TEX_H)
    ctx2d.strokeStyle = 'rgba(80,200,120,0.18)'
    ctx2d.lineWidth = 1
    for (let gx = 0; gx <= SCOPE_TEX_W; gx += SCOPE_TEX_W / 8) {
      ctx2d.beginPath()
      ctx2d.moveTo(gx, 0)
      ctx2d.lineTo(gx, SCOPE_TEX_H)
      ctx2d.stroke()
    }
    for (let gy = 0; gy <= SCOPE_TEX_H; gy += SCOPE_TEX_H / 6) {
      ctx2d.beginPath()
      ctx2d.moveTo(0, gy)
      ctx2d.lineTo(SCOPE_TEX_W, gy)
      ctx2d.stroke()
    }

    // Waveform temporelle réelle du master gain
    ctx2d.strokeStyle = '#4ade80'
    ctx2d.lineWidth = 2
    ctx2d.beginPath()
    const sliceWidth = SCOPE_TEX_W / data.length
    let x = 0
    for (let i = 0; i < data.length; i++) {
      const v = data[i] / 128 - 1 // [-1, 1]
      const y = SCOPE_TEX_H / 2 + v * (SCOPE_TEX_H / 2) * 0.9
      if (i === 0) ctx2d.moveTo(x, y)
      else ctx2d.lineTo(x, y)
      x += sliceWidth
    }
    ctx2d.stroke()

    texture.needsUpdate = true
  })

  return (
    <group>
      {/* Modèle GLB (export FBX désordonné, 139 meshes, échelle interne 0.01 déjà appliquée) */}
      <group position={MODEL_POSITION} rotation={MODEL_ROTATION} scale={MODEL_SCALE}>
        <OscilloscopeModel />
      </group>
      {/* Écran (overlay plan + texture canvas), positionné indépendamment du modèle car aucun
          mesh "écran" n'est identifiable dans le GLB */}
      <mesh position={SCREEN_POSITION} rotation={SCREEN_ROTATION} renderOrder={10}>
        <planeGeometry args={[SCREEN_WIDTH, SCREEN_HEIGHT]} />
        <meshBasicMaterial map={texture} toneMapped={false} depthTest={false} />
      </mesh>
    </group>
  )
}
