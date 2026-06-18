import { useState } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useCoffees, useRoastDates } from '../hooks/useCoffees'
import { useShots } from '../hooks/useShots'
import { useBrews } from '../hooks/useBrews'
import { useGrinders } from '../hooks/useEquipment'
import { Select } from '../components/ui'
import { RecipeCard } from '../components/RecipeCard'
import { calcBestRecipe } from '../utils/recipeCalc'
import { drinkTypeLabel } from '../utils/drinkTypes'
import { ratingHex, intensityFill } from '../utils/ratingColor'
import { BREW_METHODS } from '../utils/brewMethods'
import { secondsToMMSS } from '../utils/timeFormat'
import type { ShotWithCoffee } from '../hooks/useShots'
import type { BrewWithCoffee } from '../hooks/useBrews'

type AnalysisTab = 'espresso' | 'brews' | 'milk'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ── Scatter helpers ────────────────────────────────────────────────────────────

// quality=true → 10-stufige Qualitäts-Skala (rot→grün, nur Flavor).
// quality=false → Intensitäts-Creme (Body/Säure/Bitterness: Stärke, kein gut/schlecht).
const dotColor = (y: number, quality: boolean) =>
  quality ? ratingHex(Math.round(y)) : intensityFill(Math.round(y))

function ScatterPlot({ data, xLabel, yLabel, quality }: {
  data: { x: number; y: number; id: string }[]
  xLabel: string
  yLabel: string
  quality: boolean
}) {
  if (data.length === 0) {
    return <p className="text-center text-coffee-muted text-sm py-6">No data yet for {yLabel} rating.</p>
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
          <Scatter data={data}>
            {data.map(entry => (
              <Cell key={entry.id} fill={dotColor(entry.y, quality)} fillOpacity={0.85} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-2 mt-1 text-xs text-coffee-muted">
        <span>1</span>
        <span
          className="inline-block h-2 w-28 rounded-full"
          style={{
            background: `linear-gradient(to right, ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
              .map(n => (quality ? ratingHex(n) : intensityFill(n)))
              .join(', ')})`,
          }}
        />
        <span>10</span>
        <span className="ml-1">{yLabel}</span>
      </div>
    </>
  )
}

// ── Espresso Tab ───────────────────────────────────────────────────────────────

type EspressoMetric = 'rating' | 'body_score' | 'acidity_score' | 'bitterness_score'

const ESPRESSO_METRICS: { key: EspressoMetric; label: string }[] = [
  { key: 'rating',           label: 'Flavor' },
  { key: 'body_score',       label: 'Body' },
  { key: 'acidity_score',    label: 'Acidity' },
  { key: 'bitterness_score', label: 'Bitterness' },
]

function EspressoAnalysis() {
  const [coffeeId, setCoffeeId]     = useState('')
  const [roastDateId, setRoastDateId] = useState('')
  const [grinderId, setGrinderId]   = useState('')
  const [metric, setMetric]         = useState<EspressoMetric>('rating')

  const { data: coffees = [] }    = useCoffees()
  const { data: roastDates = [] } = useRoastDates(coffeeId)
  const { data: grinders = [] }   = useGrinders()
  const { data: allShots = [] }   = useShots(coffeeId || undefined, roastDateId || undefined, 'espresso')

  const shots: ShotWithCoffee[] = grinderId
    ? allShots.filter(s => s.grinder_id === grinderId)
    : allShots

  const metricLabel = ESPRESSO_METRICS.find(m => m.key === metric)!.label

  const scatterData = shots
    .filter(s => s.grind_setting != null && s[metric] !== null)
    .map(s => ({ x: s.grind_setting, y: s[metric] as number, id: s.id }))

  const recipe = calcBestRecipe(shots)

  return (
    <div>
      {/* Filters */}
      <div className="grid gap-2 mb-4">
        <Select value={coffeeId} onChange={e => { setCoffeeId(e.target.value); setRoastDateId('') }}>
          <option value="">All Coffees</option>
          {coffees.map(c => <option key={c.id} value={c.id}>{c.name}{c.roaster ? ` / ${c.roaster}` : ''}</option>)}
        </Select>

        {coffeeId && roastDates.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setRoastDateId('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${roastDateId === '' ? 'border-coffee-accent bg-coffee-accent/10 text-coffee-accent-soft' : 'border-coffee-line text-coffee-muted bg-coffee-bg'}`}>
              All Roasts
            </button>
            {roastDates.map((rd, i) => (
              <button key={rd.id} onClick={() => setRoastDateId(rd.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${roastDateId === rd.id ? 'border-coffee-accent bg-coffee-accent/10 text-coffee-accent-soft' : 'border-coffee-line text-coffee-muted bg-coffee-bg'}`}>
                {formatDate(rd.roast_date)}{i === 0 ? ' (current)' : ''}
              </button>
            ))}
          </div>
        )}

        {grinders.length > 1 && (
          <Select value={grinderId} onChange={e => setGrinderId(e.target.value)}>
            <option value="">All Grinders</option>
            {grinders.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </Select>
        )}
      </div>

      {!grinderId && grinders.length > 1 && (
        <p className="text-xs text-coffee-accent-soft bg-coffee-accent/10 border border-coffee-accent/30 rounded-lg px-3 py-2 mb-4">
          Tip: Filter by one grinder — grind numbers are only comparable within the same grinder.
        </p>
      )}

      {shots.length === 0 ? (
        <p className="text-center text-coffee-muted text-sm py-10">No espresso shots for this selection.</p>
      ) : (
        <div className="md:grid md:grid-cols-5 md:gap-6 md:items-start">
          <div className="md:col-span-3 bg-coffee-surface2 border border-coffee-line rounded-lg p-4 mb-4 md:mb-0">
            <div className="flex gap-1 mb-4 bg-coffee-bg rounded-lg p-1">
              {ESPRESSO_METRICS.map(m => (
                <button key={m.key} onClick={() => setMetric(m.key)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${metric === m.key ? 'bg-coffee-surface2 text-coffee-cream shadow-sm' : 'text-coffee-muted hover:text-coffee-text'}`}>
                  {m.label}
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-coffee-muted uppercase tracking-wide mb-3">
              Grind → {metricLabel}
              <span className="font-normal ml-1">({scatterData.length} Shot{scatterData.length !== 1 ? 's' : ''})</span>
            </p>
            <ScatterPlot data={scatterData} xLabel="Grind" yLabel={metricLabel} quality={metric === 'rating'} />
          </div>
          <div className="md:col-span-2">
            {recipe
              ? <RecipeCard stats={recipe} />
              : <div className="bg-coffee-bg border border-coffee-line rounded-lg p-4 text-center text-sm text-coffee-muted">No shots with Flavor ≥ 8.</div>
            }
          </div>
        </div>
      )}
    </div>
  )
}

// ── Brews Tab ─────────────────────────────────────────────────────────────────

type BrewMetric = 'rating' | 'acidity_score' | 'bitterness_score'

const BREW_METRICS: { key: BrewMetric; label: string }[] = [
  { key: 'rating',           label: 'Flavor' },
  { key: 'acidity_score',    label: 'Acidity' },
  { key: 'bitterness_score', label: 'Bitterness' },
]

function BrewsAnalysis() {
  const [brewMethod, setBrewMethod] = useState('')
  const [coffeeId, setCoffeeId]     = useState('')
  const [grinderId, setGrinderId]   = useState('')
  const [metric, setMetric]         = useState<BrewMetric>('rating')

  const { data: coffees = [] }  = useCoffees()
  const { data: grinders = [] } = useGrinders()
  const { data: allBrews = [] } = useBrews(coffeeId || undefined, brewMethod || undefined)

  const brews: BrewWithCoffee[] = grinderId
    ? allBrews.filter(b => b.grinder_id === grinderId)
    : allBrews

  const metricLabel = BREW_METRICS.find(m => m.key === metric)!.label

  const scatterData = brews
    .filter(b => b.grind_setting != null && b[metric] !== null)
    .map(b => ({ x: b.grind_setting!, y: b[metric] as number, id: b.id }))

  const topBrews = brews.filter(b => b.rating >= 8)
  const avg = (arr: number[]) => arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length) : null
  const topStats = topBrews.length > 0 ? {
    avgGrind:   avg(topBrews.map(b => b.grind_setting).filter((x): x is number => x != null)),
    avgDose:    avg(topBrews.map(b => b.dose_g).filter((x): x is number => x != null)),
    avgWater:   avg(topBrews.map(b => b.water_ml).filter((x): x is number => x != null)),
    avgTemp:    avg(topBrews.map(b => b.temp_c).filter((x): x is number => x != null)),
    avgTime:    avg(topBrews.map(b => b.brew_time_s).filter((x): x is number => x != null)),
    avgRating:  avg(topBrews.map(b => b.rating))!,
    count:      topBrews.length,
  } : null

  return (
    <div>
      {/* Filters */}
      <div className="grid gap-2 mb-4">
        <Select value={brewMethod} onChange={e => setBrewMethod(e.target.value)}>
          <option value="">All Methods</option>
          {BREW_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </Select>

        <Select value={coffeeId} onChange={e => setCoffeeId(e.target.value)}>
          <option value="">All Coffees</option>
          {coffees.map(c => <option key={c.id} value={c.id}>{c.name}{c.roaster ? ` / ${c.roaster}` : ''}</option>)}
        </Select>

        {grinders.length > 1 && (
          <Select value={grinderId} onChange={e => setGrinderId(e.target.value)}>
            <option value="">All Grinders</option>
            {grinders.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </Select>
        )}
      </div>

      {!grinderId && grinders.length > 1 && (
        <p className="text-xs text-coffee-accent-soft bg-coffee-accent/10 border border-coffee-accent/30 rounded-lg px-3 py-2 mb-4">
          Tip: Filter by one grinder — grind numbers are only comparable within the same grinder.
        </p>
      )}

      {brews.length === 0 ? (
        <p className="text-center text-coffee-muted text-sm py-10">No brews for this selection.</p>
      ) : (
        <div className="md:grid md:grid-cols-5 md:gap-6 md:items-start">
          <div className="md:col-span-3 bg-coffee-surface2 border border-coffee-line rounded-lg p-4 mb-4 md:mb-0">
            <div className="flex gap-1 mb-4 bg-coffee-bg rounded-lg p-1">
              {BREW_METRICS.map(m => (
                <button key={m.key} onClick={() => setMetric(m.key)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${metric === m.key ? 'bg-coffee-surface2 text-coffee-cream shadow-sm' : 'text-coffee-muted hover:text-coffee-text'}`}>
                  {m.label}
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-coffee-muted uppercase tracking-wide mb-3">
              Grind → {metricLabel}
              <span className="font-normal ml-1">({scatterData.length} Brew{scatterData.length !== 1 ? 's' : ''})</span>
            </p>
            <ScatterPlot data={scatterData} xLabel="Grind" yLabel={metricLabel} quality={metric === 'rating'} />
          </div>

          <div className="md:col-span-2">
            {topStats ? (
              <div className="bg-coffee-surface2 border border-coffee-line rounded-lg p-4">
                <p className="text-xs font-semibold text-coffee-muted uppercase tracking-wide mb-3">
                  Top Recipe ({topStats.count} Brew{topStats.count !== 1 ? 's' : ''} ≥ 8)
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-coffee-muted">Avg Rating</span>
                    <span className="font-bold text-green-400">{topStats.avgRating.toFixed(1)}</span>
                  </div>
                  {topStats.avgGrind != null && (
                    <div className="flex justify-between">
                      <span className="text-coffee-muted">Avg Grind</span>
                      <span className="font-semibold text-coffee-cream">{topStats.avgGrind.toFixed(1)}</span>
                    </div>
                  )}
                  {topStats.avgDose != null && topStats.avgWater != null && (
                    <div className="flex justify-between">
                      <span className="text-coffee-muted">Avg Ratio</span>
                      <span className="font-semibold text-coffee-cream">
                        {topStats.avgDose.toFixed(1)} g / {topStats.avgWater.toFixed(0)} ml
                      </span>
                    </div>
                  )}
                  {topStats.avgTemp != null && (
                    <div className="flex justify-between">
                      <span className="text-coffee-muted">Avg Temp</span>
                      <span className="font-semibold text-coffee-cream">{topStats.avgTemp.toFixed(1)}°C</span>
                    </div>
                  )}
                  {topStats.avgTime != null && (
                    <div className="flex justify-between">
                      <span className="text-coffee-muted">Avg Brew Time</span>
                      <span className="font-semibold text-coffee-cream">{secondsToMMSS(Math.round(topStats.avgTime))}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-coffee-bg border border-coffee-line rounded-lg p-4 text-center text-sm text-coffee-muted">
                No brews with Rating ≥ 8.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Milch Tab ─────────────────────────────────────────────────────────────────

function MilkAnalysis() {
  const [coffeeId, setCoffeeId] = useState('')
  const { data: coffees = [] }  = useCoffees()
  const { data: shots = [] }    = useShots(coffeeId || undefined, undefined, 'milk')

  const byType = shots.reduce<Record<string, { count: number; ratingSum: number }>>((acc, s) => {
    if (!acc[s.drink_type]) acc[s.drink_type] = { count: 0, ratingSum: 0 }
    acc[s.drink_type].count++
    acc[s.drink_type].ratingSum += s.rating
    return acc
  }, {})

  const sorted = Object.entries(byType).sort((a, b) => b[1].count - a[1].count)

  return (
    <div>
      <Select value={coffeeId} onChange={e => setCoffeeId(e.target.value)} className="mb-4">
        <option value="">All Coffees</option>
        {coffees.map(c => <option key={c.id} value={c.id}>{c.name}{c.roaster ? ` / ${c.roaster}` : ''}</option>)}
      </Select>

      {shots.length === 0 ? (
        <p className="text-center text-coffee-muted text-sm py-10">No milk drinks yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-coffee-surface2 border border-coffee-line rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-coffee-accent-soft">{shots.length}</p>
              <p className="text-xs text-coffee-muted mt-0.5">Drinks total</p>
            </div>
            <div className="bg-coffee-surface2 border border-coffee-line rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-400">
                {(shots.reduce((s, x) => s + x.rating, 0) / shots.length).toFixed(1)}
              </p>
              <p className="text-xs text-coffee-muted mt-0.5">Avg Rating</p>
            </div>
          </div>

          <div className="bg-coffee-surface2 border border-coffee-line rounded-lg overflow-hidden">
            <p className="text-xs font-semibold text-coffee-muted uppercase tracking-wide p-3 border-b border-coffee-line">
              By Drink Type
            </p>
            {sorted.map(([type, { count, ratingSum }]) => (
              <div key={type} className="flex items-center justify-between px-4 py-3 border-b border-coffee-line last:border-0">
                <span className="text-sm text-coffee-text">{drinkTypeLabel(type)}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-coffee-muted">{count}×</span>
                  <span className="text-sm font-semibold text-coffee-cream">
                    Avg {(ratingSum / count).toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Main Analysis ─────────────────────────────────────────────────────────────

const TABS: { key: AnalysisTab; label: string }[] = [
  { key: 'espresso', label: 'Espresso' },
  { key: 'brews',    label: 'Brews' },
  { key: 'milk',     label: 'Milk' },
]

export function Analysis() {
  const [tab, setTab] = useState<AnalysisTab>('espresso')

  return (
    <div>
      <h1 className="text-xl font-bold text-coffee-cream mb-4">Analysis</h1>

      <div className="flex border-b border-coffee-line mb-5">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'text-coffee-accent-soft border-b-2 border-coffee-accent -mb-px'
                : 'text-coffee-muted hover:text-coffee-text'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'espresso' && <EspressoAnalysis />}
      {tab === 'brews'    && <BrewsAnalysis />}
      {tab === 'milk'     && <MilkAnalysis />}
    </div>
  )
}
