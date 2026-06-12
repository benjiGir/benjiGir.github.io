import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Hotspot from '@/scene/Hotspot'
import { Model as OscilloscopeModel } from '@/scene/OscilloscopeModel'
import { useCameraStore } from '@/store/useCameraStore'
import { useCircuitStore } from '@/store/useCircuitStore'
import { getAnalyser } from '@/lib/audio'

// ─── Constantes ────────────────────────────────────────────────────────────────

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

const TABLE_COLOR = '#6b5640'
const TABLE_TOP_COLOR = '#8a7257'
const BOARD_COLOR = '#e8e4d8'
const MULTIMETER_COLOR = '#d97706'
const SOLDER_STAND_COLOR = '#4b4b4b'

// LED de la breadboard : rouge tant que le Circuit Lab n'a livré aucun niveau, vert une fois
// au moins un niveau résolu (changement de couleur = feedback de `useCircuitStore`).
const LED_OFF_COLOR = '#7a1a1a'
const LED_ON_COLOR = '#22c55e'
const LED_ON_COLOR_UNSOLVED = '#ef4444'

// Résolution du canvas de l'oscilloscope (texture)
const SCOPE_TEX_W = 256
const SCOPE_TEX_H = 192

// ─── Plan de travail ────────────────────────────────────────────────────────────

function Table() {
  return (
    <group>
      {/* Plateau */}
      <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.04, 0.6]} />
        <meshStandardMaterial color={TABLE_TOP_COLOR} roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Caisson fermé jusqu'au sol (sous le plateau) */}
      <mesh position={[0, 0.36, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.72, 0.5]} />
        <meshStandardMaterial color={TABLE_COLOR} roughness={0.8} />
      </mesh>
    </group>
  )
}

// ─── Breadboard + LED clignotante ───────────────────────────────────────────────

function Breadboard() {
  const ledMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const blinkRef = useRef(0)
  const solvedLevels = useCircuitStore((s) => s.solvedLevels)

  useFrame((_, delta) => {
    const mat = ledMatRef.current
    if (!mat) return
    const solved = solvedLevels > 0

    blinkRef.current += delta
    // Clignotement plus rapide une fois un niveau résolu (feedback "circuit actif")
    const period = solved ? 0.5 : 1.4
    const phase = (blinkRef.current % period) / period
    const on = phase < 0.5

    if (on) {
      mat.color.set(solved ? LED_ON_COLOR : LED_ON_COLOR_UNSOLVED)
      mat.emissive.set(solved ? LED_ON_COLOR : LED_ON_COLOR_UNSOLVED)
      mat.emissiveIntensity = solved ? 2.2 : 1.2
    } else {
      mat.color.set(LED_OFF_COLOR)
      mat.emissive.set(LED_OFF_COLOR)
      mat.emissiveIntensity = 0.15
    }
  })

  // Petite grille de trous (instanciée pour l'aspect breadboard, géométrie figée)
  const holes = useMemo(() => {
    const positions: [number, number][] = []
    for (let x = -0.085; x <= 0.085; x += 0.017) {
      for (let z = -0.04; z <= 0.04; z += 0.017) {
        positions.push([x, z])
      }
    }
    return positions
  }, [])

  const holeGeo = useMemo(() => new THREE.CylinderGeometry(0.0015, 0.0015, 0.006, 6), [])
  const holeMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#9b9488', roughness: 0.6 }),
    []
  )

  return (
    <group position={[-0.32, 0.766, -0.08]}>
      {/* Plaque */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.012, 0.14]} />
        <meshStandardMaterial color={BOARD_COLOR} roughness={0.6} />
      </mesh>
      {/* Trous (instancing via Instances serait sur-ingénierie ici : ~50 cylindres fins, coût
          négligeable et géométrie/matériau partagés via useMemo) */}
      {holes.map(([x, z], i) => (
        <mesh key={i} geometry={holeGeo} material={holeMat} position={[x, 0.007, z]} />
      ))}
      {/* Quelques composants posés (résistances) */}
      <mesh position={[-0.05, 0.012, 0.02]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.004, 0.004, 0.03, 8]} />
        <meshStandardMaterial color="#caa472" roughness={0.5} />
      </mesh>
      <mesh position={[0.04, 0.012, -0.015]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.004, 0.004, 0.03, 8]} />
        <meshStandardMaterial color="#caa472" roughness={0.5} />
      </mesh>
      {/* LED — dôme hémisphérique émissif */}
      <mesh position={[0.06, 0.018, 0.03]} castShadow>
        <sphereGeometry args={[0.012, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial ref={ledMatRef} color={LED_OFF_COLOR} emissive={LED_OFF_COLOR} />
      </mesh>
      {/* Pattes de la LED */}
      <mesh position={[0.057, 0.006, 0.03]} castShadow>
        <cylinderGeometry args={[0.0008, 0.0008, 0.012, 4]} />
        <meshStandardMaterial color="#999" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.063, 0.006, 0.03]} castShadow>
        <cylinderGeometry args={[0.0008, 0.0008, 0.012, 4]} />
        <meshStandardMaterial color="#999" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

// ─── Fer à souder sur support ────────────────────────────────────────────────────

function SolderingIron() {
  return (
    <group position={[0.28, 0.77, 0.08]}>
      {/* Support (anneau métallique sur socle) */}
      <mesh position={[0, 0.012, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.035, 0.04, 0.02, 16]} />
        <meshStandardMaterial color={SOLDER_STAND_COLOR} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.045, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.025, 0.004, 8, 16]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Manche du fer, posé en biais dans l'anneau */}
      <group position={[0.01, 0.05, 0]} rotation={[0, 0, Math.PI / 5]}>
        <mesh position={[0, 0.07, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.014, 0.16, 12]} />
          <meshStandardMaterial color="#222" roughness={0.6} />
        </mesh>
        {/* Panne (pointe métallique) */}
        <mesh position={[0, -0.02, 0]} castShadow>
          <coneGeometry args={[0.005, 0.05, 8]} />
          <meshStandardMaterial color="#cfcfcf" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Petite zone chauffante émissive (pointe légèrement rouge) */}
        <mesh position={[0, -0.04, 0]}>
          <sphereGeometry args={[0.006, 8, 8]} />
          <meshStandardMaterial color="#ff5533" emissive="#aa2200" emissiveIntensity={0.6} />
        </mesh>
      </group>
    </group>
  )
}

// ─── Multimètre ──────────────────────────────────────────────────────────────────

function Multimeter() {
  return (
    <group position={[0.45, 0.77, -0.12]} rotation={[0, -0.3, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.09, 0.02, 0.13]} />
        <meshStandardMaterial color={MULTIMETER_COLOR} roughness={0.6} />
      </mesh>
      {/* Écran */}
      <mesh position={[0, 0.011, -0.02]}>
        <boxGeometry args={[0.05, 0.002, 0.03]} />
        <meshStandardMaterial color="#9be8a8" emissive="#4ade80" emissiveIntensity={0.4} />
      </mesh>
      {/* Molette de sélection */}
      <mesh position={[0, 0.014, 0.04]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.012, 16]} />
        <meshStandardMaterial color="#1f2937" roughness={0.5} />
      </mesh>
      {/* Sondes (fils rouge/noir) */}
      <mesh position={[-0.03, 0.005, 0.07]} rotation={[0.3, 0, 0.2]}>
        <cylinderGeometry args={[0.0025, 0.0025, 0.06, 6]} />
        <meshStandardMaterial color="#cc2222" />
      </mesh>
      <mesh position={[0.03, 0.005, 0.07]} rotation={[0.3, 0, -0.2]}>
        <cylinderGeometry args={[0.0025, 0.0025, 0.06, 6]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  )
}

// ─── Oscilloscope ────────────────────────────────────────────────────────────────

function Oscilloscope({ active }: { active: boolean }) {
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

  const dataArrayRef = useRef<Uint8Array | null>(null)

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
      <Table />
      <Breadboard />
      <SolderingIron />
      <Multimeter />
      <Oscilloscope active={poiActive} />
    </Hotspot>
  )
}
