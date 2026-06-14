import type { MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GameInputs, GameModule } from '@/lib/games/types'

// ─── Boucle de jeu (canvas hors-écran → CanvasTexture) ────────────────────────────

interface UseGameLoopArgs {
  active: boolean
  on: boolean
  texture: THREE.CanvasTexture
  ctx2d: CanvasRenderingContext2D | null
  inputsRef: MutableRefObject<GameInputs>
  gameRef: MutableRefObject<GameModule | null>
}

export function useGameLoop({ active, on, texture, ctx2d, inputsRef, gameRef }: UseGameLoopArgs) {
  useFrame((_, delta) => {
    // Perf : on ne met à jour la simulation/texture que lorsque le POI 'crt' est actif et la
    // TV allumée (cartouche insérée) — pas de redraw 60fps en permanence.
    if (!active || !on || !ctx2d || !gameRef.current) return

    gameRef.current.update(delta, inputsRef.current)
    gameRef.current.draw(ctx2d)
    texture.needsUpdate = true
  })
}
