import { setOverlayEl, setInnerEl } from '@/os/overlayEl'
import ScreenContent from '@/os/ScreenContent'

export default function BootOverlay() {
  return (
    <div
      ref={setOverlayEl}
      style={{
        position: 'fixed',
        display: 'none',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 5,
        borderRadius: 3,
      }}
    >
      <div
        ref={setInnerEl}
        style={{ transformOrigin: 'top left', width: 685, height: 385 }}
      >
        <ScreenContent />
      </div>
    </div>
  )
}
