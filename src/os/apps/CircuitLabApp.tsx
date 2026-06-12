import { useMemo, useState } from 'react'
import { useCircuitStore } from '@/store/useCircuitStore'
import { playClick } from '@/lib/audio'

// ─── Modèle de circuit ─────────────────────────────────────────────────────────
//
// Un niveau définit un ensemble de "ports" (entrées, portes logiques, sortie). Le joueur
// relie les ports entre eux par des fils (clic-clic : sélectionner un port de départ puis
// un port d'arrivée). Le circuit est résolu quand la sortie vaut 1 pour TOUTES les
// combinaisons d'entrées listées dans `truthTable` une fois les bonnes connexions faites
// — en pratique on vérifie juste que le graphe de connexions calcule la bonne table de
// vérité pour la fonction logique cible.

type GateType = 'AND' | 'OR' | 'NOT' | 'XOR'

interface PortDef {
  id: string
  label: string
  kind: 'input' | 'gate' | 'output'
  gate?: GateType
  /** Position dans la grille SVG (colonnes/lignes arbitraires, en unités de 60px). */
  col: number
  row: number
}

interface Wire {
  from: string
  to: string
}

interface Level {
  id: number
  title: string
  description: string
  ports: PortDef[]
}

const LEVELS: Level[] = [
  {
    id: 0,
    title: 'Niveau 1 — La porte AND',
    description: 'Relie les deux entrées à la porte AND, puis la porte AND à la LED.',
    ports: [
      { id: 'in0', label: 'A', kind: 'input', col: 0, row: 0 },
      { id: 'in1', label: 'B', kind: 'input', col: 0, row: 2 },
      { id: 'g0', label: 'AND', kind: 'gate', gate: 'AND', col: 1, row: 1 },
      { id: 'out', label: 'LED', kind: 'output', col: 2, row: 1 },
    ],
  },
  {
    id: 1,
    title: 'Niveau 2 — La porte OR',
    description: 'Relie les deux entrées à la porte OR, puis OR à la LED.',
    ports: [
      { id: 'in0', label: 'A', kind: 'input', col: 0, row: 0 },
      { id: 'in1', label: 'B', kind: 'input', col: 0, row: 2 },
      { id: 'g0', label: 'OR', kind: 'gate', gate: 'OR', col: 1, row: 1 },
      { id: 'out', label: 'LED', kind: 'output', col: 2, row: 1 },
    ],
  },
  {
    id: 2,
    title: 'Niveau 3 — Inverser',
    description: 'Une seule entrée : passe-la dans une porte NOT avant la LED.',
    ports: [
      { id: 'in0', label: 'A', kind: 'input', col: 0, row: 1 },
      { id: 'g0', label: 'NOT', kind: 'gate', gate: 'NOT', col: 1, row: 1 },
      { id: 'out', label: 'LED', kind: 'output', col: 2, row: 1 },
    ],
  },
  {
    id: 3,
    title: 'Niveau 4 — La porte XOR',
    description: 'Relie A et B à une porte XOR, puis XOR à la LED.',
    ports: [
      { id: 'in0', label: 'A', kind: 'input', col: 0, row: 0 },
      { id: 'in1', label: 'B', kind: 'input', col: 0, row: 2 },
      { id: 'g0', label: 'XOR', kind: 'gate', gate: 'XOR', col: 1, row: 1 },
      { id: 'out', label: 'LED', kind: 'output', col: 2, row: 1 },
    ],
  },
  {
    id: 4,
    title: 'Niveau 5 — Combinaison',
    description: 'A ET B passent par AND, puis le résultat est inversé (NOT) avant la LED — un NAND !',
    ports: [
      { id: 'in0', label: 'A', kind: 'input', col: 0, row: 0 },
      { id: 'in1', label: 'B', kind: 'input', col: 0, row: 2 },
      { id: 'g0', label: 'AND', kind: 'gate', gate: 'AND', col: 1, row: 1 },
      { id: 'g1', label: 'NOT', kind: 'gate', gate: 'NOT', col: 2, row: 1 },
      { id: 'out', label: 'LED', kind: 'output', col: 3, row: 1 },
    ],
  },
  {
    id: 5,
    title: 'Niveau 6 — Le circuit final',
    description:
      'A et B passent par OR, A et C passent par AND. Les deux résultats passent par une dernière porte XOR avant la LED.',
    ports: [
      { id: 'in0', label: 'A', kind: 'input', col: 0, row: 0 },
      { id: 'in1', label: 'B', kind: 'input', col: 0, row: 2 },
      { id: 'in2', label: 'C', kind: 'input', col: 0, row: 4 },
      { id: 'g0', label: 'OR', kind: 'gate', gate: 'OR', col: 1, row: 1 },
      { id: 'g1', label: 'AND', kind: 'gate', gate: 'AND', col: 1, row: 3 },
      { id: 'g2', label: 'XOR', kind: 'gate', gate: 'XOR', col: 2, row: 2 },
      { id: 'out', label: 'LED', kind: 'output', col: 3, row: 2 },
    ],
  },
]

// Combien d'entrées attend chaque type de porte
const GATE_INPUTS: Record<GateType, number> = { AND: 2, OR: 2, NOT: 1, XOR: 2 }

function evalGate(gate: GateType, inputs: number[]): number {
  switch (gate) {
    case 'AND':
      return inputs.every((v) => v === 1) ? 1 : 0
    case 'OR':
      return inputs.some((v) => v === 1) ? 1 : 0
    case 'NOT':
      return inputs[0] === 1 ? 0 : 1
    case 'XOR':
      return inputs.reduce((a, b) => a ^ b, 0)
  }
}

/**
 * Évalue le circuit pour un jeu de valeurs d'entrée donné, en suivant les fils posés.
 * Renvoie `null` si le circuit est mal formé (port non alimenté, cycle, etc.) — dans ce cas
 * la fonction logique n'est pas définie et le niveau ne peut pas être validé.
 */
function evaluateCircuit(
  ports: PortDef[],
  wires: Wire[],
  inputValues: Record<string, number>
): number | null {
  const values: Record<string, number | undefined> = { ...inputValues }

  // Résolution itérative simple (le graphe est petit et acyclique) : on boucle jusqu'à ce que
  // toutes les valeurs soient connues ou qu'on ne progresse plus.
  let progressed = true
  let guard = 0
  while (progressed && guard < 20) {
    progressed = false
    guard++
    for (const port of ports) {
      if (port.kind === 'input') continue
      if (values[port.id] !== undefined) continue
      if (port.kind === 'gate' && port.gate) {
        const incoming = wires.filter((w) => w.to === port.id)
        const needed = GATE_INPUTS[port.gate]
        if (incoming.length !== needed) continue
        const inputVals = incoming.map((w) => values[w.from])
        if (inputVals.some((v) => v === undefined)) continue
        values[port.id] = evalGate(port.gate, inputVals as number[])
        progressed = true
      } else if (port.kind === 'output') {
        const incoming = wires.filter((w) => w.to === port.id)
        if (incoming.length !== 1) continue
        const v = values[incoming[0].from]
        if (v === undefined) continue
        values[port.id] = v
        progressed = true
      }
    }
  }

  const out = ports.find((p) => p.kind === 'output')
  if (!out) return null
  return values[out.id] ?? null
}

/** Génère toutes les combinaisons possibles 0/1 pour les entrées d'un niveau. */
function allInputCombos(inputIds: string[]): Record<string, number>[] {
  const n = inputIds.length
  const combos: Record<string, number>[] = []
  for (let mask = 0; mask < 1 << n; mask++) {
    const combo: Record<string, number> = {}
    inputIds.forEach((id, i) => {
      combo[id] = (mask >> i) & 1
    })
    combos.push(combo)
  }
  return combos
}

/**
 * Vérifie si le circuit posé par le joueur est correct : il doit calculer EXACTEMENT la
 * fonction logique attendue (déduite du circuit "modèle" décrit par `ports`/portes du
 * niveau) pour toutes les combinaisons d'entrées. On compare donc le circuit du joueur
 * (mêmes ports, fils du joueur) vs le circuit de référence (mêmes ports, en supposant un
 * câblage "naturel" : chaque porte/sortie reçoit ses entrées dans l'ordre de définition).
 */
function isCircuitCorrect(level: Level, wires: Wire[]): boolean {
  const inputIds = level.ports.filter((p) => p.kind === 'input').map((p) => p.id)
  const combos = allInputCombos(inputIds)

  // Circuit de référence : connexions "logiques" déduites de l'ordre des ports — chaque
  // porte/sortie consomme dans l'ordre les sorties des ports précédents qui ne sont pas
  // déjà utilisés comme source ailleurs (topologie linéaire simple, cohérente avec la
  // disposition des niveaux ci-dessus).
  const referenceWires = referenceWiring(level)

  for (const combo of combos) {
    const player = evaluateCircuit(level.ports, wires, combo)
    const reference = evaluateCircuit(level.ports, referenceWires, combo)
    if (player === null || player !== reference) return false
  }
  return true
}

/** Construit le câblage "idéal" attendu pour un niveau (utilisé pour la validation). */
function referenceWiring(level: Level): Wire[] {
  switch (level.id) {
    case 0: // AND : in0,in1 -> g0 -> out
      return [
        { from: 'in0', to: 'g0' },
        { from: 'in1', to: 'g0' },
        { from: 'g0', to: 'out' },
      ]
    case 1: // OR
      return [
        { from: 'in0', to: 'g0' },
        { from: 'in1', to: 'g0' },
        { from: 'g0', to: 'out' },
      ]
    case 2: // NOT
      return [
        { from: 'in0', to: 'g0' },
        { from: 'g0', to: 'out' },
      ]
    case 3: // XOR
      return [
        { from: 'in0', to: 'g0' },
        { from: 'in1', to: 'g0' },
        { from: 'g0', to: 'out' },
      ]
    case 4: // NAND : (A AND B) -> NOT -> out
      return [
        { from: 'in0', to: 'g0' },
        { from: 'in1', to: 'g0' },
        { from: 'g0', to: 'g1' },
        { from: 'g1', to: 'out' },
      ]
    case 5: // (A OR B) XOR (A AND C) -> out
      return [
        { from: 'in0', to: 'g0' },
        { from: 'in1', to: 'g0' },
        { from: 'in0', to: 'g1' },
        { from: 'in2', to: 'g1' },
        { from: 'g0', to: 'g2' },
        { from: 'g1', to: 'g2' },
        { from: 'g2', to: 'out' },
      ]
    default:
      return []
  }
}

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
              fill =
                feedback === 'success' ? 'rgba(52,211,153,0.28)' : 'rgba(248,113,113,0.14)'
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
                style={{ cursor: port.kind === 'output' && pending === null ? 'default' : 'pointer' }}
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
