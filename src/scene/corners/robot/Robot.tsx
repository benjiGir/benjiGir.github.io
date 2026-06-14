import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Hotspot from '@/scene/camera/Hotspot'
import { useCameraStore } from '@/store/useCameraStore'
import { playServo } from '@/lib/audio'
import { RobotModel } from './RobotModel'
import type { RobotModelHandle } from './types'

// Limite l'amplitude du suivi du regard (radians)
const HEAD_LOOK_LIMIT = 0.5

// Vecteurs temporaires réutilisés à chaque frame (pas d'allocation dans useFrame)
const tmpDir = new THREE.Vector3()
const tmpHeadPos = new THREE.Vector3()

// ─── Robot ───────────────────────────────────────────────────────────────────
//
// Enveloppe `RobotModel` (géométrie + animation, partagée avec la mini-scène de feedback de
// RobotLab) avec les aspects propres à la scène principale : zone cliquable (Hotspot/POI) et
// suivi du regard de la tête vers le pointeur lorsque le POI 'robot' est actif.

export default function Robot() {
  const modelRef = useRef<RobotModelHandle>(null)
  const { camera, pointer } = useThree()

  const activePoi = useCameraStore((s) => s.poi)
  const poiActive = activePoi === 'robot'

  useFrame(() => {
    const model = modelRef.current
    if (!model || !model.head) return

    let targetYaw = 0
    let targetPitch = 0
    if (poiActive) {
      // Projette le pointeur écran dans un plan devant la tête pour estimer une direction de regard
      tmpDir.set(pointer.x, pointer.y, 0.5).unproject(camera)
      model.head.getWorldPosition(tmpHeadPos)
      tmpDir.sub(tmpHeadPos)
      targetYaw = THREE.MathUtils.clamp(
        Math.atan2(tmpDir.x, tmpDir.z),
        -HEAD_LOOK_LIMIT,
        HEAD_LOOK_LIMIT
      )
      targetPitch = THREE.MathUtils.clamp(
        -tmpDir.y * 0.4,
        -HEAD_LOOK_LIMIT * 0.6,
        HEAD_LOOK_LIMIT * 0.6
      )
    }

    model.gaze.current.yaw = targetYaw
    model.gaze.current.pitch = targetPitch
  })

  function handleClick() {
    playServo()
  }

  return (
    <Hotspot poi="robot" label="Robot NAO" position={[0, 0, 0]}>
      <group onClick={handleClick}>
        <RobotModel ref={modelRef} />
      </group>
    </Hotspot>
  )
}
