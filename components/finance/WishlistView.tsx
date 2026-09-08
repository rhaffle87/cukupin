import React, { useMemo, useState } from 'react'
import type { SavingGoal, Transaction, WishlistItem } from '@/lib/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Filter,
  Plus,
  ShoppingBag,
  Sparkles,
  Target,
  Trash2,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { useFinanceData } from '@/hooks/useFinanceData'
import { currency, isoDate, totals } from '@/lib/finance'
import { formatRupiahInput, sanitizeNumericInput, wishlistSchema } from '@/lib/validations/finance'
import confetti from 'canvas-confetti'
import { enqueueOfflineAction } from '@/lib/offlineQueue'

interface WishlistViewProps {
  supabase: SupabaseClient | null
  data: ReturnType<typeof useFinanceData>
  userId?: string
}

export function WishlistView({ supabase, data, userId }: WishlistViewProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium')
  const [filterTab, setFilterTab] = useState<'all' | 'affordable' | 'High' | 'Medium' | 'Low'>('all')

  // Calculate current liquid balance from transactions
  const currentBalance = useMemo(() => totals(data.transactions).balance, [data.transactions])

  // Total value of all wishlist items
  const totalWishlistValue = useMemo(() => {
    return data.wishlist.reduce((acc, item) => acc + Number(item.price || 0), 0)
  }, [data.wishlist])

  // Items user can afford right now based on balance
  const affordableCount = useMemo(() => {
    if (currentBalance <= 0) return 0
    return data.wishlist.filter(item => Number(item.price) <= currentBalance).length
  }, [data.wishlist, currentBalance])

  // Filtered wishlist items
  const filteredWishlist = useMemo(() => {
    return data.wishlist.filter(item => {
      if (filterTab === 'all') return true
      if (filterTab === 'affordable') return Number(item.price) <= currentBalance && currentBalance > 0
      return item.priority === filterTab
    })
  }, [data.wishlist, filterTab, currentBalance])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    const numericPrice = sanitizeNumericInput(price)
    const parsed = wishlistSchema.safeParse({ name, price: numericPrice, priority })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || 'Data wishlist tidak valid')
      return
    }

    const tempId = `temp-${Date.now()}`
    const newItem: WishlistItem = {
      id: tempId,
      user_id: userId || 'local-dev-user',
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
    setPriority('Medium')
    setShowAddModal(false)

    if (userId === 'local-dev-user' || !supabase) {
      const stored = localStorage.getItem('cukupin_local_wishlist')
      const localWish: WishlistItem[] = stored ? JSON.parse(stored) : []
      const updated = [newItem, ...localWish]
      localStorage.setItem('cukupin_local_wishlist', JSON.stringify(updated))
      toast.success('Barang impian berhasil ditambahkan!')
      return
    }

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
      toast.success('Barang impian berhasil ditambahkan!')
      data.setWishlist(prev => prev.map(item => item.id === tempId ? (r.data as WishlistItem) : item))
    }
  }

  async function checkout(item: WishlistItem) {
    if (!confirm(`Catat "${item.name}" (${currency(Number(item.price))}) sebagai pengeluaran belanja dan tandai sudah terbeli?`)) return

    // Optimistic UI update
    const previousWishlist = data.wishlist
    data.setWishlist(prev => prev.filter(w => w.id !== item.id))

    const txPayload: Transaction = {
      id: 'tx-' + Date.now(),
      user_id: userId || 'local-dev-user',
      type: 'expense' as const,
      description: item.name,
      amount: Number(item.price),
      category: 'Shopping',
      transaction_date: isoDate(new Date()),
      note: 'Dibeli dari Wishlist',
      payment_method: 'Transfer Bank',
      created_at: new Date().toISOString(),
    }

    if (userId === 'local-dev-user' || !supabase) {
      const storedWish = localStorage.getItem('cukupin_local_wishlist')
      const localWish: WishlistItem[] = storedWish ? JSON.parse(storedWish) : []
      localStorage.setItem('cukupin_local_wishlist', JSON.stringify(localWish.filter(w => w.id !== item.id)))

      const storedTx = localStorage.getItem('cukupin_local_transactions')
      const localTx: Transaction[] = storedTx ? JSON.parse(storedTx) : []
      localStorage.setItem('cukupin_local_transactions', JSON.stringify([txPayload, ...localTx]))
      data.setTransactions(prev => [txPayload, ...prev])

      try {
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.65 }, colors: ['#3E8F68', '#BEE6CF', '#315DCB'] })
      } catch { }
      toast.success(`Hore! "${item.name}" berhasil dibeli dan dicatat ke pengeluaran.`)
      return
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      enqueueOfflineAction({
        userId: userId || 'user',
        action: 'insert',
        table: 'transactions',
        payload: {
          user_id: userId,
          type: 'expense',
          description: item.name,
          amount: Number(item.price),
          category: 'Shopping',
          transaction_date: isoDate(new Date()),
          note: 'Dibeli dari Wishlist',
          payment_method: 'Transfer Bank',
        },
      })
      enqueueOfflineAction({
        userId: userId || 'user',
        action: 'delete',
        table: 'wishlist',
        targetId: item.id,
        payload: { id: item.id },
      })
      data.setTransactions(prev => [txPayload, ...prev])

      try {
        confetti({
          particleCount: 75,
          spread: 65,
          origin: { y: 0.65 },
          colors: ['#3E8F68', '#BEE6CF', '#315DCB', '#D98362'],
        })
      } catch { }

      toast.info(`Tersimpan offline. "${item.name}" berhasil dibeli dan akan disinkronkan saat online.`)
      return
    }

    let txRes = await supabase.from('transactions').insert({
      user_id: userId,
      type: 'expense',
      description: item.name,
      amount: Number(item.price),
      category: 'Shopping',
      transaction_date: isoDate(new Date()),
      note: 'Dibeli dari Wishlist',
      payment_method: 'Transfer Bank',
    }).select().single()

    if (txRes.error && (txRes.error.message?.includes('payment_method') || txRes.error.code === 'PGRST204')) {
      txRes = await supabase.from('transactions').insert({
        user_id: userId,
        type: 'expense',
        description: item.name,
        amount: Number(item.price),
        category: 'Shopping',
        transaction_date: isoDate(new Date()),
        note: 'Dibeli dari Wishlist [Metode: Transfer Bank]',
      }).select().single()
    }

    if (txRes.error) {
      toast.error('Gagal mencatat transaksi: ' + txRes.error.message)
      data.setWishlist(previousWishlist)
      return
    }

    // Delete from wishlist
    await supabase.from('wishlist').delete().eq('id', item.id)

    try {
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.65 },
        colors: ['#3E8F68', '#BEE6CF', '#315DCB', '#D98362'],
      })
    } catch {
      // ignore in environments without canvas
    }

    toast.success(`Hore! "${item.name}" berhasil dibeli dan dicatat ke pengeluaran.`)
    data.refresh()
  }

  async function remove(item: WishlistItem) {
    if (!confirm('Hapus barang ini dari wishlist?')) return
    const previous = data.wishlist
    data.setWishlist(prev => prev.filter(w => w.id !== item.id))

    if (userId === 'local-dev-user' || !supabase) {
      const stored = localStorage.getItem('cukupin_local_wishlist')
      const localWish: WishlistItem[] = stored ? JSON.parse(stored) : []
      localStorage.setItem('cukupin_local_wishlist', JSON.stringify(localWish.filter(w => w.id !== item.id)))
      toast.success('Item dihapus dari wishlist.')
      return
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      enqueueOfflineAction({
        userId: userId || 'user',
        action: 'delete',
        table: 'wishlist',
        targetId: item.id,
        payload: { id: item.id },
      })
      toast.info('Penghapusan disimpan dalam antrean offline.')
      return
    }

    const r = await supabase.from('wishlist').delete().eq('id', item.id)
    if (r.error) {
      toast.error(r.error.message)
      data.setWishlist(previous)
    } else {
      toast.success('Item dihapus dari wishlist.')
    }
  }

  async function convertToGoal(item: WishlistItem) {
    if (!confirm(`Buat target tabungan untuk "${item.name}" sebesar ${currency(Number(item.price))}?`)) return

    const newGoal: SavingGoal = {
      id: 'goal-' + Date.now(),
      user_id: userId || 'local-dev-user',
      name: `Beli ${item.name}`,
      target_amount: Number(item.price),
      current_amount: 0,
      deadline: null,
      created_at: new Date().toISOString(),
    }

    if (userId === 'local-dev-user' || !supabase) {
      const stored = localStorage.getItem('cukupin_local_goals')
      const localGoals: SavingGoal[] = stored ? JSON.parse(stored) : []
      const updated = [newGoal, ...localGoals]
      localStorage.setItem('cukupin_local_goals', JSON.stringify(updated))
      data.setGoals(updated)
      try {
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } })
      } catch { }
      toast.success(`Target tabungan untuk "${item.name}" berhasil dibuat! Cek di menu Tabungan.`)
      return
    }

    const res = await supabase.from('saving_goals').insert({
      user_id: userId,
      name: `Beli ${item.name}`,
      target_amount: Number(item.price),
      current_amount: 0,
    }).select().single()

    if (res.error) {
      toast.error('Gagal membuat target tabungan: ' + res.error.message)
    } else {
      try {
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } })
      } catch { }
      toast.success(`Target tabungan untuk "${item.name}" berhasil dibuat! Cek di menu Tabungan.`)
      if (res.data) {
        data.setGoals(prev => [res.data as SavingGoal, ...prev])
      }
      data.refresh()
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="DAFTAR IMPIAN"
        title="Wishlist"
        subtitle="Tampung barang yang pengen kamu beli biar belanja tetap terencana dan nggak impulsif."
        action={
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-xs font-bold !text-white shadow-sm transition-all hover:bg-ink/90 active:scale-95"
          >
            <Plus size={16} /> Tambah Wishlist
          </button>
        }
      />

      {/* Top Structured KPI Summary Cards */}
      <div className="mb-4 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-[18px] border border-line bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="font-bold text-[10px] uppercase tracking-wider">Total Nilai</span>
            <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-blue-soft text-blue">
              <ShoppingBag size={14} />
            </div>
          </div>
          <strong className="mt-1.5 block !font-numeric tabular-nums !text-sm sm:!text-[15px] md:!text-base lg:!text-xl xl:!text-2xl tracking-tight sm:tracking-tighter lg:tracking-tight font-bold text-ink truncate" title={currency(totalWishlistValue)}>
            {currency(totalWishlistValue)}
          </strong>
          <small className="mt-0.5 block text-[10px] sm:text-[11px] text-muted">
            {data.wishlist.length} barang tersimpan
          </small>
        </div>

        <div className="rounded-[18px] border border-line bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="font-bold text-[10px] uppercase tracking-wider">Siap Dibeli</span>
            <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-green-soft text-green">
              <Sparkles size={14} />
            </div>
          </div>
          <strong className="mt-1.5 block !font-numeric tabular-nums !text-sm sm:!text-[15px] md:!text-base lg:!text-xl xl:!text-2xl tracking-tight sm:tracking-tighter lg:tracking-tight font-bold text-green">
            {affordableCount} Barang
          </strong>
          <small className="mt-0.5 block text-[10px] sm:text-[11px] text-muted truncate">
            Saldo cukup ({currency(currentBalance)})
          </small>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-[18px] border border-line bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="font-bold text-[10px] uppercase tracking-wider">Saldo Kas Tersedia</span>
            <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-paper text-ink">
              <Wallet size={14} />
            </div>
          </div>
          <strong className={`mt-1.5 block !font-numeric tabular-nums !text-sm sm:!text-[15px] md:!text-base lg:!text-xl xl:!text-2xl tracking-tight sm:tracking-tighter lg:tracking-tight font-bold truncate ${currentBalance >= 0 ? 'text-ink' : 'text-coral'}`} title={currency(currentBalance)}>
            {currency(currentBalance)}
          </strong>
          <small className="mt-0.5 block text-[10px] sm:text-[11px] text-muted">
            {currentBalance >= 0 ? 'Kondisi kas aman untuk belanja' : 'Arus kas minus, tunda dulu'}
          </small>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="mb-4 rounded-[18px] border border-line bg-card p-3.5 sm:p-4 shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Filter</span>
          <span className="text-[11px] font-medium text-muted">
            Menampilkan <strong>{filteredWishlist.length}</strong> barang
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 sm:flex-wrap no-scrollbar">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${filterTab === 'all' ? 'bg-ink !text-white shadow-2xs' : 'bg-paper text-muted hover:bg-black/5 hover:text-ink'
              }`}
          >
            Semua ({data.wishlist.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('affordable')}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${filterTab === 'affordable' ? 'bg-green !text-white shadow-2xs' : 'bg-green-soft text-green hover:bg-green/20'
              }`}
          >
            Siap Dibeli ({affordableCount})
          </button>

          <span className="h-4 w-px bg-line shrink-0 mx-0.5" />

          <button
            type="button"
            onClick={() => setFilterTab('High')}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${filterTab === 'High' ? 'bg-coral !text-white shadow-2xs' : 'bg-coral-soft text-coral hover:bg-coral/20'
              }`}
          >
            <span className="hidden sm:inline">Prioritas </span>Tinggi
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('Medium')}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${filterTab === 'Medium' ? 'bg-blue !text-white shadow-2xs' : 'bg-blue-soft text-blue hover:bg-blue/20'
              }`}
          >
            <span className="hidden sm:inline">Prioritas </span>Sedang
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('Low')}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${filterTab === 'Low' ? 'bg-ink !text-white shadow-2xs' : 'bg-paper text-muted hover:bg-black/5 hover:text-ink'
              }`}
          >
            <span className="hidden sm:inline">Prioritas </span>Rendah
          </button>
        </div>
      </div>

      {/* Structured Wishlist Cards Grid */}
      {filteredWishlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8 md:pb-0">
          {filteredWishlist.map(item => {
            const itemPrice = Number(item.price || 0)
            const isAffordable = currentBalance >= itemPrice && currentBalance > 0
            const deficit = Math.max(0, itemPrice - Math.max(0, currentBalance))

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-[20px] border border-line bg-card p-5 shadow-[0_4px_20px_rgba(30,50,73,0.025)] transition-all hover:border-line/90 hover:shadow-[0_8px_30px_rgba(30,50,73,0.05)]"
              >
                <div>
                  {/* Top: Priority Pill + Delete Button */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${item.priority === 'High'
                          ? 'bg-coral-soft text-coral'
                          : item.priority === 'Medium'
                            ? 'bg-blue-soft text-blue'
                            : 'bg-black/5 text-muted'
                        }`}
                    >
                      Prioritas {item.priority === 'High' ? 'Tinggi' : item.priority === 'Medium' ? 'Sedang' : 'Rendah'}
                    </span>
                    <button
                      onClick={() => remove(item)}
                      className="rounded-lg p-1.5 text-muted/60 hover:bg-coral-soft hover:text-coral transition-colors"
                      title="Hapus item"
                      aria-label="Hapus dari wishlist"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Item Name */}
                  <h3 className="font-display text-lg font-bold tracking-tight text-ink line-clamp-2">
                    {item.name}
                  </h3>

                  {/* Price */}
                  <strong className="mt-2 block !font-numeric tabular-nums text-xl font-bold text-ink">
                    {currency(itemPrice)}
                  </strong>

                  {/* Affordability Badge */}
                  <div className="mt-3">
                    {isAffordable ? (
                      <div className="inline-flex items-center gap-1.5 rounded-xl bg-green-soft px-2.5 py-1 text-[11px] font-bold text-green">
                        <CheckCircle2 size={13} /> Saldo Cukup · Siap Dibeli
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 rounded-xl bg-paper px-2.5 py-1 text-[11px] font-medium text-muted">
                        <AlertCircle size={13} className="text-muted" /> Kurang {currency(deficit)} dari saldo
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action: Buy & Record */}
                <div className="mt-5 pt-3.5 border-t border-line/60 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-muted">
                    {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(item.created_at))}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {!isAffordable && (
                      <button
                        onClick={() => convertToGoal(item)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-soft px-3 py-2 text-xs font-bold text-blue hover:bg-blue-soft/80 active:scale-95 transition-all cursor-pointer"
                        title="Buat rencana tabungan untuk barang ini"
                      >
                        <Target size={13} /> Nabung
                      </button>
                    )}
                    <button
                      onClick={() => checkout(item)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-xs font-bold !text-white shadow-2xs hover:bg-ink/90 active:scale-95 transition-all cursor-pointer"
                    >
                      <Check size={14} className="text-mint" /> Terbeli
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title={data.wishlist.length ? 'Nggak ada wishlist pada filter ini' : 'Belum ada barang di wishlist'}
          body={data.wishlist.length ? 'Coba ganti filter tab di atas.' : 'Catat barang impianmu di sini dulu biar belanja lebih terencana.'}
          action={
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-xs font-bold !text-white shadow-sm hover:bg-ink/90 transition-all"
            >
              <Plus size={16} /> Tambah Wishlist Pertama
            </button>
          }
        />
      )}

      {/* Structured Add Wishlist Modal */}
      {showAddModal && (
        <Modal title="Tambah ke Wishlist" onClose={() => setShowAddModal(false)}>
          <form className="flex flex-col gap-4" onSubmit={add}>
            <label className="flex flex-col gap-1.5 text-xs font-bold text-ink">
              Nama Barang / Keinginan
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Contoh: Sepatu Lari, Monitor 24 inch, Kacamata"
                className="rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-bold text-ink">
              Perkiraan Harga (Rp)
              <input
                type="text"
                inputMode="numeric"
                required
                value={price}
                onChange={e => setPrice(formatRupiahInput(e.target.value))}
                placeholder="Contoh: 750.000"
                className="rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green font-numeric tabular-nums font-medium"
              />
            </label>

            <div className="flex flex-col gap-1.5 text-xs font-bold text-ink">
              Tingkat Prioritas
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPriority('High')}
                  className={`rounded-xl border py-2 text-xs font-bold transition-all ${priority === 'High' ? 'border-coral bg-coral text-white shadow-2xs' : 'border-line bg-paper text-muted hover:bg-coral-soft'
                    }`}
                >
                  Tinggi
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('Medium')}
                  className={`rounded-xl border py-2 text-xs font-bold transition-all ${priority === 'Medium' ? 'border-blue bg-blue text-white shadow-2xs' : 'border-line bg-paper text-muted hover:bg-blue-soft'
                    }`}
                >
                  Sedang
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('Low')}
                  className={`rounded-xl border py-2 text-xs font-bold transition-all ${priority === 'Low' ? 'border-ink bg-ink text-white shadow-2xs' : 'border-line bg-paper text-muted hover:bg-black/5'
                    }`}
                >
                  Rendah
                </button>
              </div>
            </div>

            <div className="mt-2 pt-3 border-t border-line/60 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-xl border border-line bg-card px-4 py-2.5 text-xs font-bold text-muted hover:bg-paper transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-ink px-4 py-2.5 text-xs font-bold !text-white shadow-sm hover:bg-ink/90 active:scale-95 transition-all"
              >
                Simpan ke Wishlist
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}

