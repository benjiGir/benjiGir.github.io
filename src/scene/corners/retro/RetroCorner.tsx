import { useEffect, useMemo, useRef, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import Hotspot from '@/scene/camera/Hotspot'
import Editable from '@/editor/Editable'
import { useCameraStore } from '@/store/useCameraStore'
import { playClick, playCrtOn } from '@/lib/audio'
import { createPong } from '@/lib/games/pong'
import { GAME_WIDTH, GAME_HEIGHT, type GameInputs, type GameModule } from '@/lib/games/types'
import { SCREEN_TEX_W, SCREEN_TEX_H } from './crtShader'
import { Cabinet } from './Cabinet'
import { Tv } from './Tv'
import { useGameLoop } from './useGameLoop'

// ─── RetroCorner (export) ─────────────────────────────────────────────────────────
//
// Coin jeu (mur du fond gauche, x≈-2.4, z≈-3.6) : meuble bas + TV CRT + console + manette +
// cartouches. Cliquer la cartouche rouge allume la TV (`playCrtOn`) et démarre Pong, dessiné
// dans un canvas 2D hors-écran (`lib/games/pong.ts`) projeté sur l'écran via CanvasTexture +
// shader CRT (scanlines/vignette/distorsion). Contrôles ↑/↓ actifs uniquement quand le POI
// 'crt' est actif.

export default function RetroCorner() {
  const activePoi = useCameraStore((s) => s.poi)
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
    // Le jeu dessine en 320x240 — on étire le contexte pour remplir la texture suréchantillonnée
    if (ctx) ctx.scale(SCREEN_TEX_W / GAME_WIDTH, SCREEN_TEX_H / GAME_HEIGHT)
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

  function handleCartridgeClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    if (!poiActive || on) return
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
    <Hotspot poi="crt" label="Coin jeu" position={[-2.4, 0, -3.6]}>
      <Editable id="crt" label="Coin jeu (CRT)" rotation={[0, -0.5, 0]}>
        <Cabinet />
        <Tv texture={texture} on={on} onCartridgeClick={handleCartridgeClick} />
      </Editable>
    </Hotspot>
  )
}
