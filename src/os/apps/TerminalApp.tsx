import { useState, useRef, useEffect } from 'react'
import { projects } from '@/os/apps/data/projects'
import { useWindowStore } from '@/store/useWindowStore'
import { APP_REGISTRY } from '@/os/appRegistry'
import { playClick } from '@/lib/audio'

// ── Types ──────────────────────────────────────────────────────────────────────

type Span = { text: string; color?: string; bold?: boolean }
type Line =
  | { kind: 'output'; spans: Span[] }
  | { kind: 'input'; text: string; cwd: string }

// ── Virtual Filesystem ─────────────────────────────────────────────────────────

type FileNode = { kind: 'file'; content: string }
type DirNode = { kind: 'dir'; children: Record<string, FSNode> }
type FSNode = FileNode | DirNode

const f = (content: string): FileNode => ({ kind: 'file', content })
const d = (children: Record<string, FSNode>): DirNode => ({ kind: 'dir', children })

const FS: DirNode = d({
  home: d({
    benji: d({
      '.profile': f('# ~/.profile\nexport USER=benji\nexport HOME=/home/benji\nexport PATH=/usr/local/bin:/usr/bin'),
      'readme.txt': f('Bienvenue dans le terminal de Benjamin Girard.\nTape "help" pour la liste des commandes.'),
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
        'notes.txt': f('TODO:\n- [ ] Finir le portfolio 3D\n- [ ] Ajouter plus de projets\n- [x] Créer le terminal amélioré\n- [x] Créer l\'éditeur de code'),
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

function normalizePath(path: string): string {
  const parts = path.split('/').filter(Boolean)
  const out: string[] = []
  for (const p of parts) {
    if (p === '..') out.pop()
    else if (p !== '.') out.push(p)
  }
  return '/' + out.join('/')
}

function resolvePath(cwd: string, input: string): string {
  if (!input || input === '~') return '/home/benji'
  if (input.startsWith('~/')) return normalizePath('/home/benji/' + input.slice(2))
  if (input.startsWith('/')) return normalizePath(input)
  return normalizePath(cwd + '/' + input)
}

function getNode(path: string): FSNode | null {
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

function displayPath(abs: string): string {
  if (abs === '/home/benji') return '~'
  if (abs.startsWith('/home/benji/')) return '~' + abs.slice('/home/benji'.length)
  return abs
}

function fileExt(name: string): string {
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i) : ''
}

// ── Color palette (Catppuccin Mocha) ──────────────────────────────────────────

const C = {
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

function fileColor(name: string, isDir: boolean): string {
  if (isDir) return C.blue
  const ext = fileExt(name)
  if (ext === '.tsx' || ext === '.ts') return C.pink
  if (ext === '.json') return C.yellow
  if (ext === '.md') return C.teal
  if (ext === '.txt') return C.green
  if (name.startsWith('.')) return C.muted
  return C.white
}

// ── ASCII logo for neofetch ────────────────────────────────────────────────────

const LOGO = [
  '╔══════════════════╗',
  '║  BENJAMIN G.     ║',
  '║  Backend Dev     ║',
  '╠══════════════════╣',
  '║  bureau-os 1.0   ║',
  '╚══════════════════╝',
  '                    ',
  '                    ',
]

// ── Banner ─────────────────────────────────────────────────────────────────────

const BANNER: Line[] = [
  { kind: 'output', spans: [{ text: 'Bureau OS v1.0.0', color: C.cyan }] },
  { kind: 'output', spans: [{ text: 'Tape "help" pour voir les commandes disponibles.', color: C.muted }] },
  { kind: 'output', spans: [{ text: '' }] },
]

// ── Commands ───────────────────────────────────────────────────────────────────

const COMMANDS = [
  'help', 'whoami', 'pwd', 'ls', 'cd', 'cat', 'echo',
  'date', 'clear', 'history', 'projects', 'contact',
  'open', 'neofetch', 'man',
]

type CmdCtx = {
  cwd: string
  history: string[]
  setCwd: (p: string) => void
  openApp: (id: string) => void
}

function o(spans: Span[]): Line { return { kind: 'output', spans } }
function spans(...ss: Span[]): Span[] { return ss }
function s(text: string, color?: string, bold?: boolean): Span { return { text, color, bold } }

function runCommand(raw: string, ctx: CmdCtx): Line[] | null {
  const trimmed = raw.trim()
  if (!trimmed) return []

  const tokens = trimmed.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) ?? []
  if (!tokens[0]) return []
  const cmd = tokens[0].toLowerCase()
  const args = tokens.slice(1).map((a) => a.replace(/^['"]|['"]$/g, ''))

  switch (cmd) {
    // ── help ──────────────────────────────────────────────────────────────────
    case 'help':
      return [
        o(spans(s('Commandes disponibles', C.bold, true))),
        o(spans(s(''))),
        o(spans(s('  Navigation', C.cyan))),
        o(spans(s('    pwd              ', C.yellow), s('— répertoire courant'))),
        o(spans(s('    ls [-l][-a]      ', C.yellow), s('— liste les fichiers'))),
        o(spans(s('    cd [chemin]      ', C.yellow), s('— change de répertoire'))),
        o(spans(s('    cat <fichier>    ', C.yellow), s('— affiche le contenu'))),
        o(spans(s(''))),
        o(spans(s('  Infos', C.cyan))),
        o(spans(s('    whoami           ', C.yellow), s('— qui suis-je ?'))),
        o(spans(s('    projects         ', C.yellow), s('— liste des projets'))),
        o(spans(s('    contact          ', C.yellow), s('— coordonnées'))),
        o(spans(s('    neofetch         ', C.yellow), s('— infos système'))),
        o(spans(s('    date             ', C.yellow), s('— date et heure'))),
        o(spans(s(''))),
        o(spans(s('  Utilitaires', C.cyan))),
        o(spans(s('    echo <texte>     ', C.yellow), s('— affiche un message'))),
        o(spans(s('    history          ', C.yellow), s('— historique'))),
        o(spans(s('    clear  (Ctrl+L)  ', C.yellow), s('— efface le terminal'))),
        o(spans(s('    open <app>       ', C.yellow), s('— ouvre une application'))),
        o(spans(s('    man <commande>   ', C.yellow), s('— page de manuel'))),
        o(spans(s(''))),
      ]

    // ── whoami ────────────────────────────────────────────────────────────────
    case 'whoami':
      return [
        o(spans(s('Benjamin Girard', C.bold, true))),
        o(spans(s('Développeur backend confirmé', C.cyan))),
        o(spans(s(''))),
        o(spans(s('  Entreprise  ', C.muted), s('Komity', C.white))),
        o(spans(s('  Depuis      ', C.muted), s('Septembre 2022', C.white))),
        o(spans(s('  Stack       ', C.muted), s('React · NestJS · PostgreSQL · Docker', C.pink))),
        o(spans(s('  Email       ', C.muted), s('benjiamin.girard7@gmail.com', C.green))),
        o(spans(s('  GitHub      ', C.muted), s('github.com/benjiGir', C.blue))),
        o(spans(s(''))),
      ]

    // ── pwd ───────────────────────────────────────────────────────────────────
    case 'pwd':
      return [o(spans(s(ctx.cwd)))]

    // ── ls ────────────────────────────────────────────────────────────────────
    case 'ls': {
      const flags = args.filter((a) => a.startsWith('-')).join('')
      const pathArg = args.find((a) => !a.startsWith('-')) ?? ''
      const target = pathArg ? resolvePath(ctx.cwd, pathArg) : ctx.cwd
      const node = getNode(target)
      if (!node) return [o(spans(s(`ls: ${target}: Aucun fichier ou dossier de ce type`, C.red)))]
      if (node.kind === 'file') return [o(spans(s(displayPath(target))))]

      const showHidden = flags.includes('a')
      const longFmt = flags.includes('l')
      let entries = Object.entries(node.children)
      if (!showHidden) entries = entries.filter(([name]) => !name.startsWith('.'))
      entries.sort(([a], [b]) => a.localeCompare(b))

      if (!entries.length) return [o(spans(s('(dossier vide)', C.muted)))]

      if (longFmt) {
        return entries.map(([name, child]) => {
          const isDir = child.kind === 'dir'
          const perm = isDir ? 'drwxr-xr-x' : '-rw-r--r--'
          const size = child.kind === 'file' ? String(child.content.length).padStart(6) : '  4096'
          return o(spans(
            s(`${perm}  benji  benji  ${size}  `, C.muted),
            s(name + (isDir ? '/' : ''), fileColor(name, isDir)),
          ))
        })
      }

      const cols = 4
      const lines: Line[] = []
      for (let i = 0; i < entries.length; i += cols) {
        const row = entries.slice(i, i + cols)
        lines.push(o(row.flatMap(([name, child]) => {
          const isDir = child.kind === 'dir'
          return [s((name + (isDir ? '/' : '')).padEnd(22), fileColor(name, isDir))]
        })))
      }
      return lines
    }

    // ── cd ────────────────────────────────────────────────────────────────────
    case 'cd': {
      const target = args[0] ?? '~'
      const resolved = resolvePath(ctx.cwd, target)
      const node = getNode(resolved)
      if (!node) return [o(spans(s(`cd: ${target}: Aucun fichier ou dossier de ce type`, C.red)))]
      if (node.kind === 'file') return [o(spans(s(`cd: ${target}: N'est pas un répertoire`, C.red)))]
      ctx.setCwd(resolved)
      return []
    }

    // ── cat ───────────────────────────────────────────────────────────────────
    case 'cat': {
      if (!args[0]) return [o(spans(s('Usage: cat <fichier>', C.red)))]
      const resolved = resolvePath(ctx.cwd, args[0])
      const node = getNode(resolved)
      if (!node) return [o(spans(s(`cat: ${args[0]}: Aucun fichier ou dossier de ce type`, C.red)))]
      if (node.kind === 'dir') return [o(spans(s(`cat: ${args[0]}: Est un répertoire`, C.red)))]
      return node.content.split('\n').map((line) => o(spans(s(line))))
    }

    // ── echo ──────────────────────────────────────────────────────────────────
    case 'echo': {
      const text = args
        .join(' ')
        .replace(/\$HOME/g, '/home/benji')
        .replace(/\$USER/g, 'benji')
        .replace(/\$PWD/g, ctx.cwd)
      return [o(spans(s(text)))]
    }

    // ── date ──────────────────────────────────────────────────────────────────
    case 'date': {
      const now = new Date()
      return [o(spans(s(now.toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'medium' }), C.cyan)))]
    }

    // ── clear ─────────────────────────────────────────────────────────────────
    case 'clear':
      return null

    // ── history ───────────────────────────────────────────────────────────────
    case 'history':
      if (!ctx.history.length) return [o(spans(s('(vide)', C.muted)))]
      return ctx.history
        .slice()
        .reverse()
        .map((cmd, i) => o(spans(s(`  ${String(ctx.history.length - i).padStart(4)}  `, C.muted), s(cmd))))

    // ── projects ──────────────────────────────────────────────────────────────
    case 'projects':
      return [
        o(spans(s(`${projects.length} projet(s) :`, C.bold, true))),
        o(spans(s(''))),
        ...projects.flatMap((p) => [
          o(spans(s(`  ${p.name}`, C.cyan, true), s(`  (${p.year})`, C.muted))),
          o(spans(s(`  ${p.tagline}`, C.white))),
          o(spans(s('  Stack : ', C.muted), s(p.stack.join(' · '), C.pink))),
          o(spans(s(''))),
        ]),
      ]

    // ── contact ───────────────────────────────────────────────────────────────
    case 'contact':
      return [
        o(spans(s('  Email   ', C.muted), s('benjiamin.girard7@gmail.com', C.green))),
        o(spans(s('  GitHub  ', C.muted), s('github.com/benjiGir', C.blue))),
        o(spans(s(''))),
      ]

    // ── open ──────────────────────────────────────────────────────────────────
    case 'open': {
      const appId = args[0]?.toLowerCase()
      if (!appId)
        return [
          o(spans(s('Usage: open <app>', C.red))),
          o(
            spans(
              s(
                'Apps : projects, about, contact, terminal, explorer, editor, robotlab, circuitlab',
                C.muted
              )
            )
          ),
        ]
      const meta = APP_REGISTRY[appId]
      if (!meta)
        return [
          o(spans(s(`open: ${appId}: application introuvable`, C.red))),
          o(
            spans(
              s(
                'Apps : projects, about, contact, terminal, explorer, editor, robotlab, circuitlab',
                C.muted
              )
            )
          ),
        ]
      ctx.openApp(appId)
      return [o(spans(s(`Ouverture de "${meta.title}"…`, C.green)))]
    }

    // ── neofetch ──────────────────────────────────────────────────────────────
    case 'neofetch': {
      const mem = (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory
      const memStr = mem
        ? `${Math.round(mem.usedJSHeapSize / 1024 / 1024)} MiB / ${Math.round(mem.totalJSHeapSize / 1024 / 1024)} MiB`
        : 'N/A'

      const INFO: Span[][] = [
        spans(s('benji', C.green, true), s('@', C.muted), s('bureau', C.blue, true)),
        spans(s('─────────────────', C.muted)),
        spans(s('OS:      ', C.cyan), s('Bureau OS 1.0.0')),
        spans(s('Runtime: ', C.cyan), s('React 19 + Three.js r184')),
        spans(s('Shell:   ', C.cyan), s('bureau-sh 1.0')),
        spans(s('Screen:  ', C.cyan), s('1280 × 720 px')),
        spans(s('CPU:     ', C.cyan), s('WebGL · TypeScript')),
        spans(s('Memory:  ', C.cyan), s(memStr)),
        [],
        spans(
          s('  '),
          ...([C.red, C.yellow, C.green, C.cyan, C.blue, C.mauve, C.white, C.muted] as string[]).flatMap((c) => [
            s('██', c),
          ])
        ),
      ]

      const maxLines = Math.max(LOGO.length, INFO.length)
      const lines: Line[] = []
      for (let i = 0; i < maxLines; i++) {
        const logo = i < LOGO.length ? LOGO[i] : ' '.repeat(LOGO[0].length)
        const info = i < INFO.length ? INFO[i] : []
        lines.push(o([s(logo, C.cyan), s('  '), ...info]))
      }
      return [...lines, o(spans(s('')))]
    }

    // ── man ───────────────────────────────────────────────────────────────────
    case 'man': {
      const subject = args[0]?.toLowerCase()
      if (!subject) return [o(spans(s('Usage: man <commande>', C.red)))]

      const pages: Record<string, Line[]> = {
        ls: [
          o(spans(s('NOM', C.bold, true))),
          o(spans(s("    ls — liste le contenu d'un répertoire"))),
          o(spans(s(''))),
          o(spans(s('SYNOPSIS', C.bold, true))),
          o(spans(s('    ls [-l] [-a] [répertoire]'))),
          o(spans(s(''))),
          o(spans(s('OPTIONS', C.bold, true))),
          o(spans(s('    -l    ', C.yellow), s('format long (permissions, taille)'))),
          o(spans(s('    -a    ', C.yellow), s('affiche les fichiers cachés (. …)'))),
          o(spans(s(''))),
        ],
        cd: [
          o(spans(s('NOM', C.bold, true))),
          o(spans(s('    cd — change le répertoire courant'))),
          o(spans(s(''))),
          o(spans(s('SYNOPSIS', C.bold, true))),
          o(spans(s('    cd [répertoire]'))),
          o(spans(s(''))),
          o(spans(s('    Spéciaux : ~ (home)  ..  (parent)  / (racine)'))),
          o(spans(s(''))),
        ],
        cat: [
          o(spans(s('NOM', C.bold, true))),
          o(spans(s("    cat — affiche le contenu d'un fichier"))),
          o(spans(s(''))),
          o(spans(s('SYNOPSIS', C.bold, true))),
          o(spans(s('    cat <fichier>'))),
          o(spans(s(''))),
        ],
        open: [
          o(spans(s('NOM', C.bold, true))),
          o(spans(s('    open — ouvre une application du bureau'))),
          o(spans(s(''))),
          o(spans(s('SYNOPSIS', C.bold, true))),
          o(spans(s('    open <app>'))),
          o(spans(s(''))),
          o(
            spans(
              s('    Apps : projects, about, contact, terminal, explorer, editor, robotlab, circuitlab')
            )
          ),
          o(spans(s(''))),
        ],
        neofetch: [
          o(spans(s('NOM', C.bold, true))),
          o(spans(s('    neofetch — affiche les informations système'))),
          o(spans(s(''))),
          o(spans(s('SYNOPSIS', C.bold, true))),
          o(spans(s('    neofetch'))),
          o(spans(s(''))),
        ],
      }

      return pages[subject] ?? [o(spans(s(`man: ${subject}: aucune entrée de manuel`, C.red)))]
    }

    // ── unknown ───────────────────────────────────────────────────────────────
    default:
      return [
        o(spans(s(`${cmd}: commande introuvable`, C.red))),
        o(spans(s('Tape "help" pour la liste des commandes.', C.muted))),
      ]
  }
}

// ── Tab completion ─────────────────────────────────────────────────────────────

function tabComplete(input: string, cwd: string): string | string[] | null {
  const spaceIdx = input.indexOf(' ')

  if (spaceIdx < 0) {
    const matches = COMMANDS.filter((c) => c.startsWith(input) && c !== input)
    if (matches.length === 1) return matches[0] + ' '
    if (matches.length > 1) return matches
    return null
  }

  const lastWord = input.split(' ').pop() ?? ''
  const prefix = input.slice(0, input.lastIndexOf(' ') + 1)

  const dirPart = lastWord.includes('/') ? lastWord.slice(0, lastWord.lastIndexOf('/') + 1) : ''
  const namePart = lastWord.includes('/') ? lastWord.slice(lastWord.lastIndexOf('/') + 1) : lastWord

  const dirPath = dirPart ? resolvePath(cwd, dirPart) : cwd
  const node = getNode(dirPath)
  if (!node || node.kind !== 'dir') return null

  const matches = Object.entries(node.children).filter(([n]) => n.startsWith(namePart))
  if (matches.length === 0) return null
  if (matches.length === 1) {
    const [name, child] = matches[0]
    return prefix + dirPart + name + (child.kind === 'dir' ? '/' : ' ')
  }
  return matches.map(([n]) => n)
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function TerminalApp() {
  const [lines, setLines] = useState<Line[]>(BANNER)
  const [cwd, setCwd] = useState('/home/benji')
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const openWindow = useWindowStore((s) => s.openWindow)

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  function submit() {
    const cmd = input.trim()
    let newCwd = cwd

    const result = runCommand(cmd, {
      cwd,
      history,
      setCwd: (p) => { newCwd = p },
      openApp: (id) => {
        const meta = APP_REGISTRY[id]
        if (meta) { playClick(); openWindow(id, meta) }
      },
    })

    if (result === null) {
      setLines(BANNER)
    } else {
      setLines((prev) => [
        ...prev,
        ...(cmd ? [{ kind: 'input' as const, text: cmd, cwd }] : []),
        ...result,
      ])
    }

    setCwd(newCwd)
    if (cmd) setHistory((h) => [cmd, ...h])
    setInput('')
    setHistIdx(-1)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      submit()
      return
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const result = tabComplete(input, cwd)
      if (typeof result === 'string') {
        setInput(result)
      } else if (Array.isArray(result)) {
        setLines((prev) => [
          ...prev,
          { kind: 'output', spans: [{ text: result.join('  '), color: C.muted }] },
        ])
      }
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const idx = Math.min(histIdx + 1, history.length - 1)
      setHistIdx(idx)
      setInput(history[idx] ?? '')
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const idx = Math.max(histIdx - 1, -1)
      setHistIdx(idx)
      setInput(idx === -1 ? '' : history[idx])
      return
    }
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines(BANNER)
      return
    }
    if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault()
      if (input) {
        setLines((prev) => [
          ...prev,
          { kind: 'input', text: input, cwd },
          { kind: 'output', spans: [{ text: '^C', color: C.muted }] },
        ])
        setInput('')
        setHistIdx(-1)
      }
    }
  }

  const prompt = displayPath(cwd)

  return (
    <div
      ref={scrollRef}
      onClick={() => inputRef.current?.focus({ preventScroll: true })}
      style={{
        height: '100%',
        background: '#1e1e2e',
        fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace",
        fontSize: 12,
        color: '#cdd6f4',
        padding: '14px 16px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        cursor: 'text',
        lineHeight: 1.7,
      }}
    >
      {lines.map((line, i) => {
        if (line.kind === 'input') {
          return (
            <div key={i} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline' }}>
              <Prompt cwd={line.cwd} />
              <span style={{ color: C.white, whiteSpace: 'pre' }}>{line.text}</span>
            </div>
          )
        }
        return (
          <div key={i} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', minHeight: '1.7em' }}>
            {line.spans.map((span, j) => (
              <span
                key={j}
                style={{
                  color: span.color ?? '#cdd6f4',
                  fontWeight: span.bold ? 700 : undefined,
                  whiteSpace: 'pre',
                }}
              >
                {span.text}
              </span>
            ))}
          </div>
        )
      })}

      {/* Input row */}
      <div style={{ display: 'flex', alignItems: 'baseline' }}>
        <Prompt cwd={prompt} />
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: C.white,
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            caretColor: C.green,
          }}
        />
      </div>
    </div>
  )
}

function Prompt({ cwd }: { cwd: string }) {
  return (
    <>
      <span style={{ color: C.green, userSelect: 'none', whiteSpace: 'pre' }}>benji</span>
      <span style={{ color: C.muted, userSelect: 'none', whiteSpace: 'pre' }}>@</span>
      <span style={{ color: C.blue, userSelect: 'none', whiteSpace: 'pre' }}>bureau</span>
      <span style={{ color: C.muted, userSelect: 'none', whiteSpace: 'pre' }}>:</span>
      <span style={{ color: C.cyan, userSelect: 'none', whiteSpace: 'pre' }}>{cwd}</span>
      <span style={{ color: C.white, userSelect: 'none', whiteSpace: 'pre', marginRight: 8 }}>$</span>
    </>
  )
}
