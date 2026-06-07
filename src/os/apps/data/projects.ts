export type Project = {
  id: string
  name: string
  tagline: string
  description: string
  stack: string[]
  links: { label: string; url: string }[]
  color: string
  year: number
}

export const projects: Project[] = [
  {
    id: 'portfolio-3d',
    name: 'Portfolio 3D',
    tagline: 'Bureau interactif en React Three Fiber',
    description:
      'Un portfolio immersif sous forme de scène 3D : un bureau avec un ordinateur allumable, un mini-OS navigable avec gestionnaire de fenêtres, et un mode plein écran. Rendu HTML embarqué dans la scène via <Html transform>, post-processing (bloom, vignette), et animations sit-stand.',
    stack: ['React', 'TypeScript', 'Three.js', 'React Three Fiber', 'Zustand', 'Vite'],
    links: [{ label: 'GitHub', url: '#' }],
    color: '#3b82f6',
    year: 2026,
  },
  {
    id: 'project-astr',
    name: 'ASTR',
    tagline: 'Outil de gestion et de partage d`archive de test',
    description:
      'TBD',
    stack: ['TypeScript', 'React', 'NestJS', 'PostgreSQL', 'Docker'],
    links: [{ label: 'Repository front', url: '#' },{ label: 'Repository back', url: '#' }],
    color: '#8b5cf6',
    year: 2025,
  },
  {
    id: 'project-3',
    name: 'Projet 3',
    tagline: 'Courte accroche du projet',
    description:
      'Description détaillée à compléter. Remplace ce texte par une présentation de ton projet : contexte, problème résolu, choix techniques, résultats.',
    stack: ['À', 'compléter'],
    links: [],
    color: '#10b981',
    year: 2024,
  },
]
