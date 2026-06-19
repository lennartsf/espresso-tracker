import { useState } from 'react'
import { Check, TrendingDown, TrendingUp } from 'lucide-react'
import { diagnoseShot, type DevStatus } from '../../utils/tasteGuide'
import { calcBestRecipe } from '../../utils/recipeCalc'
import { secondsToMMSS } from '../../utils/timeFormat'
import type { ShotWithCoffee } from '../../hooks/useShots'

const STATUS_STYLE: Record<DevStatus, { ring: string; text: string; Icon: typeof Check; word: string }> = {
  ok:   { ring: 'border-green-500/30 bg-green-500/5',  text: 'text-green-400',  Icon: Check,        word: 'in range' },
  low:  { ring: 'border-amber-500/30 bg-amber-500/5',  text: 'text-amber-400',  Icon: TrendingDown, word: 'low' },
  high: { ring: 'border-amber-500/30 bg-amber-500/5',  text: 'text-amber-400',  Icon: TrendingUp,   word: 'high' },
}

function fmt(lever: string, v: number) {
  if (lever === 'time') return secondsToMMSS(Math.round(v))
  if (lever === 'ratio') return `1:${v.toFixed(2)}`
  if (lever === 'temp') return `${v.toFixed(1)}°C`
  return v.toFixed(1)
}

export function ShotDiagnosis({ shots }: { shots: ShotWithCoffee[] }) {
  const [shotId, setShotId] = useState(shots[0]?.id ?? '')
  const shot = shots.find(s => s.id === shotId) ?? shots[0]
  const best = calcBestRecipe(shots)
  const devs = diagnoseShot(shot, best)

  const date = new Date(shot.pulled_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  const allOk = devs.length > 0 && devs.every(d => d.status === 'ok')

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-coffee-muted">Shot</label>
        <select value={shotId} onChange={e => setShotId(e.target.value)}
          className="flex-1 rounded-lg border border-white/15 bg-coffee-surface2 px-3 py-2 text-sm text-coffee-text">
          {shots.slice(0, 30).map(s => (
            <option key={s.id} value={s.id}>
              {new Date(s.pulled_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} · {s.rating}/10 flavor
            </option>
          ))}
        </select>
      </div>

      <p className="mb-3 text-xs text-coffee-muted">
        Comparing your shot from <span className="text-coffee-cream">{date}</span> against{' '}
        {best ? 'your best shots for this coffee' : 'general espresso targets'}.
      </p>

      {allOk && (
        <p className="mb-3 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-400">
          Dialed in — every parameter sits in range. If the taste is still off, tweak grind in small steps.
        </p>
      )}

      <div className="space-y-2">
        {devs.map(d => {
          const st = STATUS_STYLE[d.status]
          return (
            <div key={d.lever} className={`rounded-xl border p-3 ${st.ring}`}>
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-semibold text-coffee-cream">{d.label}</span>
                <span className={`inline-flex items-center gap-1 text-xs font-medium ${st.text}`}>
                  <st.Icon size={13} /> {fmt(d.lever, d.value)} · {st.word}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-coffee-muted">
                Target {d.lever === 'ratio' ? `1:${d.window.min.toFixed(2)}–1:${d.window.max.toFixed(2)}`
                  : d.lever === 'time' ? `${secondsToMMSS(Math.round(d.window.min))}–${secondsToMMSS(Math.round(d.window.max))}`
                  : `${d.window.min.toFixed(1)}–${d.window.max.toFixed(1)}`}
                {' · '}{d.source === 'your-best' ? 'your best' : 'theory'}
              </p>
              {d.hint && <p className={`mt-1.5 text-xs ${st.text}`}>{d.hint}</p>}
            </div>
          )
        })}
        {devs.length === 0 && (
          <p className="text-center text-sm text-coffee-muted py-6">This shot has no ratio/time/temp logged to diagnose.</p>
        )}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-coffee-muted">
        Tip: as a bag ages, grind a touch finer to keep extraction up.
      </p>
    </div>
  )
}
