import { useState, useRef, useEffect } from 'react'
import { projects } from '@/os/apps/data/projects'

type Line = { type: 'input' | 'output' | 'error'; text: string }

const BANNER = [
  'Bureau OS v1.0.0',
  'Tape "help" pour la liste des commandes.',
  '',
]

function runCommand(raw: string): string[] {
  const cmd = raw.trim().toLowerCase()
  if (!cmd) return []

  switch (cmd) {
    case 'help':
      return [
        'Commandes disponibles :',
        '  whoami     — qui suis-je ?',
        '  projects   — liste des projets',
        '  contact    — coordonnées',
        '  ls         — fichiers du bureau',
        '  clear      — effacer le terminal',
        '',
      ]
    case 'whoami':
      return [
        'TODO — Prénom Nom',
        'TODO — Titre / spécialité',
        '',
        'Remplace ce texte dans TerminalApp.tsx.',
        '',
      ]
    case 'projects':
      return [
        `${projects.length} projet(s) :`,
        ...projects.map((p) => `  · ${p.name} (${p.year}) — ${p.tagline}`),
        '',
      ]
    case 'contact':
      return ['benjiamin.girard7@gmail.com', '']
    case 'ls':
      return ['Projets/  À propos.txt  Contact.lnk  Terminal.app', '']
    case 'clear':
      return ['__clear__']
    default:
      return [`commande introuvable : ${raw}`, 'Tape "help" pour la liste des commandes.', '']
  }
}

export default function TerminalApp() {
  const [lines, setLines] = useState<Line[]>(() =>
    BANNER.map((t) => ({ type: 'output', text: t }))
  )
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Focus without triggering browser scroll
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  // Scroll within the terminal container only — no scrollIntoView propagation
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  function submit() {
    const cmd = input.trim()
    const output = runCommand(cmd)

    if (output[0] === '__clear__') {
      setLines(BANNER.map((t) => ({ type: 'output', text: t })))
    } else {
      setLines((prev) => [
        ...prev,
        { type: 'input', text: cmd },
        ...output.map((t) => ({ type: 'output' as const, text: t })),
      ])
    }

    if (cmd) setHistory((h) => [cmd, ...h])
    setInput('')
    setHistIdx(-1)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { submit(); return }
    if (e.key === 'ArrowUp') {
      const idx = Math.min(histIdx + 1, history.length - 1)
      setHistIdx(idx)
      setInput(history[idx] ?? '')
    }
    if (e.key === 'ArrowDown') {
      const idx = Math.max(histIdx - 1, -1)
      setHistIdx(idx)
      setInput(idx === -1 ? '' : history[idx])
    }
  }

  return (
    <div
      ref={scrollRef}
      onClick={() => inputRef.current?.focus({ preventScroll: true })}
      style={{
        height: '100%',
        background: '#0a0e1a',
        fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace",
        fontSize: 12,
        color: '#a8d8a8',
        padding: '14px 16px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        cursor: 'text',
        lineHeight: 1.6,
      }}
    >
      {lines.map((line, i) => (
        <div key={i} style={{ display: 'flex', gap: 8 }}>
          {line.type === 'input' && (
            <span style={{ color: '#6a9fb5', userSelect: 'none', flexShrink: 0 }}>{'> '}</span>
          )}
          <span
            style={{
              color: line.type === 'input'
                ? '#e0e0e0'
                : line.type === 'error'
                  ? '#f87171'
                  : '#a8d8a8',
              whiteSpace: 'pre',
            }}
          >
            {line.text}
          </span>
        </div>
      ))}

      {/* Input row */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ color: '#6a9fb5', userSelect: 'none', flexShrink: 0 }}>{'> '}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: '#e0e0e0',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            caretColor: '#a8d8a8',
          }}
        />
      </div>
    </div>
  )
}
