import { useWindowStore } from '@/store/useWindowStore'
import { APP_REGISTRY } from '@/os/window/appRegistry'
import { playClick } from '@/lib/audio'

export default function TaskbarWindow({
  id,
  appId,
  title,
  minimized,
}: {
  id: string
  appId: string
  title: string
  minimized: boolean
}) {
  const { focusWindow, minimizeWindow } = useWindowStore()
  const meta = APP_REGISTRY[appId]
  const bg = meta?.color ?? '#475569'
  const icon = meta?.icon

  function toggle() {
    playClick()
    if (minimized) focusWindow(id)
    else minimizeWindow(id)
  }

  return (
    <button
      onClick={toggle}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 36,
        padding: '0 12px',
        borderRadius: 10,
        background: minimized ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'rgba(255,255,255,0.85)',
        fontSize: 11,
        cursor: 'pointer',
        opacity: minimized ? 0.55 : 1,
      }}
    >
      {icon ? (
        <img
          src={icon}
          alt=""
          draggable={false}
          style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }}
        />
      ) : (
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: bg,
            flexShrink: 0,
          }}
        />
      )}
      {title}
    </button>
  )
}
