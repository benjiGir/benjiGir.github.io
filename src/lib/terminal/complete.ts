import { COMMANDS } from './commands'
import { getNode, resolvePath } from './fs'

// ── Tab completion ─────────────────────────────────────────────────────────────

export function tabComplete(input: string, cwd: string): string | string[] | null {
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
