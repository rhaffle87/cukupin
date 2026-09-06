import type { SupabaseClient } from '@supabase/supabase-js'
import { STORAGE_KEYS } from '@/lib/constants/site'

export interface QueuedAction {
  queueId: string
  timestamp: number
  userId: string
  action: 'insert' | 'update' | 'delete'
  table?: 'transactions' | 'saving_goals' | 'wishlist' | 'recurring_bills' | 'category_budgets'
  targetId?: string
  payload: any
}

const OFFLINE_QUEUE_KEY = STORAGE_KEYS.OFFLINE_QUEUE

export function getOfflineQueue(): QueuedAction[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('Failed to read offline queue:', e)
    return []
  }
}

export function enqueueOfflineAction(action: Omit<QueuedAction, 'queueId' | 'timestamp'>): QueuedAction {
  const queue = getOfflineQueue()
  const item: QueuedAction = {
    ...action,
    queueId: 'offline-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    timestamp: Date.now(),
  }
  queue.push(item)
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
  } catch (e) {
    console.error('Failed to save offline queue:', e)
  }
  return item
}

export function removeOfflineItem(queueId: string): void {
  if (typeof window === 'undefined') return
  try {
    const queue = getOfflineQueue().filter(q => q.queueId !== queueId)
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
  } catch (e) {
    console.error('Failed to update offline queue on removal:', e)
  }
}

export function clearOfflineQueue(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(OFFLINE_QUEUE_KEY)
  } catch (e) {
    console.error('Failed to clear offline queue:', e)
  }
}

/**
 * Replays all queued actions to Supabase sequentially when online
 */
export async function syncOfflineQueue(
  supabase: SupabaseClient,
  currentUserId: string
): Promise<{ syncedCount: number; errors: any[] }> {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return { syncedCount: 0, errors: [] }
  }

  const queue = getOfflineQueue().filter(q => q.userId === currentUserId)
  if (queue.length === 0) {
    return { syncedCount: 0, errors: [] }
  }

  let syncedCount = 0
  const errors: any[] = []

  for (const item of queue) {
    const targetTable = item.table || 'transactions'
    try {
      if (item.action === 'insert') {
        let res = await supabase.from(targetTable).insert(item.payload).select()
        if (res.error && targetTable === 'transactions') {
          // Schema fallback if payment_method column is pending migration
          if (res.error.message?.includes('payment_method') || (res.error as any).code === 'PGRST204') {
            const isArray = Array.isArray(item.payload)
            const fallbackPayload = isArray
              ? item.payload.map(({ payment_method, ...rest }: any) => ({
                  ...rest,
                  note: payment_method
                    ? (rest.note ? `${rest.note} [Metode: ${payment_method}]` : `[Metode: ${payment_method}]`)
                    : rest.note,
                }))
              : (() => {
                  const { payment_method, ...rest } = item.payload
                  const mergedNote = payment_method
                    ? (rest.note ? `${rest.note} [Metode: ${payment_method}]` : `[Metode: ${payment_method}]`)
                    : rest.note
                  return { ...rest, note: mergedNote || null }
                })()
            const retryRes = await supabase.from(targetTable).insert(fallbackPayload)
            if (retryRes.error) throw retryRes.error
          } else {
            throw res.error
          }
        } else if (res.error) {
          throw res.error
        }
      } else if (item.action === 'update' && item.targetId) {
        const res = await supabase.from(targetTable).update(item.payload).eq('id', item.targetId)
        if (res.error) throw res.error
      } else if (item.action === 'delete' && item.targetId) {
        const res = await supabase.from(targetTable).delete().eq('id', item.targetId)
        if (res.error) throw res.error
      }

      removeOfflineItem(item.queueId)
      syncedCount++
    } catch (err) {
      console.error(`Failed to sync offline item for table "${targetTable}":`, item, err)
      errors.push(err)
    }
  }

  return { syncedCount, errors }
}
