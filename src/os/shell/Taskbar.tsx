import { useState } from 'react'
import { useWindowStore } from '@/store/useWindowStore'
import { playClick } from '@/lib/audio'
import StartMenu from './StartMenu'
import StartButton from './StartButton'
import TaskbarWindow from './TaskbarWindow'
import Clock from './Clock'

export default function Taskbar() {
  const windows = useWindowStore((s) => s.windows)
  const [startOpen, setStartOpen] = useState(false)

  return (
    <>
      {startOpen && <StartMenu onClose={() => setStartOpen(false)} />}
      <div
        style={{
          flexShrink: 0,
          height: 52,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 12px',
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          zIndex: 1000,
        }}
      >
        <StartButton
          active={startOpen}
          onClick={() => {
            playClick()
            setStartOpen((v) => !v)
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, overflowX: 'auto' }}>
          {windows.map((win) => (
            <TaskbarWindow
              key={win.id}
              id={win.id}
              appId={win.appId}
              title={win.title}
              minimized={win.minimized}
            />
          ))}
        </div>

        <Clock />
      </div>
    </>
  )
}
