// Évaluation des circuits du Circuit Lab : simulation du graphe de fils posés par le
// joueur, génération des combinaisons d'entrées et vérification de la correction d'un
// niveau par rapport au câblage de référence.

import type { GateType, Level, PortDef, Wire } from '@/lib/circuit/types'

// Combien d'entrées attend chaque type de porte
export const GATE_INPUTS: Record<GateType, number> = { AND: 2, OR: 2, NOT: 1, XOR: 2 }

export function evalGate(gate: GateType, inputs: number[]): number {
  switch (gate) {
    case 'AND':
      return inputs.every((v) => v === 1) ? 1 : 0
    case 'OR':
      return inputs.some((v) => v === 1) ? 1 : 0
    case 'NOT':
      return inputs[0] === 1 ? 0 : 1
    case 'XOR':
      return inputs.reduce((a, b) => a ^ b, 0)
  }
}

/**
 * Évalue le circuit pour un jeu de valeurs d'entrée donné, en suivant les fils posés.
 * Renvoie `null` si le circuit est mal formé (port non alimenté, cycle, etc.) — dans ce cas
 * la fonction logique n'est pas définie et le niveau ne peut pas être validé.
 */
export function evaluateCircuit(
  ports: PortDef[],
  wires: Wire[],
  inputValues: Record<string, number>
): number | null {
  const values: Record<string, number | undefined> = { ...inputValues }

  // Résolution itérative simple (le graphe est petit et acyclique) : on boucle jusqu'à ce que
  // toutes les valeurs soient connues ou qu'on ne progresse plus.
  let progressed = true
  let guard = 0
  while (progressed && guard < 20) {
    progressed = false
    guard++
    for (const port of ports) {
      if (port.kind === 'input') continue
      if (values[port.id] !== undefined) continue
      if (port.kind === 'gate' && port.gate) {
        const incoming = wires.filter((w) => w.to === port.id)
        const needed = GATE_INPUTS[port.gate]
        if (incoming.length !== needed) continue
        const inputVals = incoming.map((w) => values[w.from])
        if (inputVals.some((v) => v === undefined)) continue
        values[port.id] = evalGate(port.gate, inputVals as number[])
        progressed = true
      } else if (port.kind === 'output') {
        const incoming = wires.filter((w) => w.to === port.id)
        if (incoming.length !== 1) continue
        const v = values[incoming[0].from]
        if (v === undefined) continue
        values[port.id] = v
        progressed = true
      }
    }
  }

  const out = ports.find((p) => p.kind === 'output')
  if (!out) return null
  return values[out.id] ?? null
}

/** Génère toutes les combinaisons possibles 0/1 pour les entrées d'un niveau. */
export function allInputCombos(inputIds: string[]): Record<string, number>[] {
  const n = inputIds.length
  const combos: Record<string, number>[] = []
  for (let mask = 0; mask < 1 << n; mask++) {
    const combo: Record<string, number> = {}
    inputIds.forEach((id, i) => {
      combo[id] = (mask >> i) & 1
    })
    combos.push(combo)
  }
  return combos
}

/**
 * Vérifie si le circuit posé par le joueur est correct : il doit calculer EXACTEMENT la
 * fonction logique attendue (déduite du circuit "modèle" décrit par `ports`/portes du
 * niveau) pour toutes les combinaisons d'entrées. On compare donc le circuit du joueur
 * (mêmes ports, fils du joueur) vs le circuit de référence (mêmes ports, en supposant un
 * câblage "naturel" : chaque porte/sortie reçoit ses entrées dans l'ordre de définition).
 */
export function isCircuitCorrect(level: Level, wires: Wire[]): boolean {
  const inputIds = level.ports.filter((p) => p.kind === 'input').map((p) => p.id)
  const combos = allInputCombos(inputIds)

  // Circuit de référence : connexions "logiques" déduites de l'ordre des ports — chaque
  // porte/sortie consomme dans l'ordre les sorties des ports précédents qui ne sont pas
  // déjà utilisés comme source ailleurs (topologie linéaire simple, cohérente avec la
  // disposition des niveaux ci-dessus).
  const referenceWires = referenceWiring(level)

  for (const combo of combos) {
    const player = evaluateCircuit(level.ports, wires, combo)
    const reference = evaluateCircuit(level.ports, referenceWires, combo)
    if (player === null || player !== reference) return false
  }
  return true
}

/** Construit le câblage "idéal" attendu pour un niveau (utilisé pour la validation). */
export function referenceWiring(level: Level): Wire[] {
  switch (level.id) {
    case 0: // AND : in0,in1 -> g0 -> out
      return [
        { from: 'in0', to: 'g0' },
        { from: 'in1', to: 'g0' },
        { from: 'g0', to: 'out' },
      ]
    case 1: // OR
      return [
        { from: 'in0', to: 'g0' },
        { from: 'in1', to: 'g0' },
        { from: 'g0', to: 'out' },
      ]
    case 2: // NOT
      return [
        { from: 'in0', to: 'g0' },
        { from: 'g0', to: 'out' },
      ]
    case 3: // XOR
      return [
        { from: 'in0', to: 'g0' },
        { from: 'in1', to: 'g0' },
        { from: 'g0', to: 'out' },
      ]
    case 4: // NAND : (A AND B) -> NOT -> out
      return [
        { from: 'in0', to: 'g0' },
        { from: 'in1', to: 'g0' },
        { from: 'g0', to: 'g1' },
        { from: 'g1', to: 'out' },
      ]
    case 5: // (A OR B) XOR (A AND C) -> out
      return [
        { from: 'in0', to: 'g0' },
        { from: 'in1', to: 'g0' },
        { from: 'in0', to: 'g1' },
        { from: 'in2', to: 'g1' },
        { from: 'g0', to: 'g2' },
        { from: 'g1', to: 'g2' },
        { from: 'g2', to: 'out' },
      ]
    default:
      return []
  }
}
