// Définition des niveaux du Circuit Lab : chaque niveau part d'une plaque vierge et valide le
// câblage posé par le joueur via une simulation électrique réelle (voir `eval.ts`).

import { applyBurnout, solveCircuit } from '@/lib/circuit/eval'
import type { Level, PlacedComponent } from '@/lib/circuit/types'

/** Une LED qui conduit (courant > 0) et n'est pas grillée. */
function isLedLit(component: PlacedComponent, currentByComponentId: Record<string, number>) {
  return (
    component.type === 'led' &&
    !component.burnedOut &&
    (currentByComponentId[component.id] ?? 0) > 0
  )
}

export const LEVELS: Level[] = [
  {
    id: 0,
    title: 'Niveau 1 — Allumer une LED',
    description:
      'Place une LED et une résistance entre les rails pour allumer la LED sans la griller.',
    isSolved: (components) => {
      const { currentByComponentId, shortCircuit } = solveCircuit(components)
      if (shortCircuit) return false
      return components.some((c) => isLedLit(c, currentByComponentId))
    },
  },
  {
    id: 1,
    title: 'Niveau 2 — Un interrupteur pour contrôler',
    description:
      "Câble une LED, une résistance et un interrupteur en série : la LED doit s'allumer quand l'interrupteur est fermé, et s'éteindre quand il est ouvert.",
    isSolved: (components) => {
      const switches = components.filter((c) => c.type === 'switch')
      if (switches.length === 0) return false

      const closedResult = solveCircuit(
        components,
        Object.fromEntries(switches.map((s) => [s.id, true]))
      )
      const openResult = solveCircuit(
        components,
        Object.fromEntries(switches.map((s) => [s.id, false]))
      )
      if (closedResult.shortCircuit) return false

      const litWhenClosed = components.some((c) => isLedLit(c, closedResult.currentByComponentId))
      const offWhenOpen = components
        .filter((c) => c.type === 'led')
        .every((c) => (openResult.currentByComponentId[c.id] ?? 0) === 0)

      return litWhenClosed && offWhenOpen
    },
  },
  {
    id: 2,
    title: 'Niveau 3 — LEDs en série',
    description:
      'Place deux LEDs et une résistance sur le même chemin électrique : les deux doivent s’allumer ensemble.',
    isSolved: (components) => {
      const { currentByComponentId, shortCircuit } = solveCircuit(components)
      if (shortCircuit) return false
      const leds = components.filter((c) => c.type === 'led')
      if (leds.length < 2) return false
      return leds.every((c) => isLedLit(c, currentByComponentId))
    },
  },
  {
    id: 3,
    title: 'Niveau 4 — LEDs en parallèle',
    description:
      'Câble deux branches indépendantes entre les rails, chacune avec sa propre résistance et sa propre LED.',
    isSolved: (components) => {
      const { currentByComponentId, shortCircuit } = solveCircuit(components)
      if (shortCircuit) return false
      const leds = components.filter((c) => c.type === 'led')
      if (leds.length < 2) return false
      return leds.every((c) => isLedLit(c, currentByComponentId))
    },
  },
  {
    id: 4,
    title: 'Niveau 5 — Circuit combiné',
    description:
      'Un seul interrupteur contrôle deux branches en parallèle, chacune avec sa propre résistance et sa propre LED.',
    isSolved: (components) => {
      const switches = components.filter((c) => c.type === 'switch')
      const leds = components.filter((c) => c.type === 'led')
      if (switches.length === 0 || leds.length < 2) return false

      const closedResult = solveCircuit(
        components,
        Object.fromEntries(switches.map((s) => [s.id, true]))
      )
      const openResult = solveCircuit(
        components,
        Object.fromEntries(switches.map((s) => [s.id, false]))
      )
      if (closedResult.shortCircuit) return false

      const allLitWhenClosed = leds.every((c) => isLedLit(c, closedResult.currentByComponentId))
      const allOffWhenOpen = leds.every((c) => (openResult.currentByComponentId[c.id] ?? 0) === 0)

      return allLitWhenClosed && allOffWhenOpen
    },
  },
  {
    id: 5,
    title: 'Niveau 6 — Bac à sable',
    description: 'Plateau libre, sans objectif : bricole comme tu veux.',
    sandbox: true,
    isSolved: () => false,
  },
]

/** Réapplique l'état "grillé" persistant après chaque modification de câblage. */
export function simulateAndBurnout(components: PlacedComponent[]) {
  const result = solveCircuit(components)
  return { components: applyBurnout(components, result), result }
}
