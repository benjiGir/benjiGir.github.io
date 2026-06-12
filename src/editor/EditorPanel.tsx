import { useEffect, useMemo, useRef } from 'react'
import { button, useControls } from 'leva'
import * as THREE from 'three'
import { useEditorStore, type Vec3 } from '@/editor/useEditorStore'

// @ts-ignore
const DEBUG = import.meta.env.VITE_DEBUG === 'true'

// ─── Helpers matériau ─────────────────────────────────────────────────────────

/** Premier MeshStandardMaterial trouvé dans l'entité — sert à amorcer les champs du panneau. */
function readFirstStandardMaterial(obj: THREE.Object3D): THREE.MeshStandardMaterial | null {
  let found: THREE.MeshStandardMaterial | null = null
  obj.traverse((child) => {
    if (found) return
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      found = child.material
    }
  })
  return found
}

/** Applique une surcharge matériau à TOUS les MeshStandardMaterial de l'entité (hors emissive). */
function applyMaterial(
  obj: THREE.Object3D,
  mat: { color?: string; roughness?: number; metalness?: number }
) {
  obj.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    const m = child.material
    if (!(m instanceof THREE.MeshStandardMaterial)) return
    if (mat.color !== undefined) m.color.set(mat.color)
    if (mat.roughness !== undefined) m.roughness = mat.roughness
    if (mat.metalness !== undefined) m.metalness = mat.metalness
  })
}

// Contexte leva onChange — on ignore l'appel initial (montage) pour ne pas polluer le buffer
// d'overrides avec des entités jamais éditées.
type LevaCtx = { initial?: boolean }

// ─── Contrôles (montés uniquement quand l'éditeur est actif) ────────────────────

function EditorControls() {
  const selectedId = useEditorStore((s) => s.selectedId)
  const registry = useEditorStore((s) => s.registry)

  const entry = selectedId ? (registry.get(selectedId) ?? null) : null
  const obj = entry?.object ?? null

  // Clé stable des entités enregistrées — déclenche la reconstruction du dropdown quand la
  // liste change (les <Editable> s'enregistrent au montage).
  const optionsKey = useMemo(
    () =>
      Array.from(registry.values())
        .map((e) => e.id)
        .join(','),
    [registry]
  )
  const options = useMemo(() => {
    const o: Record<string, string> = { '— aucun —': '' }
    registry.forEach((e) => {
      o[e.label] = e.id
    })
    return o
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionsKey])

  // Valeurs d'amorçage lues sur l'objet sélectionné (post-override / post-gizmo).
  const seed = useMemo(() => {
    if (!obj) return null
    const mat = readFirstStandardMaterial(obj)
    return {
      position: obj.position.toArray() as Vec3,
      rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z] as Vec3,
      scale: obj.scale.toArray() as Vec3,
      color: mat ? '#' + mat.color.getHexString() : '#ffffff',
      roughness: mat ? mat.roughness : 0.5,
      metalness: mat ? mat.metalness : 0,
      hasMat: !!mat,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obj, selectedId])

  // `set` est routé via une ref : le bouton Sauvegarder est défini DANS le schéma passé à
  // useControls, il ne peut donc pas référencer `set` (déclaré par ce même appel) directement.
  const setRef = useRef<((value: Record<string, unknown>) => void) | null>(null)

  const [, set] = useControls(
    'Éditeur scène',
    () => ({
      entité: {
        value: selectedId ?? '',
        options,
        onChange: (v: string, _p: string, ctx: LevaCtx) => {
          if (ctx.initial) return
          useEditorStore.getState().select(v || null)
        },
      },
      mode: {
        label: 'gizmo (1·2·3)',
        value: useEditorStore.getState().gizmoMode,
        options: ['translate', 'rotate', 'scale'] as const,
        onChange: (v: 'translate' | 'rotate' | 'scale', _p: string, ctx: LevaCtx) => {
          if (ctx.initial) return
          useEditorStore.getState().setGizmoMode(v)
        },
      },
      position: {
        value: seed?.position ?? ([0, 0, 0] as Vec3),
        step: 0.01,
        disabled: !obj,
        onChange: (v: Vec3, _p: string, ctx: LevaCtx) => {
          if (ctx.initial || !obj || !selectedId) return
          obj.position.fromArray(v)
          useEditorStore.getState().setOverride(selectedId, { position: [...v] as Vec3 })
        },
      },
      rotation: {
        value: seed?.rotation ?? ([0, 0, 0] as Vec3),
        step: 0.01,
        disabled: !obj,
        onChange: (v: Vec3, _p: string, ctx: LevaCtx) => {
          if (ctx.initial || !obj || !selectedId) return
          obj.rotation.set(v[0], v[1], v[2])
          useEditorStore.getState().setOverride(selectedId, { rotation: [...v] as Vec3 })
        },
      },
      scale: {
        value: seed?.scale ?? ([1, 1, 1] as Vec3),
        step: 0.01,
        disabled: !obj,
        onChange: (v: Vec3, _p: string, ctx: LevaCtx) => {
          if (ctx.initial || !obj || !selectedId) return
          obj.scale.fromArray(v)
          useEditorStore.getState().setOverride(selectedId, { scale: [...v] as Vec3 })
        },
      },
      couleur: {
        value: seed?.color ?? '#ffffff',
        disabled: !seed?.hasMat,
        onChange: (v: string, _p: string, ctx: LevaCtx) => {
          if (ctx.initial || !obj || !selectedId) return
          applyMaterial(obj, { color: v })
          useEditorStore.getState().setOverride(selectedId, { material: { color: v } })
        },
      },
      roughness: {
        value: seed?.roughness ?? 0.5,
        min: 0,
        max: 1,
        step: 0.01,
        disabled: !seed?.hasMat,
        onChange: (v: number, _p: string, ctx: LevaCtx) => {
          if (ctx.initial || !obj || !selectedId) return
          applyMaterial(obj, { roughness: v })
          useEditorStore.getState().setOverride(selectedId, { material: { roughness: v } })
        },
      },
      metalness: {
        value: seed?.metalness ?? 0,
        min: 0,
        max: 1,
        step: 0.01,
        disabled: !seed?.hasMat,
        onChange: (v: number, _p: string, ctx: LevaCtx) => {
          if (ctx.initial || !obj || !selectedId) return
          applyMaterial(obj, { metalness: v })
          useEditorStore.getState().setOverride(selectedId, { material: { metalness: v } })
        },
      },
      '💾 Sauvegarder': button(() => {
        void useEditorStore
          .getState()
          .save()
          .then((ok) => setRef.current?.({ statut: ok ? 'Sauvegardé ✓' : 'Échec ✗' }))
      }),
      statut: { value: '', editable: false },
    }),
    [selectedId, optionsKey, obj]
  )

  // Garde la ref `set` à jour pour le bouton Sauvegarder.
  useEffect(() => {
    setRef.current = set
  }, [set])

  // Reflète les mutations du gizmo (et des autres sources) dans les champs numériques.
  // `set` ne déclenche pas les onChange utilisateur (gardés par ctx.initial), donc pas de boucle.
  useEffect(() => {
    if (!obj || !selectedId) return
    return useEditorStore.subscribe(() => {
      set({
        position: obj.position.toArray() as Vec3,
        rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z] as Vec3,
        scale: obj.scale.toArray() as Vec3,
      })
    })
  }, [obj, selectedId, set])

  return null
}

// ─── Racine : raccourcis clavier + montage conditionnel des contrôles ───────────

/**
 * Panneau leva de l'éditeur de scène (dev only). Gère aussi les raccourcis globaux :
 * - backtick (²) : bascule le mode éditeur (freecam + sélection),
 * - 1 / 2 / 3 : mode du gizmo (translate / rotate / scale) — on évite G/R/S car S = recul freecam,
 * - Échap : désélectionne.
 * Les raccourcis sont ignorés quand on saisit dans un champ (input/textarea).
 */
export default function EditorPanel() {
  const enabled = useEditorStore((s) => s.enabled)

  useEffect(() => {
    if (!DEBUG) return

    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null
      const typing =
        !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)

      if (e.code === 'Backquote' && !typing) {
        e.preventDefault()
        const wasEnabled = useEditorStore.getState().enabled
        useEditorStore.getState().toggle()
        if (!wasEnabled) {
          // À l'entrée en mode éditeur : focus le canvas pour capter ZQSD/WASD immédiatement.
          requestAnimationFrame(() => document.querySelector('canvas')?.focus())
        } else {
          // À la sortie : un survol d'entité a pu laisser le curseur en 'pointer', on le réinitialise.
          document.body.style.cursor = 'auto'
        }
        return
      }

      if (typing || !useEditorStore.getState().enabled) return

      if (e.code === 'Digit1') useEditorStore.getState().setGizmoMode('translate')
      else if (e.code === 'Digit2') useEditorStore.getState().setGizmoMode('rotate')
      else if (e.code === 'Digit3') useEditorStore.getState().setGizmoMode('scale')
      else if (e.code === 'Escape') useEditorStore.getState().select(null)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!DEBUG || !enabled) return null
  return <EditorControls />
}
