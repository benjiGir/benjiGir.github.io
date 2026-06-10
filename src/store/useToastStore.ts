import { create } from 'zustand'

export interface Toast {
  id: string
  icon?: string
  title: string
  body?: string
  /** Durée d'affichage en ms avant disparition automatique. */
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  push: (toast: Omit<Toast, 'id'> & { id?: string }) => void
  dismiss: (id: string) => void
}

const DEFAULT_DURATION = 4000

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = toast.id ?? crypto.randomUUID()
    const duration = toast.duration ?? DEFAULT_DURATION
    set((s) => ({ toasts: [...s.toasts, { ...toast, id, duration }] }))

    setTimeout(() => get().dismiss(id), duration)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
