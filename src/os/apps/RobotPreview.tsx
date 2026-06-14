import type { ReactElement } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { RobotModel } from '@/scene/corners/robot/RobotModel'
import { TargetMarker } from '@/scene/corners/robot/parts/TargetMarker'
import { GRID_SIZE, CELL_SIZE, cellToWorld } from '@/store/useRobotStore'

// Centre de la grille (en coordonnées "monde" de la scène principale, réutilisées telles
// quelles ici puisque la mini-scène est indépendante).
const [GRID_CENTER_X, GRID_CENTER_Z] = cellToWorld((GRID_SIZE - 1) / 2, (GRID_SIZE - 1) / 2)
const GRID_SPAN = (GRID_SIZE - 1) * CELL_SIZE + CELL_SIZE // marge d'une demi-cellule de chaque côté

// Caméra fixe en vue 3/4 plongeante au-dessus de la grille (offset par rapport à son centre)
const CAMERA_POS: [number, number, number] = [GRID_CENTER_X + 0.5, 1.2, GRID_CENTER_Z - 0.8]

// ─── Tapis + grille visuelle ──────────────────────────────────────────────────

function MiniMat() {
  const lines: ReactElement[] = []
  // Lignes verticales et horizontales matérialisant les cellules 6×6
  for (let i = 0; i < GRID_SIZE + 1; i++) {
    const x = GRID_CENTER_X - GRID_SPAN / 2 + CELL_SIZE / 2 + i * CELL_SIZE
    const z = GRID_CENTER_Z - GRID_SPAN / 2 + CELL_SIZE / 2 + i * CELL_SIZE
    lines.push(
      <mesh key={`v${i}`} position={[x, 0.011, GRID_CENTER_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.004, GRID_SPAN]} />
        <meshBasicMaterial color="#3a4756" />
      </mesh>
    )
    lines.push(
      <mesh key={`h${i}`} position={[GRID_CENTER_X, 0.011, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[GRID_SPAN, 0.004]} />
        <meshBasicMaterial color="#3a4756" />
      </mesh>
    )
  }

  return (
    <group>
      <mesh
        position={[GRID_CENTER_X, 0, GRID_CENTER_Z]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[GRID_SPAN + 0.1, GRID_SPAN + 0.1]} />
        <meshStandardMaterial color="#5b6b7a" roughness={0.95} />
      </mesh>
      {lines}
    </group>
  )
}

// ─── Scène ─────────────────────────────────────────────────────────────────────

function MiniScene() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[1, 2, 1]} intensity={1.2} castShadow={false} />
      <MiniMat />
      <TargetMarker />
      <RobotModel />
    </>
  )
}

// ─── RobotPreview ────────────────────────────────────────────────────────────
//
// Mini-Canvas R3F autonome (contexte WebGL indépendant de la scène principale) affiché dans
// l'app RobotLab : retour visuel du robot qui exécute la séquence sur la grille, sans quitter
// l'app. Lit `useRobotStore` (singleton zustand, partagé entre les deux Canvas). Caméra fixe,
// pas de contrôles. dpr et taille limités : il s'agit d'un simple aperçu, pas d'un rendu
// principal.

export default function RobotPreview() {
  return (
    <div style={{ width: '100%', height: 180, flexShrink: 0 }}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: CAMERA_POS, fov: 32 }}
        onCreated={({ camera }) => camera.lookAt(GRID_CENTER_X, 0, GRID_CENTER_Z)}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <MiniScene />
      </Canvas>
    </div>
  )
}
