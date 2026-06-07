 // Moteur audio — sons UI synthétisés via Web Audio API + lecture de fichiers en boucle pour l'ambiance.

let ctx: AudioContext | null = null
let master: GainNode | null = null
let loop: {
  src: string
  el: HTMLAudioElement
  source: MediaElementAudioSourceNode
  gain: GainNode
} | null = null

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = 1
    master.connect(ctx.destination)
  }
  return ctx
}

/** À appeler au premier geste utilisateur — la politique navigateur exige une interaction. */
export function unlockAudio() {
  const c = getCtx()
  if (c.state === 'suspended') void c.resume()
}

export function setMuted(muted: boolean) {
  if (!ctx || !master) return
  master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.06)
}

/** Clic UI — blip percussif court. */
export function playClick() {
  const c = getCtx()
  if (!master) return
  const now = c.currentTime
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = 'square'
  osc.frequency.setValueAtTime(1300, now)
  osc.frequency.exponentialRampToValueAtTime(650, now + 0.045)
  gain.gain.setValueAtTime(0.05, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05)
  osc.connect(gain).connect(master)
  osc.start(now)
  osc.stop(now + 0.06)
}

/** Allumage — sweep ascendant, façon vieux poste qui démarre. */
export function playPowerOn() {
  const c = getCtx()
  if (!master) return
  const now = c.currentTime
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(110, now)
  osc.frequency.exponentialRampToValueAtTime(720, now + 0.8)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.07, now + 0.18)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.3)
  osc.connect(gain).connect(master)
  osc.start(now)
  osc.stop(now + 1.4)
}

/**
 * Joue un fichier audio en boucle (ambiance, musique de fond...).
 * `src` est une URL servie statiquement, ex. `/audio/ambient.mp3` (place le fichier dans `public/audio/`).
 * Si une boucle avec la même source tourne déjà, ne fait rien ; sinon remplace la boucle en cours.
 */
export function playLoop(src: string, volume = 0.25) {
  if (!master) return
  if (loop?.src === src) return
  stopLoop()

  const c = getCtx()
  const el = new Audio(src)
  el.loop = true
  el.crossOrigin = 'anonymous'

  const source = c.createMediaElementSource(el)
  const gain = c.createGain()
  gain.gain.value = 0.0001
  source.connect(gain).connect(master)

  void el.play()
  gain.gain.setTargetAtTime(volume, c.currentTime, 1.2)

  loop = { src, el, source, gain }
}

/** Arrête la boucle en cours (fondu de sortie puis coupure). */
export function stopLoop() {
  if (!loop || !ctx) return
  const { el, source, gain } = loop
  const now = ctx.currentTime
  gain.gain.setTargetAtTime(0.0001, now, 0.4)
  setTimeout(() => {
    el.pause()
    source.disconnect()
    gain.disconnect()
  }, 900)
  loop = null
}
