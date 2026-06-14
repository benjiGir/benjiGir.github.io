import { useRef } from 'react'
import { type ThreeEvent } from '@react-three/fiber'
import { RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { playClick } from '@/lib/audio'
import { BRICK_H, COLORS, TOWER_BRICK_SIZE, TOWER_COLORS, TOWER_POS } from './bricks'

// ─── Tour de briques physique (rapier) ───────────────────────────────────────────
//
// Petite tour de 5 briques empilées, posée à droite du plateau. Chaque brique = un
// `RigidBody` dynamique. Cliquer la tour applique une impulsion latérale aléatoire sur
// chaque brique, la faisant s'écrouler.
//
// ⚠️ Ne monte PAS de `<Physics>` ici : ce composant est destiné à être un enfant direct du
// `<Physics>` unique monté par l'orchestrateur `LegoCorner`.

export function PhysicsTower() {
  const bodyRefs = useRef<RapierRigidBody[]>([])

  function handleTowerClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    playClick()
    for (const body of bodyRefs.current) {
      if (!body) continue
      // Impulsion latérale aléatoire + légère poussée vers le haut → effet "écroulement".
      // Ordres de grandeur calés sur la masse d'une brique (~1.5e-4 kg à densité par défaut) :
      // impulse = masse × Δv, on vise un Δv de l'ordre de 0.3-0.6 m/s.
      const ix = (Math.random() - 0.5) * 0.00012
      const iz = (Math.random() - 0.5) * 0.00012
      body.applyImpulse({ x: ix, y: 0.00004, z: iz }, true)
    }
  }

  return (
    <group position={TOWER_POS}>
      {/* Socle fixe — posé sur la table (pas embarqué dedans), sert d'appui à la tour */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.005, 0]} receiveShadow>
          <boxGeometry args={[0.14, 0.01, 0.14]} />
          <meshStandardMaterial color={COLORS.gray} roughness={0.6} />
        </mesh>
      </RigidBody>
      {/* Briques empilées — la première repose sur le socle (top du socle à y=0.01) */}
      {TOWER_COLORS.map((color, i) => (
        <RigidBody
          key={i}
          ref={(api) => {
            if (api) bodyRefs.current[i] = api
          }}
          position={[0, 0.01 + BRICK_H / 2 + i * BRICK_H + 0.002, 0]}
          colliders="cuboid"
          restitution={0.15}
          friction={0.6}
        >
          {/* Brique simple (sans tenons décoratifs : un mesh supplémentaire générerait un
              collider "cuboid" additionnel par brique avec `colliders="cuboid"`). Le clic est
              porté par le mesh (RigidBodyProps ne type pas onClick). */}
          <mesh
            castShadow
            receiveShadow
            onClick={handleTowerClick}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = 'auto')}
          >
            <boxGeometry args={TOWER_BRICK_SIZE} />
            <meshStandardMaterial color={color} roughness={0.4} />
          </mesh>
        </RigidBody>
      ))}
    </group>
  )
}
