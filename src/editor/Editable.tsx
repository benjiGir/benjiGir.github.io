import { useLayoutEffect, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { useEditorStore, type Vec3 } from '@/editor/useEditorStore'

// @ts-ignore
const DEBUG = import.meta.env.VITE_DEBUG === 'true'

interface EditableProps {
  id: string
  label: string
  position?: Vec3
  rotation?: Vec3
  scale?: Vec3
  children: ReactNode
}

const DEFAULT_POSITION: Vec3 = [0, 0, 0]
const DEFAULT_ROTATION: Vec3 = [0, 0, 0]
const DEFAULT_SCALE: Vec3 = [1, 1, 1]

/**
 * Enveloppe une portion de scène pour la rendre éditable en mode dev (gizmo, sélection,
 * surcharges de matériau).
 *
 * Deux groupes imbriqués :
 * - `pivotRef` (extérieur) porte la transform de l'entité (override sinon défaut JSX) et c'est
 *   LUI que le gizmo manipule — son origine est donc l'ancre du gizmo.
 * - `innerRef` (intérieur) reçoit un décalage = −centre de la bbox du contenu, ce qui replace le
 *   pivot sur le centre VISUEL de l'entité sans la déplacer à l'écran. Sans ce recentrage, les
 *   entités regroupées (étagère, plante…) auraient leur gizmo à l'origine du monde.
 *
 * La transform n'est jamais bindée en JSX : appliquée une fois au montage (impératif), pour que le
 * gizmo puisse ensuite muter le groupe sans qu'un re-render React ne vienne l'écraser.
 */
export default function Editable({
  id,
  label,
  position = DEFAULT_POSITION,
  rotation = DEFAULT_ROTATION,
  scale = DEFAULT_SCALE,
  children,
}: EditableProps) {
  const pivotRef = useRef<THREE.Group>(null!)
  const innerRef = useRef<THREE.Group>(null!)
  const enabled = useEditorStore((s) => s.enabled)

  // Applique la transform effective (override sauvegardé sinon valeurs par défaut JSX), recentre le
  // pivot sur le contenu, applique l'override matériau et s'enregistre. useLayoutEffect pour éviter
  // tout flash visuel avant application.
  useLayoutEffect(() => {
    const pivot = pivotRef.current
    const inner = innerRef.current
    const override = useEditorStore.getState().overrides[id]

    const pos = override?.position ?? position
    const rot = override?.rotation ?? rotation
    const scl = override?.scale ?? scale

    pivot.position.fromArray(pos)
    pivot.rotation.set(rot[0], rot[1], rot[2])
    pivot.scale.fromArray(scl)
    inner.position.set(0, 0, 0)

    // Recentrage du pivot sur le centre de la bbox du contenu. Le décalage interno-local est
    // intrinsèque (ne dépend que de la géométrie), donc rejouable à l'identique au rechargement.
    // L'origine du pivot n'est replacée au centre que SANS override de position (sinon on respecte
    // la valeur sauvegardée, qui était déjà centrée à sa création).
    pivot.updateWorldMatrix(true, true)
    const box = new THREE.Box3().setFromObject(inner)
    if (!box.isEmpty()) {
      const centerWorld = box.getCenter(new THREE.Vector3())
      inner.position.copy(pivot.worldToLocal(centerWorld.clone())).negate()
      if (!override?.position) {
        const parent = pivot.parent
        pivot.position.copy(parent ? parent.worldToLocal(centerWorld) : centerWorld)
      }
    }

    // Surcharge matériau — appliquée à tous les MeshStandardMaterial descendants, sans toucher
    // emissive/emissiveIntensity (animés en useFrame ailleurs : LED, dalle écran...).
    const materialOverride = override?.material
    if (materialOverride) {
      pivot.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return
        const mat = child.material
        if (!(mat instanceof THREE.MeshStandardMaterial)) return
        if (materialOverride.color !== undefined) mat.color.set(materialOverride.color)
        if (materialOverride.roughness !== undefined) mat.roughness = materialOverride.roughness
        if (materialOverride.metalness !== undefined) mat.metalness = materialOverride.metalness
      })
    }

    useEditorStore.getState().register({ id, label, object: pivot })
    return () => useEditorStore.getState().unregister(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Hors mode éditeur (ou en production) : aucun handler, pour ne pas interférer avec les
  // interactions normales de la scène (clics sur les hotspots, boutons…). `DEBUG` étant une
  // constante inlinée au build, la branche interactive ci-dessous est éliminée du bundle de prod
  // (dead code) — l'éditeur est strictement dev-only, mais les overrides restent appliqués.
  if (!DEBUG || !enabled) {
    return (
      <group ref={pivotRef}>
        <group ref={innerRef}>{children}</group>
      </group>
    )
  }

  return (
    <group
      ref={pivotRef}
      onClick={(e) => {
        e.stopPropagation()
        useEditorStore.getState().select(id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'auto'
      }}
    >
      <group ref={innerRef}>{children}</group>
    </group>
  )
}
