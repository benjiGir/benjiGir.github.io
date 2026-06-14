import { useState } from 'react'
import { useWindowStore } from '@/store/useWindowStore'
import { APP_REGISTRY } from '@/os/window/appRegistry'
import { playClick } from '@/lib/audio'
import AppIcon from './AppIcon'

export default function DesktopIcon({
  appId,
  label,
  bg,
  icon,
}: {
  appId: string
  label: string
  bg: string
  icon?: string
}) {
  const openWindow = useWindowStore((s) => s.openWindow)
  const [selected, setSelected] = useState(false)

  function open() {
    const meta = APP_REGISTRY[appId]
    if (meta) {
      playClick()
      openWindow(appId, meta)
    }
  }

  return (
    <div
      tabIndex={0}
      onClick={() => setSelected(true)}
      onDoubleClick={open}
      onBlur={() => setSelected(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '6px 8px',
        borderRadius: 6,
        background: selected ? 'rgba(255,255,255,0.12)' : 'transparent',
        cursor: 'default',
        userSelect: 'none',
        width: 72,
        outline: 'none',
      }}
    >
      <AppIcon icon={icon} label={label} bg={bg} size={44} />
      <span
        style={{
          fontSize: 10,
          color: selected ? '#fff' : 'rgba(255,255,255,0.75)',
          textAlign: 'center',
          lineHeight: 1.2,
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
        }}
      >
        {label}
      </span>
    </div>
  )
}
