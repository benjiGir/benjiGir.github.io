import { useAudioStore } from '@/store/useAudioStore'
import { playClick } from '@/lib/audio'

function IconSound() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  )
}

function IconMuted() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  )
}

export default function MuteToggle() {
  const { muted, toggleMute } = useAudioStore()

  return (
    <button
      onClick={() => {
        toggleMute()
        if (muted) playClick()
      }}
      title={muted ? 'Activer le son' : 'Couper le son'}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.2)',
        color: '#fff',
        backdropFilter: 'blur(8px)',
        transition: 'background 0.2s, color 0.2s',
        zIndex: 10,
      }}
    >
      {muted ? <IconMuted /> : <IconSound />}
    </button>
  )
}
