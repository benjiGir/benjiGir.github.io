import { create } from 'zustand'
import type { Object3D } from 'three'
import overridesJson from '@/scene/scene-overrides.json'

// Store de l'éditeur de scène (dev only) : pilote le mode freecam, la sélection d'entités,
// le gizmo, et le buffer de surcharges sauvegardé dans scene-overrides.json via le plugin Vite.
//
// Flux des données : les littéraux JSX sont les valeurs PAR DÉFAUT ; ce store tient un buffer de
// surcharges (seedé depuis le JSON committé) que <Editable> applique au montage et que `save()`
// réécrit sur disque. Pendant l'édition, l'objet 3D vivant (muté par le gizmo / le panneau) et ce
// buffer restent synchronisés ; le buffer est la « vérité à sauvegarder ».

// ─── Types ──────────────────────────────────────────────────────────────────

export type Vec3 = [number, number, number]

/** Surcharge persistée pour une entité. Tout champ absent ⇒ on garde le défaut JSX. */
export interface Override {
  position?: Vec3
  rotation?: Vec3
  scale?: Vec3
  /** Appliqué à TOUS les MeshStandardMaterial de l'entité (granularité entité, hors emissive). */
  material?: { color?: string; roughness?: number; metalness?: number }
}

export type GizmoMode = 'translate' | 'rotate' | 'scale'

/** Une entité éditable enregistrée par <Editable> — alimente le dropdown et le gizmo. */
export interface EditableEntry {
  id: string
  label: string
  object: Object3D
}

// Surcharges committées dans le JSON, utilisées pour amorcer le buffer de session.
// `as unknown as` : avec resolveJsonModule, TS infère les tableaux du JSON comme `number[]`
// (longueur non bornée), non assignables aux tuples `Vec3` — la double assertion est nécessaire.
const INITIAL_OVERRIDES = overridesJson as unknown as Record<string, Override>

// ─── Store ──────────────────────────────────────────────────────────────────

interface EditorStore {
  /** Mode éditeur actif (freecam + sélection). Bascule au backtick, dev only. */
  enabled: boolean
  /** Entité sélectionnée (id), ou null. */
  selectedId: string | null
  /** Mode courant du gizmo TransformControls. */
  gizmoMode: GizmoMode
  /** Vrai pendant un drag du gizmo — la freecam doit alors ignorer les inputs. */
  isDragging: boolean
  /** Auto-fit/snapping en mode translate (mur/sol/autres objets). Désactivable via le panneau ou Alt. */
  snapEnabled: boolean
  /** Entités vivantes enregistrées par <Editable> (clé = id). */
  registry: Map<string, EditableEntry>
  /** Buffer des surcharges en cours (seedé depuis le JSON). `save()` l'écrit tel quel. */
  overrides: Record<string, Override>

  toggle: () => void
  setEnabled: (v: boolean) => void
  select: (id: string | null) => void
  setGizmoMode: (m: GizmoMode) => void
  setDragging: (v: boolean) => void
  setSnapEnabled: (v: boolean) => void
  register: (entry: EditableEntry) => void
  unregister: (id: string) => void
  /** Fusionne un delta de surcharge pour une entité (transform et/ou matériau). */
  setOverride: (id: string, patch: Override) => void
  /** Écrit le buffer dans scene-overrides.json via le plugin Vite. Renvoie le succès. */
  save: () => Promise<boolean>
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  enabled: false,
  selectedId: null,
  gizmoMode: 'translate',
  isDragging: false,
  snapEnabled: true,
  registry: new Map(),
  overrides: { ...INITIAL_OVERRIDES },

  toggle: () => set((s) => ({ enabled: !s.enabled, selectedId: null })),
  setEnabled: (v) => set((s) => ({ enabled: v, selectedId: v ? s.selectedId : null })),
  select: (id) => set({ selectedId: id }),
  setGizmoMode: (m) => set({ gizmoMode: m }),
  setDragging: (v) => set({ isDragging: v }),
  setSnapEnabled: (v) => set({ snapEnabled: v }),

  register: (entry) =>
    set((s) => {
      const registry = new Map(s.registry)
      registry.set(entry.id, entry)
      return { registry }
    }),

  unregister: (id) =>
    set((s) => {
      const registry = new Map(s.registry)
      registry.delete(id)
      return { registry, selectedId: s.selectedId === id ? null : s.selectedId }
    }),

  setOverride: (id, patch) =>
    set((s) => {
      const prev = s.overrides[id] ?? {}
      const material =
        patch.material || prev.material ? { ...prev.material, ...patch.material } : undefined
      return { overrides: { ...s.overrides, [id]: { ...prev, ...patch, material } } }
    }),

  save: async () => {
    try {
      const res = await fetch('/__scene_editor/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(get().overrides, null, 2),
      })
      return res.ok
    } catch {
      return false
    }
  },
}))
