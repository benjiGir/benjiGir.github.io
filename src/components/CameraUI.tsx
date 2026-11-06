import { useEffect, useRef, useState } from 'react'
import { useCameraStore, type PoiId } from '@/store/useCameraStore'
import { useEditorStore } from '@/editor/useEditorStore'
import { usePowerStore } from '@/store/usePowerStore'
import { useScreenStore } from '@/store/useScreenStore'
import { playClick } from '@/lib/audio'
import './cameraUI.css'

const DESTINATIONS = {
  screen: { label: 'Ordinateur', icon: 'M3 4h18v12H3zM8 21h8m-4-5v5' },
  workbench: { label: 'Établi', icon: 'M3 7h18v10H3zM5 17v4m14-4v4M7 12h3l2-3 2 5 2-2h2' },
  crt: { label: 'Coin rétro', icon: 'M3 8h18v12H3zM8 3l4 5 4-5M17 12h1m-1 4h1' },
  robot: { label: 'Robot NAO', icon: 'M5 9h14v11H5zM12 5v4M9 13h.01m6 0h.01M9 17h6' },
  guitar: { label: 'Guitare', icon: 'M14 10l5-7 2 2-6 6m-4 0c2-1 4 0 4 3 0 4-7 8-10 5s1-9 5-8zM8 16h.01' },
  legos: { label: 'Coin Lego', icon: 'M3 10h18v9H3zM6 10V6h4v4m4 0V6h4v4' },
} satisfies Record<Exclude<PoiId, 'overview'>, { label: string; icon: string }>

const DESTINATION_IDS = Object.keys(DESTINATIONS) as Array<keyof typeof DESTINATIONS>

const INTERACTION_HINTS = {
  workbench: 'L’oscilloscope affiche le signal audio du bureau.',
  crt: 'Clique sur la console pour lancer Pong. Joue avec ↑ et ↓.',
  robot: 'Bouge le pointeur pour attirer le regard du robot.',
  guitar: 'Clique sur les cordes pour jouer ou lance une partie de Simon.',
  legos: null,
}

export default function CameraUI() {
  const poi = useCameraStore((s) => s.poi)
  const focusOn = useCameraStore((s) => s.focusOn)
  const back = useCameraStore((s) => s.back)
  const isFullscreen = useScreenStore((s) => s.isFullscreen)
  const editing = useEditorStore((s) => s.enabled)
  const power = usePowerStore((s) => s.power)
  const pressPower = usePowerStore((s) => s.pressPower)
  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const visible = !isFullscreen && !editing
  const canStartComputer = poi === 'screen' && power === 'off'
  const hint = poi === 'overview' || poi === 'screen' ? null : INTERACTION_HINTS[poi]

  useEffect(() => {
    if (!visible || !open) return

    const dismissOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !navRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', dismissOutside)
    return () => document.removeEventListener('pointerdown', dismissOutside)
  }, [open, visible])

  useEffect(() => {
    if (!visible) return

    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      if (
        event.target instanceof HTMLElement &&
        event.target.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return
      }
      if (open) {
        setOpen(false)
        triggerRef.current?.focus()
      } else if (poi !== 'overview') {
        playClick()
        back()
      }
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [back, open, poi, visible])

  if (!visible) return null

  function choose(destination: PoiId) {
    playClick()
    focusOn(destination)
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <nav ref={navRef} className="camera-nav" aria-label="Navigation dans la chambre">
      <div className="camera-nav__bar">
        <button
          ref={triggerRef}
          type="button"
          className="camera-nav__explore"
          aria-expanded={open}
          aria-controls="camera-destinations"
          onClick={() => {
            playClick()
            setOpen(!open)
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="m15.5 8.5-2 5-5 2 2-5z" />
          </svg>
          {poi === 'overview' ? 'Explorer' : DESTINATIONS[poi].label}
          <svg className="camera-nav__chevron" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m7 14 5-5 5 5" />
          </svg>
        </button>
        <button
          type="button"
          className="camera-nav__home"
          aria-label="Recentrer sur la vue d’ensemble"
          title="Vue d’ensemble"
          onClick={() => {
            playClick()
            setOpen(false)
            back()
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        </button>
      </div>
      {!open && (canStartComputer || hint) && (
        <div className="camera-nav__context">
          {canStartComputer ? (
            <button
              type="button"
              onClick={() => {
                playClick()
                pressPower()
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3v8m-4.9-5a7 7 0 1 0 9.8 0" />
              </svg>
              Allumer l’ordinateur
            </button>
          ) : (
            <p>{hint}</p>
          )}
        </div>
      )}
      <div id="camera-destinations" className="camera-nav__panel" hidden={!open}>
        <p className="camera-nav__heading">Explorer la chambre</p>
        <div className="camera-nav__destinations">
          {DESTINATION_IDS.map((id) => (
            <button
              key={id}
              type="button"
              aria-current={poi === id ? 'true' : undefined}
              onClick={() => choose(id)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={DESTINATIONS[id].icon} />
              </svg>
              {DESTINATIONS[id].label}
            </button>
          ))}
        </div>
        <p className="camera-nav__hint camera-nav__hint--mouse">
          Glisser pour tourner · Molette pour zoomer
          <br />
          En vue d’ensemble, clic droit glissé pour se déplacer. Au clavier, clique dans la pièce
          puis utilise les flèches ou ZQSD (WASD sur QWERTY).
        </p>
        <p className="camera-nav__hint camera-nav__hint--touch">
          Glisse à un doigt pour tourner et pince pour zoomer. En vue d’ensemble, glisse à deux
          doigts pour te déplacer.
        </p>
      </div>
    </nav>
  )
}
