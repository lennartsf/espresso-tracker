import { CoffeeBean } from './CoffeeBean'
import { coarseRoastLevel } from '../utils/beanColor'

const ROAST_NAMES: [number, string][] = [
  [1.5, 'Cinnamon'],
  [2.5, 'Light'],
  [4, 'Medium light'],
  [5.5, 'Medium'],
  [7, 'Medium dark'],
  [8.5, 'Dark'],
  [10, 'Italian'],
]

function roastName(v: number): string {
  return ROAST_NAMES.find(([at]) => v <= at)?.[1] ?? 'Italian'
}

/**
 * Röstgrad als Schieberegler mit lebender Bohne daneben.
 *
 * Der Regler schreibt den **feinen** Wert (1.0–10.0 in Zehntelschritten); der
 * grobe `roast_level` wird beim Speichern daraus gerundet. Dadurch bleiben
 * Badges und Filter gültig, ohne dass zwei Wahrheiten entstehen.
 *
 * Die Bohne färbt sich live mit — sie ist keine Illustration, sondern die
 * Anzeige des Werts. Wer den Regler bewegt, sieht sofort, was „7,3" bedeutet.
 */
export function RoastSlider({
  value,
  onChange,
  arabicaPct,
  robustaPct,
}: {
  value: number | null
  onChange: (v: number | null) => void
  arabicaPct: number | null
  robustaPct: number | null
}) {
  const active = value != null
  const shown = value ?? 5

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase text-coffee-muted">Roast Level</p>

      <div className="flex items-center gap-4">
        <div className={active ? '' : 'opacity-40 grayscale'}>
          <CoffeeBean
            roastLevel={shown}
            arabicaPct={arabicaPct}
            robustaPct={robustaPct}
            size={84}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-coffee-cream">
              {active ? shown.toFixed(1) : '—'}
            </span>
            <span className="text-xs text-coffee-muted">
              {active ? roastName(shown) : 'not set'}
              {active && ` · rounds to ${coarseRoastLevel(shown)}`}
            </span>
          </div>

          <input
            type="range"
            min={1}
            max={10}
            step={0.1}
            value={shown}
            aria-label="Roast level"
            onChange={e => onChange(parseFloat(e.target.value))}
            className="mt-2 w-full accent-coffee-accent"
          />

          <div className="mt-1 flex justify-between px-0.5 text-xs text-coffee-muted/60">
            <span>light</span>
            <span>dark</span>
          </div>

          {active && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="mt-1 text-xs text-coffee-muted underline hover:text-coffee-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-coffee-accent"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
