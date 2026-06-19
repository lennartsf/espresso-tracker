import {
  ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import { ratingHex, intensityFill } from '../../utils/ratingColor'
import { linearRegression, pearsonR, hasEnoughForCorrelation } from '../../utils/correlation'

// quality=true → 10-stufige Qualitäts-Skala (rot→grün, Flavor).
// quality=false → Intensitäts-Creme (Body/Säure/Bitterness: Stärke, kein gut/schlecht).
export const dotColor = (y: number, quality: boolean) =>
  quality ? ratingHex(Math.round(y)) : intensityFill(Math.round(y))

export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-coffee-line bg-coffee-surface2 p-3 text-center">
      <p className="font-display text-lg font-bold text-coffee-accent-soft">{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-coffee-muted">{label}</p>
    </div>
  )
}

interface ScatterProps {
  data: { x: number; y: number; id: string }[]
  xLabel: string
  yLabel: string
  quality: boolean
  /** Regressionslinie + r einblenden (ab MIN_SHOTS_FOR_CORRELATION). */
  showTrend?: boolean
}

export function ScatterPlot({ data, xLabel, yLabel, quality, showTrend = false }: ScatterProps) {
  if (data.length === 0) {
    return <p className="text-center text-coffee-muted text-sm py-6">No data yet for {yLabel}.</p>
  }

  const enoughTrend = showTrend && hasEnoughForCorrelation(data.length)
  let trend: { p1: { x: number; y: number }; p2: { x: number; y: number }; r: number } | null = null
  if (enoughTrend) {
    const { slope, intercept } = linearRegression(data)
    const xs = data.map(d => d.x)
    const x1 = Math.min(...xs), x2 = Math.max(...xs)
    const clampY = (y: number) => Math.max(0, Math.min(10, y))
    trend = {
      p1: { x: x1, y: clampY(slope * x1 + intercept) },
      p2: { x: x2, y: clampY(slope * x2 + intercept) },
      r: pearsonR(data),
    }
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={220}>
        <ScatterChart margin={{ top: 10, right: 10, bottom: 24, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#33291f" />
          <XAxis dataKey="x" type="number" name={xLabel} domain={['auto', 'auto']}
            label={{ value: xLabel, position: 'insideBottom', offset: -10, fontSize: 11, fill: '#a89784' }}
            tick={{ fontSize: 11, fill: '#a89784' }} />
          <YAxis dataKey="y" type="number" name={yLabel} domain={[0, 10]}
            tick={{ fontSize: 11, fill: '#a89784' }} width={24} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
            if (!payload?.length) return null
            const { x, y } = payload[0].payload
            return (
              <div className="bg-coffee-surface2 border border-coffee-line rounded px-2 py-1 text-xs shadow">
                <p>{xLabel}: <strong>{x}</strong></p>
                <p>{yLabel}: <strong>{y}</strong></p>
              </div>
            )
          }} />
          {trend && (
            <ReferenceLine
              ifOverflow="extendDomain"
              stroke="#c9a35e" strokeWidth={1.5} strokeDasharray="5 4"
              segment={[trend.p1, trend.p2]}
            />
          )}
          <Scatter data={data}>
            {data.map(entry => (
              <Cell key={entry.id} fill={dotColor(entry.y, quality)} fillOpacity={0.85} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-2 mt-1 text-xs text-coffee-muted">
        <span>1</span>
        <span className="inline-block h-2 w-28 rounded-full"
          style={{ background: `linear-gradient(to right, ${[1,2,3,4,5,6,7,8,9,10].map(n => (quality ? ratingHex(n) : intensityFill(n))).join(', ')})` }} />
        <span>10</span>
        <span className="ml-1">{yLabel}</span>
      </div>
      {trend && (
        <p className="text-center text-xs text-coffee-muted mt-1">
          Trend line · r = {trend.r.toFixed(2)} ({data.length} shots)
        </p>
      )}
    </>
  )
}
