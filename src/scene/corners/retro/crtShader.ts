import { GAME_WIDTH, GAME_HEIGHT } from '@/lib/games/types'

// Résolution de la texture canvas de l'écran (le jeu dessine en 320x240, on suréchantillonne
// un peu pour limiter le flou une fois mappé sur le plan convexe).
export const SCREEN_TEX_W = GAME_WIDTH * 2
export const SCREEN_TEX_H = GAME_HEIGHT * 2

// ─── Shader CRT ──────────────────────────────────────────────────────────────────
//
// Overlay scanlines + vignette + légère distorsion en barillet appliqué à la texture du
// canvas de jeu. ShaderMaterial brut (pas besoin de `shaderMaterial`/`extend` pour un
// matériau utilisé une seule fois).

export const CRT_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const CRT_FRAGMENT_SHADER = /* glsl */ `
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
