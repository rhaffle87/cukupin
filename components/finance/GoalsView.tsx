import React, { useMemo, useState } from 'react'
import type { SavingGoal, Transaction } from '@/lib/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { ArrowUpRight, CheckCircle2, Clock, Plus, Sparkles, Target, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { useFinanceData } from '@/hooks/useFinanceData'
import { currency, isoDate, shortCurrency } from '@/lib/finance'
import confetti from 'canvas-confetti'
import { formatRupiahInput, goalSchema, sanitizeNumericInput } from '@/lib/validations/finance'

interface GoalsViewProps {
  supabase: SupabaseClient | null
  data: ReturnType<typeof useFinanceData>
  userId?: string
}

export function GoalsView({ supabase, data, userId }: GoalsViewProps) {
  const [show, setShow] = useState(false)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [adding, setAdding] = useState<SavingGoal | null>(null)
  const [amount, setAmount] = useState('')
  const [recordAsExpense, setRecordAsExpense] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed'>('all')

  function triggerCelebration() {
    try {
      confetti({
        particleCount: 90,
        spread: 65,
        origin: { y: 0.65 },
        colors: ['#3E8F68', '#BEE6CF', '#315DCB', '#D98362'],
      })
    } catch {
      // ignore in environments without canvas
    }
  }

  // Summary statistics
  const { totalTarget, totalSaved, remainingNeeded, overallProgress, filteredGoals, counts } = useMemo(() => {
    const goals = data.goals
    const tTarget = goals.reduce((acc, g) => acc + Number(g.target_amount), 0)
    const tSaved = goals.reduce((acc, g) => acc + Number(g.current_amount), 0)
    const rNeeded = Math.max(0, tTarget - tSaved)
    const oProgress = tTarget > 0 ? (tSaved / tTarget) * 100 : 0

    const completed = goals.filter(g => Number(g.current_amount) >= Number(g.target_amount))
    const inProgress = goals.filter(g => Number(g.current_amount) < Number(g.target_amount))

    let filtered = goals
    if (statusFilter === 'in_progress') filtered = inProgress
    else if (statusFilter === 'completed') filtered = completed

    return {
      totalTarget: tTarget,
      totalSaved: tSaved,
      remainingNeeded: rNeeded,
      overallProgress: oProgress,
      filteredGoals: filtered,
      counts: {
        all: goals.length,
        inProgress: inProgress.length,
        completed: completed.length,
      },
    }
  }, [data.goals, statusFilter])

  async function createGoal(e: React.FormEvent) {
    e.preventDefault()
    const numericTarget = sanitizeNumericInput(target)
    const parsed = goalSchema.safeParse({ name, target_amount: numericTarget })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || 'Input target tidak valid')
      return
    }

    const newGoal: SavingGoal = {
      id: 'goal-' + Date.now(),
      user_id: userId || 'local-dev-user',
      name: parsed.data.name,
      target_amount: parsed.data.target_amount,
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
      toast.success('Target tabungan baru dibuat.')
      setShow(false)
      setName('')
      setTarget('')
      return
    }

    const payload = {
      user_id: userId,
      name: parsed.data.name,
      target_amount: parsed.data.target_amount,
      current_amount: 0,
    }

    const result = await supabase.from('saving_goals').insert(payload).select().single()

    if (result.error) {
      toast.error(result.error.message)
    } else {
      toast.success('Target baru dibuat.')
      setShow(false)
      setName('')
      setTarget('')
      if (result.data) {
        data.setGoals(prev => [result.data as SavingGoal, ...prev])
      }
      data.refresh()
    }
  }

  async function fundGoal(e: React.FormEvent) {
    e.preventDefault()
    if (!adding) return

    const numericAdd = sanitizeNumericInput(amount)
    if (numericAdd <= 0) {
      toast.error('Masukkan nominal dana yang valid')
      return
    }

    const next = Math.min(Number(adding.target_amount), Number(adding.current_amount) + numericAdd)
    const isCompleted = next >= Number(adding.target_amount)

    if (userId === 'local-dev-user' || !supabase) {
      const stored = localStorage.getItem('cukupin_local_goals')
      const localGoals: SavingGoal[] = stored ? JSON.parse(stored) : []
      const updated = localGoals.map(g => (g.id === adding.id ? { ...g, current_amount: next } : g))
      localStorage.setItem('cukupin_local_goals', JSON.stringify(updated))
      data.setGoals(updated)

      if (recordAsExpense) {
        const storedTx = localStorage.getItem('cukupin_local_transactions')
        const localTx: Transaction[] = storedTx ? JSON.parse(storedTx) : []
        const expTx: Transaction = {
          id: 'tx-' + Date.now(),
          user_id: 'local-dev-user',
          type: 'expense',
          amount: numericAdd,
          category: 'Bills',
          description: `Alokasi target: ${adding.name}`,
          transaction_date: isoDate(new Date()),
          note: `#tabungan Alokasi tabungan untuk ${adding.name}`,
          payment_method: 'Transfer Bank',
          created_at: new Date().toISOString(),
        }
        localStorage.setItem('cukupin_local_transactions', JSON.stringify([expTx, ...localTx]))
        data.setTransactions(prev => [expTx, ...prev])
      }

      if (isCompleted) {
        triggerCelebration()
        toast.success('Hore! Target tabunganmu sudah tercapai!')
      } else {
        toast.success(recordAsExpense ? 'Dana ditambahkan & dicatat ke pengeluaran.' : 'Dana berhasil ditambahkan.')
      }
      setAdding(null)
      setAmount('')
      return
    }

    // Optimistic update
    const prevGoals = data.goals
    data.setGoals(prev =>
      prev.map(g => (g.id === adding.id ? { ...g, current_amount: next } : g))
    )

    const result = await supabase
      .from('saving_goals')
      .update({ current_amount: next })
      .eq('id', adding.id)

    if (result.error) {
      toast.error(result.error.message)
      data.setGoals(prevGoals)
    } else {
      if (recordAsExpense && userId) {
        const { error: gTxErr } = await supabase.from('transactions').insert({
          user_id: userId,
          type: 'expense',
          amount: numericAdd,
          category: 'Bills',
          description: `Alokasi target: ${adding.name}`,
          transaction_date: isoDate(new Date()),
          note: `#tabungan Alokasi tabungan untuk ${adding.name}`,
          payment_method: 'Transfer Bank',
        })
        if (gTxErr && (gTxErr.message?.includes('payment_method') || gTxErr.code === 'PGRST204')) {
          await supabase.from('transactions').insert({
            user_id: userId,
            type: 'expense',
            amount: numericAdd,
            category: 'Bills',
            description: `Alokasi target: ${adding.name}`,
            transaction_date: isoDate(new Date()),
            note: `#tabungan Alokasi tabungan untuk ${adding.name} [Metode: Transfer Bank]`,
          })
        }
      }

      if (isCompleted) {
        triggerCelebration()
        toast.success('Hore! Target tabunganmu sudah tercapai!')
      } else {
        toast.success(recordAsExpense ? 'Dana ditambahkan & dicatat ke pengeluaran.' : 'Dana berhasil ditambahkan.')
      }
      setAdding(null)
      setAmount('')
      data.refresh()
    }
  }

  async function deleteGoal(goal: SavingGoal) {
    if (!confirm(`Hapus target "${goal.name}"?`)) return

    const prevGoals = data.goals
    data.setGoals(prev => prev.filter(g => g.id !== goal.id))

    if (userId === 'local-dev-user' || !supabase) {
      const stored = localStorage.getItem('cukupin_local_goals')
      const localGoals: SavingGoal[] = stored ? JSON.parse(stored) : []
      const updated = localGoals.filter(g => g.id !== goal.id)
      localStorage.setItem('cukupin_local_goals', JSON.stringify(updated))
      toast.success('Target tabungan dihapus.')
      return
    }

    const result = await supabase.from('saving_goals').delete().eq('id', goal.id)
    if (result.error) {
      toast.error(result.error.message)
      data.setGoals(prevGoals)
    } else {
      toast.success('Target tabungan dihapus.')
      data.refresh()
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="TABUNGAN"
        title="Target tabungan"
        subtitle="Kumpulin uang buat hal-hal yang pengen kamu capai."
        action={
          <button className="button primary cursor-pointer" onClick={() => setShow(true)}>
            <Plus size={17} /> Target baru
          </button>
        }
      />

      {/* 3 KPI Summary Cards — Bento: hero card full-width on mobile, 3-col sm+ */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3">
        <div className="col-span-2 sm:col-span-1">
          <StatCard
            label="Total Target"
            value={currency(totalTarget)}
            tone="blue"
            icon={Target}
            note={`${counts.all} target tabungan`}
            featured
          />
        </div>
        <StatCard
          label="Total Terkumpul"
          value={currency(totalSaved)}
          tone="green"
          icon={CheckCircle2}
          note={`${overallProgress.toFixed(0)}% tercapai`}
        />
        <StatCard
          label="Sisa Dibutuhkan"
          value={currency(remainingNeeded)}
          tone="coral"
          icon={ArrowUpRight}
          note="Pelan-pelan asal konsisten"
        />
      </div>

      {/* Filter Tabs */}
      <div className="mb-4 flex items-center gap-1.5 border-b border-line/60 pb-3">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-ink !text-white shadow-2xs'
              : 'bg-card border border-line text-muted hover:text-ink hover:border-ink/20 shadow-2xs'
          }`}
        >
          Semua ({counts.all})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('in_progress')}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
            statusFilter === 'in_progress'
              ? 'bg-ink !text-white shadow-2xs'
              : 'bg-card border border-line text-muted hover:text-ink hover:border-ink/20 shadow-2xs'
          }`}
        >
          Sedang Berjalan ({counts.inProgress})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('completed')}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
            statusFilter === 'completed'
              ? 'bg-ink !text-white shadow-2xs'
              : 'bg-card border border-line text-muted hover:text-ink hover:border-ink/20 shadow-2xs'
          }`}
        >
          Sudah Tercapai ({counts.completed})
        </button>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8 md:pb-0">
          {filteredGoals.map(goal => {
            const current = Number(goal.current_amount)
            const targetAmt = Number(goal.target_amount)
            const progress = targetAmt > 0 ? Math.min(100, (current / targetAmt) * 100) : 0
            const isCompleted = progress >= 100
            const diff = Math.max(0, targetAmt - current)
            // Monthly saving pace estimation (target achieved in 3 months if continuous)
            const monthlyPace = diff > 0 ? Math.ceil(diff / 3) : 0

            return (
              <div
                key={goal.id}
                className="group relative flex flex-col justify-between rounded-[20px] border border-line bg-card p-5 shadow-xs hover:shadow-card-hover hover:border-ink/20 transition-all"
              >
                <div>
                  {/* Top: Status Badge + Delete */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        isCompleted
                          ? 'bg-green-soft text-green'
                          : 'bg-blue-soft text-blue'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 size={12} /> Target Tercapai
                        </>
                      ) : (
                        <>
                          <Clock size={12} /> Sedang Dikumpulkan
                        </>
                      )}
                    </span>
                    <button
                      onClick={() => deleteGoal(goal)}
                      className="rounded-lg p-1.5 text-muted/60 hover:bg-coral-soft hover:text-coral transition-colors cursor-pointer"
                      title="Hapus target"
                      aria-label="Hapus target tabungan"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Goal Name */}
                  <h3 className="font-display text-lg font-bold text-ink tracking-tight">
                    {goal.name}
                  </h3>

                  {/* Amounts */}
                  <div className="mt-2.5 flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] sm:text-xs font-semibold text-muted uppercase tracking-wider block">Terkumpul</span>
                      <strong className="text-xl !font-numeric tabular-nums font-bold text-ink">
                        {currency(current)}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] sm:text-xs font-semibold text-muted uppercase tracking-wider block">Target</span>
                      <span className="text-sm !font-numeric tabular-nums font-bold text-muted">
                        {currency(targetAmt)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Track */}
                  <div className="mt-3.5">
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-line/60">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-green' : 'bg-blue'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-ink">{progress.toFixed(0)}% terkumpul</span>
                      <span className="text-muted">
                        {isCompleted ? 'Siap digunakan' : `Kurang ${currency(diff)}`}
                      </span>
                    </div>
                  </div>

                  {/* Monthly Pace Tip */}
                  {!isCompleted && monthlyPace > 0 && (
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-paper px-2.5 py-1 text-[11px] text-muted">
                      <Sparkles size={13} className="text-green shrink-0" />
                      <span>Nabung ~{shortCurrency(monthlyPace)}/bln untuk capai dalam 3 bulan</span>
                    </div>
                  )}
                </div>

                {/* Bottom Action */}
                <div className="mt-5 pt-3.5 border-t border-line/60 flex items-center justify-between">
                  <span className="text-[10px] text-muted">
                    {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(goal.created_at))}
                  </span>
                  {!isCompleted ? (
                    <button
                      onClick={() => setAdding(goal)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-xs font-bold !text-white shadow-2xs hover:bg-ink/90 active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus size={14} /> Tambah Dana
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-green">
                      <CheckCircle2 size={14} /> Selesai
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={Target}
          title={data.goals.length ? 'Nggak ada target pada filter ini' : 'Mulai dari satu target dulu'}
          body={data.goals.length ? 'Coba ganti filter tab di atas.' : 'Bisa buat dana darurat, beli gadget impian, atau jalan-jalan santai.'}
          action={
            <button className="button secondary small cursor-pointer" onClick={() => setShow(true)}>
              <Plus size={15} /> Buat target
            </button>
          }
        />
      )}

      {show && (
        <Modal title="Target tabungan baru" onClose={() => setShow(false)}>
          <form className="transaction-form" onSubmit={createGoal}>
            <label>
              Nama target
              <input required value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Dana darurat 3 bulan" />
            </label>
            <label>
              Nominal yang ditargetkan (Rp)
              <input
                type="text"
                inputMode="numeric"
                required
                value={target}
                onChange={e => setTarget(formatRupiahInput(e.target.value))}
                placeholder="0"
                className="font-numeric tabular-nums font-medium"
              />
            </label>
            <button className="button primary wide cursor-pointer mt-2">Simpan target</button>
          </form>
        </Modal>
      )}

      {adding && (
        <Modal title={'Tambah dana · ' + adding.name} onClose={() => setAdding(null)}>
          <form className="transaction-form" onSubmit={fundGoal}>
            <p className="modal-copy text-xs text-muted">
              Saat ini terkumpul <strong className="text-ink">{currency(Number(adding.current_amount))}</strong> dari target {currency(Number(adding.target_amount))}.
            </p>
            <label>
              Nominal tambahan (Rp)
              <input
                type="text"
                inputMode="numeric"
                required
                value={amount}
                onChange={e => setAmount(formatRupiahInput(e.target.value))}
                placeholder="0"
                className="font-numeric tabular-nums font-medium"
              />
            </label>
            <label className="flex flex-row items-center gap-2 cursor-pointer text-xs font-semibold text-ink pt-1">
              <input
                type="checkbox"
                checked={recordAsExpense}
                onChange={e => setRecordAsExpense(e.target.checked)}
                className="h-4 w-4 rounded border-line text-green focus:ring-green cursor-pointer"
              />
              <span>Catat otomatis sebagai pengeluaran di transaksi</span>
            </label>
            <button className="button primary wide mt-2 cursor-pointer">Tambahkan dana</button>
          </form>
        </Modal>
      )}
    </>
  )
}
