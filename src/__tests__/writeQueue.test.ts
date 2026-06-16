import { test, expect, beforeEach, vi } from 'vitest'

const insertMock = vi.fn()
vi.mock('../lib/supabase', () => ({
  supabase: { from: () => ({ insert: insertMock }) },
}))

import { enqueueWrite, loadQueue, queueSize, flushQueue } from '../lib/writeQueue'

beforeEach(() => {
  localStorage.clear()
  insertMock.mockReset()
})

test('enqueue persists payload + table to localStorage', () => {
  enqueueWrite('shots', { rating: 8 })
  expect(queueSize()).toBe(1)
  const [item] = loadQueue()
  expect(item.table).toBe('shots')
  expect(item.payload).toEqual({ rating: 8 })
})

test('flush replays each write and clears the queue on success', async () => {
  enqueueWrite('shots', { rating: 8 })
  enqueueWrite('brews', { rating: 7 })
  insertMock.mockResolvedValue({ error: null })

  const res = await flushQueue()

  expect(res.flushed).toBe(2)
  expect(res.remaining).toBe(0)
  expect(queueSize()).toBe(0)
  expect(insertMock).toHaveBeenCalledTimes(2)
})

test('flush stops at first failure and keeps the remaining items in order', async () => {
  enqueueWrite('shots', { a: 1 })
  enqueueWrite('shots', { a: 2 })
  insertMock
    .mockResolvedValueOnce({ error: null })
    .mockResolvedValueOnce({ error: { message: 'network' } })

  const res = await flushQueue()

  expect(res.flushed).toBe(1)
  expect(queueSize()).toBe(1)
  expect(loadQueue()[0].payload).toEqual({ a: 2 })
})
