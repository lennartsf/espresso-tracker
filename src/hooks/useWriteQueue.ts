import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { queueSize, subscribeQueue, flushQueue } from '../lib/writeQueue'

/**
 * Tracks online status + pending offline writes, and flushes the queue on
 * reconnect (and once on mount, to drain a previous session). Invalidates the
 * shot/brew caches after a successful flush so synced rows appear.
 */
export function useWriteQueue() {
  const qc = useQueryClient()
  const [pending, setPending] = useState(queueSize)
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const sync = () => setPending(queueSize())
    const unsub = subscribeQueue(sync)

    const flush = async () => {
      const { flushed } = await flushQueue()
      if (flushed > 0) {
        qc.invalidateQueries({ queryKey: ['shots'] })
        qc.invalidateQueries({ queryKey: ['brews'] })
      }
    }
    const goOnline = () => { setOnline(true); flush() }
    const goOffline = () => setOnline(false)

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    if (navigator.onLine) flush()

    return () => {
      unsub()
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [qc])

  return { pending, online }
}
