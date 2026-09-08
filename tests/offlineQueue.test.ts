/// <reference types="vitest/globals" />
import {
  getOfflineQueue,
  enqueueOfflineAction,
  removeOfflineItem,
  clearOfflineQueue,
  syncOfflineQueue,
} from '@/lib/offlineQueue'

describe('Offline Action Queue System', () => {
  beforeEach(() => {
    clearOfflineQueue()
  })

  it('starts with an empty queue', () => {
    expect(getOfflineQueue()).toEqual([])
  })

  it('enqueues an action with generated queueId and timestamp', () => {
    const action = enqueueOfflineAction({
      userId: 'user-123',
      action: 'insert',
      table: 'transactions',
      payload: { amount: 50000, description: 'Coffee' },
    })

    expect(action.queueId).toMatch(/^offline-/)
    expect(action.timestamp).toBeGreaterThan(0)
    expect(action.userId).toBe('user-123')

    const queue = getOfflineQueue()
    expect(queue).toHaveLength(1)
    expect(queue[0].payload.description).toBe('Coffee')
  })

  it('removes a specific item from the queue by queueId', () => {
    const item1 = enqueueOfflineAction({
      userId: 'user-123',
      action: 'insert',
      table: 'transactions',
      payload: { amount: 10000 },
    })
    const item2 = enqueueOfflineAction({
      userId: 'user-123',
      action: 'insert',
      table: 'transactions',
      payload: { amount: 20000 },
    })

    expect(getOfflineQueue()).toHaveLength(2)

    removeOfflineItem(item1.queueId)
    const remaining = getOfflineQueue()
    expect(remaining).toHaveLength(1)
    expect(remaining[0].queueId).toBe(item2.queueId)
  })

  it('clears all items in the queue', () => {
    enqueueOfflineAction({
      userId: 'user-123',
      action: 'insert',
      table: 'transactions',
      payload: { amount: 30000 },
    })
    enqueueOfflineAction({
      userId: 'user-123',
      action: 'insert',
      table: 'saving_goals',
      payload: { name: 'Emergency Fund' },
    })

    clearOfflineQueue()
    expect(getOfflineQueue()).toEqual([])
  })

  it('gracefully returns 0 sync when navigator is offline or mock supabase is idle', async () => {
    // navigator.onLine is true in jsdom by default
    const mockSupabase: any = {
      from: () => ({
        insert: () => Promise.resolve({ error: null }),
      }),
    }

    const res = await syncOfflineQueue(mockSupabase, 'user-123')
    expect(res.syncedCount).toBe(0)
    expect(res.errors).toEqual([])
  })
})
