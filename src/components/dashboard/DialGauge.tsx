import { CountUp } from '../CountUp'
import { ratingHex } from '../../utils/ratingColor'

const R = 54
const C = 2 * Math.PI * R

/** Kreis-Gauge in geprägter Mulde mit glühender Wert-Zahl. */
export function DialGauge({
  value, max, label, decimals = 1, color,
}: { value: number; max: number; label: string; decimals?: number; color?: string }) {
  const finite = Number.isFinite(value)
  const pct = finite ? Math.max(0, Math.min(1, value / max)) : 0
  const offset = C * (1 - pct)
  const stroke = color ?? ratingHex(Math.round(value))

  return (
    <div className="flex flex-col items-center justify-center">
      <span className="mb-2 text-[9px] uppercase tracking-[0.2em] text-coffee-muted">{label}</span>
      <div className="relative flex h-[130px] w-[130px] items-center justify-center rounded-full border-2 border-coffee-line bg-[radial-gradient(circle_at_50%_32%,var(--coffee-surface),var(--coffee-bg))] shadow-[0_8px_24px_rgba(0,0,0,0.6),inset_0_3px_8px_rgba(233,201,135,0.2)]">
        <svg width="130" height="130" viewBox="0 0 130 130" className="absolute inset-0">
          <circle cx="65" cy="65" r={R} fill="none" stroke="var(--coffee-line)" strokeWidth="6" />
          <circle
            data-testid="dial-arc"
            cx="65" cy="65" r={R} fill="none" stroke={stroke} strokeWidth="6"
            strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset}
            transform="rotate(-90 65 65)" style={{ filter: 'drop-shadow(0 0 6px rgba(95,168,105,0.5))' }}
          />
        </svg>
        <div className="text-center">
          <span className="block text-4xl font-extrabold text-coffee-accent-soft drop-shadow-[0_0_16px_rgba(233,201,135,0.5)]">
            <CountUp end={value} decimals={decimals} />
          </span>
          <span className="text-[9px] text-coffee-muted">von {max}</span>
        </div>
      </div>
    </div>
  )
}
