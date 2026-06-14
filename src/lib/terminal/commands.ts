import { projects } from '@/os/apps/data/projects'
import { APP_REGISTRY } from '@/os/window/appRegistry'
import { C, displayPath, fileColor, getNode, resolvePath } from './fs'

// ── Types ──────────────────────────────────────────────────────────────────────

export type Span = { text: string; color?: string; bold?: boolean }
export type Line =
  | { kind: 'output'; spans: Span[] }
  | { kind: 'input'; text: string; cwd: string }

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

export const BANNER: Line[] = [
  { kind: 'output', spans: [{ text: 'Bureau OS v1.0.0', color: C.cyan }] },
  {
    kind: 'output',
    spans: [{ text: 'Tape "help" pour voir les commandes disponibles.', color: C.muted }],
  },
  { kind: 'output', spans: [{ text: '' }] },
]

// ── Commands ───────────────────────────────────────────────────────────────────

export const COMMANDS = [
  'help',
  'whoami',
  'pwd',
  'ls',
  'cd',
  'cat',
  'echo',
  'date',
  'clear',
  'history',
  'projects',
  'contact',
  'open',
  'neofetch',
  'man',
]

export type CmdCtx = {
  cwd: string
  history: string[]
  setCwd: (p: string) => void
  openApp: (id: string) => void
}

function o(spans: Span[]): Line {
  return { kind: 'output', spans }
}
function spans(...ss: Span[]): Span[] {
  return ss
}
function s(text: string, color?: string, bold?: boolean): Span {
  return { text, color, bold }
}

export function runCommand(raw: string, ctx: CmdCtx): Line[] | null {
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
          return o(
            spans(
              s(`${perm}  benji  benji  ${size}  `, C.muted),
              s(name + (isDir ? '/' : ''), fileColor(name, isDir))
            )
          )
        })
      }

      const cols = 4
      const lines: Line[] = []
      for (let i = 0; i < entries.length; i += cols) {
        const row = entries.slice(i, i + cols)
        lines.push(
          o(
            row.flatMap(([name, child]) => {
              const isDir = child.kind === 'dir'
              return [s((name + (isDir ? '/' : '')).padEnd(22), fileColor(name, isDir))]
            })
          )
        )
      }
      return lines
    }

    // ── cd ────────────────────────────────────────────────────────────────────
    case 'cd': {
      const target = args[0] ?? '~'
      const resolved = resolvePath(ctx.cwd, target)
      const node = getNode(resolved)
      if (!node) return [o(spans(s(`cd: ${target}: Aucun fichier ou dossier de ce type`, C.red)))]
      if (node.kind === 'file')
        return [o(spans(s(`cd: ${target}: N'est pas un répertoire`, C.red)))]
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
      return [
        o(
          spans(s(now.toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'medium' }), C.cyan))
        ),
      ]
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
        .map((cmd, i) =>
          o(spans(s(`  ${String(ctx.history.length - i).padStart(4)}  `, C.muted), s(cmd)))
        )

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
      const mem = (
        performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }
      ).memory
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
          ...(
            [C.red, C.yellow, C.green, C.cyan, C.blue, C.mauve, C.white, C.muted] as string[]
          ).flatMap((c) => [s('██', c)])
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
              s(
                '    Apps : projects, about, contact, terminal, explorer, editor, robotlab, circuitlab'
              )
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
