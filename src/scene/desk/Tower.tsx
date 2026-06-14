import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { usePowerStore } from '@/store/usePowerStore'
import { playClick } from '@/lib/audio'
import Editable from '@/editor/Editable'

// ─── Tower ────────────────────────────────────────────────────────────────────

export function Tower() {
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
    <Editable id="tower" label="Tour" position={[0.48, 0.97, -0.17]}>
      <mesh name="Tower_Body" castShadow receiveShadow>
        <boxGeometry args={[0.18, 0.44, 0.38]} />
        <meshStandardMaterial color="#1e1e1e" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Bouton power — face avant. Allume depuis l'arrêt, éteint depuis l'allumage. */}
      <mesh
        name="Tower_PowerButton"
        position={[0, 0.12, 0.193]}
        rotation={[Math.PI / 2, 0, 0]}
        onClick={
          !isTransitioning
            ? () => {
                playClick()
                pressPower()
              }
            : undefined
        }
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
    </Editable>
  )
}
