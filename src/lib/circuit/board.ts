// Topologie électrique de la plaque d'essai (breadboard) — mappe chaque trou physique vers
// son identifiant de nœud électrique.

import type { Hole } from '@/lib/circuit/types'

/** Nombre de colonnes de la plaque. */
export const N_COLUMNS = 10

/** Tension fixe de la pile, toujours branchée entre les deux rails. */
export const BATTERY_VOLTAGE = 9

/** Lignes de la moitié "haute" d'une colonne (a-e), toutes connectées entre elles. */
const TOP_ROWS = new Set(['a', 'b', 'c', 'd', 'e'])

/**
 * Identifiant de nœud électrique pour un trou donné.
 * - Les deux rails d'alimentation ne forment chacun qu'UN SEUL nœud, quelle que soit la colonne.
 * - Dans une colonne, les lignes a-e forment un nœud commun (`col-top-N`) et les lignes f-j un
 *   autre nœud commun (`col-bot-N`) — les deux moitiés ne sont PAS connectées entre elles : c'est
 *   la gouttière centrale caractéristique d'une vraie breadboard. Un composant doit l'enjamber
 *   (relier un trou haut à un trou bas) pour relier les deux moitiés.
 */
export function holeNodeId(hole: Hole): string {
  if (hole.row === 'rail+') return 'RAIL_POS'
  if (hole.row === 'rail-') return 'RAIL_NEG'
  return TOP_ROWS.has(hole.row) ? `col-top-${hole.column}` : `col-bot-${hole.column}`
}

export const RAIL_POS = 'RAIL_POS'
export const RAIL_NEG = 'RAIL_NEG'
