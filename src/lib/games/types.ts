// Interface commune pour les "cartouches" de jeux rétro affichés sur la TV CRT
// (`scene/corners/retro/RetroCorner.tsx`). Chaque jeu est un module indépendant qui implémente
// `GameModule` : la TV se contente d'appeler `init`, puis `update`/`draw` à chaque frame
// tant que le POI 'crt' est actif. Permet d'ajouter Snake/Breakout sans toucher à la TV.

/** Résolution logique de l'écran (façon console rétro, redimensionnée par la texture). */
export const GAME_WIDTH = 320
export const GAME_HEIGHT = 240

/** État des entrées clavier lues par la TV, transmis tel quel à `update`. */
export interface GameInputs {
  up: boolean
  down: boolean
}

export interface GameModule {
  /** (Ré)initialise l'état interne du jeu — appelé à l'insertion de la cartouche. */
  init(): void
  /** Avance la simulation de `dt` secondes selon les entrées courantes. */
  update(dt: number, inputs: GameInputs): void
  /** Dessine l'état courant dans le contexte 2D (résolution `GAME_WIDTH x GAME_HEIGHT`). */
  draw(ctx: CanvasRenderingContext2D): void
}
