import { useMemo, useState } from 'react'
import { useCircuitStore } from '@/store/useCircuitStore'
import { playClick } from '@/lib/audio'
import type { GateType, PortDef, Wire } from '@/lib/circuit/types'
import { LEVELS } from '@/lib/circuit/levels'
import { isCircuitCorrect } from '@/lib/circuit/eval'

// ─── Géométrie SVG ──────────────────────────────────────────────────────────────

const COL_W = 110
const ROW_H = 50
const PORT_W = 70
const PORT_H = 32

function portCenter(port: PortDef): { x: number; y: number } {
  return { x: port.col * COL_W + PORT_W / 2 + 20, y: port.row * ROW_H + PORT_H / 2 + 20 }
}

const GATE_COLORS: Record<GateType, string> = {
  AND: '#60a5fa',
  OR: '#34d399',
  NOT: '#f59e0b',
  XOR: '#c084fc',
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function CircuitLabApp() {
  const solvedLevels = useCircuitStore((s) => s.solvedLevels)
  const markSolved = useCircuitStore((s) => s.markSolved)

  const [levelIndex, setLevelIndex] = useState(0)
  const [wires, setWires] = useState<Wire[]>([])
  const [pending, setPending] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'idle' | 'success'>('idle')

  const level = LEVELS[levelIndex]

  const svgSize = useMemo(() => {
    const maxCol = Math.max(...level.ports.map((p) => p.col))
    const maxRow = Math.max(...level.ports.map((p) => p.row))
    return { w: (maxCol + 1) * COL_W + 40, h: (maxRow + 1) * ROW_H + 40 }
  }, [level])

  function resetLevel() {
    setWires([])
    setPending(null)
    setFeedback('idle')
  }

  function selectLevel(i: number) {
    playClick()
    setLevelIndex(i)
    setWires([])
    setPending(null)
    setFeedback('idle')
  }

  function handlePortClick(portId: string) {
    const port = level.ports.find((p) => p.id === portId)
    if (!port) return
    // On ne peut pas démarrer un fil depuis une sortie de circuit, ni le terminer sur une entrée
    if (pending === null) {
      if (port.kind === 'output') return
      setPending(portId)
      return
    }
    if (pending === portId) {
      setPending(null)
      return
    }
    const fromPort = level.ports.find((p) => p.id === pending)
    if (!fromPort) return
    if (port.kind === 'input') {
      setPending(portId)
      return
    }
    // Évite les doublons exacts
    const exists = wires.some((w) => w.from === pending && w.to === portId)
    const next = exists ? wires : [...wires, { from: pending, to: portId }]
    setWires(next)
    setPending(null)
    playClick()

    // Vérification automatique
    if (isCircuitCorrect(level, next)) {
      setFeedback('success')
      markSolved(levelIndex)
    } else {
      setFeedback('idle')
    }
  }

  function removeWire(index: number) {
    playClick()
    const next = wires.filter((_, i) => i !== index)
    setWires(next)
    setFeedback(isCircuitCorrect(level, next) ? 'success' : 'idle')
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        fontFamily: 'system-ui, sans-serif',
        color: 'rgba(255,255,255,0.92)',
        background: 'linear-gradient(180deg, #14141a 0%, #1c1c24 100%)',
      }}
    >
      {/* ── Sélecteur de niveaux ── */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          padding: '10px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexWrap: 'wrap',
        }}
      >
        {LEVELS.map((lvl, i) => {
          const unlocked = i <= solvedLevels
          const solved = i < solvedLevels
          return (
            <button
              key={lvl.id}
              onClick={() => unlocked && selectLevel(i)}
              disabled={!unlocked}
              style={{
                padding: '5px 10px',
                borderRadius: 6,
                border:
                  i === levelIndex
                    ? '1px solid rgba(120,170,255,0.6)'
                    : '1px solid rgba(255,255,255,0.1)',
                background: solved
                  ? 'rgba(52,211,153,0.18)'
                  : i === levelIndex
                    ? 'rgba(120,170,255,0.16)'
                    : 'rgba(255,255,255,0.04)',
                color: unlocked ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                fontSize: 11,
                fontWeight: 500,
                cursor: unlocked ? 'pointer' : 'not-allowed',
              }}
            >
              {solved ? '✓ ' : ''}
              {i + 1}
            </button>
          )
        })}
      </div>

      {/* ── En-tête niveau ── */}
      <div style={{ padding: '10px 14px 4px' }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{level.title}</div>
        <div style={{ fontSize: 11, opacity: 0.65, marginTop: 4, lineHeight: 1.5 }}>
          {level.description}
        </div>
        <div style={{ fontSize: 10, opacity: 0.45, marginTop: 4 }}>
          Clique un port de départ puis un port d'arrivée pour poser un fil. Reclique sur un fil
          existant pour le retirer.
        </div>
      </div>

      {/* ── Plateau de circuit ── */}
      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        <svg
          width={svgSize.w}
          height={svgSize.h}
          style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}
        >
          {/* Fils posés */}
          {wires.map((w, i) => {
            const from = level.ports.find((p) => p.id === w.from)
            const to = level.ports.find((p) => p.id === w.to)
            if (!from || !to) return null
            const a = portCenter(from)
            const b = portCenter(to)
            return (
              <g key={i} style={{ cursor: 'pointer' }} onClick={() => removeWire(i)}>
                <path
                  d={`M ${a.x + PORT_W / 2} ${a.y} C ${a.x + PORT_W / 2 + 30} ${a.y}, ${b.x - PORT_W / 2 - 30} ${b.y}, ${b.x - PORT_W / 2} ${b.y}`}
                  stroke={feedback === 'success' ? '#34d399' : '#facc15'}
                  strokeWidth={3}
                  fill="none"
                  opacity={0.85}
                />
              </g>
            )
          })}

          {/* Aperçu du fil en cours */}
          {pending && (
            <text
              x={portCenter(level.ports.find((p) => p.id === pending)!).x}
              y={portCenter(level.ports.find((p) => p.id === pending)!).y - PORT_H / 2 - 6}
              fill="#facc15"
              fontSize={9}
              textAnchor="middle"
            >
              choisir l'arrivée…
            </text>
          )}

          {/* Ports */}
          {level.ports.map((port) => {
            const c = portCenter(port)
            const x = c.x - PORT_W / 2
            const y = c.y - PORT_H / 2
            const isPending = pending === port.id
            let fill = 'rgba(255,255,255,0.06)'
            let stroke = 'rgba(255,255,255,0.18)'
            if (port.kind === 'input') {
              fill = 'rgba(96,165,250,0.14)'
              stroke = '#60a5fa'
            } else if (port.kind === 'output') {
              fill = feedback === 'success' ? 'rgba(52,211,153,0.28)' : 'rgba(248,113,113,0.14)'
              stroke = feedback === 'success' ? '#34d399' : '#f87171'
            } else if (port.gate) {
              fill = `${GATE_COLORS[port.gate]}22`
              stroke = GATE_COLORS[port.gate]
            }
            if (isPending) stroke = '#facc15'

            return (
              <g
                key={port.id}
                onClick={() => handlePortClick(port.id)}
                style={{
                  cursor: port.kind === 'output' && pending === null ? 'default' : 'pointer',
                }}
              >
                <rect
                  x={x}
                  y={y}
                  width={PORT_W}
                  height={PORT_H}
                  rx={6}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isPending ? 2.5 : 1.5}
                />
                <text
                  x={c.x}
                  y={c.y + 4}
                  fill="rgba(255,255,255,0.92)"
                  fontSize={11}
                  fontWeight={600}
                  textAnchor="middle"
                >
                  {port.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* ── Pied de page : statut + reset ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          fontSize: 11,
        }}
      >
        <span
          style={{
            color: feedback === 'success' ? '#34d399' : 'rgba(255,255,255,0.5)',
            fontWeight: 600,
          }}
        >
          {feedback === 'success'
            ? "Circuit correct ! La LED de l'établi s'allume."
            : 'Circuit incomplet…'}
        </span>
        <button
          onClick={() => {
            playClick()
            resetLevel()
          }}
          style={{
            padding: '5px 12px',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.18)',
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.85)',
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          Réinitialiser
        </button>
      </div>
    </div>
  )
}
