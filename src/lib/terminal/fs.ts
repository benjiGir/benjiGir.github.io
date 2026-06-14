// ── Virtual Filesystem ─────────────────────────────────────────────────────────

export type FileNode = { kind: 'file'; content: string }
export type DirNode = { kind: 'dir'; children: Record<string, FSNode> }
export type FSNode = FileNode | DirNode

const f = (content: string): FileNode => ({ kind: 'file', content })
const d = (children: Record<string, FSNode>): DirNode => ({ kind: 'dir', children })

export const FS: DirNode = d({
  home: d({
    benji: d({
      '.profile': f(
        '# ~/.profile\nexport USER=benji\nexport HOME=/home/benji\nexport PATH=/usr/local/bin:/usr/bin'
      ),
      'readme.txt': f(
        'Bienvenue dans le terminal de Benjamin Girard.\nTape "help" pour la liste des commandes.'
      ),
      projets: d({
        'portfolio-3d': d({
          'README.md': f(
            '# Portfolio 3D\n\nPortfolio immersif sous forme de scène 3D.\n\n## Stack\n- React + TypeScript\n- Three.js / React Three Fiber\n- Zustand + Vite\n\n## Lancer\n    pnpm dev'
          ),
          'package.json': f(
            '{\n  "name": "portfolio",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^19.2.7",\n    "@react-three/fiber": "^9.6.1",\n    "@react-three/drei": "^10.7.7",\n    "three": "^0.184.0",\n    "zustand": "^5.0.14"\n  }\n}'
          ),
          src: d({
            'App.tsx': f(
              "import { Suspense } from 'react'\nimport { Canvas } from '@react-three/fiber'\nimport Experience from '@/scene/Experience'\nimport FullscreenOverlay from '@/os/FullscreenOverlay'\n\nexport default function App() {\n  return (\n    <>\n      <Canvas shadows dpr={[1, 1.5]}>\n        <Suspense fallback={null}>\n          <Experience />\n        </Suspense>\n      </Canvas>\n      <FullscreenOverlay />\n    </>\n  )\n}"
            ),
          }),
        }),
        're-astr': d({
          'README.md': f(
            "# RE-ASTR\n\nOutil de gestion d'archive de test.\n\n## Stack\n- TypeScript / React\n- NestJS / PostgreSQL\n- Docker\n\n## Liens\n- github.com/benjiGir/re-astr-front\n- github.com/benjiGir/re-astr-back"
          ),
          src: d({}),
        }),
      }),
      documents: d({
        'cv.pdf': f('[Fichier binaire — ne peut pas être affiché]'),
        'notes.txt': f(
          "TODO:\n- [ ] Finir le portfolio 3D\n- [ ] Ajouter plus de projets\n- [x] Créer le terminal amélioré\n- [x] Créer l'éditeur de code"
        ),
      }),
    }),
  }),
  etc: d({
    hostname: f('bureau'),
    'os-release': f('NAME="Bureau OS"\nVERSION="1.0.0"\nID=bureau\nPRETTY_NAME="Bureau OS 1.0.0"'),
  }),
  usr: d({ bin: d({}), local: d({ bin: d({}) }) }),
})

// ── Filesystem helpers ─────────────────────────────────────────────────────────

export function normalizePath(path: string): string {
  const parts = path.split('/').filter(Boolean)
  const out: string[] = []
  for (const p of parts) {
    if (p === '..') out.pop()
    else if (p !== '.') out.push(p)
  }
  return '/' + out.join('/')
}

export function resolvePath(cwd: string, input: string): string {
  if (!input || input === '~') return '/home/benji'
  if (input.startsWith('~/')) return normalizePath('/home/benji/' + input.slice(2))
  if (input.startsWith('/')) return normalizePath(input)
  return normalizePath(cwd + '/' + input)
}

export function getNode(path: string): FSNode | null {
  if (path === '/') return FS
  const parts = path.split('/').filter(Boolean)
  let node: FSNode = FS
  for (const part of parts) {
    if (node.kind !== 'dir') return null
    node = node.children[part]
    if (!node) return null
  }
  return node
}

export function displayPath(abs: string): string {
  if (abs === '/home/benji') return '~'
  if (abs.startsWith('/home/benji/')) return '~' + abs.slice('/home/benji'.length)
  return abs
}

export function fileExt(name: string): string {
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i) : ''
}

// ── Color palette (Catppuccin Mocha) ──────────────────────────────────────────

export const C = {
  green: '#a6e3a1',
  blue: '#89b4fa',
  cyan: '#89dceb',
  yellow: '#f9e2af',
  pink: '#f5c2e7',
  teal: '#94e2d5',
  red: '#f38ba8',
  white: '#cdd6f4',
  muted: '#585b70',
  bold: '#ffffff',
  mauve: '#cba6f7',
}

export function fileColor(name: string, isDir: boolean): string {
  if (isDir) return C.blue
  const ext = fileExt(name)
  if (ext === '.tsx' || ext === '.ts') return C.pink
  if (ext === '.json') return C.yellow
  if (ext === '.md') return C.teal
  if (ext === '.txt') return C.green
  if (name.startsWith('.')) return C.muted
  return C.white
}
