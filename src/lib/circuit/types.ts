// Types du modèle de circuit du Circuit Lab.
//
// Le joueur câble une VRAIE plaque d'essai (breadboard) avec de vrais composants
// (résistance, LED, interrupteur, fil de pontage) reliés entre des trous. La simulation
// électrique calcule un courant réel par composant (loi d'Ohm allégée, voir `eval.ts`).

/** Type de composant disponible dans la boîte à outils. */
export type ComponentType = 'resistor' | 'led' | 'switch' | 'wire'

/** Couleur de LED disponible, avec sa tension de seuil propre (voir `LED_FORWARD_VOLTAGE`). */
export type LedColor = 'red' | 'green' | 'blue' | 'yellow'

/** Ligne d'un trou de la plaque : les rails d'alimentation, ou une ligne de la grille a-j. */
export type HoleRow = 'rail+' | 'rail-' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j'

/** Un trou de la plaque, identifié par sa colonne (0..N_COLUMNS-1) et sa ligne. */
export interface Hole {
  column: number
  row: HoleRow
}

/**
 * Composant posé par le joueur entre deux trous.
 * Pour une LED, `holeA` est l'anode (+) et `holeB` la cathode (-) — l'ordre de placement
 * (premier trou cliqué puis second) détermine la polarité, comme dans la réalité.
 */
export interface PlacedComponent {
  id: string
  type: ComponentType
  holeA: Hole
  holeB: Hole
  /** Résistance en ohms — uniquement pour `type: 'resistor'`. */
  resistanceOhm?: number
  /** Couleur — uniquement pour `type: 'led'`. */
  ledColor?: LedColor
  /** État ouvert/fermé — uniquement pour `type: 'switch'`. */
  closed?: boolean
  /**
   * LED grillée — état PERSISTANT une fois `true` : ne se réinitialise pas tout seul même si
   * le câblage est corrigé. Seul le retrait + replacement d'une LED à cet emplacement le
   * remet à `false` (puisqu'il s'agit alors d'un nouveau composant avec un nouvel id).
   */
  burnedOut?: boolean
}

/** Définition d'un niveau : titre, description et fonction de validation du câblage posé. */
export interface Level {
  id: number
  title: string
  description: string
  /** Mode bac à sable : pas de validation, ne compte pas dans la progression. */
  sandbox?: boolean
  isSolved: (components: PlacedComponent[]) => boolean
}
