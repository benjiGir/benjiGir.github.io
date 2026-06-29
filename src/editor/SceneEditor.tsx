import { useCallback, useEffect } from 'react'
import { TransformControls } from '@react-three/drei'
import * as THREE from 'three'
import { useEditorStore } from '@/editor/useEditorStore'
import { applySnap, clearSnapshot, snapshotOtherEntities } from '@/editor/snapping'

// Euler temporaire réutilisé pour extraire les angles de l'objet édité — évite toute
// allocation lors des callbacks de drag (potentiellement très fréquents).
const tmpEuler = new THREE.Euler()

// Flag global (hors React) pour la touche Alt maintenue : désactive temporairement le snap pour
// un placement libre/fin. Lu de façon impérative dans handleObjectChange (pas de re-render à
// chaque keydown/keyup — la fréquence de frappe rendrait ça coûteux pour rien).
let altHeld = false

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
  //
  // Le snap (mur/sol/autres objets) est appliqué ICI, AVANT setOverride, et UNIQUEMENT en mode
  // translate : il mute object.position en place, donc l'override capturé juste après reflète
  // déjà la position corrigée.
  const handleObjectChange = useCallback(() => {
    const { selectedId: id, registry: reg, gizmoMode: mode, snapEnabled } = useEditorStore.getState()
    if (!id) return
    const object = reg.get(id)?.object
    if (!object) return

    if (mode === 'translate' && snapEnabled && !altHeld) {
      applySnap(object)
    }

    tmpEuler.copy(object.rotation)
    useEditorStore.getState().setOverride(id, {
      position: [object.position.x, object.position.y, object.position.z],
      rotation: [tmpEuler.x, tmpEuler.y, tmpEuler.z],
      scale: [object.scale.x, object.scale.y, object.scale.z],
    })
  }, [])

  // À onMouseDown (début de drag du gizmo) : snapshotte les AABB des autres entités (elles ne
  // bougent pas pendant ce drag, inutile de les recalculer à chaque mousemove). Vidé à onMouseUp.
  const handleDraggingStart = useCallback(() => {
    const { selectedId: id, registry: reg } = useEditorStore.getState()
    if (id) snapshotOtherEntities(reg, id)
    useEditorStore.getState().setDragging(true)
  }, [])
  const handleDraggingEnd = useCallback(() => {
    clearSnapshot()
    useEditorStore.getState().setDragging(false)
  }, [])

  // Touche Alt maintenue : désactive temporairement le snap pour un placement libre/fin. Flag
  // global hors React (cf. `altHeld` plus haut) — écouté tant que le composant est monté, donc
  // tant que l'éditeur est actif avec une entité sélectionnée.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') altHeld = true
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') altHeld = false
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      altHeld = false
    }
  }, [])

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
