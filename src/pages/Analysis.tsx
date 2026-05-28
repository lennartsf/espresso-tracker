import { useState } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useCoffees, useRoastDates } from '../hooks/useCoffees'
import { useShots } from '../hooks/useShots'
import { RecipeCard } from '../components/RecipeCard'
import { calcBestRecipe } from '../utils/recipeCalc'

export function Analysis() {
  const [coffeeId, setCoffeeId] = useState('')
  const [roastDateId, setRoastDateId] = useState('')
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

  const recipe = calcBestRecipe(shots)
  const scatterData = shots.map(s => ({ x: s.grind_setting, y: s.rating, id: s.id }))

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

      {/* Roast date filter — only shown when a coffee is selected and has dates */}
      {coffeeId && roastDates.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setRoastDateId('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              roastDateId === ''
                ? 'border-orange-400 bg-orange-50 text-orange-600'
                : 'border-slate-200 text-slate-500 bg-white'
            }`}
          >
            Alle Röstungen
          </button>
          {roastDates.map((rd, i) => (
            <button
              key={rd.id}
              onClick={() => setRoastDateId(rd.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                roastDateId === rd.id
                  ? 'border-orange-400 bg-orange-50 text-orange-600'
                  : 'border-slate-200 text-slate-500 bg-white'
              }`}
            >
              {formatDate(rd.roast_date)}
              {i === 0 ? ' (aktuell)' : ''}
            </button>
          ))}
        </div>
      )}

      {shots.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-10">
          {coffeeId ? 'Noch keine Shots für diese Auswahl.' : 'Noch keine Shots vorhanden.'}
        </p>
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Mahlgrad → Bewertung
              {shots.length > 0 && <span className="font-normal ml-1">({shots.length} Shots)</span>}
            </p>
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
                  name="Bewertung"
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
                        <p>Bewertung: <strong>{y}</strong></p>
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
              <span className="inline-block w-2 h-2 rounded-full bg-green-600 mr-1" />Bewertung ≥ 8
              <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mx-1 ml-3" />unter 8
            </p>
          </div>

          {recipe ? (
            <RecipeCard stats={recipe} />
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center text-sm text-slate-400">
              Noch keine Shots mit Bewertung ≥ 8. Weiter experimentieren!
            </div>
          )}
        </>
      )}
    </div>
  )
}
