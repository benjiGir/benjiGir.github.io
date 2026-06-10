// Registre des points d'intérêt (POI) caméra — chaque entrée décrit la position et la cible
// de `CameraControls.setLookAt`, ainsi que d'éventuelles contraintes de distance spécifiques
// (ex. zoom serré sur l'écran). `CameraRig` consomme ce registre, `Hotspot` y référence ses POI.

export type PoiId =
  | 'overview'
  | 'screen'
  | 'guitar'
  | 'workbench'
  | 'crt'
  | 'legos'
  | 'robot'

export interface PoiConfig {
  /** Position de la caméra. */
  pos: readonly [number, number, number]
  /** Point regardé. */
  target: readonly [number, number, number]
  /** Distance min à la cible (remplace `minDistance` global de CameraControls quand le POI est actif). */
  minDist?: number
  /** Distance max à la cible (idem `maxDistance`). */
  maxDist?: number
}

// Dalle écran centrée à y≈1.13, z≈-0.2
export const POIS: Record<PoiId, PoiConfig> = {
  overview: {
    pos: [0, 2.2, 4.2],
    target: [0, 0.75, 0],
  },
  screen: {
    pos: [0, 1.13, 0.85],
    target: [0, 1.13, -0.2],
    minDist: 0.4,
    maxDist: 1.2,
  },
  // Coin musique — mur gauche, près de la fenêtre (phase 3)
  guitar: {
    pos: [-2.6, 1.3, 1.4],
    target: [-3.6, 1.0, 1.6],
    minDist: 0.8,
    maxDist: 2.5,
  },
  // Coin atelier — mur du fond droit (phase 4)
  workbench: {
    pos: [1.4, 1.4, -2.0],
    target: [2.4, 1.0, -3.6],
    minDist: 0.8,
    maxDist: 2.5,
  },
  // Coin jeu — mur du fond gauche, TV CRT (phase 5)
  crt: {
    pos: [-1.4, 1.2, -2.0],
    target: [-2.4, 0.6, -3.6],
    minDist: 0.8,
    maxDist: 2.5,
  },
  // Coin legos — premier plan droit (phase 6)
  legos: {
    pos: [1.6, 1.4, 2.4],
    target: [2.6, 0.6, 1.2],
    minDist: 0.8,
    maxDist: 2.5,
  },
  // Tapis — robot NAO (phase 2)
  robot: {
    pos: [0.9, 1.0, 1.2],
    target: [0.5, 0.3, 0.6],
    minDist: 0.6,
    maxDist: 2,
  },
}
