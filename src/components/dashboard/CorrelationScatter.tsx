import { ratingHex } from '../../utils/ratingColor'
import { pearsonR, linearRegression, hasEnoughForCorrelation } from '../../utils/correlation'

export interface ScatterPoint { ratio: number; flavor: number; rating: number }

// pixel plot box
const X0 = 30, X1 = 252, Y0 = 10, Y1 = 100
const RATIO_MIN = 1.2, RATIO_MAX = 2.8, FLAVOR_MIN = 1, FLAVOR_MAX = 10

const sx = (r: number) => X0 + ((r - RATIO_MIN) / (RATIO_MAX - RATIO_MIN)) * (X1 - X0)
const sy = (f: number) => Y1 - ((f - FLAVOR_MIN) / (FLAVOR_MAX - FLAVOR_MIN)) * (Y1 - Y0)

/** Scatter Brew-Ratio (x) × Geschmack (y). Punktfarbe = ratingHex. */
export function CorrelationScatter({ points }: { points: ScatterPoint[] }) {
  if (points.length === 0) {
    return (
      <div className="flex h-[120px] items-center justify-center text-xs text-coffee-muted">
        Log shots to see how ratio shapes flavor.
      </div>
    )
  }

  const enough = hasEnoughForCorrelation(points.length)
  const mathPoints = points.map(p => ({ x: p.ratio, y: p.flavor }))
  const r = enough ? pearsonR(mathPoints) : 0
  const { slope, intercept } = enough ? linearRegression(mathPoints) : { slope: 0, intercept: 0 }

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-wide text-coffee-muted">Ratio × Flavor</span>
        {enough && <span className="text-[10px] text-coffee-accent-soft">r = {r >= 0 ? '+' : ''}{r.toFixed(2)}</span>}
      </div>
      <svg width="100%" height="120" viewBox="0 0 260 120">
        <g stroke="var(--coffee-line)" strokeWidth="1">
          <line x1={X0} y1={Y0} x2={X0} y2={Y1} />
          <line x1={X0} y1={Y1} x2={X1} y2={Y1} />
        </g>
        {enough && (
          <line
            data-testid="regression-line"
            x1={sx(RATIO_MIN)} y1={sy(slope * RATIO_MIN + intercept)}
            x2={sx(RATIO_MAX)} y2={sy(slope * RATIO_MAX + intercept)}
            stroke="#c9a35e" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7"
          />
        )}
        <g style={{ filter: 'drop-shadow(0 0 4px rgba(233,201,135,0.5))' }}>
          {points.map((p, i) => (
            <circle key={i} data-testid="scatter-point" cx={sx(p.ratio)} cy={sy(p.flavor)} r="5" fill={ratingHex(p.rating)} />
          ))}
        </g>
      </svg>
    </div>
  )
}
