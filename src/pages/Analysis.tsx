import { useState } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useCoffees, useRoastDates } from '../hooks/useCoffees'
import { useShots } from '../hooks/useShots'
import { useBrews } from '../hooks/useBrews'
import { useGrinders } from '../hooks/useEquipment'
import { RecipeCard } from '../components/RecipeCard'
import { calcBestRecipe } from '../utils/recipeCalc'
import { drinkTypeLabel } from '../utils/drinkTypes'
import { BREW_METHODS } from '../utils/brewMethods'
import { secondsToMMSS } from '../utils/timeFormat'
import type { ShotWithCoffee } from '../hooks/useShots'
import type { BrewWithCoffee } from '../hooks/useBrews'

type AnalysisTab = 'espresso' | 'brews' | 'milch'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ── Scatter helpers ────────────────────────────────────────────────────────────

const DOT_COLOR = (y: number) => y >= 8 ? '#16a34a' : '#f97316'

function ScatterPlot({ data, xLabel, yLabel }: {
  data: { x: number; y: number; id: string }[]
  xLabel: string
  yLabel: string
}) {
  if (data.length === 0) {
    return <p className="text-center text-slate-400 text-sm py-6">Noch keine Daten mit {yLabel}-Bewertung.</p>
  }
  return (
    <>
      <ResponsiveContainer width="100%" height={220}>
        <ScatterChart margin={{ top: 10, right: 10, bottom: 24, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="x" type="number" name={xLabel} domain={['auto', 'auto']}
            label={{ value: xLabel, position: 'insideBottom', offset: -10, fontSize: 11, fill: '#94a3b8' }}
            tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis dataKey="y" type="number" name={yLabel} domain={[0, 10]}
            tick={{ fontSize: 11, fill: '#94a3b8' }} width={24} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
            if (!payload?.length) return null
            const { x, y } = payload[0].payload
            return (
              <div className="bg-white border border-slate-200 rounded px-2 py-1 text-xs shadow">
                <p>{xLabel}: <strong>{x}</strong></p>
                <p>{yLabel}: <strong>{y}</strong></p>
              </div>
            )
          }} />
          <Scatter data={data}>
            {data.map(entry => (
              <Cell key={entry.id} fill={DOT_COLOR(entry.y)} fillOpacity={0.85} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-400 text-center mt-1">
        <span className="inline-block w-2 h-2 rounded-full bg-green-600 mr-1" />≥ 8
        <span className="inline-block w-2 h-2 rounded-full bg-orange-500 ml-3 mr-1" />unter 8
      </p>
    </>
  )
}

// ── Espresso Tab ───────────────────────────────────────────────────────────────

type EspressoMetric = 'rating' | 'body_score' | 'acidity_score' | 'bitterness_score'

const ESPRESSO_METRICS: { key: EspressoMetric; label: string }[] = [
  { key: 'rating',           label: 'Geschmack' },
  { key: 'body_score',       label: 'Körper' },
  { key: 'acidity_score',    label: 'Säure' },
  { key: 'bitterness_score', label: 'Bitterkeit' },
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
        <select value={coffeeId} onChange={e => { setCoffeeId(e.target.value); setRoastDateId('') }}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400">
          <option value="">Alle Kaffees</option>
          {coffees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {coffeeId && roastDates.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setRoastDateId('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${roastDateId === '' ? 'border-orange-400 bg-orange-50 text-orange-600' : 'border-slate-200 text-slate-500 bg-white'}`}>
              Alle Röstungen
            </button>
            {roastDates.map((rd, i) => (
              <button key={rd.id} onClick={() => setRoastDateId(rd.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${roastDateId === rd.id ? 'border-orange-400 bg-orange-50 text-orange-600' : 'border-slate-200 text-slate-500 bg-white'}`}>
                {formatDate(rd.roast_date)}{i === 0 ? ' (aktuell)' : ''}
              </button>
            ))}
          </div>
        )}

        {grinders.length > 1 && (
          <select value={grinderId} onChange={e => setGrinderId(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400">
            <option value="">Alle Mühlen</option>
            {grinders.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        )}
      </div>

      {!grinderId && grinders.length > 1 && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          💡 Tipp: Filtere auf eine Mühle — Mahlgrad-Zahlen sind nur innerhalb derselben Mühle vergleichbar.
        </p>
      )}

      {shots.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-10">Noch keine Espresso-Shots für diese Auswahl.</p>
      ) : (
        <div className="md:grid md:grid-cols-5 md:gap-6 md:items-start">
          <div className="md:col-span-3 bg-white border border-slate-200 rounded-lg p-4 mb-4 md:mb-0">
            <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1">
              {ESPRESSO_METRICS.map(m => (
                <button key={m.key} onClick={() => setMetric(m.key)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${metric === m.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  {m.label}
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Mahlgrad → {metricLabel}
              <span className="font-normal ml-1">({scatterData.length} Shot{scatterData.length !== 1 ? 's' : ''})</span>
            </p>
            <ScatterPlot data={scatterData} xLabel="Mahlgrad" yLabel={metricLabel} />
          </div>
          <div className="md:col-span-2">
            {recipe
              ? <RecipeCard stats={recipe} />
              : <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center text-sm text-slate-400">Noch keine Shots mit Geschmack ≥ 8.</div>
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
  { key: 'rating',           label: 'Geschmack' },
  { key: 'acidity_score',    label: 'Säure' },
  { key: 'bitterness_score', label: 'Bitterkeit' },
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
        <select value={brewMethod} onChange={e => setBrewMethod(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400">
          <option value="">Alle Methoden</option>
          {BREW_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>

        <select value={coffeeId} onChange={e => setCoffeeId(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400">
          <option value="">Alle Kaffees</option>
          {coffees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {grinders.length > 1 && (
          <select value={grinderId} onChange={e => setGrinderId(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-orange-400">
            <option value="">Alle Mühlen</option>
            {grinders.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        )}
      </div>

      {!grinderId && grinders.length > 1 && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          💡 Tipp: Filtere auf eine Mühle — Mahlgrad-Zahlen sind nur innerhalb derselben Mühle vergleichbar.
        </p>
      )}

      {brews.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-10">Noch keine Brews für diese Auswahl.</p>
      ) : (
        <div className="md:grid md:grid-cols-5 md:gap-6 md:items-start">
          <div className="md:col-span-3 bg-white border border-slate-200 rounded-lg p-4 mb-4 md:mb-0">
            <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1">
              {BREW_METRICS.map(m => (
                <button key={m.key} onClick={() => setMetric(m.key)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${metric === m.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  {m.label}
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Mahlgrad → {metricLabel}
              <span className="font-normal ml-1">({scatterData.length} Brew{scatterData.length !== 1 ? 's' : ''})</span>
            </p>
            <ScatterPlot data={scatterData} xLabel="Mahlgrad" yLabel={metricLabel} />
          </div>

          <div className="md:col-span-2">
            {topStats ? (
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                  Top-Rezept ({topStats.count} Brew{topStats.count !== 1 ? 's' : ''} ≥ 8)
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ø Bewertung</span>
                    <span className="font-bold text-green-600">{topStats.avgRating.toFixed(1)}</span>
                  </div>
                  {topStats.avgGrind != null && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ø Mahlgrad</span>
                      <span className="font-semibold text-slate-800">{topStats.avgGrind.toFixed(1)}</span>
                    </div>
                  )}
                  {topStats.avgDose != null && topStats.avgWater != null && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ø Verhältnis</span>
                      <span className="font-semibold text-slate-800">
                        {topStats.avgDose.toFixed(1)} g / {topStats.avgWater.toFixed(0)} ml
                      </span>
                    </div>
                  )}
                  {topStats.avgTemp != null && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ø Temperatur</span>
                      <span className="font-semibold text-slate-800">{topStats.avgTemp.toFixed(1)}°C</span>
                    </div>
                  )}
                  {topStats.avgTime != null && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ø Brühzeit</span>
                      <span className="font-semibold text-slate-800">{secondsToMMSS(Math.round(topStats.avgTime))}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center text-sm text-slate-400">
                Noch keine Brews mit Bewertung ≥ 8.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Milch Tab ─────────────────────────────────────────────────────────────────

function MilchAnalysis() {
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
      <select value={coffeeId} onChange={e => setCoffeeId(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white mb-4 focus:outline-none focus:border-orange-400">
        <option value="">Alle Kaffees</option>
        {coffees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {shots.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-10">Noch keine Milchgetränke.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{shots.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Getränke total</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {(shots.reduce((s, x) => s + x.rating, 0) / shots.length).toFixed(1)}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Ø Bewertung</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide p-3 border-b border-slate-100">
              Nach Getränketyp
            </p>
            {sorted.map(([type, { count, ratingSum }]) => (
              <div key={type} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-700">{drinkTypeLabel(type)}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{count}×</span>
                  <span className="text-sm font-semibold text-slate-800">
                    Ø {(ratingSum / count).toFixed(1)}
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
  { key: 'espresso', label: '☕ Espresso' },
  { key: 'brews',    label: '🫖 Brews' },
  { key: 'milch',    label: '🥛 Milch' },
]

export function Analysis() {
  const [tab, setTab] = useState<AnalysisTab>('espresso')

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">📊 Analyse</h1>

      <div className="flex border-b border-slate-200 mb-5">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'text-orange-600 border-b-2 border-orange-500 -mb-px'
                : 'text-slate-400 hover:text-slate-600'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'espresso' && <EspressoAnalysis />}
      {tab === 'brews'    && <BrewsAnalysis />}
      {tab === 'milch'    && <MilchAnalysis />}
    </div>
  )
}
