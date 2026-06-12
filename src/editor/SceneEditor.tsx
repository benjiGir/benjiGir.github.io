import { useCallback } from 'react'
import { TransformControls } from '@react-three/drei'
import * as THREE from 'three'
import { useEditorStore } from '@/editor/useEditorStore'

// Euler temporaire réutilisé pour extraire les angles de l'objet édité — évite toute
// allocation lors des callbacks de drag (potentiellement très fréquents).
const tmpEuler = new THREE.Euler()

/**
 * Gizmo de transformation (drei TransformControls) attaché à l'entité sélectionnée. Ne rend
 * rien hors mode éditeur ou sans sélection.
 */
export default function SceneEditor() {
  const enabled = useEditorStore((s) => s.enabled)
  const selectedId = useEditorStore((s) => s.selectedId)
  const registry = useEditorStore((s) => s.registry)
  const gizmoMode = useEditorStore((s) => s.gizmoMode)

  // Synchronise en continu la transform de l'objet (muté par le gizmo via la souris) vers le
  // buffer d'overrides du store. `objectChange` est piloté par les déplacements souris pendant
  // le drag, pas par la frame loop — donc pas de setState dans useFrame ici.
  const handleObjectChange = useCallback(() => {
    const { selectedId: id, registry: reg } = useEditorStore.getState()
    if (!id) return
    const object = reg.get(id)?.object
    if (!object) return

    tmpEuler.copy(object.rotation)
    useEditorStore.getState().setOverride(id, {
      position: [object.position.x, object.position.y, object.position.z],
      rotation: [tmpEuler.x, tmpEuler.y, tmpEuler.z],
      scale: [object.scale.x, object.scale.y, object.scale.z],
    })
  }, [])

  const handleDraggingStart = useCallback(() => useEditorStore.getState().setDragging(true), [])
  const handleDraggingEnd = useCallback(() => useEditorStore.getState().setDragging(false), [])

  if (!enabled || !selectedId) return null

  const entry = registry.get(selectedId)
  if (!entry) return null

  return (
    <TransformControls
      object={entry.object}
      mode={gizmoMode}
      onObjectChange={handleObjectChange}
      // `dragging-changed` (TransformControlsImpl) est dispatché exactement aux mêmes moments
      // que mouseDown/mouseUp : on les utilise pour signaler à la freecam d'ignorer ses inputs
      // pendant le drag du gizmo.
      onMouseDown={handleDraggingStart}
      onMouseUp={handleDraggingEnd}
    />
  )
}
