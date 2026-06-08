import { useState, useEffect } from 'react'
import { usePowerStore } from '@/store/usePowerStore'
import Desktop, { SCREEN_W, SCREEN_H } from '@/os/Desktop'

/** Lignes du POST/BIOS et délai (ms) avant leur apparition — quelques pauses « dramatiques »
 *  ponctuent la séquence pour évoquer un vrai démarrage matériel. */
const BIOS_LINES: { text: string; delay: number }[] = [
  { text: 'AMI BIOS (C) 2026 Award Software, Inc.', delay: 140 },
  { text: 'VIRTUAL-DESK X1 — Rev. 4.02', delay: 180 },
  { text: '', delay: 80 },
  { text: 'CPU : Threadripper 9950X @ 4.2GHz', delay: 260 },
  { text: 'Memory Test : 32768MB OK', delay: 480 },
  { text: '', delay: 100 },
  { text: 'Detecting IDE drives...', delay: 420 },
  { text: '  Primary Master  : SSD-PORTFOLIO 1TB', delay: 320 },
  { text: '  Primary Slave   : None', delay: 220 },
  { text: '', delay: 360 },
  { text: 'Press DEL to enter SETUP, F12 for Boot Menu', delay: 560 },
  { text: '', delay: 380 },
  { text: 'Booting from SSD-PORTFOLIO...', delay: 440 },
]

function BiosScreen() {
  const [lines, setLines] = useState<string[]>([])
  const [cursor, setCursor] = useState(true)

  useEffect(() => {
    let elapsed = 0
    const timers = BIOS_LINES.map(({ text, delay }) => {
      elapsed += delay
      return setTimeout(() => setLines((prev) => [...prev, text]), elapsed)
    })
    const c = setInterval(() => setCursor((v) => !v), 420)
    return () => {
      timers.forEach(clearTimeout)
      clearInterval(c)
    }
  }, [])

  return (
    <div
      style={{
        width: SCREEN_W,
        height: SCREEN_H,
        overflow: 'hidden',
        background: '#060805',
        padding: '36px 48px',
        color: '#3dff6e',
        textShadow: '0 0 6px rgba(61,255,110,0.55)',
        fontFamily: "'Courier New', ui-monospace, monospace",
        fontSize: 14,
        lineHeight: 1.7,
        letterSpacing: 0.5,
        userSelect: 'none',
        pointerEvents: 'none',
        position: 'relative',
      }}
    >
      {lines.map((line, i) => (
        <div key={i}>
          {line || ' '}
          {i === lines.length - 1 && <span style={{ opacity: cursor ? 1 : 0 }}>_</span>}
        </div>
      ))}
      {/* Lignes de balayage CRT */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'repeating-linear-gradient(rgba(0,0,0,0) 0, rgba(0,0,0,0) 2px, rgba(0,0,0,0.18) 3px)',
          mixBlendMode: 'multiply',
        }}
      />
    </div>
  )
}

function BootScreen() {
  const [progress, setProgress] = useState(0)
  const [cursor, setCursor] = useState(true)

  useEffect(() => {
    // 100 pas × 20ms = 2000ms, à garder aligné avec BOOT_DURATION (PowerSequence.tsx)
    // pour que la barre atteigne 100% pile au moment où l'OS prend la main.
    const p = setInterval(() => setProgress((v) => Math.min(v + 1, 100)), 20)
    const c = setInterval(() => setCursor((v) => !v), 530)
    return () => {
      clearInterval(p)
      clearInterval(c)
    }
  }, [])

  return (
    <div
      style={{
        width: SCREEN_W,
        height: SCREEN_H,
        overflow: 'hidden',
        background: '#08080f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        color: '#fff',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 200, letterSpacing: 16, opacity: 0.9 }}>
        PORTFOLIO
      </div>
      <div
        style={{
          width: 280,
          height: 2,
          background: 'rgba(255,255,255,0.12)',
          borderRadius: 2,
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: '#fff',
            borderRadius: 2,
            transition: 'width 34ms linear',
          }}
        />
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: 4 }}>
        LOADING{cursor ? '_' : ' '}
      </div>
    </div>
  )
}

function ShutdownScreen() {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const p = setInterval(() => setProgress((v) => Math.max(v - 2, 0)), 34)
    return () => clearInterval(p)
  }, [])

  return (
    <div
      style={{
        width: SCREEN_W,
        height: SCREEN_H,
        overflow: 'hidden',
        background: '#08080f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        color: '#fff',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        userSelect: 'none',
        pointerEvents: 'none',
        position: 'relative',
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 200, letterSpacing: 16, opacity: 0.9 }}>
        PORTFOLIO
      </div>
      <div
        style={{
          width: 280,
          height: 2,
          background: 'rgba(255,255,255,0.12)',
          borderRadius: 2,
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: '#fff',
            borderRadius: 2,
            transition: 'width 34ms linear',
          }}
        />
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: 4 }}>
        ARRÊT EN COURS
      </div>
      {/* Fondu au noir progressif — l'écran s'éteint avec la machine */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#000',
          opacity: 1 - progress / 100,
          transition: 'opacity 0.3s linear',
        }}
      />
    </div>
  )
}

export default function ScreenContent() {
  const power = usePowerStore((s) => s.power)
  if (power === 'bios') return <BiosScreen />
  if (power === 'booting') return <BootScreen />
  if (power === 'shuttingDown') return <ShutdownScreen />
  return <Desktop />
}
