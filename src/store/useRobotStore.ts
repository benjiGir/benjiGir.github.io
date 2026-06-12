import { create } from 'zustand'

// Grille logique du tapis sur laquelle évolue le robot NAO. Le tapis 3D dédié au robot mesure
// 1.6 × 1.6 m, centré en (0.6, 0.005, 2.6) — zone dégagée à droite, décalée de l'axe
// caméra↔bureau (voir `scene/DeskScene.tsx`). La grille 6×6 (span = (GRID_SIZE-1)*CELL_SIZE
// = 1.0 m) est centrée sur ce tapis.
export const GRID_SIZE = 6
export const CELL_SIZE = 0.2
// Coin (0, 0) de la grille en coordonnées monde (X, Z) — la cellule (col, row) est centrée en
// (GRID_ORIGIN_X + col * CELL_SIZE, GRID_ORIGIN_Z + row * CELL_SIZE). Centré sur le tapis du
// robot, cohérent avec le cadrage du POI 'robot' (cf. scene/pois.ts).
export const GRID_ORIGIN_X = 0.1
export const GRID_ORIGIN_Z = 2.1

/** Convertit une coordonnée de grille (col, row) en position monde (x, z). */
export function cellToWorld(col: number, row: number): [number, number] {
  return [GRID_ORIGIN_X + col * CELL_SIZE, GRID_ORIGIN_Z + row * CELL_SIZE]
}

// Orientation du robot : 0 = +Z (vers l'avant du tapis), 1 = +X, 2 = -Z, 3 = -X.
// Rotation Y correspondante (radians) pour chaque direction.
export type Direction = 0 | 1 | 2 | 3

export const DIRECTION_ANGLES: Record<Direction, number> = {
  0: 0,
  1: -Math.PI / 2,
  2: Math.PI,
  3: Math.PI / 2,
}

// Vecteurs de déplacement (dCol, dRow) par direction.
const DIRECTION_DELTAS: Record<Direction, [number, number]> = {
  0: [0, 1],
  1: [1, 0],
  2: [0, -1],
  3: [-1, 0],
}

export type Instruction = 'forward' | 'left' | 'right' | 'beep' | 'dance'

export type RunState = 'idle' | 'running' | 'success' | 'fail'

export interface RobotLevel {
  id: number
  name: string
  description: string
  start: { col: number; row: number; dir: Direction }
  target: { col: number; row: number }
  maxInstructions: number
}

export const LEVELS: RobotLevel[] = [
  {
    id: 1,
    name: 'Niveau 1 — Premiers pas',
    description: 'Avance jusqu’à la case cible.',
    start: { col: 0, row: 0, dir: 0 },
    target: { col: 0, row: 3 },
    maxInstructions: 4,
  },
  {
    id: 2,
    name: 'Niveau 2 — Tourne à droite',
    description: 'Avance puis tourne pour rejoindre la cible.',
    start: { col: 0, row: 0, dir: 0 },
    target: { col: 3, row: 2 },
    maxInstructions: 6,
  },
  {
    id: 3,
    name: 'Niveau 3 — Le détour',
    description: 'La cible est derrière toi : fais demi-tour intelligemment.',
    start: { col: 2, row: 2, dir: 0 },
    target: { col: 0, row: 0 },
    maxInstructions: 7,
  },
  {
    id: 4,
    name: 'Niveau 4 — Le carré',
    description: 'Reviens à ton point de départ en formant un carré.',
    start: { col: 1, row: 1, dir: 1 },
    target: { col: 1, row: 1 },
    maxInstructions: 8,
  },
  {
    id: 5,
    name: 'Niveau 5 — La traversée',
    description: 'Traverse tout le tapis en diagonale.',
    start: { col: 0, row: 0, dir: 0 },
    target: { col: 5, row: 5 },
    maxInstructions: 12,
  },
]

interface RobotState {
  // Position/orientation logiques courantes (en cours d'exécution ou idle après reset).
  col: number
  row: number
  dir: Direction

  // Niveau courant.
  levelIndex: number

  // File d'instructions construite par l'app RobotLab.
  queue: Instruction[]

  // État d'exécution.
  runState: RunState
  /** Index de l'instruction en cours d'exécution (consommée par la scène 3D). */
  currentStep: number | null
  /** Incrémenté à chaque "bip" demandé — la scène y réagit pour jouer le son une seule fois. */
  beepTick: number
  /** Incrémenté à chaque animation de danse demandée. */
  danceTick: number

  setQueue: (queue: Instruction[]) => void
  addInstruction: (instr: Instruction) => void
  removeInstruction: (index: number) => void
  reorderInstruction: (from: number, to: number) => void
  clearQueue: () => void

  setLevel: (index: number) => void
  resetToLevelStart: () => void

  start: () => void
  /** Avance d'une étape (appelé par la scène 3D toutes les ~600ms pendant l'exécution). */
  step: () => void
  stop: (result: 'success' | 'fail') => void
}

function levelStart(level: RobotLevel) {
  return { col: level.start.col, row: level.start.row, dir: level.start.dir }
}

export const useRobotStore = create<RobotState>((set, get) => ({
  ...levelStart(LEVELS[0]),
  levelIndex: 0,
  queue: [],
  runState: 'idle',
  currentStep: null,
  beepTick: 0,
  danceTick: 0,

  setQueue: (queue) => set({ queue }),
  addInstruction: (instr) =>
    set((s) => ({ queue: s.queue.length < 16 ? [...s.queue, instr] : s.queue })),
  removeInstruction: (index) => set((s) => ({ queue: s.queue.filter((_, i) => i !== index) })),
  reorderInstruction: (from, to) =>
    set((s) => {
      const queue = [...s.queue]
      const [item] = queue.splice(from, 1)
      queue.splice(to, 0, item)
      return { queue }
    }),
  clearQueue: () => set({ queue: [] }),

  setLevel: (index) => {
    const level = LEVELS[index]
    if (!level) return
    set({ levelIndex: index, queue: [], runState: 'idle', currentStep: null, ...levelStart(level) })
  },
  resetToLevelStart: () => {
    const level = LEVELS[get().levelIndex]
    set({ runState: 'idle', currentStep: null, ...levelStart(level) })
  },

  start: () => {
    const { queue, runState } = get()
    if (runState === 'running' || queue.length === 0) return
    const level = LEVELS[get().levelIndex]
    set({ ...levelStart(level), runState: 'running', currentStep: 0 })
  },

  // Exécute l'instruction courante puis avance le curseur. Appelé par la scène 3D au rythme
  // de l'animation (~600ms/instruction) — la logique de déplacement vit ici, l'animation visuelle
  // (interpolation de position/rotation) vit dans `scene/Robot.tsx`.
  step: () => {
    const { queue, currentStep, col, row, dir, levelIndex } = get()
    if (currentStep === null) return
    const instr = queue[currentStep]
    const level = LEVELS[levelIndex]

    let nextCol = col
    let nextRow = row
    let nextDir = dir

    if (instr === 'forward') {
      const [dCol, dRow] = DIRECTION_DELTAS[dir]
      nextCol = col + dCol
      nextRow = row + dRow
      // Sortie de grille → échec immédiat.
      if (nextCol < 0 || nextCol >= GRID_SIZE || nextRow < 0 || nextRow >= GRID_SIZE) {
        set({ runState: 'fail', currentStep: null })
        return
      }
    } else if (instr === 'left') {
      nextDir = ((dir + 3) % 4) as Direction
    } else if (instr === 'right') {
      nextDir = ((dir + 1) % 4) as Direction
    } else if (instr === 'beep') {
      set({ beepTick: get().beepTick + 1 })
    } else if (instr === 'dance') {
      set({ danceTick: get().danceTick + 1 })
    }

    const reachedTarget = nextCol === level.target.col && nextRow === level.target.row
    const isLastStep = currentStep + 1 >= queue.length

    set({
      col: nextCol,
      row: nextRow,
      dir: nextDir,
      currentStep: isLastStep ? null : currentStep + 1,
      runState: isLastStep ? (reachedTarget ? 'success' : 'fail') : 'running',
    })
  },

  stop: (result) => set({ runState: result, currentStep: null }),
}))
