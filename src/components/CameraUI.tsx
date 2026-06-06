import { useCameraStore, type CameraPreset } from '@/store/useCameraStore'
import { playClick } from '@/lib/audio'

export default function CameraUI() {
  const { preset, focusOn } = useCameraStore()

  const buttons: { label: string; value: CameraPreset }[] = [
    { label: 'Vue ensemble', value: 'overview' },
    { label: 'Écran', value: 'screen' },
  ]

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 8,
        zIndex: 10,
      }}
    >
      {buttons.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => { playClick(); focusOn(value) }}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'system-ui, sans-serif',
            fontSize: 13,
            fontWeight: 500,
            background: preset === value ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
            color: preset === value ? '#111' : '#fff',
            backdropFilter: 'blur(8px)',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
