// ─── Constantes partagées du coin Guitare ───────────────────────────────────

// Accordage standard EADGBE — fréquences à vide des 6 cordes (de la plus grave à la plus aiguë)
export const STRING_FREQS = [82.41, 110, 146.83, 196, 246.94, 329.63] as const

export const STRING_COUNT = STRING_FREQS.length

// du sillet (haut du manche) au chevalet (sur la table) — sert au positionnement des cordes
// dans `GuitarModel` et à la géométrie de chaque corde dans `GuitarString`.
export const STRING_LENGTH = 0.78
