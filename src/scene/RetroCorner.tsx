import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import Hotspot from '@/scene/Hotspot'
import Editable from '@/editor/Editable'
import { useCameraStore } from '@/store/useCameraStore'
import { playClick, playCrtOn } from '@/lib/audio'
import { createPong } from '@/lib/games/pong'
import { GAME_WIDTH, GAME_HEIGHT, type GameInputs, type GameModule } from '@/lib/games/types'

// ─── Constantes ────────────────────────────────────────────────────────────────

const CABINET_COLOR = '#5a4632'
const CABINET_TOP_COLOR = '#6f5a40'
const TV_SHELL_COLOR = '#d8d3c4'
const TV_TRIM_COLOR = '#3a3a3a'
const CONSOLE_COLOR = '#2b2b2b'
const PAD_COLOR = '#222226'
const CARTRIDGE_COLORS = ['#c0392b', '#2980b9', '#27ae60'] as const

// Résolution de la texture canvas de l'écran (le jeu dessine en 320x240, on suréchantillonne
// un peu pour limiter le flou une fois mappé sur le plan convexe).
const SCREEN_TEX_W = GAME_WIDTH * 2
const SCREEN_TEX_H = GAME_HEIGHT * 2

// ─── Shader CRT ──────────────────────────────────────────────────────────────────
//
// Overlay scanlines + vignette + légère distorsion en barillet appliqué à la texture du
// canvas de jeu. ShaderMaterial brut (pas besoin de `shaderMaterial`/`extend` pour un
// matériau utilisé une seule fois).

const CRT_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const CRT_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D map;
  uniform float time;
  uniform float on;
  varying vec2 vUv;

  void main() {
    // Distorsion en barillet légère (centre étiré, bords resserrés)
    vec2 uv = vUv * 2.0 - 1.0;
    float r2 = dot(uv, uv);
    uv *= 1.0 + 0.06 * r2;
    uv = uv * 0.5 + 0.5;

    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }

    vec3 color = texture2D(map, uv).rgb;

    // Scanlines horizontales
    float scanline = sin(uv.y * 240.0 * 3.14159) * 0.5 + 0.5;
    color *= 0.85 + 0.15 * scanline;

    // Vignette
    float vignette = smoothstep(1.0, 0.35, length(uv - 0.5) * 1.4);
    color *= vignette;

    // Léger scintillement façon tube cathodique
    float flicker = 0.97 + 0.03 * sin(time * 18.0);
    color *= flicker;

    // Écran éteint = noir (TV pas encore allumée)
    color *= on;

    gl_FragColor = vec4(color, 1.0);
  }
`

// ─── Meuble bas ──────────────────────────────────────────────────────────────────

function Cabinet() {
  return (
    <group>
      {/* Caisson — élargi (1.15) pour laisser la place à la console à droite de la TV */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.15, 0.5, 0.42]} />
        <meshStandardMaterial color={CABINET_COLOR} roughness={0.8} />
      </mesh>
      {/* Plateau */}
      <mesh position={[0, 0.51, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.19, 0.025, 0.46]} />
        <meshStandardMaterial color={CABINET_TOP_COLOR} roughness={0.6} />
      </mesh>
      {/* Petite porte (façade) */}
      <mesh position={[0, 0.25, 0.211]}>
        <boxGeometry args={[1.05, 0.42, 0.005]} />
        <meshStandardMaterial color="#4a3a28" roughness={0.7} />
      </mesh>
      {/* Poignée */}
      <mesh position={[0.44, 0.25, 0.218]} castShadow>
        <cylinderGeometry args={[0.006, 0.006, 0.06, 8]} />
        <meshStandardMaterial color="#c9a96e" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

// ─── TV CRT ────────────────────────────────────────────────────────────────────
//
// Caisson bombé : boîte principale + face avant légèrement renflée (mesh sphérique aplati
// en guise de bombement, masqué derrière l'écran). L'écran est un plan légèrement convexe
// (segments + déplacement radial appliqué via une géométrie custom).

interface TvScreenProps {
  texture: THREE.CanvasTexture
  on: boolean
}

function TvScreen({ texture, on }: TvScreenProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  // Géométrie de l'écran légèrement bombée : plan subdivisé dont on pousse les sommets vers
  // l'avant (axe Z local) en fonction de la distance au centre — effet "verre convexe".
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(0.46, 0.36, 24, 18)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const d = Math.sqrt(x * x + y * y)
      pos.setZ(i, d * d * 0.18)
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  // L'écran démarre toujours éteint (`on: 0`) — la transition vers `on`/`off` est ensuite
  // gérée par mutation directe de `mat.uniforms.on.value` dans useFrame, sans recréer l'objet
  // uniforms (ce qui réinitialiserait `time`).
  const uniforms = useMemo(
    () => ({
      map: { value: texture },
      time: { value: 0 },
      on: { value: 0 },
    }),
    [texture]
  )

  useFrame((_, delta) => {
    const mat = materialRef.current
    if (!mat) return
    mat.uniforms.time.value += delta
    // Transition douce à l'allumage/extinction
    const target = on ? 1 : 0
    mat.uniforms.on.value += (target - mat.uniforms.on.value) * Math.min(1, delta * 6)
  })

  return (
    <mesh geometry={geometry} position={[0, 0, 0.001]}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={CRT_VERTEX_SHADER}
        fragmentShader={CRT_FRAGMENT_SHADER}
        uniforms={uniforms}
        toneMapped={false}
      />
    </mesh>
  )
}

interface TvProps {
  texture: THREE.CanvasTexture
  on: boolean
  onCartridgeClick: (e: ThreeEvent<MouseEvent>) => void
}

function Tv({ texture, on, onCartridgeClick }: TvProps) {
  return (
    <group position={[-0.22, 0.79, 0.05]}>
      {/* Caisson principal — demi-profondeur 0.25, face avant en z=0.25 */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.46, 0.5]} />
        <meshStandardMaterial color={TV_SHELL_COLOR} roughness={0.55} />
      </mesh>
      {/* Bezel (rebord fin) autour de l'écran — léger surplomb pour l'effet "verre bombé"
          sans recouvrir l'écran ni le cadre */}
      <mesh position={[0, 0, 0.252]}>
        <boxGeometry args={[0.56, 0.42, 0.012]} />
        <meshStandardMaterial color={TV_SHELL_COLOR} roughness={0.55} />
      </mesh>
      {/* Cadre sombre autour de l'écran */}
      <mesh position={[0, 0, 0.259]}>
        <boxGeometry args={[0.5, 0.4, 0.02]} />
        <meshStandardMaterial color={TV_TRIM_COLOR} roughness={0.5} />
      </mesh>
      {/* Écran (canvas + shader CRT) — légèrement en avant du cadre */}
      <group position={[0, 0, 0.27]}>
        <TvScreen texture={texture} on={on} />
      </group>
      {/* Boutons / molettes en façade */}
      <mesh position={[0.27, 0.16, 0.259]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.02, 12]} />
        <meshStandardMaterial color="#888" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.27, 0.1, 0.259]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.02, 12]} />
        <meshStandardMaterial color="#666" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Antenne (deux brins) */}
      <group position={[0, 0.23, -0.1]}>
        <mesh position={[-0.05, 0.12, 0]} rotation={[0, 0, 0.35]} castShadow>
          <cylinderGeometry args={[0.003, 0.003, 0.24, 6]} />
          <meshStandardMaterial color="#999" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.05, 0.12, 0]} rotation={[0, 0, -0.35]} castShadow>
          <cylinderGeometry args={[0.003, 0.003, 0.24, 6]} />
          <meshStandardMaterial color="#999" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      {/* Console posée devant la TV, sur le meuble */}
      <Console onCartridgeClick={onCartridgeClick} />
    </group>
  )
}

// ─── Console + manette + cartouches ──────────────────────────────────────────────

interface ConsoleProps {
  onCartridgeClick: (e: ThreeEvent<MouseEvent>) => void
}

function Console({ onCartridgeClick }: ConsoleProps) {
  // Position relative au groupe `Tv` (qui est à y=0.79, z=0.05 dans le groupe racine de
  // RetroCorner) :
  // - y = -0.245 → centre du boîtier (hauteur 0.045) posé sur le plateau du meuble (dessus à
  //   y≈0.5225 en coordonnées racine, soit 0.5225 + 0.0225 - 0.79 = -0.245)
  // - x = 0.54 → à droite de la TV, dans l'espace libre du plateau élargi
  // - z = 0 → centré sur la profondeur du plateau (z_world = 0.05, plateau ∈ [-0.18, 0.28])
  return (
    <group position={[0.54, -0.245, 0]}>
      {/* Boîtier console — légèrement réduit pour tenir à côté de la manette et des cartouches */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.26, 0.045, 0.2]} />
        <meshStandardMaterial color={CONSOLE_COLOR} roughness={0.5} />
      </mesh>
      {/* Fente cartouche */}
      <mesh position={[0, 0.026, -0.035]}>
        <boxGeometry args={[0.13, 0.006, 0.045]} />
        <meshStandardMaterial color="#111" roughness={0.6} />
      </mesh>
      {/* Bouton power */}
      <mesh position={[0.1, 0.026, 0.07]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.012, 12]} />
        <meshStandardMaterial color="#c0392b" roughness={0.4} />
      </mesh>

      {/* Manette posée devant la console (vers le bord avant du meuble) */}
      <group position={[-0.04, 0.026, 0.1]} rotation={[0, 0.25, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.018, 0.16]} />
          <meshStandardMaterial color={PAD_COLOR} roughness={0.55} />
        </mesh>
        {/* Croix directionnelle */}
        <mesh position={[-0.025, 0.011, 0.04]} castShadow>
          <boxGeometry args={[0.035, 0.006, 0.012]} />
          <meshStandardMaterial color="#444" roughness={0.5} />
        </mesh>
        <mesh position={[-0.025, 0.011, 0.04]} castShadow>
          <boxGeometry args={[0.012, 0.006, 0.035]} />
          <meshStandardMaterial color="#444" roughness={0.5} />
        </mesh>
        {/* Boutons d'action */}
        <mesh position={[0.03, 0.012, -0.04]} castShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.008, 12]} />
          <meshStandardMaterial color="#c0392b" roughness={0.4} />
        </mesh>
        <mesh position={[0.05, 0.012, -0.02]} castShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.008, 12]} />
          <meshStandardMaterial color="#2980b9" roughness={0.4} />
        </mesh>
      </group>

      {/* Cartouches empilées contre le flanc droit de la console — la première (rouge) lance
          Pong au clic */}
      {CARTRIDGE_COLORS.map((color, i) => (
        <mesh
          key={color}
          position={[0.16 + i * 0.018, 0.04, -0.04 + i * 0.04]}
          rotation={[0, -0.15, -Math.PI / 2 + 0.08]}
          castShadow
          receiveShadow
          onClick={i === 0 ? onCartridgeClick : undefined}
          onPointerOver={i === 0 ? () => (document.body.style.cursor = 'pointer') : undefined}
          onPointerOut={i === 0 ? () => (document.body.style.cursor = 'auto') : undefined}
        >
          <boxGeometry args={[0.045, 0.065, 0.012]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Écran de jeu (canvas hors-écran → CanvasTexture) ─────────────────────────────

interface UseGameLoopArgs {
  active: boolean
  on: boolean
  texture: THREE.CanvasTexture
  ctx2d: CanvasRenderingContext2D | null
  inputsRef: MutableRefObject<GameInputs>
  gameRef: MutableRefObject<GameModule | null>
}

function useGameLoop({ active, on, texture, ctx2d, inputsRef, gameRef }: UseGameLoopArgs) {
  useFrame((_, delta) => {
    // Perf : on ne met à jour la simulation/texture que lorsque le POI 'crt' est actif et la
    // TV allumée (cartouche insérée) — pas de redraw 60fps en permanence.
    if (!active || !on || !ctx2d || !gameRef.current) return

    gameRef.current.update(delta, inputsRef.current)
    gameRef.current.draw(ctx2d)
    texture.needsUpdate = true
  })
}

// ─── RetroCorner (export) ─────────────────────────────────────────────────────────
//
// Coin jeu (mur du fond gauche, x≈-2.4, z≈-3.6) : meuble bas + TV CRT + console + manette +
// cartouches. Cliquer la cartouche rouge allume la TV (`playCrtOn`) et démarre Pong, dessiné
// dans un canvas 2D hors-écran (`lib/games/pong.ts`) projeté sur l'écran via CanvasTexture +
// shader CRT (scanlines/vignette/distorsion). Contrôles ↑/↓ actifs uniquement quand le POI
// 'crt' est actif.

export default function RetroCorner() {
  const activePoi = useCameraStore((s) => s.poi)
  const poiActive = activePoi === 'crt'

  // État "TV allumée / jeu démarré" — change une seule fois par session (clic cartouche),
  // un useState ponctuel est inoffensif (pas de mutation par frame).
  const [on, setOn] = useState(false)
  const gameRef = useRef<GameModule | null>(null)
  const inputsRef = useRef<GameInputs>({ up: false, down: false })

  // Canvas hors-écran + texture (créés une fois)
  const canvas = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = SCREEN_TEX_W
    c.height = SCREEN_TEX_H
    return c
  }, [])
  const ctx2d = useMemo(() => {
    const ctx = canvas.getContext('2d')
    // Le jeu dessine en 320x240 — on étire le contexte pour remplir la texture suréchantillonnée
    if (ctx) ctx.scale(SCREEN_TEX_W / GAME_WIDTH, SCREEN_TEX_H / GAME_HEIGHT)
    return ctx
  }, [canvas])
  const texture = useMemo(() => {
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [canvas])

  // Écran éteint par défaut
  useEffect(() => {
    if (!ctx2d) return
    ctx2d.fillStyle = '#000'
    ctx2d.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    texture.needsUpdate = true
  }, [ctx2d, texture])

  // Contrôles clavier ↑/↓ — actifs uniquement quand le POI 'crt' est actif
  useEffect(() => {
    if (!poiActive) {
      inputsRef.current.up = false
      inputsRef.current.down = false
      return
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowUp') inputsRef.current.up = true
      if (e.key === 'ArrowDown') inputsRef.current.down = true
    }
    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === 'ArrowUp') inputsRef.current.up = false
      if (e.key === 'ArrowDown') inputsRef.current.down = false
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      inputsRef.current.up = false
      inputsRef.current.down = false
    }
  }, [poiActive])

  function handleCartridgeClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    if (!poiActive || on) return
    playClick()
    playCrtOn()
    setOn(true)
    if (!gameRef.current) gameRef.current = createPong()
    gameRef.current.init()
  }

  useGameLoop({
    active: poiActive,
    on,
    texture,
    ctx2d,
    inputsRef,
    gameRef,
  })

  return (
    <Hotspot poi="crt" label="Coin jeu" position={[-2.4, 0, -3.6]}>
      <Editable id="crt" label="Coin jeu (CRT)" rotation={[0, -0.5, 0]}>
        <Cabinet />
        <Tv texture={texture} on={on} onCartridgeClick={handleCartridgeClick} />
      </Editable>
    </Hotspot>
  )
}
