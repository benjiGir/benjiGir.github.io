import { playClick } from '@/lib/audio'
import { useLightingStore } from '@/store/useLightingStore'

export default function LightingToggle() {
  const night = useLightingStore((s) => s.mode === 'night')
  const toggleMode = useLightingStore((s) => s.toggleMode)

  return (
    <button
      type="button"
      className="scene-toggle"
      aria-label="Mode nuit"
      aria-pressed={night}
      title={night ? 'Passer en mode jour' : 'Passer en mode nuit'}
      onClick={() => {
        playClick()
        toggleMode()
      }}
    >
      <svg
        aria-hidden="true"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {night ? (
          <path d="M20.9 13.3A9 9 0 0 1 10.7 3.1a9 9 0 1 0 10.2 10.2Z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5" />
          </>
        )}
      </svg>
    </button>
  )
}
