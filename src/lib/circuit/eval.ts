// Simulation électrique du Circuit Lab — "loi d'Ohm allégée".
//
// PORTÉE EXPLICITEMENT LIMITÉE : ce moteur reste correct pour des circuits série/parallèle
// simples où chaque branche a sa propre résistance dédiée (c'est le cas pour les 5 niveaux de
// ce module, voir `levels.ts`). Si une résistance ou un fil est PARTAGÉ par plusieurs branches
// qui divergent ensuite (ex. une résistance commune avant deux LED en parallèle), le modèle
// additionne les courants de chaque chemin traversant cet élément pour l'affichage/la détection
// de surcharge, SANS redistribution non-linéaire exacte entre branches de tensions de seuil
// différentes. C'est une approximation acceptée pour cet outil pédagogique (pas un solveur
// SPICE/analyse nodale complet), pas un bug à corriger.

import { BATTERY_VOLTAGE, holeNodeId, RAIL_NEG, RAIL_POS } from '@/lib/circuit/board'
import type { LedColor, PlacedComponent } from '@/lib/circuit/types'

/** Tension de seuil (Vf) par couleur de LED, en volts. */
export const LED_FORWARD_VOLTAGE: Record<LedColor, number> = {
  red: 1.8,
  yellow: 2.0,
  green: 2.1,
  blue: 3.0,
}

/** Résistance interne d'une LED traversée dans le bon sens, en ohms. */
export const LED_ON_RESISTANCE = 10

/** Courant maximum sûr pour une LED — au-delà, elle grille définitivement. */
export const LED_MAX_SAFE_A = 0.02

/** Profondeur maximale explorée par le DFS de recherche de chemins — évite l'explosion combinatoire. */
const MAX_PATH_DEPTH = 8

export interface SolveResult {
  /** Courant accumulé (ampères) par identifiant de composant. */
  currentByComponentId: Record<string, number>
  /** Vrai si au moins un chemin sans résistance ni LED relie directement les deux rails. */
  shortCircuit: boolean
}

interface Edge {
  component: PlacedComponent
  nodeA: string
  nodeB: string
}

/**
 * Simule le circuit posé sur la plaque et renvoie le courant par composant.
 *
 * @param components Composants actuellement posés sur la plaque.
 * @param switchOverrides État d'interrupteur à FORCER pour la simulation (par id de composant),
 *   sans modifier l'état réel affiché — utilisé pour valider un niveau en testant "et si
 *   l'interrupteur était fermé/ouvert" indépendamment de ce que voit le joueur.
 */
export function solveCircuit(
  components: PlacedComponent[],
  switchOverrides?: Record<string, boolean>
): SolveResult {
  const edges: Edge[] = components.map((c) => ({
    component: c,
    nodeA: holeNodeId(c.holeA),
    nodeB: holeNodeId(c.holeB),
  }))

  const currentByComponentId: Record<string, number> = {}
  for (const c of components) currentByComponentId[c.id] = 0

  const paths = findSimplePaths(edges, RAIL_POS, RAIL_NEG, MAX_PATH_DEPTH)

  let shortCircuit = false

  for (const path of paths) {
    const result = evaluatePath(path, switchOverrides)
    if (result === 'short') {
      shortCircuit = true
      continue
    }
    if (result.current <= 0) continue
    for (const edge of path) {
      currentByComponentId[edge.component.id] += result.current
    }
  }

  // LED grillée si le courant accumulé dépasse le seuil sûr — état persistant géré par
  // l'appelant (qui doit reporter `burnedOut = true` sur le composant correspondant).
  return { currentByComponentId, shortCircuit }
}

/** Énumère tous les chemins simples (sans nœud répété) reliant `start` à `end` dans le graphe. */
function findSimplePaths(edges: Edge[], start: string, end: string, maxDepth: number): Edge[][] {
  const paths: Edge[][] = []
  const visitedNodes = new Set<string>([start])
  const current: Edge[] = []

  function dfs(node: string) {
    if (node === end) {
      paths.push([...current])
      return
    }
    if (current.length >= maxDepth) return
    for (const edge of edges) {
      let nextNode: string | null = null
      if (edge.nodeA === node && !visitedNodes.has(edge.nodeB)) nextNode = edge.nodeB
      else if (edge.nodeB === node && !visitedNodes.has(edge.nodeA)) nextNode = edge.nodeA
      if (nextNode === null) continue

      visitedNodes.add(nextNode)
      current.push(edge)
      dfs(nextNode)
      current.pop()
      visitedNodes.delete(nextNode)
    }
  }

  dfs(start)
  return paths
}

/** Résultat de l'évaluation d'un chemin : un courant (peut être 0), ou un court-circuit détecté. */
function evaluatePath(
  path: Edge[],
  switchOverrides?: Record<string, boolean>
): { current: number } | 'short' {
  let totalR = 0
  let totalVf = 0
  let node = RAIL_POS

  for (const edge of path) {
    const { component } = edge
    // Sens de traversée de ce composant le long du chemin, de `node` vers l'autre extrémité.
    const traversedFromAtoB = edge.nodeA === node
    node = traversedFromAtoB ? edge.nodeB : edge.nodeA

    if (component.type === 'switch') {
      const closed = switchOverrides?.[component.id] ?? component.closed ?? false
      if (!closed) return { current: 0 }
    }

    if (component.type === 'resistor') {
      totalR += component.resistanceOhm ?? 0
    }

    if (component.type === 'led') {
      if (component.burnedOut) return { current: 0 }
      // La LED conduit de l'anode (holeA) vers la cathode (holeB). Le chemin doit la traverser
      // dans ce sens (de `holeA` vers `holeB`) pour être passant.
      const traversedAnodeToCathode = traversedFromAtoB
      if (!traversedAnodeToCathode) return { current: 0 } // diode bloquante
      totalR += LED_ON_RESISTANCE
      totalVf += component.ledColor ? LED_FORWARD_VOLTAGE[component.ledColor] : 0
    }
    // 'wire' : pas de résistance ni de tension de seuil ajoutée.
  }

  if (totalR === 0) return 'short'
  if (BATTERY_VOLTAGE <= totalVf) return { current: 0 }

  return { current: (BATTERY_VOLTAGE - totalVf) / totalR }
}

/**
 * Applique le résultat d'une simulation aux composants : toute LED dont le courant accumulé
 * dépasse `LED_MAX_SAFE_A` passe en `burnedOut: true` de façon persistante. Renvoie une nouvelle
 * liste de composants (immutabilité) — ne fait rien si aucune LED ne grille (même référence).
 */
export function applyBurnout(
  components: PlacedComponent[],
  result: SolveResult
): PlacedComponent[] {
  let changed = false
  const next = components.map((c) => {
    if (c.type !== 'led' || c.burnedOut) return c
    const current = result.currentByComponentId[c.id] ?? 0
    if (current > LED_MAX_SAFE_A) {
      changed = true
      return { ...c, burnedOut: true }
    }
    return c
  })
  return changed ? next : components
}
