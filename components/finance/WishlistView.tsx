import React, { useState } from 'react'
import type { WishlistItem } from '@/lib/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { Check, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { useFinanceData } from '@/hooks/useFinanceData'
import { currency } from '@/lib/finance'
import { sanitizeNumericInput, wishlistSchema } from '@/lib/validations/finance'

import confetti from 'canvas-confetti'
import { isoDate } from '@/lib/finance'

interface WishlistViewProps {
  supabase: SupabaseClient | null
  data: ReturnType<typeof useFinanceData>
  userId?: string
}

export function WishlistView({ supabase, data, userId }: WishlistViewProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium')

  async function add(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase || !userId) return toast.error('Hubungkan Supabase dan masuk untuk menyimpan.')
    
    const numericPrice = sanitizeNumericInput(price)
    const parsed = wishlistSchema.safeParse({ name, price: numericPrice, priority })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || 'Data wishlist tidak valid')
      return
    }

    const tempId = `temp-${Date.now()}`
    const newItem: WishlistItem = {
      id: tempId,
      user_id: userId,
      name: parsed.data.name,
      price: parsed.data.price,
      url: null,
      priority: parsed.data.priority,
      created_at: new Date().toISOString(),
    }

    // Zero-latency optimistic UI update
    const previous = data.wishlist
    data.setWishlist(prev => [newItem, ...prev])
    setName('')
    setPrice('')

    const r = await supabase.from('wishlist').insert({
      user_id: userId,
      name: parsed.data.name,
      price: parsed.data.price,
      url: null,
      priority: parsed.data.priority,
    }).select().single()
    
    if (r.error) {
      toast.error(r.error.message)
      data.setWishlist(previous)
    } else {
      toast.success('Wishlist ditambahkan.')
      data.setWishlist(prev => prev.map(item => item.id === tempId ? (r.data as WishlistItem) : item))
    }
  }

  async function toggle(item: WishlistItem) {
    if (!supabase) return
    const newPrio = item.priority === 'High' ? 'Low' : 'High'
    const previous = data.wishlist
    data.setWishlist(prev => prev.map(w => w.id === item.id ? { ...w, priority: newPrio } : w))
    
    const r = await supabase.from('wishlist').update({ priority: newPrio }).eq('id', item.id)
    if (r.error) {
      toast.error(r.error.message)
      data.setWishlist(previous)
    }
  }

  async function checkout(item: WishlistItem) {
    if (!supabase || !userId) return
    if (!confirm(`Catat "${item.name}" sebesar ${currency(Number(item.price))} sebagai pengeluaran dan tandai terbeli?`)) return

    // Optimistic UI update
    const previousWishlist = data.wishlist
    data.setWishlist(prev => prev.filter(w => w.id !== item.id))

    // 1. Insert into transactions
    const txPayload = {
      user_id: userId,
      type: 'expense' as const,
      description: item.name,
      amount: Number(item.price),
      category: 'Shopping',
      transaction_date: isoDate(new Date()),
      note: 'Dibeli dari Wishlist',
    }

    const txRes = await supabase.from('transactions').insert(txPayload).select().single()
    if (txRes.error) {
      toast.error('Gagal mencatat transaksi: ' + txRes.error.message)
      data.setWishlist(previousWishlist)
      return
    }

    // 2. Delete from wishlist
    await supabase.from('wishlist').delete().eq('id', item.id)

    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#3E8F68', '#BEE6CF', '#315DCB', '#D98362'],
      })
    } catch {
      // ignore
    }

    toast.success(`"${item.name}" berhasil dicatat sebagai pengeluaran!`)
    data.refresh()
  }
  
  async function remove(item: WishlistItem) {
    if (!supabase || !confirm('Hapus item ini?')) return
    const previous = data.wishlist
    data.setWishlist(prev => prev.filter(w => w.id !== item.id))
    
    const r = await supabase.from('wishlist').delete().eq('id', item.id)
    if (r.error) {
      toast.error(r.error.message)
      data.setWishlist(previous)
    } else {
      toast.success('Item dihapus.')
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="DAFTAR INGIN"
        title="Wishlist"
        subtitle="Tampung barang yang pengen dibeli, biar nggak impulsif."
      />
      
      <div className="wishlist-layout">
        <section className="panel wish-add">
          <p className="eyebrow">CATAT DULU</p>
          <h2>Pengen beli apa?</h2>
          <form onSubmit={add}>
            <input required value={name} onChange={e => setName(e.target.value)} placeholder="Nama barang atau keinginan" />
            <div className="inline-form">
              <input type="text" inputMode="numeric" required value={price} onChange={e => setPrice(e.target.value)} placeholder="Perkiraan harga (contoh: 150.000)" />
              <select
                style={{
                  width: '80px',
                  flex: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.15)'
                }}
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
              >
                <option className="text-black">Low</option>
                <option className="text-black">Medium</option>
                <option className="text-black">High</option>
              </select>
              <button className="button primary" aria-label="Tambah wishlist">
                <Plus size={18} />
              </button>
            </div>
          </form>
        </section>
        
        <section className="panel wishlist-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">DAFTAR KEINGINAN</p>
              <h2>{data.wishlist.length} item tersimpan</h2>
            </div>
          </div>
          {data.wishlist.length ? (
            <div className="wish-list">
              {data.wishlist.map(item => (
                <div className={`wish-row ${item.priority === 'Low' ? 'purchased' : ''}`} key={item.id}>
                  <button className="check-button" onClick={() => toggle(item)} aria-label="Tandai prioritas">
                    {item.priority === 'Low' && <Check size={14} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <strong className="truncate block">{item.name}</strong>
                    <span className="text-xs text-muted">{currency(Number(item.price))} · {item.priority}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => checkout(item)}
                      className="inline-flex items-center gap-1 rounded-lg border border-green/30 bg-green-soft px-2.5 py-1 text-[11px] font-bold text-green transition-all hover:bg-green hover:!text-white active:scale-95"
                      title="Catat barang ini sebagai pengeluaran dan hapus dari wishlist"
                    >
                      <Check size={12} />
                      <span className="hidden sm:inline">Sudah Beli</span>
                    </button>
                    <button className="icon-button danger" onClick={() => remove(item)} aria-label="Hapus wishlist">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ShoppingBag}
              title="Belum ada wishlist"
              body="Tulis barang impianmu di sini dulu sebelum buru-buru dibeli."
            />
          )}
        </section>
      </div>
    </>
  )
}
