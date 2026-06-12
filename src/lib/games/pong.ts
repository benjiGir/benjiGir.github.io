// Cartouche Pong — implémente `GameModule`. Joueur = raquette gauche (↑/↓), adversaire =
// raquette droite pilotée par une IA simple qui suit la balle avec un peu de retard.

import { GAME_WIDTH, GAME_HEIGHT, type GameInputs, type GameModule } from '@/lib/games/types'

const PADDLE_WIDTH = 8
const PADDLE_HEIGHT = 44
const PADDLE_MARGIN = 12
const PADDLE_SPEED = 220 // px/s
const BALL_SIZE = 6
const BALL_SPEED_INITIAL = 160 // px/s
const BALL_SPEED_MAX = 380
const AI_REACTION = 6 // px/s de marge de "réflexion" (plus haut = IA plus lente)

interface Vec2 {
  x: number
  y: number
}

class Pong implements GameModule {
  private playerY = 0
  private aiY = 0
  private ball: Vec2 = { x: 0, y: 0 }
  private ballVel: Vec2 = { x: 0, y: 0 }
  private playerScore = 0
  private aiScore = 0

  init() {
    this.playerY = (GAME_HEIGHT - PADDLE_HEIGHT) / 2
    this.aiY = (GAME_HEIGHT - PADDLE_HEIGHT) / 2
    this.playerScore = 0
    this.aiScore = 0
    this.resetBall(1)
  }

  private resetBall(direction: 1 | -1) {
    this.ball = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 }
    // Angle aléatoire modéré pour éviter les échanges purement horizontaux
    const angle = (Math.random() * 2 - 1) * 0.5
    this.ballVel = {
      x: Math.cos(angle) * BALL_SPEED_INITIAL * direction,
      y: Math.sin(angle) * BALL_SPEED_INITIAL,
    }
  }

  update(dt: number, inputs: GameInputs) {
    // Raquette joueur (gauche)
    if (inputs.up) this.playerY -= PADDLE_SPEED * dt
    if (inputs.down) this.playerY += PADDLE_SPEED * dt
    this.playerY = clamp(this.playerY, 0, GAME_HEIGHT - PADDLE_HEIGHT)

    // IA raquette droite : suit le centre de la balle avec une marge morte
    const aiCenter = this.aiY + PADDLE_HEIGHT / 2
    const ballCenter = this.ball.y
    if (Math.abs(aiCenter - ballCenter) > AI_REACTION) {
      this.aiY += Math.sign(ballCenter - aiCenter) * PADDLE_SPEED * 0.85 * dt
    }
    this.aiY = clamp(this.aiY, 0, GAME_HEIGHT - PADDLE_HEIGHT)

    // Balle
    this.ball.x += this.ballVel.x * dt
    this.ball.y += this.ballVel.y * dt

    // Rebond haut/bas
    if (this.ball.y <= 0 || this.ball.y >= GAME_HEIGHT - BALL_SIZE) {
      this.ballVel.y *= -1
      this.ball.y = clamp(this.ball.y, 0, GAME_HEIGHT - BALL_SIZE)
    }

    // Collision raquette gauche
    if (
      this.ballVel.x < 0 &&
      this.ball.x <= PADDLE_MARGIN + PADDLE_WIDTH &&
      this.ball.x + BALL_SIZE >= PADDLE_MARGIN &&
      this.ball.y + BALL_SIZE >= this.playerY &&
      this.ball.y <= this.playerY + PADDLE_HEIGHT
    ) {
      this.bounceOffPaddle(this.playerY, 1)
    }

    // Collision raquette droite
    const aiX = GAME_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH
    if (
      this.ballVel.x > 0 &&
      this.ball.x + BALL_SIZE >= aiX &&
      this.ball.x <= aiX + PADDLE_WIDTH &&
      this.ball.y + BALL_SIZE >= this.aiY &&
      this.ball.y <= this.aiY + PADDLE_HEIGHT
    ) {
      this.bounceOffPaddle(this.aiY, -1)
    }

    // Sortie de terrain → point + reset
    if (this.ball.x < 0) {
      this.aiScore++
      this.resetBall(1)
    } else if (this.ball.x > GAME_WIDTH) {
      this.playerScore++
      this.resetBall(-1)
    }
  }

  /** Renvoie la balle en ajustant l'angle selon le point d'impact sur la raquette. */
  private bounceOffPaddle(paddleY: number, direction: 1 | -1) {
    const relativeIntersect =
      (this.ball.y + BALL_SIZE / 2 - (paddleY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2)
    const bounceAngle = relativeIntersect * (Math.PI / 3) // max ±60°
    const speed = Math.min(Math.hypot(this.ballVel.x, this.ballVel.y) * 1.05, BALL_SPEED_MAX)
    this.ballVel = {
      x: Math.cos(bounceAngle) * speed * direction,
      y: Math.sin(bounceAngle) * speed,
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Fond
    ctx.fillStyle = '#04140a'
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    // Ligne médiane pointillée
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.35)'
    ctx.lineWidth = 2
    ctx.setLineDash([6, 8])
    ctx.beginPath()
    ctx.moveTo(GAME_WIDTH / 2, 0)
    ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT)
    ctx.stroke()
    ctx.setLineDash([])

    // Raquettes
    ctx.fillStyle = '#4ade80'
    ctx.fillRect(PADDLE_MARGIN, this.playerY, PADDLE_WIDTH, PADDLE_HEIGHT)
    ctx.fillRect(GAME_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH, this.aiY, PADDLE_WIDTH, PADDLE_HEIGHT)

    // Balle
    ctx.fillRect(this.ball.x, this.ball.y, BALL_SIZE, BALL_SIZE)

    // Score
    ctx.fillStyle = '#4ade80'
    ctx.font = '20px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(String(this.playerScore), GAME_WIDTH / 2 - 30, 28)
    ctx.fillText(String(this.aiScore), GAME_WIDTH / 2 + 30, 28)
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Crée une nouvelle instance de la cartouche Pong. */
export function createPong(): GameModule {
  return new Pong()
}
