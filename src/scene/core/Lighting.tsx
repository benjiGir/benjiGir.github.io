import { Environment } from '@react-three/drei'

// ─── Lighting ─────────────────────────────────────────────────────────────────
// Éclairage motivé par de vrais éléments de la pièce (cf. Room.tsx) plutôt que des sources
// génériques : la fenêtre du mur gauche (seule ouverture, centrée en [-3.96, 1.5, 1.5], éclaire
// vers +X) tient lieu de key light "lumière du jour" ; un ambiant/Environment bas laisse cette
// source — plus la lampe de bureau (DeskLampModel) et la dalle du moniteur (Monitor) — créer du
// contraste et des ombres lisibles au lieu d'une pièce plate "lumineuse de partout".

export default function Lighting() {
  return (
    <>
      {/* Ambiant très bas — juste de quoi garder les zones d'ombre lisibles (pas noir total),
          le gros du fill vient maintenant de l'Environment et des rebonds visuels attendus. */}
      <ambientLight intensity={0.12} />

      {/* Key — lumière du jour motivée par la fenêtre du mur gauche. Placée juste à l'extérieur
          de l'ouverture, vise vers +X (intérieur de la pièce). Frustum d'ombre recentré sur la
          zone bureau (groupe décalé en z=-1.3 dans DeskScene) tout en couvrant la fenêtre. */}
      <directionalLight
        position={[-5.5, 3.2, 1.8]}
        target-position={[0, 0.9, -0.8]}
        intensity={2.2}
        color="#fff4e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={14}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />

      {/* Fill très atténué — rattrapage doux des faces non éclairées par la fenêtre, pas une
          deuxième source qui remplit la pièce (pas de GI réelle ici, donc on évite le noir dur
          sur les faces opposées sans pour autant aplatir le rendu). */}
      <directionalLight position={[2, 2.5, -2]} intensity={0.18} color="#aabfff" />

      {/* Environment HDRI conservé pour les reflets/IBL sur les matériaux mais très dosé pour ne
          pas remplir la pièce d'un fill plat — environmentIntensity dispo en drei ^10 (three
          ≥0.163, vérifié sur la version installée). */}
      <Environment preset="apartment" environmentIntensity={0.2} />
    </>
  )
}
