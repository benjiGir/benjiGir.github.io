import { useEffect, useRef } from 'react'
import { useRobotStore, LEVELS, type Instruction, type RunState } from '@/store/useRobotStore'
import { useToastStore } from '@/store/useToastStore'
import { playClick } from '@/lib/audio'
import RobotPreview from '@/os/apps/RobotPreview'

// ── Palette de blocs ────────────────────────────────────────────────────────────

const BLOCKS: { instr: Instruction; label: string; icon: string; color: string }[] = [
  { instr: 'forward', label: 'Avancer', icon: '↑', color: '#3b82f6' },
  { instr: 'left', label: 'Tourner à gauche', icon: '↺', color: '#f59e0b' },
  { instr: 'right', label: 'Tourner à droite', icon: '↻', color: '#f59e0b' },
  { instr: 'beep', label: 'Bip', icon: '♪', color: '#10b981' },
  { instr: 'dance', label: 'Danser', icon: '★', color: '#a855f7' },
]

const BLOCK_BY_INSTR = Object.fromEntries(BLOCKS.map((b) => [b.instr, b]))

// ── UI helpers ───────────────────────────────────────────────────────────────────

function Button({
  children,
  onClick,
  disabled,
  variant = 'default',
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'primary' | 'danger'
}) {
  const colors: Record<string, string> = {
    default: 'rgba(255,255,255,0.08)',
    primary: '#3b82f6',
    danger: 'rgba(239,68,68,0.18)',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '7px 14px',
        borderRadius: 6,
        border: '1px solid rgba(255,255,255,0.1)',
        background: colors[variant],
        color: disabled ? 'rgba(255,255,255,0.25)' : '#fff',
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.15s, background 0.15s',
      }}
    >
      {children}
    </button>
  )
}

// ── App ──────────────────────────────────────────────────────────────────────────

export default function RobotLabApp() {
  const levelIndex = useRobotStore((s) => s.levelIndex)
  const queue = useRobotStore((s) => s.queue)
  const runState = useRobotStore((s) => s.runState)
  const currentStep = useRobotStore((s) => s.currentStep)

  const setLevel = useRobotStore((s) => s.setLevel)
  const addInstruction = useRobotStore((s) => s.addInstruction)
  const removeInstruction = useRobotStore((s) => s.removeInstruction)
  const reorderInstruction = useRobotStore((s) => s.reorderInstruction)
  const clearQueue = useRobotStore((s) => s.clearQueue)
  const start = useRobotStore((s) => s.start)
  const resetToLevelStart = useRobotStore((s) => s.resetToLevelStart)

  const push = useToastStore((s) => s.push)
  const lastResultRef = useRef<string | null>(null)

  const level = LEVELS[levelIndex]
  const isRunning = runState === 'running'

  // Feedback succès/échec — toast déclenché une seule fois par exécution terminée
  useEffect(() => {
    if (runState === 'success' && lastResultRef.current !== 'success') {
      lastResultRef.current = 'success'
      push({
        icon: '🤖',
        title: 'Niveau réussi !',
        body: `${level.name} — objectif atteint en ${queue.length} instruction(s).`,
      })
    } else if (runState === 'fail' && lastResultRef.current !== 'fail') {
      lastResultRef.current = 'fail'
      push({
        icon: '⚠️',
        title: 'Échec',
        body: 'Le robot est sorti du tapis ou n\'a pas atteint la cible. Réessaie !',
      })
    } else if (runState === 'idle' || runState === 'running') {
      lastResultRef.current = null
    }
  }, [runState, level, queue.length, push])

  function handleSelectLevel(index: number) {
    if (isRunning) return
    playClick()
    setLevel(index)
  }

  function handleAddBlock(instr: Instruction) {
    if (isRunning) return
    playClick()
    addInstruction(instr)
  }

  function handleRemove(index: number) {
    if (isRunning) return
    playClick()
    removeInstruction(index)
  }

  function handleMove(index: number, dir: -1 | 1) {
    if (isRunning) return
    const target = index + dir
    if (target < 0 || target >= queue.length) return
    reorderInstruction(index, target)
  }

  function handleRun() {
    if (isRunning || queue.length === 0) return
    playClick()
    start()
  }

  function handleReset() {
    playClick()
    clearQueue()
    resetToLevelStart()
  }

  return (
    <div
      style={{
        height: '100%',
        background: '#0d1525',
        color: 'rgba(255,255,255,0.85)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
      }}
    >
      {/* ── Sélecteur de niveau ── */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          overflowX: 'auto',
        }}
      >
        {LEVELS.map((lvl, i) => (
          <button
            key={lvl.id}
            onClick={() => handleSelectLevel(i)}
            disabled={isRunning}
            style={{
              flexShrink: 0,
              padding: '6px 12px',
              borderRadius: 6,
              border:
                i === levelIndex
                  ? '1px solid #3b82f6'
                  : '1px solid rgba(255,255,255,0.08)',
              background: i === levelIndex ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.04)',
              color: i === levelIndex ? '#fff' : 'rgba(255,255,255,0.5)',
              fontSize: 11,
              fontWeight: 600,
              cursor: isRunning ? 'default' : 'pointer',
              opacity: isRunning ? 0.6 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {lvl.id}
          </button>
        ))}
      </div>

      {/* ── Description du niveau ── */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
          {level.name}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
          {level.description} — max {level.maxInstructions} instructions.
        </div>
      </div>

      {/* ── Aperçu 3D : retour visuel du robot sur la grille, sans quitter l'app ── */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <RobotPreview />
      </div>

      {/* ── Corps : palette + séquence ── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Palette de blocs */}
        <div
          style={{
            width: 150,
            flexShrink: 0,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            borderRight: '1px solid rgba(255,255,255,0.06)',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: 2,
              color: 'rgba(255,255,255,0.28)',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            Blocs
          </div>
          {BLOCKS.map((block) => (
            <button
              key={block.instr}
              onClick={() => handleAddBlock(block.instr)}
              disabled={isRunning || queue.length >= 16}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                borderRadius: 6,
                border: `1px solid ${block.color}55`,
                background: `${block.color}1a`,
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: isRunning ? 'default' : 'pointer',
                opacity: isRunning ? 0.5 : 1,
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 15, color: block.color, width: 18, textAlign: 'center' }}>
                {block.icon}
              </span>
              {block.label}
            </button>
          ))}
        </div>

        {/* Séquence */}
        <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 2,
              color: 'rgba(255,255,255,0.28)',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Séquence ({queue.length}/{level.maxInstructions})
          </div>
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              overflowY: 'auto',
              paddingRight: 4,
            }}
          >
            {queue.length === 0 && (
              <div
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.3)',
                  fontStyle: 'italic',
                  padding: '8px 0',
                }}
              >
                Clique sur un bloc pour l'ajouter à la séquence.
              </div>
            )}
            {queue.map((instr, i) => {
              const block = BLOCK_BY_INSTR[instr]
              const isCurrent = isRunning && currentStep === i
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: isCurrent ? '1px solid #3b82f6' : `1px solid ${block.color}40`,
                    background: isCurrent ? 'rgba(59,130,246,0.22)' : `${block.color}14`,
                  }}
                >
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', width: 18 }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 14, color: block.color, width: 18, textAlign: 'center' }}>
                    {block.icon}
                  </span>
                  <span style={{ fontSize: 12, flex: 1 }}>{block.label}</span>
                  <button
                    onClick={() => handleMove(i, -1)}
                    disabled={isRunning || i === 0}
                    style={iconBtnStyle(isRunning || i === 0)}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMove(i, 1)}
                    disabled={isRunning || i === queue.length - 1}
                    style={iconBtnStyle(isRunning || i === queue.length - 1)}
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => handleRemove(i)}
                    disabled={isRunning}
                    style={iconBtnStyle(isRunning)}
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Statut + actions ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <StatusBadge runState={runState} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={handleReset} variant="danger" disabled={isRunning}>
            Reset
          </Button>
          <Button onClick={handleRun} variant="primary" disabled={isRunning || queue.length === 0}>
            {isRunning ? 'Exécution…' : 'Exécuter'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function iconBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: 22,
    height: 22,
    borderRadius: 4,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.06)',
    color: disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
    fontSize: 11,
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    flexShrink: 0,
  }
}

function StatusBadge({ runState }: { runState: RunState }) {
  const config = {
    idle: { label: 'Prêt', color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.06)' },
    running: { label: 'En cours…', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
    success: { label: 'Réussi !', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    fail: { label: 'Échec', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  }[runState]

  return (
    <div
      style={{
        padding: '4px 10px',
        borderRadius: 999,
        background: config.bg,
        color: config.color,
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {config.label}
    </div>
  )
}
