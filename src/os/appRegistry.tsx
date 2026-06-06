import { lazy, type ComponentType } from 'react'

export type AppMeta = {
  title: string
  defaultSize: { w: number; h: number }
  color: string
  component: ComponentType
}

// Lazy-loaded — chaque app est un chunk séparé, chargé à la première ouverture
const ProjectsApp = lazy(() => import('@/os/apps/ProjectsApp'))
const AboutApp = lazy(() => import('@/os/apps/AboutApp'))
const ContactApp = lazy(() => import('@/os/apps/ContactApp'))
const TerminalApp = lazy(() => import('@/os/apps/TerminalApp'))

export const APP_REGISTRY: Record<string, AppMeta> = {
  projects: {
    title: 'Projets',
    defaultSize: { w: 680, h: 440 },
    color: '#3b82f6',
    component: ProjectsApp,
  },
  about: {
    title: 'À propos',
    defaultSize: { w: 520, h: 420 },
    color: '#8b5cf6',
    component: AboutApp,
  },
  contact: {
    title: 'Contact',
    defaultSize: { w: 400, h: 300 },
    color: '#10b981',
    component: ContactApp,
  },
  terminal: {
    title: 'Terminal',
    defaultSize: { w: 560, h: 360 },
    color: '#334155',
    component: TerminalApp,
  },
}
