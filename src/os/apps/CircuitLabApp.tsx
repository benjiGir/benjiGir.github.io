import { useMemo, useState } from 'react'
import { useCircuitStore } from '@/store/useCircuitStore'
import { playBurnout, playClick } from '@/lib/audio'
import { LEVELS, simulateAndBurnout } from '@/lib/circuit/levels'
import type { ComponentType, Hole, PlacedComponent } from '@/lib/circuit/types'
import CircuitBreadboard from '@/os/apps/CircuitBreadboard'
import CircuitToolbox, { type ToolSelection } from '@/os/apps/CircuitToolbox'

let nextComponentId = 0
function makeComponentId(type: ComponentType) {
  nextComponentId += 1
  return `${type}-${nextComponentId}`
}

function sameHole(a: Hole, b: Hole): boolean {
  return a.column === b.column && a.row === b.row
}

export default function CircuitLabApp() {
  const solvedLevels = useCircuitStore((s) => s.solvedLevels)
  const markSolved = useCircuitStore((s) => s.markSolved)

  const [levelIndex, setLevelIndex] = useState(0)
  const [components, setComponents] = useState<PlacedComponent[]>([])
  const [pendingHole, setPendingHole] = useState<Hole | null>(null)
  const [selection, setSelection] = useState<ToolSelection>({ type: 'wire' })
  const [solved, setSolved] = useState(false)

  const level = LEVELS[levelIndex]

  const { currentByComponentId, shortCircuit } = useMemo(() => {
    const { result } = simulateAndBurnout(components)
    return result
  }, [components])

  function resetLevel() {
    setComponents([])
    setPendingHole(null)
    setSolved(false)
  }

  function selectLevel(i: number) {
    playClick()
    setLevelIndex(i)
    setComponents([])
    setPendingHole(null)
    setSolved(false)
  }

  function commitComponents(next: PlacedComponent[]) {
    const { components: withBurnout } = simulateAndBurnout(next)
    const justBurned = withBurnout.some(
      (c, i) => c.type === 'led' && c.burnedOut && !(next[i]?.burnedOut ?? false)
    )
    if (justBurned) playBurnout()
    setComponents(withBurnout)
    if (!level.sandbox) {
      const isSolved = level.isSolved(withBurnout)
      setSolved(isSolved)
      if (isSolved) markSolved(levelIndex)
    }
  }

  function handleHoleClick(hole: Hole) {
    if (pendingHole === null) {
      setPendingHole(hole)
      return
    }
    if (sameHole(pendingHole, hole)) {
      setPendingHole(null)
      return
    }
    // Empêche de poser un composant entre deux trous déjà identiques à un composant existant
    const newComponent: PlacedComponent = {
      id: makeComponentId(selection.type),
      type: selection.type,
      holeA: pendingHole,
      holeB: hole,
      ...(selection.type === 'resistor' ? { resistanceOhm: selection.resistanceOhm } : {}),
      ...(selection.type === 'led' ? { ledColor: selection.ledColor } : {}),
      ...(selection.type === 'switch' ? { closed: false } : {}),
    }
    playClick()
    commitComponents([...components, newComponent])
    setPendingHole(null)
  }

  function handleComponentClick(component: PlacedComponent) {
    if (component.type === 'switch') {
      playClick()
      const next = components.map((c) => (c.id === component.id ? { ...c, closed: !c.closed } : c))
      commitComponents(next)
      return
    }
    playClick()
    commitComponents(components.filter((c) => c.id !== component.id))
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
          const isSolvedLevel = i < solvedLevels && !lvl.sandbox
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
                background: isSolvedLevel
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
              {isSolvedLevel ? '✓ ' : ''}
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
      </div>

      {/* ── Corps : boîte à outils + plaque ── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <CircuitToolbox selection={selection} onSelect={setSelection} />
        <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
          <CircuitBreadboard
            components={components}
            pendingHole={pendingHole}
            currentByComponentId={currentByComponentId}
            shortCircuit={shortCircuit}
            onHoleClick={handleHoleClick}
            onComponentClick={handleComponentClick}
          />
        </div>
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
            color: shortCircuit ? '#f87171' : solved ? '#34d399' : 'rgba(255,255,255,0.5)',
            fontWeight: 600,
          }}
        >
          {level.sandbox
            ? 'Bac à sable — bricole librement.'
            : shortCircuit
              ? 'Court-circuit ! Ajoute une résistance ou une LED sur le chemin.'
              : solved
                ? 'Circuit correct ! La LED de l’établi s’allume.'
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
