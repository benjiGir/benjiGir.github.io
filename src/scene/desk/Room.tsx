import { Geometry, Base, Subtraction } from '@react-three/csg'
import * as THREE from 'three'
import Editable from '@/editor/Editable'

// ─── Room ─────────────────────────────────────────────────────────────────────

// Livres : [largeur, hauteur, couleur]
const BOOKS: [number, number, string][] = [
  [0.04, 0.22, '#c0392b'],
  [0.035, 0.18, '#2980b9'],
  [0.05, 0.25, '#27ae60'],
  [0.03, 0.2, '#e67e22'],
  [0.045, 0.16, '#8e44ad'],
  [0.04, 0.21, '#d4ac0d'],
  [0.035, 0.17, '#1a5276'],
  [0.05, 0.23, '#922b21'],
]

export function Room() {
  const wallColor = '#b8b2aa'
  const baseboardColor = '#e8e4de'
  const wallRoughness = 0.95
  const wallThickness = 0.08

  // Calcul du décalage X cumulé pour aligner les livres sur l'étagère
  let bookOffsetX = 0

  return (
    <group>
      {/* ── Mur du fond (Z = -4) ── */}
      <mesh position={[0, 1.5, -4]} receiveShadow>
        <boxGeometry args={[8.16, 3, wallThickness]} />
        <meshStandardMaterial color={wallColor} roughness={wallRoughness} metalness={0} />
      </mesh>

      {/* ── Mur gauche (X = -4) — CSG : mur plein moins l'ouverture de fenêtre ── */}
      <mesh position={[-4, 1.5, 0]} receiveShadow>
        <Geometry>
          {/* Mur complet */}
          <Base>
            <boxGeometry args={[0.08, 3, 8]} />
          </Base>
          {/* Découpe fenêtre — légèrement plus épais que le mur pour une coupe nette */}
          <Subtraction position={[0, 0, 1.5]}>
            <boxGeometry args={[0.12, 1.0, 0.76]} />
          </Subtraction>
        </Geometry>
        <meshStandardMaterial color={wallColor} roughness={wallRoughness} metalness={0} />
      </mesh>

      {/* ── Plinthes ── */}
      {/* Plinthe mur du fond */}
      <mesh position={[0, 0.06, -3.96]} receiveShadow>
        <boxGeometry args={[8.16, 0.12, 0.02]} />
        <meshStandardMaterial color={baseboardColor} roughness={0.8} metalness={0} />
      </mesh>
      {/* Plinthe mur gauche */}
      <mesh position={[-3.96, 0.06, 0]} receiveShadow>
        <boxGeometry args={[0.02, 0.12, 8]} />
        <meshStandardMaterial color={baseboardColor} roughness={0.8} metalness={0} />
      </mesh>

      {/* ── Tapis du robot — zone dégagée à droite, grille 6×6 (voir useRobotStore) ── */}
      {/* Décalé sur X pour ne plus être dans l'axe caméra↔bureau (x=0) */}
      <mesh position={[0.6, 0.005, 2.6]} receiveShadow>
        <boxGeometry args={[1.6, 0.01, 1.6]} />
        <meshStandardMaterial color="#5b6b7a" roughness={0.95} metalness={0} />
      </mesh>

      {/* ── Étagère murale sur le mur gauche ── */}
      <Editable id="shelf" label="Étagère">
        {/* Planche de l'étagère */}
        <mesh position={[-3.88, 1.6, -2.0]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 0.04, 0.8]} />
          <meshStandardMaterial color="#7a5c3a" roughness={0.7} metalness={0.05} />
        </mesh>
        {/* Tasseau de fixation */}
        <mesh position={[-3.97, 1.56, -2.0]} receiveShadow>
          <boxGeometry args={[0.02, 0.08, 0.7]} />
          <meshStandardMaterial color="#5c4020" roughness={0.8} metalness={0.05} />
        </mesh>
        {/* Livres sur l'étagère */}
        {BOOKS.map(([w, h, color], i) => {
          const x = bookOffsetX + w / 2
          bookOffsetX += w + 0.008
          return (
            <mesh
              key={i}
              // Les livres sont centrés sur la longueur de l'étagère (axe Z ici = axe Y monde)
              position={[-3.84, 1.62 + h / 2, -2.32 + x]}
              castShadow
            >
              <boxGeometry args={[0.06, h, w]} />
              <meshStandardMaterial color={color} roughness={0.8} metalness={0} />
            </mesh>
          )
        })}
      </Editable>

      {/* ── Cadre photo sur le mur du fond ── */}
      <Editable id="photo" label="Cadre photo">
        {/* Cadre extérieur */}
        <mesh position={[-1.2, 1.7, -3.96]} castShadow>
          <boxGeometry args={[0.42, 0.32, 0.025]} />
          <meshStandardMaterial color="#5c4020" roughness={0.6} metalness={0.1} />
        </mesh>
        {/* Passeport intérieur (couleur claire) */}
        <mesh position={[-1.2, 1.7, -3.948]}>
          <boxGeometry args={[0.36, 0.26, 0.01]} />
          <meshStandardMaterial color="#c8bfb0" roughness={0.9} metalness={0} />
        </mesh>
        {/* Zone photo (gris-bleu évocateur) */}
        <mesh position={[-1.2, 1.7, -3.942]}>
          <boxGeometry args={[0.3, 0.2, 0.008]} />
          <meshStandardMaterial color="#7a8fa6" roughness={0.8} metalness={0} />
        </mesh>
      </Editable>

      {/* ── Plante d'intérieur — coin gauche-fond ── */}
      <Editable id="plant" label="Plante">
        {/* Pot */}
        <mesh position={[-3.5, 0.0, -3.5]} castShadow receiveShadow>
          <cylinderGeometry args={[0.12, 0.09, 0.22, 20]} />
          <meshStandardMaterial color="#a0522d" roughness={0.8} metalness={0} />
        </mesh>
        {/* Terre */}
        <mesh position={[-3.5, 0.115, -3.5]} receiveShadow>
          <cylinderGeometry args={[0.11, 0.11, 0.01, 20]} />
          <meshStandardMaterial color="#3d2b1f" roughness={0.95} metalness={0} />
        </mesh>
        {/* Tronc */}
        <mesh position={[-3.5, 0.42, -3.5]} castShadow>
          <cylinderGeometry args={[0.025, 0.035, 0.42, 12]} />
          <meshStandardMaterial color="#5c4020" roughness={0.85} metalness={0} />
        </mesh>
        {/* Feuillage — sphère principale */}
        <mesh position={[-3.5, 0.78, -3.5]} castShadow>
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshStandardMaterial color="#2d5a27" roughness={0.85} metalness={0} />
        </mesh>
        {/* Feuillage — lobes latéraux pour plus de volume */}
        <mesh position={[-3.68, 0.72, -3.5]} castShadow>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial color="#234d1e" roughness={0.85} metalness={0} />
        </mesh>
        <mesh position={[-3.5, 0.72, -3.68]} castShadow>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshStandardMaterial color="#2a5424" roughness={0.85} metalness={0} />
        </mesh>
      </Editable>

      {/* ── Fenêtre sur le mur gauche ── */}
      {/* 4 bandes formant un vrai cadre creux (ouverture centrale 0.64m × 0.88m) */}
      <Editable id="window" label="Fenêtre">
        {/* Bande haute */}
        <mesh position={[-3.96, 1.97, 1.5]} castShadow>
          <boxGeometry args={[0.04, 0.06, 0.76]} />
          <meshStandardMaterial color="#ccc8c0" roughness={0.6} metalness={0.05} />
        </mesh>
        {/* Bande basse */}
        <mesh position={[-3.96, 1.03, 1.5]} castShadow>
          <boxGeometry args={[0.04, 0.06, 0.76]} />
          <meshStandardMaterial color="#ccc8c0" roughness={0.6} metalness={0.05} />
        </mesh>
        {/* Bande gauche */}
        <mesh position={[-3.96, 1.5, 1.15]} castShadow>
          <boxGeometry args={[0.04, 0.88, 0.06]} />
          <meshStandardMaterial color="#ccc8c0" roughness={0.6} metalness={0.05} />
        </mesh>
        {/* Bande droite */}
        <mesh position={[-3.96, 1.5, 1.85]} castShadow>
          <boxGeometry args={[0.04, 0.88, 0.06]} />
          <meshStandardMaterial color="#ccc8c0" roughness={0.6} metalness={0.05} />
        </mesh>
        {/* Vitre translucide — DoubleSide pour être visible depuis les deux côtés */}
        <mesh position={[-3.94, 1.5, 1.5]}>
          <boxGeometry args={[0.01, 0.88, 0.64]} />
          <meshStandardMaterial
            color="#d4eaf7"
            roughness={0.05}
            transparent
            opacity={0.22}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Croisillon horizontal */}
        <mesh position={[-3.955, 1.5, 1.5]}>
          <boxGeometry args={[0.04, 0.03, 0.64]} />
          <meshStandardMaterial color="#ccc8c0" roughness={0.6} metalness={0.05} />
        </mesh>
        {/* Croisillon vertical */}
        <mesh position={[-3.955, 1.5, 1.5]}>
          <boxGeometry args={[0.04, 0.88, 0.03]} />
          <meshStandardMaterial color="#ccc8c0" roughness={0.6} metalness={0.05} />
        </mesh>
      </Editable>

      {/* ── Zones réservées (phase 1 : espace vide, mobilier ajouté en phases ultérieures) ── */}
      {/* Coin atelier — mur du fond droit : établi électronique + oscilloscope, voir <Workbench /> */}
      {/* Coin musique — mur gauche, juste après la fenêtre : guitare sur stand, voir <Guitar /> */}
    </group>
  )
}
