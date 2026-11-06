import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { Mesh, MeshBasicMaterial } from 'three'
import type { Material } from 'three'
import { batchStaticMeshes } from '@/scene/core/batchStaticMeshes'

const MODEL_URL = '/models/keyboard.opt.glb'

export function KeyboardModel(props: ThreeElements['group']) {
  const { scene } = useGLTF(MODEL_URL)
  const model = useMemo(() => scene.clone(), [scene])

  useEffect(() => {
    const fallbackMaterial = new MeshBasicMaterial()
    const replacedMaterials = new Map<Mesh, Material | Material[]>()
    model.traverse((part) => {
      // Ces pièces utilisaient le matériau Three.js par défaut dans l'ancien JSX :
      // leurs noms de matériau ont disparu lors de l'optimisation du GLB.
      if (
        part instanceof Mesh &&
        (part.name.startsWith('Screw') || part.name === 'Roller_Material003_0')
      ) {
        replacedMaterials.set(part, part.material)
        part.material = fallbackMaterial
      }
    })

    const restoreModel = batchStaticMeshes(model, true)
    return () => {
      restoreModel()
      for (const [part, material] of replacedMaterials) part.material = material
      fallbackMaterial.dispose()
    }
  }, [model])

  return (
    <group {...props} dispose={null}>
      <primitive object={model} />
    </group>
  )
}

useGLTF.preload(MODEL_URL)
