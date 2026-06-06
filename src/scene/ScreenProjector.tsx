import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { overlayEl, innerEl } from '@/os/overlayEl'
import { usePowerStore } from '@/store/usePowerStore'

// Demi-dimensions du mesh Monitor_Screen (0.685 × 0.385 m)
const HALF_W = 0.3425
const HALF_H = 0.1925
// Taille native du contenu ScreenContent
const NATIVE_W = 685
const NATIVE_H = 385

// Vecteurs réutilisables — pas d'allocation par frame
const _center = new THREE.Vector3()
const _tl = new THREE.Vector3()
const _br = new THREE.Vector3()

export default function ScreenProjector() {
  const { camera, size, scene } = useThree()
  const power = usePowerStore((s) => s.power)

  useFrame(() => {
    if (!overlayEl) return

    if (power === 'off') {
      overlayEl.style.display = 'none'
      return
    }

    const mesh = scene.getObjectByName('Monitor_Screen')
    if (!mesh) return

    mesh.getWorldPosition(_center)

    _tl.set(_center.x - HALF_W, _center.y + HALF_H, _center.z)
    _br.set(_center.x + HALF_W, _center.y - HALF_H, _center.z)
    _tl.project(camera)
    _br.project(camera)

    const x = (_tl.x * 0.5 + 0.5) * size.width
    const y = (-_tl.y * 0.5 + 0.5) * size.height
    const w = (_br.x - _tl.x) * 0.5 * size.width
    const h = (-_br.y + _tl.y) * 0.5 * size.height

    if (w <= 0 || h <= 0) return

    overlayEl.style.display = 'block'
    overlayEl.style.left = `${x}px`
    overlayEl.style.top = `${y}px`
    overlayEl.style.width = `${w}px`
    overlayEl.style.height = `${h}px`

    // Scale le contenu natif (685×385) pour remplir la zone projetée
    if (innerEl) {
      const scale = Math.min(w / NATIVE_W, h / NATIVE_H)
      innerEl.style.transform = `scale(${scale})`
    }
  })

  return null
}
