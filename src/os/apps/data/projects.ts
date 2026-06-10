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
    id: 'Re-astr',
    name: 'RE-ASTR',
    tagline: 'Outil de gestion et de partage d`archive de test',
    description:
      'ASTR est un outil de gestion d`archive de test. Conçu pour faciliter la creation d`archives de test, leur partage' +
      'entre les différentes équipes que ce soit via un lien de consultation ou le téléchargement de l`archive complète. ' +
      'L`application est composée d`une interface web pour la gestion des archives et d`une API REST pour les opérations de backend.',
    stack: ['TypeScript', 'React', 'NestJS', 'PostgreSQL', 'Docker'],
    links: [{ label: 'Repository front', url: 'https://github.com/benjiGir/re-astr-front' },{ label: 'Repository back', url: 'https://github.com/benjiGir/re-astr-back' }],
    color: '#8b5cf6',
    year: 2024,
  }
]
