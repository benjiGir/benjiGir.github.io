# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (see `packageManager` in package.json).

- `pnpm dev` — start Vite dev server
- `pnpm build` — typecheck (`tsc`) then production build (`vite build`)
- `pnpm preview` — preview the production build
- `pnpm lint` — eslint on `src`
- `pnpm format` — prettier write on `src`

**Do not run `pnpm dev` / `pnpm build` / any node process yourself** — the user runs them and
pastes the output back. `pnpm lint` is fine.

There is no test suite in this project.

Path alias `@` resolves to `src/` (configured in both `vite.config.ts` and `tsconfig.json`).

Deployment is GitHub Pages via `.github/workflows/deploy.yml` (push on `main`).

## Big-picture architecture

This is a 3D portfolio: a react-three-fiber room scene (desk + computer, plus themed corners),
whose computer screen renders a fake desktop "OS" (windows, taskbar, apps). Two parallel layers
compose the page in `App.tsx`: the R3F `<Canvas>` (3D scene) and DOM overlays (UI chrome,
fullscreen, audio).

### Camera: POI registry + hotspots
`scene/pois.ts` is the registry of camera points of interest (`overview`, `screen`, `guitar`,
`workbench`, `crt`, `legos`, `robot`), each with camera position/target and optional zoom
constraints. `useCameraStore` holds the active `PoiId` (`focusOn` / `back`); `scene/CameraRig.tsx`
animates `CameraControls` toward the active POI. Clickable `scene/Hotspot.tsx` markers in the
scene trigger `focusOn`.

### Power sequencing
`usePowerStore` drives a boot sequence (`off` → `booting` → `on`), orchestrated by
`scene/PowerSequence.tsx`: it focuses the camera on the `screen` POI, plays the power-on sound,
and starts the ambient loop once booted.

### The screen portal trick
`os/ScreenContent.tsx` (the desktop OS UI) is mounted **once** and reparented via
`createPortal` between two possible DOM targets registered in `useScreenStore`
(`dockedEl` — a DOM node living inside the 3D scene via `<Html>`, and `fullscreenEl` — an
overlay outside the canvas). This is what lets the user toggle fullscreen without
unmounting/remounting the OS (windows, terminal state, focus, etc.). See `os/ScreenPortal.tsx`
and `os/FullscreenOverlay.tsx`.

### Fake desktop OS
`os/Desktop.tsx` is the OS shell (topbar, desktop icons, taskbar, start menu, toasts) and renders
`os/Window.tsx` instances from `useWindowStore` (open/close/focus/move/resize/minimize, with
z-index stacking via `_top`). Apps are registered in `os/appRegistry.tsx` as
`APP_REGISTRY: Record<appId, AppMeta>`, each lazily imported (`lazy(() => import(...))`) so
every app ships as its own chunk, loaded on first open. Apps live in `os/apps/*`
(Projects, About, Contact, Terminal, FileExplorer, RecycleBin, CodeEditor, RobotLab, CircuitLab).

### Scene corners and mini-games
`scene/DeskScene.tsx` composes the room. Each corner pairs a 3D prop with interactive logic:
- `scene/Guitar.tsx` — playable guitar; string synthesis (Karplus-Strong) lives in
  `lib/audio.ts`; includes a Simon-style memory game.
- `scene/Workbench.tsx` + `scene/OscilloscopeModel.tsx` — electronics bench; the CircuitLab
  app (`useCircuitStore`) drives it.
- `scene/RetroCorner.tsx` — CRT TV with shader; game logic is pure TS in `lib/games/`
  (`pong.ts`, shared `types.ts`) rendered onto the TV.
- `scene/LegoCorner.tsx` — step-by-step build + physics tower (`@react-three/rapier`,
  `useLegoStore`).
- `scene/Robot.tsx` / `RobotModel.tsx` — desk robot moving on a grid; programmed from the
  RobotLab app via `useRobotStore` (grid constants + `cellToWorld` live in the store).

### Zustand stores (`src/store/`)
Each store owns one narrow slice of cross-cutting state: `usePowerStore`, `useCameraStore`,
`useScreenStore`, `useWindowStore`, `useDeskStore` (standing desk), `useAudioStore`,
`useToastStore` (OS notifications, rendered by `os/Toasts.tsx`), `useRobotStore`,
`useLegoStore`, `useCircuitStore`. Components subscribe with selectors
(e.g. `useWindowStore((s) => s.windows)`). 3D-facing stores are also read transiently in
`useFrame` via `getState()` to avoid re-renders.

### Audio engine
`lib/audio.ts` is a small hand-rolled Web Audio API layer: short UI sounds (clicks, power-on)
and guitar strings are synthesized (oscillators / Karplus-Strong), while ambient tracks are
looped `<audio>` elements routed through a master gain node. `unlockAudio()` must run on first
user gesture (browser autoplay policy) — see `components/AudioUnlock.tsx`. Mute is global via
the master gain (`setMuted`, wired to `useAudioStore`/`MuteToggle`).

### Debug mode
`VITE_DEBUG` env var (see `.env` / `.env.development`) gates `leva` controls and the
`<Stats />` perf overlay in `scene/Experience.tsx`.

## Sub-agents

- Delegate non-trivial work on `scene/*` (Three.js / R3F / drei / rapier / shaders / perf)
  to the **react-r3f-senior** agent.
- Delegate non-trivial work on `os/*` (fake OS shell, windows, apps) to the **os-ui-dev** agent.
- Use **convention-reviewer** for a read-only review pass before committing significant changes.

## Conventions

- French is used for in-app UI strings, comments, and locale formatting (`fr-FR`).
- No semicolons, single quotes, 100-char width — enforced by Prettier (`.prettierrc`) and
  `eslint-config-prettier`.
- Never use `index.ts` as a barrel file.
- R3F perf rules: no `setState` in `useFrame`, no per-frame allocations (hoist temp vectors),
  memoize geometries/materials, prefer mutating refs.
