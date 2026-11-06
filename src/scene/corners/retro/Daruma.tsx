import { useMemo } from 'react'
import { SRGBColorSpace, Vector2 } from 'three'

const PROFILE = [
  new Vector2(0, 0),
  new Vector2(0.035, 0),
  new Vector2(0.05, 0.016),
  new Vector2(0.058, 0.038),
  new Vector2(0.06, 0.061),
  new Vector2(0.059, 0.083),
  new Vector2(0.054, 0.104),
  new Vector2(0.043, 0.122),
  new Vector2(0.025, 0.135),
  new Vector2(0, 0.14),
]

function paintDaruma() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  ctx.fillStyle = '#b6382c'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Le visage et les motifs sont peints directement sur la coque.
  ctx.translate(canvas.width / 2, 0)
  ctx.fillStyle = '#edd4ac'
  ctx.fill(
    new Path2D('M0 24C-15 20-32 28-30 43Q-29 63 0 66Q29 63 30 43C32 28 15 20 0 24Z')
  )

  for (const side of [-1, 1]) {
    ctx.save()
    ctx.scale(side, 1)
    ctx.fillStyle = '#fff0d8'
    ctx.beginPath()
    ctx.ellipse(12, 42, 7.5, 5.5, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#2c211e'
    ctx.beginPath()
    ctx.arc(12, 42, 3.4, 0, Math.PI * 2)
    ctx.fill()
    ctx.fill(new Path2D('M4 35Q12 24 25 33L24 38Q14 33 4 38Z'))
    ctx.fill(new Path2D('M0 51Q10 47 23 50Q16 53 19 57Q9 55 2 56Z'))
    ctx.restore()
  }

  ctx.fillStyle = '#2c211e'
  ctx.fill(new Path2D('M-7 59Q0 61 7 59Q0 64-7 59Z'))
  ctx.strokeStyle = '#e9b96b'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.stroke(new Path2D('M0 76V96M-17 74Q-17 86-9 91M17 74Q17 86 9 91'))

  return canvas
}

export function Daruma() {
  const paint = useMemo(() => paintDaruma(), [])

  return (
    <mesh rotation={[0, Math.PI, 0]} scale={[1, 1, 0.84]} receiveShadow>
      <latheGeometry args={[PROFILE, 24]} />
      <meshStandardMaterial roughness={0.76}>
        <canvasTexture attach="map" args={[paint]} colorSpace={SRGBColorSpace} />
      </meshStandardMaterial>
    </mesh>
  )
}
