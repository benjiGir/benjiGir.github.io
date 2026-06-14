import { useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useLegoStore } from '@/store/useLegoStore'
import { playClick } from '@/lib/audio'
import {
  CAR_STEPS,
  CAR_TOTAL_STEPS,
  COLORS,
  FALL_HEIGHT,
  PLATE_CENTER,
  PLATE_SIZE,
  PLATE_THICKNESS,
  hideBrickInstance,
  setBrickInstance,
  stepOffsets,
  type BrickDef,
  type WheelDef,
} from './bricks'

// ─── Plateau de montage (voiture progressive) ────────────────────────────────────

interface BuildPlateProps {
  active: boolean
}

export function BuildPlate({ active }: BuildPlateProps) {
  const step = useLegoStore((s) => s.step)
  const next = useLegoStore((s) => s.next)

  const brickMeshRef = useRef<THREE.InstancedMesh>(null)
  const studMeshRef = useRef<THREE.InstancedMesh>(null)
  const wheelRefs = useRef<(THREE.Mesh | null)[]>([])

  // Liste plate des briques/roues (toutes étapes confondues) + nombre total de tenons.
  const {
    allBricks,
    allWheels,
    totalStuds,
    studIndicesPerBrick,
    brickStepRanges,
    wheelStepRanges,
  } = useMemo(() => {
    const bricks: BrickDef[] = []
    const wheels: WheelDef[] = []
    const studIndicesPerBrick: number[][] = []
    const brickStepRanges: Array<[number, number]> = []
    const wheelStepRanges: Array<[number, number]> = []
    let studCursor = 0
    for (const carStep of CAR_STEPS) {
      const brickStart = bricks.length
      for (const b of carStep.bricks) {
        bricks.push(b)
        const count = b.height > 0 ? b.studsX * b.studsZ : 0
        const indices: number[] = []
        for (let k = 0; k < count; k++) indices.push(studCursor++)
        studIndicesPerBrick.push(indices)
      }
      brickStepRanges.push([brickStart, bricks.length])

      const wheelStart = wheels.length
      for (const w of carStep.wheels) wheels.push(w)
      wheelStepRanges.push([wheelStart, wheels.length])
    }
    return {
      allBricks: bricks,
      allWheels: wheels,
      totalStuds: studCursor,
      studIndicesPerBrick,
      brickStepRanges,
      wheelStepRanges,
    }
  }, [])

  // Initialisées à FALL_HEIGHT : tant qu'aucune étape n'est validée (step === 0), toutes les
  // pièces sont "hors champ" sans animation parasite au montage.
  const brickOffsetsRef = useRef(new Float32Array(allBricks.length).fill(FALL_HEIGHT))
  const wheelOffsetsRef = useRef(new Float32Array(allWheels.length).fill(FALL_HEIGHT))
  // Objet réutilisé pour `damp()` (qui mute `obj[prop]`) — évite une allocation par pièce/frame
  const dampObjRef = useRef({ v: 0 })

  useFrame((_, delta) => {
    const brickMesh = brickMeshRef.current
    const studMesh = studMeshRef.current
    if (!brickMesh) return

    const visibleBricks = step === 0 ? 0 : brickStepRanges[step - 1][1]
    const visibleWheels = step === 0 ? 0 : wheelStepRanges[step - 1][1]

    stepOffsets(brickOffsetsRef.current, visibleBricks, delta, dampObjRef.current)
    stepOffsets(wheelOffsetsRef.current, visibleWheels, delta, dampObjRef.current)

    for (let i = 0; i < allBricks.length; i++) {
      const brick = allBricks[i]
      const visible = i < visibleBricks
      if (!visible) {
        // Brique pas encore révélée : la place hors champ (sous le plateau, invisible)
        hideBrickInstance(brickMesh, studMesh, i, studIndicesPerBrick[i])
        continue
      }
      const offset = brickOffsetsRef.current[i]
      setBrickInstance(brickMesh, studMesh, i, studIndicesPerBrick[i], brick, offset)
    }

    brickMesh.instanceMatrix.needsUpdate = true
    if (brickMesh.instanceColor) brickMesh.instanceColor.needsUpdate = true
    if (studMesh) {
      studMesh.instanceMatrix.needsUpdate = true
      if (studMesh.instanceColor) studMesh.instanceColor.needsUpdate = true
    }

    // Roues (meshes individuels — seulement 4, pas d'instancing nécessaire)
    for (let i = 0; i < allWheels.length; i++) {
      const wheelMesh = wheelRefs.current[i]
      if (!wheelMesh) continue
      const visible = i < visibleWheels
      const wheel = allWheels[i]
      if (!visible) {
        wheelMesh.visible = false
        continue
      }
      wheelMesh.visible = true
      wheelMesh.position.set(wheel.pos[0], wheel.pos[1] + wheelOffsetsRef.current[i], wheel.pos[2])
    }
  })

  function handlePlateClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    if (!active) return
    if (step >= CAR_TOTAL_STEPS) return
    playClick()
    next(CAR_TOTAL_STEPS)
  }

  return (
    <group
      position={PLATE_CENTER}
      onClick={handlePlateClick}
      onPointerOver={() => {
        if (active && step < CAR_TOTAL_STEPS) document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
      }}
    >
      {/* Plaque de base verte */}
      <mesh position={[0, -PLATE_THICKNESS / 2, 0]} receiveShadow>
        <boxGeometry args={[PLATE_SIZE[0], PLATE_THICKNESS, PLATE_SIZE[1]]} />
        <meshStandardMaterial color={COLORS.green} roughness={0.7} />
      </mesh>
      {/* Briques du modèle (instanciées) */}
      <instancedMesh
        ref={brickMeshRef}
        args={[undefined, undefined, allBricks.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.4} />
      </instancedMesh>
      {/* Tenons des briques (instanciés) */}
      {totalStuds > 0 && (
        <instancedMesh ref={studMeshRef} args={[undefined, undefined, totalStuds]} castShadow>
          <cylinderGeometry args={[1, 1, 1, 12]} />
          <meshStandardMaterial roughness={0.4} />
        </instancedMesh>
      )}
      {/* Roues (4 cylindres couchés, initialement invisibles) */}
      {allWheels.map((wheel, i) => (
        <mesh
          key={i}
          ref={(m) => {
            wheelRefs.current[i] = m
          }}
          rotation={[0, 0, Math.PI / 2]}
          visible={false}
          castShadow
        >
          <cylinderGeometry args={[wheel.radius, wheel.radius, wheel.width, 16]} />
          <meshStandardMaterial color={wheel.color} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}
