import { useEffect, useMemo, useRef, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import Hotspot from '@/scene/camera/Hotspot'
import Editable from '@/editor/Editable'
import { useEditorStore } from '@/editor/useEditorStore'
import { useCameraStore } from '@/store/useCameraStore'
import { CRT_POSITION } from '@/scene/roomLayout'
import { playClick, playCrtOn } from '@/lib/audio'
import { createPong } from '@/lib/games/pong'
import { GAME_WIDTH, GAME_HEIGHT, type GameInputs, type GameModule } from '@/lib/games/types'
import { SCREEN_TEX_W, SCREEN_TEX_H } from './crtShader'
import { Cabinet } from './Cabinet'
import { Console } from './Console'
import { Daruma } from './Daruma'
import { CABINET_TOP_Y } from './retroLayout'
import { Tv } from './Tv'
import { useGameLoop } from './useGameLoop'

// ─── RetroCorner (export) ─────────────────────────────────────────────────────────
//
// Coin jeu au fond à droite : meuble bas + TV CRT + console + manette +
// cartouches. La cartouche Pong et le bouton de la console allument la TV et démarrent le jeu, dessiné
// dans un canvas 2D hors-écran (`lib/games/pong.ts`) projeté sur l'écran via CanvasTexture +
// shader CRT (scanlines/vignette/distorsion). Contrôles ↑/↓ actifs uniquement quand le POI
// 'crt' est actif.

export default function RetroCorner() {
  const activePoi = useCameraStore((s) => s.poi)
  const editing = useEditorStore((s) => s.enabled)
  const poiActive = activePoi === 'crt'

  // État "TV allumée / jeu démarré" — change une seule fois par session (clic cartouche),
  // un useState ponctuel est inoffensif (pas de mutation par frame).
  const [on, setOn] = useState(false)
  const gameRef = useRef<GameModule | null>(null)
  const inputsRef = useRef<GameInputs>({ up: false, down: false })

  // Canvas hors-écran + texture (créés une fois)
  const canvas = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = SCREEN_TEX_W
    c.height = SCREEN_TEX_H
    return c
  }, [])
  const ctx2d = useMemo(() => {
    const ctx = canvas.getContext('2d')
    // Fixe l'échelle sans la cumuler si React réévalue l'initialisation en développement.
    ctx?.setTransform(SCREEN_TEX_W / GAME_WIDTH, 0, 0, SCREEN_TEX_H / GAME_HEIGHT, 0, 0)
    return ctx
  }, [canvas])
  const texture = useMemo(() => {
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [canvas])

  // Écran éteint par défaut
  useEffect(() => {
    if (!ctx2d) return
    ctx2d.fillStyle = '#000'
    ctx2d.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    texture.needsUpdate = true
  }, [ctx2d, texture])

  // Contrôles clavier ↑/↓ — actifs uniquement quand le POI 'crt' est actif
  useEffect(() => {
    if (!poiActive) {
      inputsRef.current.up = false
      inputsRef.current.down = false
      return
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowUp') inputsRef.current.up = true
      if (e.key === 'ArrowDown') inputsRef.current.down = true
    }
    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === 'ArrowUp') inputsRef.current.up = false
      if (e.key === 'ArrowDown') inputsRef.current.down = false
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      inputsRef.current.up = false
      inputsRef.current.down = false
    }
  }, [poiActive])

  const canStart = poiActive && !on && !editing

  function startGame(e: ThreeEvent<MouseEvent>) {
    if (!canStart) return
    e.stopPropagation()
    document.body.style.cursor = 'auto'
    playClick()
    playCrtOn()
    setOn(true)
    if (!gameRef.current) gameRef.current = createPong()
    gameRef.current.init()
  }

  useGameLoop({
    active: poiActive,
    on,
    texture,
    ctx2d,
    inputsRef,
    gameRef,
  })

  return (
    <Hotspot poi="crt" label="Coin jeu" position={CRT_POSITION} rotation={[0, -0.15, 0]}>
      <Editable id="crt" label="Coin jeu (CRT)">
        <Cabinet />
        <Tv texture={texture} on={on} />
        <Console on={on} canStart={canStart} onStart={startGame} />
        <Editable
          id="daruma"
          label="Daruma"
          position={[0.181, CABINET_TOP_Y, 0.183]}
          rotation={[0, -0.12, 0]}
        >
          <Daruma />
        </Editable>
      </Editable>
    </Hotspot>
  )
}
