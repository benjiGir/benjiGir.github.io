import { useState, useRef, useEffect, useCallback } from 'react'
import { basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { FILES, TREE, type TreeNode } from './data/codeEditorFiles'

function langLabel(key: string): string {
  if (key.endsWith('.ts') || key.endsWith('.tsx')) return 'TypeScript'
  if (key.endsWith('.json')) return 'JSON'
  return 'Text'
}

function fileIcon(key: string): string {
  if (key.endsWith('.tsx')) return '⚛'
  if (key.endsWith('.ts')) return 'TS'
  if (key.endsWith('.json')) return '{}'
  return '📄'
}

// ── CodeMirror editor (isolated component — remounts on key change) ────────────

function CodeMirrorEditor({
  fileKey,
  onCursorChange,
}: {
  fileKey: string
  onCursorChange: (line: number, col: number) => void
}) {
  const editorRef = useRef<HTMLDivElement>(null)
  const file = FILES[fileKey]

  useEffect(() => {
    const el = editorRef.current
    if (!el || !file) return

    const state = EditorState.create({
      doc: file.content,
      extensions: [
        basicSetup,
        javascript({ typescript: file.lang === 'typescript', jsx: fileKey.endsWith('.tsx') }),
        oneDark,
        EditorState.readOnly.of(true),
        EditorView.updateListener.of((update) => {
          if (update.selectionSet) {
            const pos = update.state.selection.main.head
            const lineInfo = update.state.doc.lineAt(pos)
            onCursorChange(lineInfo.number, pos - lineInfo.from + 1)
          }
        }),
        EditorView.theme({
          '&': { height: '100%', background: '#1e1e2e' },
          '.cm-scroller': {
            overflow: 'auto',
            fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace",
            fontSize: '12px',
            lineHeight: '1.65',
          },
          '.cm-gutters': { background: '#1e1e2e', borderRight: '1px solid #313244' },
          '.cm-lineNumbers .cm-gutterElement': { color: '#45475a', minWidth: '36px' },
          '.cm-activeLine': { background: 'rgba(255,255,255,0.03)' },
          '.cm-activeLineGutter': { background: 'rgba(255,255,255,0.03)' },
          '.cm-cursor': { borderLeftColor: '#a6e3a1' },
          '.cm-selectionBackground, ::selection': { background: '#313244 !important' },
          '.cm-foldPlaceholder': { background: '#313244', border: 'none', color: '#6c7086' },
        }),
      ],
    })

    const view = new EditorView({ state, parent: el })
    return () => view.destroy()
  }, []) // key handles remount on file switch

  return <div ref={editorRef} style={{ height: '100%', overflow: 'hidden' }} />
}

// ── File tree component ────────────────────────────────────────────────────────

function TreeNodeView({
  node,
  depth,
  activeFile,
  onOpen,
}: {
  node: TreeNode
  depth: number
  activeFile: string
  onOpen: (key: string) => void
}) {
  const [open, setOpen] = useState(true)
  const indent = depth * 12

  if (node.kind === 'file') {
    const active = activeFile === node.fileKey
    return (
      <div
        onClick={() => onOpen(node.fileKey)}
        style={{
          paddingLeft: 8 + indent,
          paddingRight: 8,
          paddingTop: 2,
          paddingBottom: 2,
          cursor: 'pointer',
          background: active ? 'rgba(137,180,250,0.15)' : 'transparent',
          color: active ? '#cdd6f4' : '#9399b2',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          userSelect: 'none',
          borderLeft: active ? '2px solid #89b4fa' : '2px solid transparent',
        }}
      >
        <span style={{ fontSize: 10, opacity: 0.7, flexShrink: 0 }}>{fileIcon(node.fileKey)}</span>
        <span>{node.name}</span>
      </div>
    )
  }

  return (
    <div>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          paddingLeft: 6 + indent,
          paddingTop: 2,
          paddingBottom: 2,
          cursor: 'pointer',
          color: '#6c7086',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 11,
          userSelect: 'none',
        }}
      >
        <span
          style={{
            fontSize: 9,
            transition: 'transform 0.15s',
            display: 'inline-block',
            transform: open ? 'rotate(90deg)' : 'none',
          }}
        >
          ▶
        </span>
        <span>{node.name}</span>
      </div>
      {open &&
        node.children.map((child, i) => (
          <TreeNodeView
            key={i}
            node={child}
            depth={depth + 1}
            activeFile={activeFile}
            onOpen={onOpen}
          />
        ))}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function CodeEditorApp() {
  const [activeFile, setActiveFile] = useState('App.tsx')
  const [tabs, setTabs] = useState<string[]>(['App.tsx'])
  const [lineCol, setLineCol] = useState({ line: 1, col: 1 })
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleCursorChange = useCallback((line: number, col: number) => {
    setLineCol({ line, col })
  }, [])

  function openFile(key: string) {
    setActiveFile(key)
    setLineCol({ line: 1, col: 1 })
    if (!tabs.includes(key)) setTabs((t) => [...t, key])
  }

  function closeTab(key: string, e: React.MouseEvent) {
    e.stopPropagation()
    const next = tabs.filter((t) => t !== key)
    setTabs(next)
    if (activeFile === key) setActiveFile(next[next.length - 1] ?? '')
  }

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#1e1e2e',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: '#cdd6f4',
        overflow: 'hidden',
      }}
    >
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#181825',
          borderBottom: '1px solid #313244',
          flexShrink: 0,
          height: 34,
          overflowX: 'auto',
        }}
      >
        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          title="Explorateur"
          style={{
            width: 34,
            height: 34,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: sidebarOpen ? '#89b4fa' : '#585b70',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          ☰
        </button>
        <div style={{ width: 1, height: 20, background: '#313244', flexShrink: 0 }} />

        {tabs.map((key) => (
          <div
            key={key}
            onClick={() => openFile(key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '0 12px',
              height: '100%',
              cursor: 'pointer',
              background: activeFile === key ? '#1e1e2e' : 'transparent',
              borderBottom: activeFile === key ? '1px solid #89b4fa' : '1px solid transparent',
              borderRight: '1px solid #313244',
              color: activeFile === key ? '#cdd6f4' : '#6c7086',
              fontSize: 12,
              userSelect: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 10, opacity: 0.7 }}>{fileIcon(key)}</span>
            <span>{key}</span>
            <button
              onClick={(e) => closeTab(key, e)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'inherit',
                padding: '0 2px',
                fontSize: 12,
                lineHeight: 1,
                opacity: 0.5,
                borderRadius: 2,
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <div
            style={{
              width: 180,
              flexShrink: 0,
              background: '#181825',
              borderRight: '1px solid #313244',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '10px 8px 6px',
                fontSize: 10,
                letterSpacing: 1.5,
                color: '#45475a',
                textTransform: 'uppercase',
                userSelect: 'none',
              }}
            >
              Explorateur
            </div>
            <TreeNodeView node={TREE} depth={0} activeFile={activeFile} onOpen={openFile} />
          </div>
        )}

        {/* Editor */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {activeFile && FILES[activeFile] ? (
            <CodeMirrorEditor
              key={activeFile}
              fileKey={activeFile}
              onCursorChange={handleCursorChange}
            />
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#45475a',
                fontSize: 13,
              }}
            >
              Ouvre un fichier pour commencer
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div
        style={{
          height: 22,
          background: '#313244',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: 16,
          fontSize: 11,
          color: '#9399b2',
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        <span style={{ color: '#89b4fa' }}>{activeFile ? langLabel(activeFile) : ''}</span>
        <span>
          Ln {lineCol.line}, Col {lineCol.col}
        </span>
        <span style={{ marginLeft: 'auto' }}>UTF-8</span>
        <span>bureau-editor</span>
      </div>
    </div>
  )
}
