// ── File content ───────────────────────────────────────────────────────────────

export const FILES: Record<string, { lang: 'typescript' | 'json'; content: string }> = {
  'App.tsx': {
    lang: 'typescript',
    content: `import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Loader } from '@react-three/drei'
import Experience from '@/scene/Experience'
import CameraUI from '@/components/CameraUI'
import MobileWarning from '@/components/MobileWarning'
import AudioUnlock from '@/components/AudioUnlock'
import MuteToggle from '@/components/MuteToggle'
import FullscreenOverlay from '@/os/FullscreenOverlay'
import ScreenPortal from '@/os/ScreenPortal'

export default function App() {
  return (
    <>
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 1.8, 3.2], fov: 50 }}
        shadows
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
      <Loader />
      <CameraUI />
      <FullscreenOverlay />
      <ScreenPortal />
      <MobileWarning />
      <AudioUnlock />
      <MuteToggle />
    </>
  )
}`,
  },

  'Experience.tsx': {
    lang: 'typescript',
    content: `import { Stats } from '@react-three/drei'
import { useControls } from 'leva'
import Lighting from '@/scene/Lighting'
import DeskScene from '@/scene/DeskScene'
import CameraRig from '@/scene/CameraRig'
import PostProcessing from '@/scene/PostProcessing'
import PowerSequence from '@/scene/PowerSequence'

const DEBUG = import.meta.env.VITE_DEBUG === 'true'

export default function Experience() {
  const { showPerf } = useControls(
    'Debug',
    { showPerf: { value: true, label: 'Show Perf' } },
    { render: () => DEBUG }
  )

  return (
    <>
      {DEBUG && showPerf && <Stats />}
      <PowerSequence />
      <Lighting />
      <DeskScene />
      <CameraRig />
      <PostProcessing />
    </>
  )
}`,
  },

  'useWindowStore.ts': {
    lang: 'typescript',
    content: `import { create } from 'zustand'

export type Win = {
  id: string
  appId: string
  title: string
  position: { x: number; y: number }
  size: { w: number; h: number }
  zIndex: number
  minimized: boolean
}

type WindowStore = {
  windows: Win[]
  _top: number
  openWindow: (appId: string, meta: { title: string; defaultSize: { w: number; h: number } }) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  moveWindow: (id: string, pos: { x: number; y: number }) => void
  resizeWindow: (id: string, size: { w: number; h: number }) => void
  minimizeWindow: (id: string) => void
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  _top: 10,

  openWindow(appId, meta) {
    const existing = get().windows.find((w) => w.appId === appId)
    if (existing) { get().focusWindow(existing.id); return }
    const top = get()._top + 1
    const n = get().windows.length % 6
    set((s) => ({
      _top: top,
      windows: [
        ...s.windows,
        {
          id: crypto.randomUUID(),
          appId,
          title: meta.title,
          position: { x: 80 + n * 24, y: 48 + n * 24 },
          size: { w: meta.defaultSize.w, h: meta.defaultSize.h },
          zIndex: top,
          minimized: false,
        },
      ],
    }))
  },

  closeWindow(id) {
    set((s) => ({ windows: s.windows.filter((w) => w.id !== id) }))
  },

  focusWindow(id) {
    const top = get()._top + 1
    set((s) => ({
      _top: top,
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, zIndex: top, minimized: false } : w
      ),
    }))
  },

  moveWindow(id, pos) {
    set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, position: pos } : w)) }))
  },

  resizeWindow(id, size) {
    set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, size } : w)) }))
  },

  minimizeWindow(id) {
    set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)) }))
  },
}))`,
  },

  'package.json': {
    lang: 'json',
    content: `{
  "name": "portfolio",
  "version": "1.0.0",
  "type": "module",
  "packageManager": "pnpm@10.28.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src",
    "format": "prettier --write src"
  },
  "dependencies": {
    "@react-three/csg": "^4.0.0",
    "@react-three/drei": "^10.7.7",
    "@react-three/fiber": "^9.6.1",
    "@react-three/postprocessing": "^3.0.4",
    "@codemirror/lang-javascript": "^6.2.5",
    "@codemirror/theme-one-dark": "^6.1.3",
    "codemirror": "^6.0.2",
    "leva": "^0.10.1",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "three": "^0.184.0",
    "zustand": "^5.0.14"
  }
}`,
  },
}

// ── File tree ──────────────────────────────────────────────────────────────────

export type TreeFile = { kind: 'file'; name: string; fileKey: string }
export type TreeDir = { kind: 'dir'; name: string; children: TreeNode[] }
export type TreeNode = TreeFile | TreeDir

export const TREE: TreeNode = {
  kind: 'dir',
  name: 'portfolio-3d',
  children: [
    {
      kind: 'dir',
      name: 'src',
      children: [
        { kind: 'file', name: 'App.tsx', fileKey: 'App.tsx' },
        {
          kind: 'dir',
          name: 'os/apps',
          children: [],
        },
        {
          kind: 'dir',
          name: 'scene',
          children: [{ kind: 'file', name: 'Experience.tsx', fileKey: 'Experience.tsx' }],
        },
        {
          kind: 'dir',
          name: 'store',
          children: [{ kind: 'file', name: 'useWindowStore.ts', fileKey: 'useWindowStore.ts' }],
        },
      ],
    },
    { kind: 'file', name: 'package.json', fileKey: 'package.json' },
  ],
}
