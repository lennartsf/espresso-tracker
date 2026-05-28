import { useState } from 'react'
import { useCoffees, useCreateCoffee, useDeleteCoffee } from '../hooks/useCoffees'

export function CoffeeManager() {
  const { data: coffees = [], isLoading } = useCoffees()
  const createCoffee = useCreateCoffee()
  const deleteCoffee = useDeleteCoffee()

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [roaster, setRoaster] = useState('')
  const [origin, setOrigin] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await createCoffee.mutateAsync({
      name: name.trim(),
      roaster: roaster.trim() || null,
      origin: origin.trim() || null,
      roast_date: null,
      notes: null,
    })
    setName(''); setRoaster(''); setOrigin(''); setShowForm(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-slate-800">☕ Kaffees</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="bg-orange-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg"
        >
          {showForm ? 'Abbrechen' : '+ Neu'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white border border-slate-200 rounded-lg p-4 mb-4 grid gap-3">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Name *"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={roaster}
              onChange={e => setRoaster(e.target.value)}
              placeholder="Rösterei"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
            <input
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              placeholder="Herkunft"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
          <button
            type="submit"
            disabled={createCoffee.isPending}
            className="bg-orange-500 text-white font-semibold py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {createCoffee.isPending ? 'Speichern...' : 'Speichern'}
          </button>
        </form>
      )}

      {isLoading && <p className="text-slate-400 text-sm text-center py-6">Laden...</p>}

      <div className="grid gap-2">
        {coffees.map(c => (
          <div key={c.id} className="bg-white border border-slate-200 rounded-lg p-3 flex justify-between items-center">
            <div>
              <p className="font-medium text-slate-800 text-sm">{c.name}</p>
              {(c.roaster || c.origin) && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {[c.roaster, c.origin].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            <button
              onClick={() => deleteCoffee.mutate(c.id)}
              className="text-slate-300 hover:text-red-400 text-xl px-1 leading-none"
              aria-label={`${c.name} löschen`}
            >
              ×
            </button>
          </div>
        ))}
        {!isLoading && coffees.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-10">
            Noch keine Kaffees. Füge deinen ersten hinzu!
          </p>
        )}
      </div>
    </div>
  )
}
