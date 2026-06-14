// Définition des niveaux du Circuit Lab : chaque niveau liste les ports (entrées, portes
// logiques, sortie) que le joueur doit relier par des fils pour reproduire la fonction
// logique attendue.

import type { Level } from '@/lib/circuit/types'

export const LEVELS: Level[] = [
  {
    id: 0,
    title: 'Niveau 1 — La porte AND',
    description: 'Relie les deux entrées à la porte AND, puis la porte AND à la LED.',
    ports: [
      { id: 'in0', label: 'A', kind: 'input', col: 0, row: 0 },
      { id: 'in1', label: 'B', kind: 'input', col: 0, row: 2 },
      { id: 'g0', label: 'AND', kind: 'gate', gate: 'AND', col: 1, row: 1 },
      { id: 'out', label: 'LED', kind: 'output', col: 2, row: 1 },
    ],
  },
  {
    id: 1,
    title: 'Niveau 2 — La porte OR',
    description: 'Relie les deux entrées à la porte OR, puis OR à la LED.',
    ports: [
      { id: 'in0', label: 'A', kind: 'input', col: 0, row: 0 },
      { id: 'in1', label: 'B', kind: 'input', col: 0, row: 2 },
      { id: 'g0', label: 'OR', kind: 'gate', gate: 'OR', col: 1, row: 1 },
      { id: 'out', label: 'LED', kind: 'output', col: 2, row: 1 },
    ],
  },
  {
    id: 2,
    title: 'Niveau 3 — Inverser',
    description: 'Une seule entrée : passe-la dans une porte NOT avant la LED.',
    ports: [
      { id: 'in0', label: 'A', kind: 'input', col: 0, row: 1 },
      { id: 'g0', label: 'NOT', kind: 'gate', gate: 'NOT', col: 1, row: 1 },
      { id: 'out', label: 'LED', kind: 'output', col: 2, row: 1 },
    ],
  },
  {
    id: 3,
    title: 'Niveau 4 — La porte XOR',
    description: 'Relie A et B à une porte XOR, puis XOR à la LED.',
    ports: [
      { id: 'in0', label: 'A', kind: 'input', col: 0, row: 0 },
      { id: 'in1', label: 'B', kind: 'input', col: 0, row: 2 },
      { id: 'g0', label: 'XOR', kind: 'gate', gate: 'XOR', col: 1, row: 1 },
      { id: 'out', label: 'LED', kind: 'output', col: 2, row: 1 },
    ],
  },
  {
    id: 4,
    title: 'Niveau 5 — Combinaison',
    description:
      'A ET B passent par AND, puis le résultat est inversé (NOT) avant la LED — un NAND !',
    ports: [
      { id: 'in0', label: 'A', kind: 'input', col: 0, row: 0 },
      { id: 'in1', label: 'B', kind: 'input', col: 0, row: 2 },
      { id: 'g0', label: 'AND', kind: 'gate', gate: 'AND', col: 1, row: 1 },
      { id: 'g1', label: 'NOT', kind: 'gate', gate: 'NOT', col: 2, row: 1 },
      { id: 'out', label: 'LED', kind: 'output', col: 3, row: 1 },
    ],
  },
  {
    id: 5,
    title: 'Niveau 6 — Le circuit final',
    description:
      'A et B passent par OR, A et C passent par AND. Les deux résultats passent par une dernière porte XOR avant la LED.',
    ports: [
      { id: 'in0', label: 'A', kind: 'input', col: 0, row: 0 },
      { id: 'in1', label: 'B', kind: 'input', col: 0, row: 2 },
      { id: 'in2', label: 'C', kind: 'input', col: 0, row: 4 },
      { id: 'g0', label: 'OR', kind: 'gate', gate: 'OR', col: 1, row: 1 },
      { id: 'g1', label: 'AND', kind: 'gate', gate: 'AND', col: 1, row: 3 },
      { id: 'g2', label: 'XOR', kind: 'gate', gate: 'XOR', col: 2, row: 2 },
      { id: 'out', label: 'LED', kind: 'output', col: 3, row: 2 },
    ],
  },
]
