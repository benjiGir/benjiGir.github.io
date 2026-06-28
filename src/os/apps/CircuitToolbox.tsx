// Boîte à outils du Circuit Lab : choix du composant à poser (type + valeur/couleur) avant de
// cliquer deux trous de la plaque pour le placer.

import type { ComponentType, LedColor } from '@/lib/circuit/types'

export const RESISTOR_VALUES = [220, 470, 1000, 10000]
export const LED_COLORS: LedColor[] = ['red', 'green', 'blue', 'yellow']

const LED_HEX: Record<LedColor, string> = {
  red: '#f87171',
  green: '#4ade80',
  blue: '#60a5fa',
  yellow: '#facc15',
}

export interface ToolSelection {
  type: ComponentType
  resistanceOhm?: number
  ledColor?: LedColor
}

interface CircuitToolboxProps {
  selection: ToolSelection
  onSelect: (selection: ToolSelection) => void
}

function pillStyle(active: boolean, accent?: string) {
  return {
    padding: '5px 10px',
    borderRadius: 6,
    border: active
      ? `1px solid ${accent ?? 'rgba(120,170,255,0.6)'}`
      : '1px solid rgba(255,255,255,0.1)',
    background: active ? `${accent ?? '#78aaff'}22` : 'rgba(255,255,255,0.04)',
    color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
  } as const
}

export default function CircuitToolbox({ selection, onSelect }: CircuitToolboxProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: 14,
        width: 168,
        flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: 2,
          color: 'rgba(255,255,255,0.28)',
          textTransform: 'uppercase',
        }}
      >
        Composants
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <button
          style={pillStyle(selection.type === 'wire')}
          onClick={() => onSelect({ type: 'wire' })}
        >
          Fil
        </button>
        <button
          style={pillStyle(selection.type === 'switch')}
          onClick={() => onSelect({ type: 'switch' })}
        >
          Interrupteur
        </button>
        <button
          style={pillStyle(selection.type === 'resistor')}
          onClick={() => onSelect({ type: 'resistor', resistanceOhm: RESISTOR_VALUES[0] })}
        >
          Résistance
        </button>
        <button
          style={pillStyle(selection.type === 'led')}
          onClick={() => onSelect({ type: 'led', ledColor: LED_COLORS[0] })}
        >
          LED
        </button>
      </div>

      {selection.type === 'resistor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Valeur</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {RESISTOR_VALUES.map((value) => (
              <button
                key={value}
                style={pillStyle(selection.resistanceOhm === value)}
                onClick={() => onSelect({ type: 'resistor', resistanceOhm: value })}
              >
                {value >= 1000 ? `${value / 1000}k` : value}Ω
              </button>
            ))}
          </div>
        </div>
      )}

      {selection.type === 'led' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Couleur</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {LED_COLORS.map((color) => (
              <button
                key={color}
                style={pillStyle(selection.ledColor === color, LED_HEX[color])}
                onClick={() => onSelect({ type: 'led', ledColor: color })}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    background: LED_HEX[color],
                    marginRight: 5,
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5, marginTop: 4 }}>
        Clique un trou de départ puis un trou d'arrivée pour poser le composant sélectionné.
        Reclique un composant posé pour le retirer (ou basculer un interrupteur).
      </div>
    </div>
  )
}
