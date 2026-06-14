import { SCREEN_W, SCREEN_H } from '@/os/window/screen'
import Topbar from './Topbar'
import DesktopArea from './DesktopArea'
import Taskbar from './Taskbar'
import Toasts from './Toasts'

export default function Desktop() {
  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        width: SCREEN_W,
        height: SCREEN_H,
        overflow: 'hidden',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif",
        fontSize: 13,
        lineHeight: 1.4,
        color: '#e2e8f0',
        boxSizing: 'border-box',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background: 'radial-gradient(ellipse at 30% 20%, #1a2a4a 0%, #0d1525 40%, #080d18 100%)',
      }}
    >
      <Topbar />
      <DesktopArea />
      <Taskbar />
      <Toasts />
    </div>
  )
}
