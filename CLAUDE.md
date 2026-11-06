# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (see `packageManager` in package.json).

- `pnpm dev` — start Vite dev server
- `pnpm build` — typecheck (`tsc`) then production build (`vite build`)
- `pnpm preview` — preview the production build
- `pnpm lint` — oxlint on `src` (config: `.oxlintrc.json`)
- `pnpm format` — oxfmt write on `src` (`pnpm format:check` to check only)

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

Source layout (hybrid — layers at the top level, grouped by domain inside):
- `scene/` — all R3F: `core/` (Experience, Lighting, PostProcessing, PowerSequence),
  `camera/` (CameraRig, Hotspot, pois), `desk/` (DeskScene + furniture sub-components),
  `corners/{robot,guitar,workbench,retro,lego}/` (one folder per themed corner).
- `os/` — the fake desktop: `shell/` (Desktop + topbar/taskbar/start menu/icons/toasts),
  `window/` (Window, ScreenContent, ScreenPortal, FullscreenOverlay, appRegistry, screen),
  `apps/` (one lazy chunk per app, + `apps/data/`).
- `lib/` — framework-free logic: `audio.ts`, `games/`, `circuit/` (logic-gate eval),
  `terminal/` (virtual FS + command parser + completion).
- `store/` (Zustand), `components/` (DOM chrome), `editor/` (dev-only scene editor).

### Camera: POI registry + hotspots
`scene/camera/pois.ts` is the registry of camera points of interest (`overview`, `screen`,
`guitar`, `workbench`, `crt`, `legos`, `robot`), each with camera position/target and optional
zoom constraints. `useCameraStore` holds the active `PoiId` (`focusOn` / `back`);
`scene/camera/CameraRig.tsx` animates `CameraControls` toward the active POI. Clickable
`scene/camera/Hotspot.tsx` markers in the scene trigger `focusOn`.

### Power sequencing
`usePowerStore` drives a boot sequence (`off` → `booting` → `on`), orchestrated by
`scene/core/PowerSequence.tsx`: it focuses the camera on the `screen` POI, plays the power-on sound,
and starts the ambient loop once booted.

### The screen portal trick
`os/window/ScreenContent.tsx` (the desktop OS UI) is mounted **once** and reparented via
`createPortal` between two possible DOM targets registered in `useScreenStore`
(`dockedEl` — a DOM node living inside the 3D scene via `<Html>`, anchored in
`scene/desk/Monitor.tsx`, and `fullscreenEl` — an overlay outside the canvas). This is what
lets the user toggle fullscreen without unmounting/remounting the OS (windows, terminal state,
focus, etc.). See `os/window/ScreenPortal.tsx` and `os/window/FullscreenOverlay.tsx`.

### Fake desktop OS
`os/shell/Desktop.tsx` is the OS shell orchestrator (its topbar, desktop icons, taskbar, start
menu and toasts live as sub-components in `os/shell/*`) and renders `os/window/Window.tsx`
instances from `useWindowStore` (open/close/focus/move/resize/minimize, with z-index stacking
via `_top`). Apps are registered in `os/window/appRegistry.tsx` as
`APP_REGISTRY: Record<appId, AppMeta>`, each lazily imported (`lazy(() => import(...))`) so
every app ships as its own chunk, loaded on first open. Apps live in `os/apps/*`
(Projects, About, Contact, Terminal, FileExplorer, RecycleBin, CodeEditor, RobotLab, CircuitLab);
their static data sits in `os/apps/data/`.

### Scene corners and mini-games
`scene/desk/DeskScene.tsx` composes the room (a thin orchestrator; the desk, monitor, tower,
lamp, books… are sub-components in `scene/desk/*`). Each corner under `scene/corners/<name>/`
pairs a 3D prop with interactive logic:
- `corners/guitar/` — playable guitar; string synthesis (Karplus-Strong) lives in
  `lib/audio.ts`; includes a Simon-style memory game.
- `corners/workbench/` (`Workbench.tsx` + gltfjsx `OscilloscopeModel.tsx`) — electronics bench;
  the CircuitLab app (`useCircuitStore`) drives it, gate-eval logic lives in `lib/circuit/`.
- `corners/retro/` — CRT TV with shader (`crtShader.ts`); game logic is pure TS in `lib/games/`
  (`pong.ts`, shared `types.ts`) rendered onto the TV via `useGameLoop`.
- `corners/lego/` — step-by-step build + physics tower (`@react-three/rapier`, `useLegoStore`);
  brick data/helpers in `bricks.ts`.
- `corners/robot/` (`Robot.tsx` / `RobotModel.tsx` + `parts/`) — desk robot moving on a grid;
  programmed from the RobotLab app via `useRobotStore` (grid constants + `cellToWorld` live in
  the store).

### Zustand stores (`src/store/`)
Each store owns one narrow slice of cross-cutting state: `usePowerStore`, `useCameraStore`,
`useScreenStore`, `useWindowStore`, `useDeskStore` (standing desk), `useAudioStore`,
`useToastStore` (OS notifications, rendered by `os/shell/Toasts.tsx`), `useRobotStore`,
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
`<Stats />` perf overlay in `scene/core/Experience.tsx`.

## Sub-agents

- Delegate non-trivial work on `scene/*` (Three.js / R3F / drei / rapier / shaders / perf)
  to the **react-r3f-senior** agent.
- Delegate non-trivial work on `os/*` (fake OS shell, windows, apps) to the **os-ui-dev** agent.
- Use **convention-reviewer** for a read-only review pass before committing significant changes.

## Conventions

- French is used for in-app UI strings, comments, and locale formatting (`fr-FR`).
- No semicolons, single quotes, 100-char width — enforced by oxfmt (`.oxfmtrc.json`,
  Prettier-compatible).
- Never use `index.ts` as a barrel file.
- R3F perf rules: no `setState` in `useFrame`, no per-frame allocations (hoist temp vectors),
  memoize geometries/materials, prefer mutating refs.

## Agent skills

### Issue tracker

Issues and PRDs live in this repo's GitHub Issues, driven by the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical label vocabulary — `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`,
`wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
