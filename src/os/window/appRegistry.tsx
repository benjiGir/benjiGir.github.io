import { lazy, type ComponentType } from 'react'

export type AppMeta = {
  title: string
  defaultSize: { w: number; h: number }
  color: string
  icon?: string
  component: ComponentType
}

// Lazy-loaded — chaque app est un chunk séparé, chargé à la première ouverture
const ProjectsApp = lazy(() => import('@/os/apps/ProjectsApp'))
const AboutApp = lazy(() => import('@/os/apps/AboutApp'))
const ContactApp = lazy(() => import('@/os/apps/ContactApp'))
const TerminalApp = lazy(() => import('@/os/apps/TerminalApp'))
const FileExplorerApp = lazy(() => import('@/os/apps/FileExplorerApp'))
const RecycleBinApp = lazy(() => import('@/os/apps/RecycleBinApp'))
const CodeEditorApp = lazy(() => import('@/os/apps/CodeEditorApp'))
// Précharge le chunk CodeMirror dès l'évaluation du module (avant toute ouverture de fenêtre)
import('@/os/apps/CodeEditorApp')
const RobotLabApp = lazy(() => import('@/os/apps/RobotLabApp'))
const CircuitLabApp = lazy(() => import('@/os/apps/CircuitLabApp'))

export const APP_REGISTRY: Record<string, AppMeta> = {
  projects: {
    title: 'Projets',
    defaultSize: { w: 680, h: 440 },
    color: '#3b82f6',
    icon: '/icons/projects.png',
    component: ProjectsApp,
  },
  about: {
    title: 'À propos',
    defaultSize: { w: 520, h: 420 },
    color: '#8b5cf6',
    icon: '/icons/information.png',
    component: AboutApp,
  },
  contact: {
    title: 'Contact',
    defaultSize: { w: 400, h: 300 },
    color: '#10b981',
    icon: '/icons/contact.png',
    component: ContactApp,
  },
  terminal: {
    title: 'Terminal',
    defaultSize: { w: 560, h: 360 },
    color: '#334155',
    icon: '/icons/terminal.png',
    component: TerminalApp,
  },
  explorer: {
    title: 'Explorateur',
    defaultSize: { w: 620, h: 420 },
    color: '#f59e0b',
    icon: '/icons/pc.png',
    component: FileExplorerApp,
  },
  recyclebin: {
    title: 'Corbeille',
    defaultSize: { w: 480, h: 380 },
    color: '#64748b',
    icon: '/icons/bin.png',
    component: RecycleBinApp,
  },
  editor: {
    title: 'Éditeur de code',
    defaultSize: { w: 720, h: 480 },
    color: '#7c3aed',
    icon: '/icons/editor.png',
    component: CodeEditorApp,
  },
  robotlab: {
    title: 'RobotLab',
    defaultSize: { w: 640, h: 440 },
    color: '#3b82f6',
    icon: '/icons/robot.png',
    component: RobotLabApp,
  },
  circuitlab: {
    title: 'Circuit Lab',
    defaultSize: { w: 600, h: 460 },
    color: '#facc15',
    icon: '/icons/oscillograph.png',
    component: CircuitLabApp,
  },
}
