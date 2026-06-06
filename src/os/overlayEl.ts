// Singleton DOM refs partagés entre BootOverlay (hors Canvas) et ScreenProjector (dans Canvas)
export let overlayEl: HTMLDivElement | null = null
export let innerEl: HTMLDivElement | null = null

export function setOverlayEl(el: HTMLDivElement | null) {
  overlayEl = el
}
export function setInnerEl(el: HTMLDivElement | null) {
  innerEl = el
}
