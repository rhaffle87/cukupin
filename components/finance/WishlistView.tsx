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
                  <button className="check-button" onClick={() => toggle(item)} aria-label="Tandai selesai">
                    {item.priority === 'Low' && <Check size={14} />}
                  </button>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{currency(Number(item.price))} · {item.priority}</span>
                  </div>
                  <button className="icon-button danger" onClick={() => remove(item)} aria-label="Hapus wishlist">
                    <Trash2 size={15} />
                  </button>
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
