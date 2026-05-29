import { useState } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useCoffees, useRoastDates } from '../hooks/useCoffees'
import { useShots } from '../hooks/useShots'
import { RecipeCard } from '../components/RecipeCard'
import { calcBestRecipe } from '../utils/recipeCalc'

type Metric = 'rating' | 'body_score' | 'acidity_score'

const METRICS: { key: Metric; label: string }[] = [
  { key: 'rating', label: 'Geschmack' },
  { key: 'body_score', label: 'Körper' },
  { key: 'acidity_score', label: 'Säure' },
]

export function Analysis() {
  const [coffeeId, setCoffeeId] = useState('')
  const [roastDateId, setRoastDateId] = useState('')
  const [metric, setMetric] = useState<Metric>('rating')
  const { data: coffees = [] } = useCoffees()
  const { data: roastDates = [] } = useRoastDates(coffeeId)
  const { data: shots = [] } = useShots(coffeeId || undefined, roastDateId || undefined)

  function handleCoffeeChange(id: string) {
    setCoffeeId(id)
    setRoastDateId('')
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const metricLabel = METRICS.find(m => m.key === metric)!.label

  // Only include shots that have a value for the selected metric
  const scatterData = shots
    .filter(s => s[metric] !== null)
    .map(s => ({ x: s.grind_setting, y: s[metric] as number, id: s.id }))

  const recipe = calcBestRecipe(shots)

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">📊 Analyse</h1>

      {/* Coffee filter */}
      <select
        value={coffeeId}
        onChange={e => handleCoffeeChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white mb-3 focus:outline-none focus:border-orange-400"
      >
        <option value="">Alle Kaffees</option>
        {coffees.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {/* Roast date filter */}
      {coffeeId && roastDates.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setRoastDateId('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              roastDateId === '' ? 'border-orange-400 bg-orange-50 text-orange-600' : 'border-slate-200 text-slate-500 bg-white'
            }`}
          >
            Alle Röstungen
          </button>
          {roastDates.map((rd, i) => (
            <button
              key={rd.id}
              onClick={() => setRoastDateId(rd.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                roastDateId === rd.id ? 'border-orange-400 bg-orange-50 text-orange-600' : 'border-slate-200 text-slate-500 bg-white'
              }`}
            >
              {formatDate(rd.roast_date)}{i === 0 ? ' (aktuell)' : ''}
            </button>
          ))}
        </div>
      )}

      {shots.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-10">
          {coffeeId ? 'Noch keine Shots für diese Auswahl.' : 'Noch keine Shots vorhanden.'}
        </p>
      ) : (
        <div className="md:grid md:grid-cols-5 md:gap-6 md:items-start">
          <div className="md:col-span-3 bg-white border border-slate-200 rounded-lg p-4 mb-4 md:mb-0">

            {/* Metric toggle */}
            <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1">
              {METRICS.map(m => (
                <button
                  key={m.key}
                  onClick={() => setMetric(m.key)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    metric === m.key
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Mahlgrad → {metricLabel}
              <span className="font-normal ml-1">
                ({scatterData.length} Shot{scatterData.length !== 1 ? 's' : ''}{scatterData.length < shots.length ? `, ${shots.length - scatterData.length} ohne Wert` : ''})
              </span>
            </p>

            {scatterData.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-6">
                Noch keine Shots mit {metricLabel}-Bewertung.
              </p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 24, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="x"
                      type="number"
                      name="Mahlgrad"
                      domain={['auto', 'auto']}
                      label={{ value: 'Mahlgrad', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#94a3b8' }}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                    />
                    <YAxis
                      dataKey="y"
                      type="number"
                      name={metricLabel}
                      domain={[0, 10]}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      width={24}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ payload }) => {
                        if (!payload?.length) return null
                        const { x, y } = payload[0].payload
                        return (
                          <div className="bg-white border border-slate-200 rounded px-2 py-1 text-xs shadow">
                            <p>Mahlgrad: <strong>{x}</strong></p>
                            <p>{metricLabel}: <strong>{y}</strong></p>
                          </div>
                        )
                      }}
                    />
                    <Scatter data={scatterData}>
                      {scatterData.map(entry => (
                        <Cell
                          key={entry.id}
                          fill={entry.y >= 8 ? '#16a34a' : '#f97316'}
                          fillOpacity={0.85}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
                <p className="text-xs text-slate-400 text-center mt-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-600 mr-1" />≥ 8
                  <span className="inline-block w-2 h-2 rounded-full bg-orange-500 ml-3 mr-1" />unter 8
                </p>
              </>
            )}
          </div>

          <div className="md:col-span-2">
            {recipe ? (
              <RecipeCard stats={recipe} />
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center text-sm text-slate-400">
                Noch keine Shots mit Geschmack ≥ 8. Weiter experimentieren!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
