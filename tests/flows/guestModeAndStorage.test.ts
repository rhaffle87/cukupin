/// <reference types="vitest/globals" />
import {
  enqueueOfflineAction,
  getOfflineQueue,
  clearOfflineQueue,
} from '@/lib/offlineQueue'
import { STORAGE_KEYS } from '@/lib/constants/site'

describe('Guest Mode & Offline Storage State Flow Tests', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('enqueues actions with unique queueIds and timestamps when offline', () => {
    enqueueOfflineAction({
      userId: 'guest-1',
      table: 'transactions',
      action: 'insert',
      payload: {
        type: 'expense',
        category: 'Food',
        amount: 25000,
        description: 'Kopi Kenangan',
      },
    })

    const queue = getOfflineQueue()
    expect(queue).toHaveLength(1)
    expect(queue[0].queueId).toBeDefined()
    expect(queue[0].timestamp).toBeGreaterThan(0)
    expect(queue[0].action).toBe('insert')
    expect(queue[0].payload.amount).toBe(25000)
  })

  it('maintains FIFO order when multiple actions are enqueued', () => {
    enqueueOfflineAction({ userId: 'u1', table: 'transactions', action: 'insert', payload: { id: 'tx-1', amount: 10000 } })
    enqueueOfflineAction({ userId: 'u1', table: 'transactions', action: 'update', targetId: 'tx-1', payload: { amount: 15000 } })
    enqueueOfflineAction({ userId: 'u1', table: 'transactions', action: 'delete', targetId: 'tx-1', payload: {} })

    const queue = getOfflineQueue()
    expect(queue).toHaveLength(3)
    expect(queue[0].action).toBe('insert')
    expect(queue[1].action).toBe('update')
    expect(queue[2].action).toBe('delete')
  })

  it('clears the offline queue on request or session reset', () => {
    enqueueOfflineAction({ userId: 'u1', table: 'saving_goals', action: 'insert', payload: { title: 'Beli Laptop' } })
    expect(getOfflineQueue()).toHaveLength(1)

    clearOfflineQueue()
    expect(getOfflineQueue()).toHaveLength(0)
    expect(localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE)).toBeNull()
  })

  it('safely handles corrupted localStorage items without throwing exceptions', () => {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, 'invalid-non-json-string')
    const queue = getOfflineQueue()
    expect(queue).toEqual([])
  })

  it('stores and retrieves guest mode transactions in localStorage', () => {
    const mockTxs = [
      { id: 'g-1', user_id: 'guest', type: 'expense', category: 'Transport', amount: 20000, description: 'Bensin' },
    ]
    localStorage.setItem(STORAGE_KEYS.LOCAL_TRANSACTIONS, JSON.stringify(mockTxs))

    const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_TRANSACTIONS)
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].description).toBe('Bensin')
  })
})
