import { supabase } from './supabase'

/**
 * Offline write queue — buffers shot/brew inserts in localStorage while offline
 * and replays them on reconnect. Keeps capture working without a connection.
 *
 * Scope: CREATE of shots and brews only (the capture flow). Edits/deletes and
 * inline new-coffee creation are NOT queued — they still require a connection.
 */

export type QueueTable = 'shots' | 'brews'

export interface QueuedWrite {
  id: string // local id (not the eventual DB id)
  table: QueueTable
  payload: Record<string, unknown>
  queuedAt: number
}

const KEY = 'espresso-write-queue'

export function loadQueue(): QueuedWrite[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as QueuedWrite[]) : []
  } catch {
    return []
  }
}

function save(queue: QueuedWrite[]) {
  localStorage.setItem(KEY, JSON.stringify(queue))
  notify()
}

export function enqueueWrite(table: QueueTable, payload: Record<string, unknown>): QueuedWrite {
  const item: QueuedWrite = {
    id: crypto.randomUUID(),
    table,
    payload,
    queuedAt: Date.now(),
  }
  save([...loadQueue(), item])
  return item
}

export function queueSize(): number {
  return loadQueue().length
}

/**
 * Replay queued writes in order. Stops at the first failure so ordering and
 * any genuinely-broken payload don't block silently forever — remaining items
 * stay queued for the next attempt. Returns counts.
 */
export async function flushQueue(): Promise<{ flushed: number; remaining: number }> {
  let queue = loadQueue()
  let flushed = 0

  for (const item of [...queue]) {
    const { error } = await supabase.from(item.table).insert(item.payload)
    if (error) break // network down or rejected — keep this + the rest, retry later
    queue = queue.filter(x => x.id !== item.id)
    save(queue)
    flushed++
  }

  return { flushed, remaining: queue.length }
}

// --- lightweight subscription so the UI can show a pending count ---
type Listener = () => void
const listeners = new Set<Listener>()

export function subscribeQueue(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notify() {
  listeners.forEach(l => l())
}
