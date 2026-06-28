// Rendu SVG de la plaque d'essai (breadboard) du Circuit Lab : rails d'alimentation, grille de
// trous avec gouttière centrale, pile fixe, composants posés (résistance, LED, interrupteur,
// fil) et leur retour visuel (LED allumée/grillée, interrupteur ouvert/fermé).

import { N_COLUMNS } from '@/lib/circuit/board'
import type { Hole, HoleRow, PlacedComponent } from '@/lib/circuit/types'
import { LED_MAX_SAFE_A } from '@/lib/circuit/eval'

// ── Géométrie ────────────────────────────────────────────────────────────────────

const COL_W = 38
const PAD_X = 36
const PAD_TOP = 50
const RAIL_GAP = 34 // écart entre les deux lignes de rail
const RAIL_TO_GRID = 46 // écart entre le rail- et le haut de la grille a-e
const ROW_H = 20
const GUTTER_H = 22 // hauteur visuelle de la gouttière centrale entre les groupes a-e et f-j
const HOLE_R = 3.2

const TOP_GRID_ROWS: HoleRow[] = ['a', 'b', 'c', 'd', 'e']
const BOTTOM_GRID_ROWS: HoleRow[] = ['f', 'g', 'h', 'i', 'j']

export const BOARD_WIDTH = PAD_X * 2 + (N_COLUMNS - 1) * COL_W
export const BOARD_HEIGHT =
  PAD_TOP +
  RAIL_GAP +
  RAIL_TO_GRID +
  TOP_GRID_ROWS.length * ROW_H +
  GUTTER_H +
  BOTTOM_GRID_ROWS.length * ROW_H +
  30

function colX(column: number): number {
  return PAD_X + column * COL_W
}

function railY(rail: 'rail+' | 'rail-'): number {
  return rail === 'rail+' ? PAD_TOP : PAD_TOP + RAIL_GAP
}

function rowY(row: HoleRow): number {
  if (row === 'rail+' || row === 'rail-') return railY(row)
  const topIndex = TOP_GRID_ROWS.indexOf(row)
  const gridTop = railY('rail-') + RAIL_TO_GRID
  if (topIndex >= 0) return gridTop + topIndex * ROW_H
  const botIndex = BOTTOM_GRID_ROWS.indexOf(row)
  return gridTop + TOP_GRID_ROWS.length * ROW_H + GUTTER_H + botIndex * ROW_H
}

/** Coordonnées écran d'un trou de la plaque. */
export function holePos(hole: Hole): { x: number; y: number } {
  return { x: colX(hole.column), y: rowY(hole.row) }
}

function sameHole(a: Hole, b: Hole): boolean {
  return a.column === b.column && a.row === b.row
}

// ── Couleurs ─────────────────────────────────────────────────────────────────────

const LED_HEX: Record<string, string> = {
  red: '#f87171',
  green: '#4ade80',
  blue: '#60a5fa',
  yellow: '#facc15',
}

// ── Composant ────────────────────────────────────────────────────────────────────

interface CircuitBreadboardProps {
  components: PlacedComponent[]
  pendingHole: Hole | null
  currentByComponentId: Record<string, number>
  shortCircuit: boolean
  onHoleClick: (hole: Hole) => void
  onComponentClick: (component: PlacedComponent) => void
}

export default function CircuitBreadboard({
  components,
  pendingHole,
  currentByComponentId,
  shortCircuit,
  onHoleClick,
  onComponentClick,
}: CircuitBreadboardProps) {
  const allHoles: Hole[] = []
  for (let col = 0; col < N_COLUMNS; col++) {
    allHoles.push({ column: col, row: 'rail+' }, { column: col, row: 'rail-' })
    for (const row of TOP_GRID_ROWS) allHoles.push({ column: col, row })
    for (const row of BOTTOM_GRID_ROWS) allHoles.push({ column: col, row })
  }

  return (
    <svg
      width={BOARD_WIDTH}
      height={BOARD_HEIGHT}
      style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}
    >
      {/* Fond de plaque */}
      <rect
        x={4}
        y={4}
        width={BOARD_WIDTH - 8}
        height={BOARD_HEIGHT - 8}
        rx={10}
        fill="#e8e3d6"
        opacity={0.06}
      />

      {/* Rails d'alimentation */}
      <line
        x1={PAD_X - 14}
        x2={BOARD_WIDTH - PAD_X + 14}
        y1={railY('rail+')}
        y2={railY('rail+')}
        stroke="#ef4444"
        strokeWidth={2}
        opacity={0.35}
      />
      <line
        x1={PAD_X - 14}
        x2={BOARD_WIDTH - PAD_X + 14}
        y1={railY('rail-')}
        y2={railY('rail-')}
        stroke="#3b82f6"
        strokeWidth={2}
        opacity={0.35}
      />
      <text x={PAD_X - 30} y={railY('rail+') + 4} fontSize={11} fill="#ef4444" fontWeight={700}>
        +
      </text>
      <text x={PAD_X - 30} y={railY('rail-') + 4} fontSize={11} fill="#3b82f6" fontWeight={700}>
        −
      </text>

      {/* Gouttière centrale (repère visuel) */}
      <rect
        x={PAD_X - 14}
        y={railY('rail-') + RAIL_TO_GRID + TOP_GRID_ROWS.length * ROW_H}
        width={BOARD_WIDTH - 2 * (PAD_X - 14)}
        height={GUTTER_H}
        fill="#000"
        opacity={0.18}
      />

      {/* Pile fixe : symbole + fils vers les rails, à gauche de la plaque */}
      <BatterySymbol />

      {/* Trous */}
      {allHoles.map((hole) => {
        const p = holePos(hole)
        const isRail = hole.row === 'rail+' || hole.row === 'rail-'
        const isPending = pendingHole !== null && sameHole(pendingHole, hole)
        return (
          <circle
            key={`${hole.column}-${hole.row}`}
            cx={p.x}
            cy={p.y}
            r={isPending ? HOLE_R + 1.5 : HOLE_R}
            fill={
              isPending ? '#facc15' : isRail ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.14)'
            }
            stroke={isPending ? '#facc15' : 'rgba(255,255,255,0.25)'}
            strokeWidth={isPending ? 1.5 : 1}
            style={{ cursor: 'pointer' }}
            onClick={() => onHoleClick(hole)}
          />
        )
      })}

      {/* Composants posés */}
      {components.map((component) => (
        <PlacedComponentView
          key={component.id}
          component={component}
          current={currentByComponentId[component.id] ?? 0}
          onClick={() => onComponentClick(component)}
        />
      ))}

      {/* Bandeau court-circuit */}
      {shortCircuit && (
        <text
          x={BOARD_WIDTH / 2}
          y={BOARD_HEIGHT - 8}
          textAnchor="middle"
          fontSize={12}
          fontWeight={700}
          fill="#f87171"
        >
          ⚡ Court-circuit !
        </text>
      )}
    </svg>
  )
}

function BatterySymbol() {
  const x = PAD_X - 14
  const yPos = railY('rail+')
  const yNeg = railY('rail-')
  const midY = (yPos + yNeg) / 2
  return (
    <g opacity={0.8}>
      <line x1={x - 22} x2={x - 8} y1={yPos} y2={yPos} stroke="#ef4444" strokeWidth={2} />
      <line x1={x - 22} x2={x - 8} y1={yNeg} y2={yNeg} stroke="#3b82f6" strokeWidth={2} />
      <line
        x1={x - 22}
        x2={x - 22}
        y1={yPos}
        y2={yNeg}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={1.5}
      />
      <text x={x - 34} y={midY + 4} fontSize={9} fill="rgba(255,255,255,0.5)" textAnchor="end">
        9V
      </text>
    </g>
  )
}

function PlacedComponentView({
  component,
  current,
  onClick,
}: {
  component: PlacedComponent
  current: number
  onClick: () => void
}) {
  const a = holePos(component.holeA)
  const b = holePos(component.holeB)
  const midX = (a.x + b.x) / 2
  const midY = (a.y + b.y) / 2

  if (component.type === 'wire') {
    return (
      <g style={{ cursor: 'pointer' }} onClick={onClick}>
        <line
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke="#fbbf24"
          strokeWidth={2.5}
          opacity={0.8}
        />
      </g>
    )
  }

  if (component.type === 'resistor') {
    return (
      <g style={{ cursor: 'pointer' }} onClick={onClick}>
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#d6d3d1" strokeWidth={2} opacity={0.6} />
        <rect
          x={midX - 12}
          y={midY - 6}
          width={24}
          height={12}
          rx={3}
          fill="#d6c9a3"
          stroke="#92765a"
          strokeWidth={1.2}
          transform={`rotate(${angleOf(a, b)} ${midX} ${midY})`}
        />
        <text
          x={midX}
          y={midY - 12}
          textAnchor="middle"
          fontSize={8.5}
          fill="rgba(255,255,255,0.7)"
        >
          {component.resistanceOhm}Ω
        </text>
      </g>
    )
  }

  if (component.type === 'switch') {
    const closed = component.closed ?? false
    return (
      <g style={{ cursor: 'pointer' }} onClick={onClick}>
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#475569" strokeWidth={2} opacity={0.5} />
        <circle cx={a.x} cy={a.y} r={3} fill={closed ? '#34d399' : '#94a3b8'} />
        <circle cx={b.x} cy={b.y} r={3} fill={closed ? '#34d399' : '#94a3b8'} />
        {closed ? (
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#34d399" strokeWidth={2.5} />
        ) : (
          <line x1={a.x} y1={a.y} x2={midX} y2={midY - 8} stroke="#facc15" strokeWidth={2.5} />
        )}
        <text x={midX} y={midY - 14} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.6)">
          {closed ? 'fermé' : 'ouvert'}
        </text>
      </g>
    )
  }

  // LED
  const color = component.ledColor ? LED_HEX[component.ledColor] : '#fff'
  const intensity = component.burnedOut ? 0 : Math.min(1, current / LED_MAX_SAFE_A)
  return (
    <g style={{ cursor: 'pointer' }} onClick={onClick}>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#94a3b8" strokeWidth={2} opacity={0.4} />
      {!component.burnedOut && intensity > 0 && (
        <circle cx={midX} cy={midY} r={13} fill={color} opacity={0.25 + intensity * 0.35} />
      )}
      <circle
        cx={midX}
        cy={midY}
        r={8}
        fill={component.burnedOut ? '#3f3f46' : color}
        opacity={component.burnedOut ? 1 : 0.4 + intensity * 0.6}
        stroke={component.burnedOut ? '#18181b' : color}
        strokeWidth={1.4}
      />
      {component.burnedOut && (
        <text x={midX} y={midY + 3} textAnchor="middle" fontSize={9} fill="#18181b">
          ✕
        </text>
      )}
      {/* Marqueur d'anode (+) côté holeA */}
      <text x={a.x} y={a.y - 8} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.4)">
        +
      </text>
    </g>
  )
}

function angleOf(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
}
