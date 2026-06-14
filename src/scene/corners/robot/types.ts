import type { MutableRefObject } from 'react'
import type * as THREE from 'three'

// ─── Types partagés du domaine Robot ────────────────────────────────────────
//
// Isolés ici pour éviter un cycle d'import : `GazeTarget` est utilisé à la fois par
// `parts/Head.tsx` (prop `gazeRef`) et par `RobotModelHandle` (exposé par `RobotModel.tsx`).
// Si l'un de ces types vivait dans `RobotModel.tsx`, `Head.tsx` devrait l'importer depuis
// `RobotModel.tsx`, qui importe lui-même `Head.tsx` → cycle.

export interface GazeTarget {
  yaw: number
  pitch: number
}

export interface RobotModelHandle {
  head: THREE.Group | null
  gaze: MutableRefObject<GazeTarget>
}
