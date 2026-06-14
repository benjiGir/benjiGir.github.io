// ─── Persistance du meilleur score (Simon musical) ──────────────────────────

const HIGH_SCORE_KEY = 'guitar-simon-highscore'

export function readHighScore(): number {
  try {
    const raw = localStorage.getItem(HIGH_SCORE_KEY)
    return raw ? Math.max(0, parseInt(raw, 10) || 0) : 0
  } catch {
    return 0
  }
}

export function writeHighScore(score: number) {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(score))
  } catch {
    // localStorage indisponible (navigation privée…) — on ignore silencieusement
  }
}
