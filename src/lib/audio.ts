// Moteur audio — sons UI synthétisés via Web Audio API + lecture de fichiers en boucle pour l'ambiance.

let ctx: AudioContext | null = null
let master: GainNode | null = null
let analyser: AnalyserNode | null = null
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

/**
 * Analyseur branché en parallèle de la sortie principale (en plus de `ctx.destination`,
 * sans rien retirer du graphe existant) — permet de lire la waveform temporelle réelle
 * de tout ce qui joue (clics UI, pluck de guitare, ambiance…) pour l'oscilloscope 3D.
 */
export function getAnalyser(): AnalyserNode {
  getCtx()
  if (!analyser && master && ctx) {
    analyser = ctx.createAnalyser()
    analyser.fftSize = 1024
    master.connect(analyser)
  }
  return analyser as AnalyserNode
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

/** Extinction — sweep descendant, façon vieux poste qui s'arrête. */
export function playPowerOff() {
  const c = getCtx()
  if (!master) return
  const now = c.currentTime
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(720, now)
  osc.frequency.exponentialRampToValueAtTime(90, now + 0.9)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.06, now + 0.12)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)
  osc.connect(gain).connect(master)
  osc.start(now)
  osc.stop(now + 1.3)
}

/** Bip POST façon vieux BIOS — court bip carré aigu. */
export function playBeep() {
  const c = getCtx()
  if (!master) return
  const now = c.currentTime
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = 'square'
  osc.frequency.setValueAtTime(980, now)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.05, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13)
  osc.connect(gain).connect(master)
  osc.start(now)
  osc.stop(now + 0.14)
}

/** Servo robot — petit sweep de fréquence + bruit filtré, façon moteur qui s'arme. */
export function playServo() {
  const c = getCtx()
  if (!master) return
  const now = c.currentTime

  // Sweep tonal (le "moteur")
  const osc = c.createOscillator()
  const oscGain = c.createGain()
  osc.type = 'square'
  osc.frequency.setValueAtTime(180, now)
  osc.frequency.exponentialRampToValueAtTime(620, now + 0.12)
  osc.frequency.exponentialRampToValueAtTime(320, now + 0.22)
  oscGain.gain.setValueAtTime(0.0001, now)
  oscGain.gain.exponentialRampToValueAtTime(0.04, now + 0.02)
  oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24)
  osc.connect(oscGain).connect(master)
  osc.start(now)
  osc.stop(now + 0.25)

  // Bruit filtré (le "frottement mécanique")
  const bufferSize = Math.floor(c.sampleRate * 0.2)
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

  const noise = c.createBufferSource()
  noise.buffer = buffer
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(900, now)
  filter.Q.value = 1.2
  const noiseGain = c.createGain()
  noiseGain.gain.setValueAtTime(0.0001, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.03, now + 0.015)
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2)

  noise.connect(filter).connect(noiseGain).connect(master)
  noise.start(now)
  noise.stop(now + 0.2)
}

/**
 * Pince de corde de guitare — synthèse Karplus-Strong.
 * Principe : on initialise une ligne à retard (longueur = sampleRate / freq) avec du bruit
 * blanc, puis on la rebouclera en moyennant chaque échantillon avec le suivant (filtre
 * passe-bas à 1 pôle dans la boucle de feedback). Les harmoniques hautes s'atténuent plus
 * vite que la fondamentale → le son devient progressivement plus "rond", comme une corde
 * pincée qui s'éteint. Le buffer entier (~2s) est précalculé une fois puis joué via
 * `AudioBufferSourceNode` (pas de ScriptProcessor, ni d'AudioWorklet à charger).
 */
export function playPluck(freq: number, gainValue = 0.18) {
  const c = getCtx()
  if (!master) return
  const now = c.currentTime
  const sampleRate = c.sampleRate
  const duration = 2 // secondes
  const length = Math.floor(sampleRate * duration)

  const buffer = c.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)

  // Ligne à retard de taille = période fondamentale en échantillons
  const delayLength = Math.max(2, Math.round(sampleRate / freq))
  const ring = new Float32Array(delayLength)
  for (let i = 0; i < delayLength; i++) ring[i] = Math.random() * 2 - 1

  // Coefficient d'amortissement du filtre passe-bas dans la boucle de feedback : plus il est
  // proche de 0.5, plus le son s'éteint vite et s'assourdit rapidement.
  const damping = 0.498

  let idx = 0
  for (let i = 0; i < length; i++) {
    const current = ring[idx]
    const next = ring[(idx + 1) % delayLength]
    const filtered = damping * (current + next)
    ring[idx] = filtered
    data[i] = current
    idx = (idx + 1) % delayLength
  }

  const source = c.createBufferSource()
  source.buffer = buffer

  // Léger filtre passe-bas global pour adoucir l'attaque du bruit initial
  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 4500

  const gain = c.createGain()
  gain.gain.setValueAtTime(gainValue, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  source.connect(filter).connect(gain).connect(master)
  source.start(now)
  source.stop(now + duration)
}

/** Allumage TV CRT — sweep aigu très rapide façon dégaussage de tube cathodique. */
export function playCrtOn() {
  const c = getCtx()
  if (!master) return
  const now = c.currentTime

  // Sweep haute fréquence, descendant rapidement (le "fwiiit" caractéristique)
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(8000, now)
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.35)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4)
  osc.connect(gain).connect(master)
  osc.start(now)
  osc.stop(now + 0.42)

  // Petit "thunk" basse fréquence (relais d'alimentation)
  const thunk = c.createOscillator()
  const thunkGain = c.createGain()
  thunk.type = 'sine'
  thunk.frequency.setValueAtTime(90, now)
  thunkGain.gain.setValueAtTime(0.0001, now)
  thunkGain.gain.exponentialRampToValueAtTime(0.06, now + 0.005)
  thunkGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)
  thunk.connect(thunkGain).connect(master)
  thunk.start(now)
  thunk.stop(now + 0.09)
}

/** LED qui grille — petit "pop" bref avec pitch descendant + souffle de bruit. */
export function playBurnout() {
  const c = getCtx()
  if (!master) return
  const now = c.currentTime

  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(500, now)
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.18)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2)
  osc.connect(gain).connect(master)
  osc.start(now)
  osc.stop(now + 0.21)

  const bufferSize = Math.floor(c.sampleRate * 0.08)
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

  const noise = c.createBufferSource()
  noise.buffer = buffer
  const noiseGain = c.createGain()
  noiseGain.gain.setValueAtTime(0.05, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)
  noise.connect(noiseGain).connect(master)
  noise.start(now)
  noise.stop(now + 0.08)
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
