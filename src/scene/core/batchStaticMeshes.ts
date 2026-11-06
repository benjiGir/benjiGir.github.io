import { Matrix4, Mesh } from 'three'
import type { BufferGeometry, Group, Material } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

export function batchStaticMeshes(model: Group, shadows = false) {
  // Editable a déjà calculé son pivot à partir des boîtes des pièces d'origine.
  const originalParts = [...model.children]
  model.updateWorldMatrix(true, true)
  const worldToModel = model.matrixWorld.clone().invert()
  const localMatrix = new Matrix4()
  const geometriesByMaterial = new Map<Material, BufferGeometry[]>()
  let canBatch = true

  model.traverse((part) => {
    if (!(part instanceof Mesh)) return
    if (Array.isArray(part.material)) {
      canBatch = false
      return
    }

    part.castShadow = shadows
    part.receiveShadow = shadows
    localMatrix.multiplyMatrices(worldToModel, part.matrixWorld)
    const geometry = part.geometry.clone().applyMatrix4(localMatrix)
    if (localMatrix.determinant() < 0) {
      // Une échelle miroir change le sens des faces quand elle est intégrée aux sommets.
      const index = geometry.getIndex()
      if (!index || geometry.hasAttribute('tangent')) canBatch = false
      else {
        for (let i = 0; i < index.count; i += 3) {
          const second = index.getX(i + 1)
          index.setX(i + 1, index.getX(i + 2))
          index.setX(i + 2, second)
        }
      }
    }

    const geometries = geometriesByMaterial.get(part.material)
    if (geometries) geometries.push(geometry)
    else geometriesByMaterial.set(part.material, [geometry])
  })

  const batches: Mesh[] = []
  for (const [material, geometries] of geometriesByMaterial) {
    const merged = canBatch ? mergeGeometries(geometries) : null
    for (const geometry of geometries) geometry.dispose()
    if (!merged) continue

    const batch = new Mesh(merged, material)
    batch.castShadow = shadows
    batch.receiveShadow = shadows
    batches.push(batch)
  }

  // Si un export contient des attributs incompatibles, garder le modèle complet.
  const didBatch = canBatch && batches.length === geometriesByMaterial.size && batches.length > 0
  if (didBatch) model.clear().add(...batches)

  return () => {
    if (didBatch) model.clear().add(...originalParts)
    for (const batch of batches) batch.geometry.dispose()
  }
}
