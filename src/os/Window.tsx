import { Suspense, type CSSProperties } from 'react'
import { useWindowStore, type Win } from '@/store/useWindowStore'
import { APP_REGISTRY } from '@/os/appRegistry'
import { playClick } from '@/lib/audio'

const MIN_W = 240
const MIN_H = 160

function TrafficButton({
  color,
  onClick,
}: {
  color: string
  onClick: (e: React.MouseEvent) => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: color,
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        flexShrink: 0,
      }}
    />
  )
}

export default function Window({ id, appId, title, position, size, zIndex }: Win) {
  const { focusWindow, closeWindow, minimizeWindow, moveWindow, resizeWindow } = useWindowStore()
  const App = APP_REGISTRY[appId]?.component

  function makeDragHandler(
    _startPos: { x: number; y: number },
    onMove: (dx: number, dy: number) => void
  ) {
    return (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      focusWindow(id)

      // Compute HTML-space scale from the nearest data-desktop element
      const desktopEl = (e.currentTarget as HTMLElement).closest(
        '[data-desktop]'
      ) as HTMLElement | null
      const rect = desktopEl?.getBoundingClientRect()
      const scale = rect ? desktopEl!.offsetWidth / rect.width : 1

      const startX = e.clientX
      const startY = e.clientY

      const handleMove = (ev: MouseEvent) => {
        onMove((ev.clientX - startX) * scale, (ev.clientY - startY) * scale)
      }
      const handleUp = () => {
        window.removeEventListener('mousemove', handleMove)
        window.removeEventListener('mouseup', handleUp)
      }
      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleUp)
    }
  }

  const onTitleBarDrag = makeDragHandler(position, (dx, dy) =>
    moveWindow(id, { x: position.x + dx, y: position.y + dy })
  )

  const onResizeDrag = makeDragHandler(position, (dx, dy) =>
    resizeWindow(id, {
      w: Math.max(MIN_W, size.w + dx),
      h: Math.max(MIN_H, size.h + dy),
    })
  )

  const root: CSSProperties = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    width: size.w,
    height: size.h,
    zIndex,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0 24px 64px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.07)',
    background: '#141c2b',
  }

  const titleBar: CSSProperties = {
    height: 32,
    background: 'rgba(255,255,255,0.04)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
    gap: 6,
    cursor: 'grab',
    flexShrink: 0,
    userSelect: 'none',
  }

  return (
    <div style={root} onMouseDown={() => focusWindow(id)}>
      <div style={titleBar} onMouseDown={onTitleBarDrag}>
        <TrafficButton
          color="#ff5f57"
          onClick={(e) => {
            e.stopPropagation()
            playClick()
            closeWindow(id)
          }}
        />
        <TrafficButton
          color="#febc2e"
          onClick={(e) => {
            e.stopPropagation()
            playClick()
            minimizeWindow(id)
          }}
        />
        <TrafficButton color="#28c840" onClick={(e) => e.stopPropagation()} />
        <span
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 11,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: 0.3,
            marginRight: 48,
            pointerEvents: 'none',
          }}
        >
          {title}
        </span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        <Suspense
          fallback={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                fontSize: 11,
                color: 'rgba(255,255,255,0.2)',
                letterSpacing: 2,
              }}
            >
              CHARGEMENT
            </div>
          }
        >
          {App && <App />}
        </Suspense>
      </div>

      {/* Resize handle — bottom-right corner */}
      <div
        onMouseDown={onResizeDrag}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 16,
          height: 16,
          cursor: 'nwse-resize',
        }}
      />
    </div>
  )
}
