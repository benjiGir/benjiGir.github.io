import { useRef, useState, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { playPluck, playClick } from '@/lib/audio'
import { STRING_FREQS, STRING_COUNT } from './constants'
import { readHighScore, writeHighScore } from './highScore'

// ─── Mini-jeu Simon musical ──────────────────────────────────────────────────

type GameState = 'idle' | 'showing' | 'listening' | 'gameover'

const STRING_NAMES = ['Mi grave', 'La', 'Ré', 'Sol', 'Si', 'Mi aigu']

interface SimonPanelProps {
  stringTriggerRef: MutableRefObject<number[]>
}

export function SimonPanel({ stringTriggerRef }: SimonPanelProps) {
  const [state, setState] = useState<GameState>('idle')
  const [sequence, setSequence] = useState<number[]>([])
  const [highScore, setHighScore] = useState(() => readHighScore())
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const stepRef = useRef(0) // index attendu dans la séquence pendant 'listening'
  const showTimeouts = useRef<number[]>([])

  function clearTimeouts() {
    showTimeouts.current.forEach((id) => clearTimeout(id))
    showTimeouts.current = []
  }

  function playSequence(seq: number[]) {
    setState('showing')
    seq.forEach((idx, i) => {
      const id = window.setTimeout(() => {
        setActiveIndex(idx)
        stringTriggerRef.current[idx] = 1
        playPluck(STRING_FREQS[idx])
        const offId = window.setTimeout(() => setActiveIndex(null), 320)
        showTimeouts.current.push(offId)
      }, i * 650)
      showTimeouts.current.push(id)
    })
    const endId = window.setTimeout(
      () => {
        stepRef.current = 0
        setState('listening')
      },
      seq.length * 650 + 200
    )
    showTimeouts.current.push(endId)
  }

  function startGame() {
    clearTimeouts()
    const first = [Math.floor(Math.random() * STRING_COUNT)]
    setSequence(first)
    playSequence(first)
  }

  function nextRound(seq: number[]) {
    const next = [...seq, Math.floor(Math.random() * STRING_COUNT)]
    setSequence(next)
    playSequence(next)
  }

  function handleStringPress(idx: number) {
    if (state !== 'listening') return
    if (idx === sequence[stepRef.current]) {
      stepRef.current += 1
      if (stepRef.current === sequence.length) {
        const score = sequence.length
        if (score > highScore) {
          setHighScore(score)
          writeHighScore(score)
        }
        const id = window.setTimeout(() => nextRound(sequence), 500)
        showTimeouts.current.push(id)
        setState('showing')
      }
    } else {
      const score = sequence.length - 1
      if (score > highScore) {
        setHighScore(score)
        writeHighScore(score)
      }
      setState('gameover')
    }
  }

  // Lit les clics utilisateur sur les cordes : `GuitarString.handleClick` écrit 2 dans
  // `stringTriggerRef[i]` (en plus de jouer le son/la vibration), consommé ici à la frame
  // suivante pour valider l'étape courante du Simon.
  useFrame(() => {
    const arr = stringTriggerRef.current
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === 2) {
        arr[i] = 0
        handleStringPress(i)
      }
    }
  })

  return (
    <Html position={[0.55, 0.6, 0]} transform distanceFactor={1.1} occlude={false}>
      <div
        style={{
          width: 190,
          padding: '12px 14px',
          borderRadius: 10,
          background: 'rgba(20,20,24,0.72)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.92)',
          fontSize: 12,
          fontFamily: 'system-ui, sans-serif',
          userSelect: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6, letterSpacing: 0.3 }}>Simon musical</div>
        <div style={{ opacity: 0.75, marginBottom: 8, fontSize: 11, lineHeight: 1.4 }}>
          {state === 'idle' && 'Mémorise puis rejoue la séquence en cliquant les cordes.'}
          {state === 'showing' && 'Écoute…'}
          {state === 'listening' &&
            `À toi : ${stepRef.current}/${sequence.length} (${STRING_NAMES[sequence[stepRef.current]] ?? ''})`}
          {state === 'gameover' && 'Raté ! Réessaie.'}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ opacity: 0.6, fontSize: 11 }}>
            Niveau : {state === 'idle' || state === 'gameover' ? 0 : sequence.length}
          </span>
          <span style={{ opacity: 0.6, fontSize: 11 }}>Record : {highScore}</span>
        </div>
        <button
          onClick={() => {
            playClick()
            startGame()
          }}
          style={{
            width: '100%',
            padding: '6px 0',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.18)',
            background:
              state === 'listening' || state === 'showing'
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(120,170,255,0.22)',
            color: 'rgba(255,255,255,0.92)',
            fontSize: 11,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {state === 'idle' && 'Démarrer'}
          {state === 'gameover' && 'Rejouer'}
          {(state === 'showing' || state === 'listening') && 'Recommencer'}
        </button>
        {/* Indicateur visuel de progression (6 pastilles = 6 cordes) */}
        <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
          {STRING_FREQS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 5,
                borderRadius: 3,
                background: activeIndex === i ? 'rgba(255,216,107,0.9)' : 'rgba(255,255,255,0.12)',
                transition: 'background 120ms',
              }}
            />
          ))}
        </div>
      </div>
    </Html>
  )
}
