import { useWindowStore } from '@/store/useWindowStore'
import Window from '@/os/window/Window'
import DesktopIcon from './DesktopIcon'

const DESKTOP_ICONS = [
  { id: 'recyclebin', label: 'Corbeille', bg: '#64748b', icon: '/icons/bin.png' },
  { id: 'explorer', label: 'Poste de travail', bg: '#f59e0b', icon: '/icons/pc.png' },
]

export default function DesktopArea() {
  const windows = useWindowStore((s) => s.windows)
  const visible = windows.filter((w) => !w.minimized)

  return (
    <div
      data-desktop=""
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Icons column — top-left */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {DESKTOP_ICONS.map((item) => (
          <DesktopIcon
            key={item.id}
            appId={item.id}
            label={item.label}
            bg={item.bg}
            icon={item.icon}
          />
        ))}
      </div>

      {/* Windows */}
      {visible.map((win) => (
        <Window key={win.id} {...win} />
      ))}
    </div>
  )
}
