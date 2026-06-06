// Moteur audio procédural — synthétise les sons via Web Audio API, aucun asset requis.

let ctx: AudioContext | null = null
let master: GainNode | null = null
let ambient: { oscillators: OscillatorNode[]; gain: GainNode } | null = null

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

/** Bourdonnement d'ambiance — deux graves filtrés, en boucle, très discret. */
export function startAmbient() {
  if (ambient || !master) return
  const c = getCtx()

  const gain = c.createGain()
  gain.gain.value = 0.0001

  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 260

  const oscillators = [58, 87].map((freq) => {
    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    osc.connect(filter)
    osc.start()
    return osc
  })
  filter.connect(gain).connect(master)

  gain.gain.setTargetAtTime(0.018, c.currentTime, 1.2)
  ambient = { oscillators, gain }
}

export function stopAmbient() {
  if (!ambient || !ctx) return
  const { oscillators, gain } = ambient
  const now = ctx.currentTime
  gain.gain.setTargetAtTime(0.0001, now, 0.4)
  oscillators.forEach((o) => o.stop(now + 1.2))
  ambient = null
}
