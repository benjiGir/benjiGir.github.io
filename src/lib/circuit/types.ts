// Types du modèle de circuit du Circuit Lab.
//
// Un niveau définit un ensemble de "ports" (entrées, portes logiques, sortie). Le joueur
// relie les ports entre eux par des fils (clic-clic : sélectionner un port de départ puis
// un port d'arrivée). Le circuit est résolu quand la sortie vaut 1 pour TOUTES les
// combinaisons d'entrées listées dans `truthTable` une fois les bonnes connexions faites
// — en pratique on vérifie juste que le graphe de connexions calcule la bonne table de
// vérité pour la fonction logique cible.

export type GateType = 'AND' | 'OR' | 'NOT' | 'XOR'

export interface PortDef {
  id: string
  label: string
  kind: 'input' | 'gate' | 'output'
  gate?: GateType
  /** Position dans la grille SVG (colonnes/lignes arbitraires, en unités de 60px). */
  col: number
  row: number
}

export interface Wire {
  from: string
  to: string
}

export interface Level {
  id: number
  title: string
  description: string
  ports: PortDef[]
}
