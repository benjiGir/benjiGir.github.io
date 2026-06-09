import { useRef, useState } from 'react'
import { Geometry, Base, Subtraction } from '@react-three/csg'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { usePowerStore } from '@/store/usePowerStore'
import { useDeskStore } from '@/store/useDeskStore'
import { useScreenStore } from '@/store/useScreenStore'
import { playClick } from '@/lib/audio'

// ─── Floor ────────────────────────────────────────────────────────────────────

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[12, 12]} />
      <meshStandardMaterial color="#b0a89a" roughness={0.9} metalness={0.0} />
    </mesh>
  )
}

// ─── Desk frame (static) ──────────────────────────────────────────────────────

function DeskFrame() {
  const legPositions: [number, number, number][] = [
    [0.64, 0.375, 0.32],
    [-0.64, 0.375, 0.32],
    [0.64, 0.375, -0.32],
    [-0.64, 0.375, -0.32],
  ]
  return (
    <>
      {legPositions.map((pos, i) => (
        <mesh key={i} position={pos} castShadow receiveShadow>
          <boxGeometry args={[0.05, 0.72, 0.05]} />
          <meshStandardMaterial color="#444444" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
    </>
  )
}

// ─── Sit-stand toggle button ───────────────────────────────────────────────────

function SitStandPanel() {
  const [hovered, setHovered] = useState(false)
  const { isStanding, toggleHeight } = useDeskStore()

  return (
    <mesh
      position={[0.668, 0.45, 0.32]}
      onClick={() => { playClick(); toggleHeight() }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer'
        setHovered(true)
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
        setHovered(false)
      }}
    >
      <boxGeometry args={[0.015, 0.04, 0.03]} />
      <meshStandardMaterial
        color={isStanding ? '#3399ff' : hovered ? '#aaaaaa' : '#888888'}
        roughness={0.3}
        metalness={0.7}
        emissive={isStanding ? '#0055cc' : '#000000'}
        emissiveIntensity={isStanding ? 0.6 : 0}
      />
    </mesh>
  )
}

// ─── Desk top ─────────────────────────────────────────────────────────────────

function DeskTop() {
  return (
    <mesh position={[0, 0.735, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.4, 0.03, 0.7]} />
      <meshStandardMaterial color="#7a5c3a" roughness={0.6} metalness={0.05} />
    </mesh>
  )
}

// ─── Monitor ──────────────────────────────────────────────────────────────────

function Monitor() {
  const power = usePowerStore((s) => s.power)
  const setDockedEl = useScreenStore((s) => s.setDockedEl)
  const isFullscreen = useScreenStore((s) => s.isFullscreen)
  const screenMatRef = useRef<THREE.MeshStandardMaterial>(null)

  useFrame((_, delta) => {
    if (!screenMatRef.current) return
    // Fondu progressif vers le noir pendant l'extinction plutôt qu'un saut brutal à 'off'
    const target =
      power === 'off' || power === 'shuttingDown' ? 0 : power === 'on' ? 1.2 : 0.6
    screenMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      screenMatRef.current.emissiveIntensity,
      target,
      1 - Math.exp(-delta * 2.5)
    )
  })

  return (
    <group position={[0, 0, -0.2]}>
      {/* Stand base */}
      <mesh position={[0, 0.76, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.28, 0.02, 0.16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Stand column */}
      <mesh position={[0, 0.84, 0]} castShadow>
        <boxGeometry args={[0.04, 0.16, 0.04]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Bezel */}
      <mesh position={[0, 1.13, 0]} castShadow>
        <boxGeometry args={[0.75, 0.45, 0.04]} />
        <meshStandardMaterial color="#111111" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Dalle (Monitor_Screen) */}
      <mesh name="Monitor_Screen" position={[0, 1.13, 0.022]}>
        <boxGeometry args={[0.685, 0.385, 0.001]} />
        <meshStandardMaterial
          ref={screenMatRef}
          color="#04040e"
          emissive="#a0b4ff"
          emissiveIntensity={0}
          roughness={0.05}
          metalness={0.1}
        />
      </mesh>
      {/* Conteneur cible du portail d'écran — ScreenContent y est projeté par <ScreenPortal />, ce qui
          le garde monté en permanence (état OS préservé) lors des bascules plein écran. */}
      {power !== 'off' && (
        <Html
          transform
          scale={0.0215}
          position={[0, 1.13, 0.025]}
          pointerEvents={isFullscreen ? 'none' : 'auto'}
        >
          <div
            ref={(el) => setDockedEl(el)}
            style={{ width: 1280, height: 720, overflow: 'hidden', borderRadius: 4 }}
          />
        </Html>
      )}
    </group>
  )
}

// ─── Keyboard ─────────────────────────────────────────────────────────────────

function Keyboard() {
  return (
    <group position={[-0.05, 0.755, 0.16]} rotation={[-0.05, 0, 0]}>
      {/* Châssis */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.32, 0.015, 0.12]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Touches — grille simplifiée pour suggérer le clavier sans surcharger la scène */}
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 12 }).map((_, col) => (
          <mesh
            key={`${row}-${col}`}
            position={[-0.135 + col * 0.024, 0.011, -0.04 + row * 0.024]}
            castShadow
          >
            <boxGeometry args={[0.02, 0.006, 0.02]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.1} />
          </mesh>
        ))
      )}
    </group>
  )
}

// ─── Mouse ────────────────────────────────────────────────────────────────────

function Mouse() {
  return (
    <mesh
      position={[0.18, 0.7605, 0.18]}
      rotation={[0, 0.3, 0]}
      scale={[1, 0.6, 1.4]}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[0.025, 16, 16]} />
      <meshStandardMaterial color="#333333" roughness={0.5} metalness={0.2} />
    </mesh>
  )
}

// ─── Desk lamp ────────────────────────────────────────────────────────────────

function DeskLamp() {
  const ARM_LEN = 0.24
  const HEAD_LEN = 0.1

  return (
    // Coin arrière-gauche du plateau — en symétrie avec la tour (arrière-droite),
    // loin du moniteur, du clavier et de la souris.
    <group position={[-0.55, 0.75, -0.27]}>
      {/* Base */}
      <mesh position={[0, 0.01, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.07, 0.08, 0.02, 24]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Colonne verticale — chaque pièce est chaînée à l'extrémité de la précédente
          via des groupes imbriqués, pour éviter tout décalage entre les segments. */}
      <group position={[0, 0.02, 0]}>
        <mesh position={[0, 0.14, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.28, 16]} />
          <meshStandardMaterial color="#1e1e1e" roughness={0.4} metalness={0.7} />
        </mesh>

        {/* Bras articulé — pivote depuis le sommet de la colonne, incliné vers le plateau */}
        <group position={[0, 0.28, 0]} rotation={[1.1, 0, -0.5]}>
          <mesh position={[0, ARM_LEN / 2, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, ARM_LEN, 16]} />
            <meshStandardMaterial color="#1e1e1e" roughness={0.4} metalness={0.7} />
          </mesh>

          {/* Tête / abat-jour — fixée à l'extrémité du bras, ouverture vers le plateau */}
          <group position={[0, 0.3, 0]}>
            <mesh position={[0, -HEAD_LEN / 2, 0]} rotation={[-1.5, 0, 0.5]} castShadow>
              <coneGeometry args={[0.05, HEAD_LEN, 24, 1, true]} />
              <meshStandardMaterial
                color="#1a1a1a"
                roughness={0.5}
                metalness={0.5}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Source lumineuse chaude projetée par l'ampoule — intensité modérée pour
                ne pas écraser l'éclairage global défini dans Lighting.tsx */}
            <spotLight
              position={[0, -HEAD_LEN, 0]}
              target-position={[0, -1, 0.3]}
              color="#ffd9a0"
              intensity={2.5}
              angle={0.5}
              penumbra={0.6}
              decay={2}
              distance={1.5}
              castShadow
            />
          </group>
        </group>
      </group>
    </group>
  )
}

// ─── Tower ────────────────────────────────────────────────────────────────────

function Tower() {
  const [hovered, setHovered] = useState(false)
  const power = usePowerStore((s) => s.power)
  const pressPower = usePowerStore((s) => s.pressPower)
  const ledMatRef = useRef<THREE.MeshStandardMaterial>(null)

  const ledColor = '#00ff44'
  // Clignotement façon POST : uniquement pendant le démarrage
  const isBooting = power === 'bios' || power === 'booting'
  // Bouton power inerte pendant toute transition en cours (démarrage ou extinction)
  const isTransitioning = isBooting || power === 'shuttingDown'

  useFrame(({ clock }, delta) => {
    if (!ledMatRef.current) return
    if (isBooting) {
      // Clignotement temporel (basé sur l'horloge, pas sur le delta/frame-rate) pour rester
      // cohérent quel que soit le fps de la machine.
      ledMatRef.current.emissiveIntensity = Math.sin(clock.elapsedTime * 9) > 0 ? 5 : 0
    } else {
      const target = power === 'on' ? 3 : 0
      ledMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        ledMatRef.current.emissiveIntensity,
        target,
        1 - Math.exp(-delta * 4)
      )
    }
  })

  return (
    <group position={[0.48, 0.97, -0.17]}>
      <mesh name="Tower_Body" castShadow receiveShadow>
        <boxGeometry args={[0.18, 0.44, 0.38]} />
        <meshStandardMaterial color="#1e1e1e" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Bouton power — face avant. Allume depuis l'arrêt, éteint depuis l'allumage. */}
      <mesh
        name="Tower_PowerButton"
        position={[0, 0.12, 0.193]}
        rotation={[Math.PI / 2, 0, 0]}
        onClick={!isTransitioning ? () => { playClick(); pressPower() } : undefined}
        onPointerOver={() => {
          if (!isTransitioning) document.body.style.cursor = 'pointer'
          setHovered(true)
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
          setHovered(false)
        }}
        castShadow
      >
        <cylinderGeometry args={[0.012, 0.012, 0.008, 16]} />
        <meshStandardMaterial
          color={hovered && !isTransitioning ? '#ffffff' : '#cccccc'}
          roughness={0.2}
          metalness={0.9}
          emissive={hovered && !isTransitioning ? '#ffffff' : '#000000'}
          emissiveIntensity={hovered && !isTransitioning ? 0.4 : 0}
        />
        {/* Info-bulle au survol — indique l'action effectuée par le bouton */}
        {hovered && !isTransitioning && (
          <Html position={[0, 0, -0.05]} center style={{ pointerEvents: 'none' }}>
            <div
              style={{
                padding: '4px 9px',
                borderRadius: 6,
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.9)',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: 0.3,
                whiteSpace: 'nowrap',
                userSelect: 'none',
              }}
            >
              {power === 'off' ? 'Allumer' : 'Éteindre'}
            </div>
          </Html>
        )}
      </mesh>
      {/* LED — face avant */}
      <mesh name="Tower_LED" position={[0.05, 0.12, 0.193]}>
        <sphereGeometry args={[0.008, 12, 12]} />
        <meshStandardMaterial
          ref={ledMatRef}
          color={ledColor}
          emissive={ledColor}
          emissiveIntensity={0}
        />
      </mesh>
    </group>
  )
}

// ─── Lift group ───────────────────────────────────────────────────────────────

function DeskLiftGroup() {
  const ref = useRef<THREE.Group>(null)
  const isStanding = useDeskStore((s) => s.isStanding)

  useFrame((_, delta) => {
    if (!ref.current) return
    const target = isStanding ? 0.3 : 0
    ref.current.position.y = THREE.MathUtils.lerp(
      ref.current.position.y,
      target,
      1 - Math.exp(-delta * 3)
    )
  })

  return (
    <group ref={ref}>
      <DeskTop />
      <Monitor />
      <Tower />
      <Keyboard />
      <Mouse />
      <DeskLamp />
    </group>
  )
}

// ─── Room ─────────────────────────────────────────────────────────────────────

// Livres : [largeur, hauteur, couleur]
const BOOKS: [number, number, string][] = [
  [0.04, 0.22, '#c0392b'],
  [0.035, 0.18, '#2980b9'],
  [0.05, 0.25, '#27ae60'],
  [0.03, 0.20, '#e67e22'],
  [0.045, 0.16, '#8e44ad'],
  [0.04, 0.21, '#d4ac0d'],
  [0.035, 0.17, '#1a5276'],
  [0.05, 0.23, '#922b21'],
]

function Room() {
  const wallColor = '#b8b2aa'
  const baseboardColor = '#e8e4de'
  const wallRoughness = 0.95
  const wallThickness = 0.08

  // Calcul du décalage X cumulé pour aligner les livres sur l'étagère
  let bookOffsetX = 0

  return (
    <group>
      {/* ── Mur du fond (Z = -3) ── */}
      <mesh position={[0, 1.5, -3]} receiveShadow>
        <boxGeometry args={[6.16, 3, wallThickness]} />
        <meshStandardMaterial color={wallColor} roughness={wallRoughness} metalness={0} />
      </mesh>

      {/* ── Mur gauche (X = -3) — CSG : mur plein moins l'ouverture de fenêtre ── */}
      <mesh position={[-3, 1.5, 0]} receiveShadow>
        <Geometry>
          {/* Mur complet */}
          <Base><boxGeometry args={[0.08, 3, 6]} /></Base>
          {/* Découpe fenêtre — légèrement plus épais que le mur pour une coupe nette */}
          <Subtraction position={[0, 0, 0.8]}>
            <boxGeometry args={[0.12, 1.0, 0.76]} />
          </Subtraction>
        </Geometry>
        <meshStandardMaterial color={wallColor} roughness={wallRoughness} metalness={0} />
      </mesh>

      {/* ── Plinthes ── */}
      {/* Plinthe mur du fond */}
      <mesh position={[0, 0.06, -2.96]} receiveShadow>
        <boxGeometry args={[6.16, 0.12, 0.02]} />
        <meshStandardMaterial color={baseboardColor} roughness={0.8} metalness={0} />
      </mesh>
      {/* Plinthe mur gauche */}
      <mesh position={[-2.96, 0.06, 0]} receiveShadow>
        <boxGeometry args={[0.02, 0.12, 6]} />
        <meshStandardMaterial color={baseboardColor} roughness={0.8} metalness={0} />
      </mesh>

      {/* ── Tapis sous le bureau ── */}
      {/* Légèrement surélevé (Y=0.005) pour éviter le z-fighting avec le sol */}
      <mesh position={[0, 0.005, 0.2]} receiveShadow>
        <boxGeometry args={[2.2, 0.01, 1.8]} />
        <meshStandardMaterial color="#8b7355" roughness={0.95} metalness={0} />
      </mesh>

      {/* ── Étagère murale sur le mur gauche ── */}
      {/* Planche de l'étagère */}
      <mesh position={[-2.88, 1.6, -1.0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.04, 0.8]} />
        <meshStandardMaterial color="#7a5c3a" roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Tasseau de fixation */}
      <mesh position={[-2.97, 1.56, -1.0]} receiveShadow>
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
            position={[-2.84, 1.62 + h / 2, -1.32 + x]}
            castShadow
          >
            <boxGeometry args={[0.06, h, w]} />
            <meshStandardMaterial color={color} roughness={0.8} metalness={0} />
          </mesh>
        )
      })}

      {/* ── Cadre photo sur le mur du fond ── */}
      {/* Cadre extérieur */}
      <mesh position={[-1.2, 1.7, -2.96]} castShadow>
        <boxGeometry args={[0.42, 0.32, 0.025]} />
        <meshStandardMaterial color="#5c4020" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Passeport intérieur (couleur claire) */}
      <mesh position={[-1.2, 1.7, -2.948]}>
        <boxGeometry args={[0.36, 0.26, 0.01]} />
        <meshStandardMaterial color="#c8bfb0" roughness={0.9} metalness={0} />
      </mesh>
      {/* Zone photo (gris-bleu évocateur) */}
      <mesh position={[-1.2, 1.7, -2.942]}>
        <boxGeometry args={[0.3, 0.2, 0.008]} />
        <meshStandardMaterial color="#7a8fa6" roughness={0.8} metalness={0} />
      </mesh>

      {/* ── Plante d'intérieur — coin gauche-fond ── */}
      {/* Pot */}
      <mesh position={[-2.5, 0.0, -2.5]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.09, 0.22, 20]} />
        <meshStandardMaterial color="#a0522d" roughness={0.8} metalness={0} />
      </mesh>
      {/* Terre */}
      <mesh position={[-2.5, 0.115, -2.5]} receiveShadow>
        <cylinderGeometry args={[0.11, 0.11, 0.01, 20]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.95} metalness={0} />
      </mesh>
      {/* Tronc */}
      <mesh position={[-2.5, 0.42, -2.5]} castShadow>
        <cylinderGeometry args={[0.025, 0.035, 0.42, 12]} />
        <meshStandardMaterial color="#5c4020" roughness={0.85} metalness={0} />
      </mesh>
      {/* Feuillage — sphère principale */}
      <mesh position={[-2.5, 0.78, -2.5]} castShadow>
        <sphereGeometry args={[0.26, 16, 16]} />
        <meshStandardMaterial color="#2d5a27" roughness={0.85} metalness={0} />
      </mesh>
      {/* Feuillage — lobes latéraux pour plus de volume */}
      <mesh position={[-2.68, 0.72, -2.5]} castShadow>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#234d1e" roughness={0.85} metalness={0} />
      </mesh>
      <mesh position={[-2.5, 0.72, -2.68]} castShadow>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#2a5424" roughness={0.85} metalness={0} />
      </mesh>

      {/* ── Fenêtre sur le mur gauche ── */}
      {/* 4 bandes formant un vrai cadre creux (ouverture centrale 0.64m × 0.88m) */}
      {/* Bande haute */}
      <mesh position={[-2.96, 1.97, 0.8]} castShadow>
        <boxGeometry args={[0.04, 0.06, 0.76]} />
        <meshStandardMaterial color='#ccc8c0' roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Bande basse */}
      <mesh position={[-2.96, 1.03, 0.8]} castShadow>
        <boxGeometry args={[0.04, 0.06, 0.76]} />
        <meshStandardMaterial color='#ccc8c0' roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Bande gauche */}
      <mesh position={[-2.96, 1.5, 0.45]} castShadow>
        <boxGeometry args={[0.04, 0.88, 0.06]} />
        <meshStandardMaterial color='#ccc8c0' roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Bande droite */}
      <mesh position={[-2.96, 1.5, 1.15]} castShadow>
        <boxGeometry args={[0.04, 0.88, 0.06]} />
        <meshStandardMaterial color='#ccc8c0' roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Vitre translucide — DoubleSide pour être visible depuis les deux côtés */}
      <mesh position={[-2.94, 1.5, 0.8]}>
        <boxGeometry args={[0.01, 0.88, 0.64]} />
        <meshStandardMaterial
          color='#d4eaf7'
          roughness={0.05}
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Croisillon horizontal */}
      <mesh position={[-2.955, 1.5, 0.8]}>
        <boxGeometry args={[0.04, 0.03, 0.64]} />
        <meshStandardMaterial color='#ccc8c0' roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Croisillon vertical */}
      <mesh position={[-2.955, 1.5, 0.8]}>
        <boxGeometry args={[0.04, 0.88, 0.03]} />
        <meshStandardMaterial color='#ccc8c0' roughness={0.6} metalness={0.05} />
      </mesh>
    </group>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function DeskScene() {
  return (
    <group>
      <Floor />
      <Room />
      <DeskFrame />
      <SitStandPanel />
      <DeskLiftGroup />
    </group>
  )
}
