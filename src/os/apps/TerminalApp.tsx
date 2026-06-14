import { useState, useRef, useEffect } from 'react'
import { useWindowStore } from '@/store/useWindowStore'
import { APP_REGISTRY } from '@/os/window/appRegistry'
import { playClick } from '@/lib/audio'
import { BANNER, runCommand, type CmdCtx, type Line } from '@/lib/terminal/commands'
import { tabComplete } from '@/lib/terminal/complete'
import { C, displayPath } from '@/lib/terminal/fs'

// ── Component ──────────────────────────────────────────────────────────────────

export default function TerminalApp() {
  const [lines, setLines] = useState<Line[]>(BANNER)
  const [cwd, setCwd] = useState('/home/benji')
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const openWindow = useWindowStore((s) => s.openWindow)

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  function submit() {
    const cmd = input.trim()
    let newCwd = cwd

    const ctx: CmdCtx = {
      cwd,
      history,
      setCwd: (p) => {
        newCwd = p
      },
      openApp: (id) => {
        const meta = APP_REGISTRY[id]
        if (meta) {
          playClick()
          openWindow(id, meta)
        }
      },
    }

    const result = runCommand(cmd, ctx)

    if (result === null) {
      setLines(BANNER)
    } else {
      setLines((prev) => [
        ...prev,
        ...(cmd ? [{ kind: 'input' as const, text: cmd, cwd }] : []),
        ...result,
      ])
    }

    setCwd(newCwd)
    if (cmd) setHistory((h) => [cmd, ...h])
    setInput('')
    setHistIdx(-1)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      submit()
      return
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const result = tabComplete(input, cwd)
      if (typeof result === 'string') {
        setInput(result)
      } else if (Array.isArray(result)) {
        setLines((prev) => [
          ...prev,
          { kind: 'output', spans: [{ text: result.join('  '), color: C.muted }] },
        ])
      }
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const idx = Math.min(histIdx + 1, history.length - 1)
      setHistIdx(idx)
      setInput(history[idx] ?? '')
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const idx = Math.max(histIdx - 1, -1)
      setHistIdx(idx)
      setInput(idx === -1 ? '' : history[idx])
      return
    }
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines(BANNER)
      return
    }
    if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault()
      if (input) {
        setLines((prev) => [
          ...prev,
          { kind: 'input', text: input, cwd },
          { kind: 'output', spans: [{ text: '^C', color: C.muted }] },
        ])
        setInput('')
        setHistIdx(-1)
      }
    }
  }

  const prompt = displayPath(cwd)

  return (
    <div
      ref={scrollRef}
      onClick={() => inputRef.current?.focus({ preventScroll: true })}
      style={{
        height: '100%',
        background: '#1e1e2e',
        fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace",
        fontSize: 12,
        color: '#cdd6f4',
        padding: '14px 16px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        cursor: 'text',
        lineHeight: 1.7,
      }}
    >
      {lines.map((line, i) => {
        if (line.kind === 'input') {
          return (
            <div key={i} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline' }}>
              <Prompt cwd={line.cwd} />
              <span style={{ color: C.white, whiteSpace: 'pre' }}>{line.text}</span>
            </div>
          )
        }
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              minHeight: '1.7em',
            }}
          >
            {line.spans.map((span, j) => (
              <span
                key={j}
                style={{
                  color: span.color ?? '#cdd6f4',
                  fontWeight: span.bold ? 700 : undefined,
                  whiteSpace: 'pre',
                }}
              >
                {span.text}
              </span>
            ))}
          </div>
        )
      })}

      {/* Input row */}
      <div style={{ display: 'flex', alignItems: 'baseline' }}>
        <Prompt cwd={prompt} />
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
            color: C.white,
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            caretColor: C.green,
          }}
        />
      </div>
    </div>
  )
}

function Prompt({ cwd }: { cwd: string }) {
  return (
    <>
      <span style={{ color: C.green, userSelect: 'none', whiteSpace: 'pre' }}>benji</span>
      <span style={{ color: C.muted, userSelect: 'none', whiteSpace: 'pre' }}>@</span>
      <span style={{ color: C.blue, userSelect: 'none', whiteSpace: 'pre' }}>bureau</span>
      <span style={{ color: C.muted, userSelect: 'none', whiteSpace: 'pre' }}>:</span>
      <span style={{ color: C.cyan, userSelect: 'none', whiteSpace: 'pre' }}>{cwd}</span>
      <span style={{ color: C.white, userSelect: 'none', whiteSpace: 'pre', marginRight: 8 }}>
        $
      </span>
    </>
  )
}
