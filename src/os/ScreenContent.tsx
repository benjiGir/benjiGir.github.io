import { useState, useEffect } from 'react'
import { usePowerStore } from '@/store/usePowerStore'
import Desktop, { SCREEN_W, SCREEN_H } from '@/os/Desktop'

function BootScreen() {
  const [progress, setProgress] = useState(0)
  const [cursor, setCursor] = useState(true)

  useEffect(() => {
    const p = setInterval(() => setProgress((v) => Math.min(v + 1, 100)), 34)
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

export default function ScreenContent() {
  const power = usePowerStore((s) => s.power)
  return power === 'booting' ? <BootScreen /> : <Desktop />
}
