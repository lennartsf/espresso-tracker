import { useState } from 'react'
import {
  useGrinders, useCreateGrinder, useUpdateGrinder, useDeleteGrinder,
  useMachines, useCreateMachine, useUpdateMachine, useDeleteMachine,
  useBaskets, useCreateBasket, useUpdateBasket, useDeleteBasket,
} from '../hooks/useEquipment'
import type { Grinder, Machine, Basket } from '../types'

type Tab = 'grinders' | 'machines' | 'baskets'
type View = 'list' | 'detail' | 'new'

const TABS: { key: Tab; label: string }[] = [
  { key: 'grinders', label: 'Mühlen' },
  { key: 'machines', label: 'Maschinen' },
  { key: 'baskets', label: 'Siebe' },
]

export function Equipment() {
  const [tab, setTab] = useState<Tab>('grinders')

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-4">⚙️ Ausrüstung</h1>

      <div className="flex border-b border-slate-200 mb-5">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'text-orange-600 border-b-2 border-orange-500 -mb-px'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'grinders' && <GrinderManager />}
      {tab === 'machines' && <MachineManager />}
      {tab === 'baskets' && <BasketManager />}
    </div>
  )
}

// ── Grinders ──────────────────────────────────────────────────────────────────

function GrinderManager() {
  const [view, setView] = useState<View>('list')
  const [selected, setSelected] = useState<Grinder | null>(null)
  const { data: grindersLive = [] } = useGrinders()
  const selectedGrinder = grindersLive.find(g => g.id === selected?.id) ?? selected

  if (view === 'new') return <GrinderForm onBack={() => setView('list')} />
  if (view === 'detail' && selectedGrinder) {
    return (
      <GrinderDetail
        grinder={selectedGrinder}
        onBack={() => { setView('list'); setSelected(null) }}
        onDelete={() => { setView('list'); setSelected(null) }}
      />
    )
  }
  return <GrinderList onSelect={g => { setSelected(g); setView('detail') }} onNew={() => setView('new')} />
}

function GrinderList({ onSelect, onNew }: { onSelect: (g: Grinder) => void; onNew: () => void }) {
  const { data: grinders = [], isLoading } = useGrinders()
  const updateGrinder = useUpdateGrinder()

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">{grinders.length} Mühle{grinders.length !== 1 ? 'n' : ''}</p>
        <button onClick={onNew} className="bg-orange-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
          + Neu
        </button>
      </div>
      {isLoading && <p className="text-slate-400 text-sm text-center py-6">Laden...</p>}
      <div className="grid gap-2">
        {grinders.map(g => (
          <div key={g.id} className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-3">
            <button
              aria-label="Favorit"
              onClick={() => updateGrinder.mutate({ id: g.id, is_favorite: !g.is_favorite })}
              className={`text-xl flex-shrink-0 ${g.is_favorite ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
            >
              ★
            </button>
            <button onClick={() => onSelect(g)} className="flex-1 text-left min-w-0">
              <p className="font-medium text-slate-800 text-sm truncate">{g.name}</p>
              {g.brand && <p className="text-xs text-slate-400 mt-0.5">{g.brand}</p>}
            </button>
            <span className="text-slate-300 text-lg">›</span>
          </div>
        ))}
        {!isLoading && grinders.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-10">Noch keine Mühlen. Füge deine erste hinzu!</p>
        )}
      </div>
    </div>
  )
}

function GrinderDetail({ grinder, onBack, onDelete }: { grinder: Grinder; onBack: () => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const deleteGrinder = useDeleteGrinder()
  const updateGrinder = useUpdateGrinder()

  if (editing) return <GrinderForm grinder={grinder} onBack={() => setEditing(false)} />

  async function handleDelete() {
    if (!confirm(`"${grinder.name}" wirklich löschen?`)) return
    setDeleteError('')
    try {
      await deleteGrinder.mutateAsync(grinder.id)
      onDelete()
    } catch {
      setDeleteError('Löschen fehlgeschlagen.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="text-slate-400 text-lg">←</button>
          <h2 className="text-xl font-bold text-slate-800">{grinder.name}</h2>
          <button
            aria-label="Favorit"
            onClick={() => updateGrinder.mutate({ id: grinder.id, is_favorite: !grinder.is_favorite })}
            className={`text-2xl ${grinder.is_favorite ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
          >
            ★
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setEditing(true)} className="text-orange-500 text-sm font-semibold">Bearbeiten</button>
          <button onClick={handleDelete} className="text-slate-300 hover:text-red-400 text-sm">Löschen</button>
        </div>
      </div>
      {deleteError && <p className="text-red-500 text-sm mb-3">{deleteError}</p>}
      {grinder.brand && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Marke</p>
          <p className="text-sm text-slate-800">{grinder.brand}</p>
        </div>
      )}
      {grinder.notes && (
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Notizen</p>
          <p className="text-sm text-slate-800">{grinder.notes}</p>
        </div>
      )}
    </div>
  )
}

function GrinderForm({ grinder, onBack }: { grinder?: Grinder; onBack: () => void }) {
  const createGrinder = useCreateGrinder()
  const updateGrinder = useUpdateGrinder()
  const [name, setName] = useState(grinder?.name ?? '')
  const [brand, setBrand] = useState(grinder?.brand ?? '')
  const [notes, setNotes] = useState(grinder?.notes ?? '')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Name ist erforderlich.'); return }
    const payload = { name: name.trim(), brand: brand.trim() || null, notes: notes.trim() || null, grinder_type: null, burr_size_mm: null, motor_watt: null, stepless: false, has_hopper: false, is_favorite: grinder?.is_favorite ?? false }
    try {
      if (grinder) {
        await updateGrinder.mutateAsync({ id: grinder.id, ...payload })
      } else {
        await createGrinder.mutateAsync(payload)
      }
      onBack()
    } catch {
      setError('Fehler beim Speichern.')
    }
  }

  const isPending = createGrinder.isPending || updateGrinder.isPending

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={onBack} className="text-slate-400 text-lg">←</button>
        <h2 className="text-xl font-bold text-slate-800">{grinder ? 'Mühle bearbeiten' : 'Neue Mühle'}</h2>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Name *"
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
        <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Marke"
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notizen" rows={2}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-orange-400" />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={isPending}
          className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50">
          {isPending ? 'Speichern...' : grinder ? 'Änderungen speichern' : 'Mühle speichern'}
        </button>
      </form>
    </div>
  )
}

// ── Machines ──────────────────────────────────────────────────────────────────

function MachineManager() {
  const [view, setView] = useState<View>('list')
  const [selected, setSelected] = useState<Machine | null>(null)
  const { data: machinesLive = [] } = useMachines()
  const selectedMachine = machinesLive.find(m => m.id === selected?.id) ?? selected

  if (view === 'new') return <MachineForm onBack={() => setView('list')} />
  if (view === 'detail' && selectedMachine) {
    return (
      <MachineDetail
        machine={selectedMachine}
        onBack={() => { setView('list'); setSelected(null) }}
        onDelete={() => { setView('list'); setSelected(null) }}
      />
    )
  }
  return <MachineList onSelect={m => { setSelected(m); setView('detail') }} onNew={() => setView('new')} />
}

function MachineList({ onSelect, onNew }: { onSelect: (m: Machine) => void; onNew: () => void }) {
  const { data: machines = [], isLoading } = useMachines()
  const updateMachine = useUpdateMachine()

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">{machines.length} Maschine{machines.length !== 1 ? 'n' : ''}</p>
        <button onClick={onNew} className="bg-orange-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
          + Neu
        </button>
      </div>
      {isLoading && <p className="text-slate-400 text-sm text-center py-6">Laden...</p>}
      <div className="grid gap-2">
        {machines.map(m => (
          <div key={m.id} className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-3">
            <button
              aria-label="Favorit"
              onClick={() => updateMachine.mutate({ id: m.id, is_favorite: !m.is_favorite })}
              className={`text-xl flex-shrink-0 ${m.is_favorite ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
            >
              ★
            </button>
            <button onClick={() => onSelect(m)} className="flex-1 text-left min-w-0">
              <p className="font-medium text-slate-800 text-sm truncate">{m.name}</p>
              {m.brand && <p className="text-xs text-slate-400 mt-0.5">{m.brand}</p>}
            </button>
            <span className="text-slate-300 text-lg">›</span>
          </div>
        ))}
        {!isLoading && machines.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-10">Noch keine Maschinen. Füge deine erste hinzu!</p>
        )}
      </div>
    </div>
  )
}

function MachineDetail({ machine, onBack, onDelete }: { machine: Machine; onBack: () => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const deleteMachine = useDeleteMachine()
  const updateMachine = useUpdateMachine()

  if (editing) return <MachineForm machine={machine} onBack={() => setEditing(false)} />

  async function handleDelete() {
    if (!confirm(`"${machine.name}" wirklich löschen?`)) return
    setDeleteError('')
    try {
      await deleteMachine.mutateAsync(machine.id)
      onDelete()
    } catch {
      setDeleteError('Löschen fehlgeschlagen.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="text-slate-400 text-lg">←</button>
          <h2 className="text-xl font-bold text-slate-800">{machine.name}</h2>
          <button
            aria-label="Favorit"
            onClick={() => updateMachine.mutate({ id: machine.id, is_favorite: !machine.is_favorite })}
            className={`text-2xl ${machine.is_favorite ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
          >
            ★
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setEditing(true)} className="text-orange-500 text-sm font-semibold">Bearbeiten</button>
          <button onClick={handleDelete} className="text-slate-300 hover:text-red-400 text-sm">Löschen</button>
        </div>
      </div>
      {deleteError && <p className="text-red-500 text-sm mb-3">{deleteError}</p>}
      {machine.brand && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Marke</p>
          <p className="text-sm text-slate-800">{machine.brand}</p>
        </div>
      )}
      {machine.notes && (
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Notizen</p>
          <p className="text-sm text-slate-800">{machine.notes}</p>
        </div>
      )}
    </div>
  )
}

function MachineForm({ machine, onBack }: { machine?: Machine; onBack: () => void }) {
  const createMachine = useCreateMachine()
  const updateMachine = useUpdateMachine()
  const [name, setName] = useState(machine?.name ?? '')
  const [brand, setBrand] = useState(machine?.brand ?? '')
  const [notes, setNotes] = useState(machine?.notes ?? '')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Name ist erforderlich.'); return }
    const payload = { name: name.trim(), brand: brand.trim() || null, notes: notes.trim() || null, funktionsweise: null, brew_group_type: null, brew_group_size_mm: null, is_favorite: machine?.is_favorite ?? false }
    try {
      if (machine) {
        await updateMachine.mutateAsync({ id: machine.id, ...payload })
      } else {
        await createMachine.mutateAsync(payload)
      }
      onBack()
    } catch {
      setError('Fehler beim Speichern.')
    }
  }

  const isPending = createMachine.isPending || updateMachine.isPending

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={onBack} className="text-slate-400 text-lg">←</button>
        <h2 className="text-xl font-bold text-slate-800">{machine ? 'Maschine bearbeiten' : 'Neue Maschine'}</h2>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Name *"
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
        <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Marke"
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notizen" rows={2}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-orange-400" />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={isPending}
          className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50">
          {isPending ? 'Speichern...' : machine ? 'Änderungen speichern' : 'Maschine speichern'}
        </button>
      </form>
    </div>
  )
}

// ── Baskets ───────────────────────────────────────────────────────────────────

function BasketManager() {
  const [view, setView] = useState<View>('list')
  const [selected, setSelected] = useState<Basket | null>(null)
  const { data: basketsLive = [] } = useBaskets()
  const selectedBasket = basketsLive.find(b => b.id === selected?.id) ?? selected

  if (view === 'new') return <BasketForm onBack={() => setView('list')} />
  if (view === 'detail' && selectedBasket) {
    return (
      <BasketDetail
        basket={selectedBasket}
        onBack={() => { setView('list'); setSelected(null) }}
        onDelete={() => { setView('list'); setSelected(null) }}
      />
    )
  }
  return <BasketList onSelect={b => { setSelected(b); setView('detail') }} onNew={() => setView('new')} />
}

function BasketList({ onSelect, onNew }: { onSelect: (b: Basket) => void; onNew: () => void }) {
  const { data: baskets = [], isLoading } = useBaskets()
  const updateBasket = useUpdateBasket()

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">{baskets.length} Sieb{baskets.length !== 1 ? 'e' : ''}</p>
        <button onClick={onNew} className="bg-orange-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
          + Neu
        </button>
      </div>
      {isLoading && <p className="text-slate-400 text-sm text-center py-6">Laden...</p>}
      <div className="grid gap-2">
        {baskets.map(b => (
          <div key={b.id} className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-3">
            <button
              aria-label="Favorit"
              onClick={() => updateBasket.mutate({ id: b.id, is_favorite: !b.is_favorite })}
              className={`text-xl flex-shrink-0 ${b.is_favorite ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
            >
              ★
            </button>
            <button onClick={() => onSelect(b)} className="flex-1 text-left min-w-0">
              <p className="font-medium text-slate-800 text-sm truncate">{b.name}</p>
              {(b.brand || b.diameter_mm || b.size_g) && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {[b.brand, b.diameter_mm ? `⌀${b.diameter_mm}mm` : null, b.size_g ? `${b.size_g}g` : null].filter(Boolean).join(' · ')}
                </p>
              )}
            </button>
            <span className="text-slate-300 text-lg">›</span>
          </div>
        ))}
        {!isLoading && baskets.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-10">Noch keine Siebe. Füge dein erstes hinzu!</p>
        )}
      </div>
    </div>
  )
}

function BasketDetail({ basket, onBack, onDelete }: { basket: Basket; onBack: () => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const deleteBasket = useDeleteBasket()
  const updateBasket = useUpdateBasket()

  if (editing) return <BasketForm basket={basket} onBack={() => setEditing(false)} />

  async function handleDelete() {
    if (!confirm(`"${basket.name}" wirklich löschen?`)) return
    setDeleteError('')
    try {
      await deleteBasket.mutateAsync(basket.id)
      onDelete()
    } catch {
      setDeleteError('Löschen fehlgeschlagen.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="text-slate-400 text-lg">←</button>
          <h2 className="text-xl font-bold text-slate-800">{basket.name}</h2>
          <button
            aria-label="Favorit"
            onClick={() => updateBasket.mutate({ id: basket.id, is_favorite: !basket.is_favorite })}
            className={`text-2xl ${basket.is_favorite ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
          >
            ★
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setEditing(true)} className="text-orange-500 text-sm font-semibold">Bearbeiten</button>
          <button onClick={handleDelete} className="text-slate-300 hover:text-red-400 text-sm">Löschen</button>
        </div>
      </div>
      {deleteError && <p className="text-red-500 text-sm mb-3">{deleteError}</p>}
      {basket.brand && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Marke</p>
          <p className="text-sm text-slate-800">{basket.brand}</p>
        </div>
      )}
      {basket.diameter_mm !== null && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Durchmesser</p>
          <p className="text-sm text-slate-800">{basket.diameter_mm} mm</p>
        </div>
      )}
      {basket.size_g !== null && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Nenndosis</p>
          <p className="text-sm text-slate-800">{basket.size_g} g</p>
        </div>
      )}
      {basket.notes && (
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Notizen</p>
          <p className="text-sm text-slate-800">{basket.notes}</p>
        </div>
      )}
    </div>
  )
}

function BasketForm({ basket, onBack }: { basket?: Basket; onBack: () => void }) {
  const createBasket = useCreateBasket()
  const updateBasket = useUpdateBasket()
  const [name, setName] = useState(basket?.name ?? '')
  const [brand, setBrand] = useState(basket?.brand ?? '')
  const [diameterMm, setDiameterMm] = useState(basket?.diameter_mm != null ? String(basket.diameter_mm) : '')
  const [sizeG, setSizeG] = useState(basket?.size_g != null ? String(basket.size_g) : '')
  const [notes, setNotes] = useState(basket?.notes ?? '')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Name ist erforderlich.'); return }
    const payload = {
      name: name.trim(),
      brand: brand.trim() || null,
      diameter_mm: diameterMm ? (isNaN(parseFloat(diameterMm)) ? null : parseFloat(diameterMm)) : null,
      size_g: sizeG ? (isNaN(parseFloat(sizeG)) ? null : parseFloat(sizeG)) : null,
      notes: notes.trim() || null,
      is_favorite: basket?.is_favorite ?? false,
    }
    try {
      if (basket) {
        await updateBasket.mutateAsync({ id: basket.id, ...payload })
      } else {
        await createBasket.mutateAsync(payload)
      }
      onBack()
    } catch {
      setError('Fehler beim Speichern.')
    }
  }

  const isPending = createBasket.isPending || updateBasket.isPending

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={onBack} className="text-slate-400 text-lg">←</button>
        <h2 className="text-xl font-bold text-slate-800">{basket ? 'Sieb bearbeiten' : 'Neues Sieb'}</h2>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Name *"
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
        <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Marke"
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
        <div className="flex items-center gap-2">
          <input type="number" step="1" value={diameterMm} onChange={e => setDiameterMm(e.target.value)} placeholder="Durchmesser"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          <span className="text-sm text-slate-400">mm</span>
        </div>
        <div className="flex items-center gap-2">
          <input type="number" step="0.5" value={sizeG} onChange={e => setSizeG(e.target.value)} placeholder="Nenndosis"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" />
          <span className="text-sm text-slate-400">g</span>
        </div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notizen" rows={2}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-orange-400" />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={isPending}
          className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50">
          {isPending ? 'Speichern...' : basket ? 'Änderungen speichern' : 'Sieb speichern'}
        </button>
      </form>
    </div>
  )
}
