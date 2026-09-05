import React, { useState } from 'react'
import type { SavingGoal } from '@/lib/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { Plus, Target, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { useFinanceData } from '@/hooks/useFinanceData'
import { currency, isoDate } from '@/lib/finance'

interface GoalsViewProps {
  supabase: SupabaseClient | null
  data: ReturnType<typeof useFinanceData>
  userId?: string
}

import confetti from 'canvas-confetti'
import { goalSchema, sanitizeNumericInput } from '@/lib/validations/finance'

export function GoalsView({ supabase, data, userId }: GoalsViewProps) {
  const [show, setShow] = useState(false)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [adding, setAdding] = useState<SavingGoal | null>(null)
  const [amount, setAmount] = useState('')
  const [recordAsExpense, setRecordAsExpense] = useState(true)

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

  async function createGoal(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase || !userId) return toast.error('Hubungkan Supabase dan masuk untuk menyimpan.')

    const numericTarget = sanitizeNumericInput(target)
    const parsed = goalSchema.safeParse({ name, target_amount: numericTarget })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || 'Input target tidak valid')
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
    if (!supabase || !adding) return

    const numericAdd = sanitizeNumericInput(amount)
    if (numericAdd <= 0) {
      toast.error('Masukkan nominal dana yang valid')
      return
    }

    const next = Math.min(Number(adding.target_amount), Number(adding.current_amount) + numericAdd)
    const isCompleted = next >= Number(adding.target_amount)

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
        await supabase.from('transactions').insert({
          user_id: userId,
          type: 'expense',
          amount: numericAdd,
          category: 'Bills',
          description: `Alokasi target: ${adding.name}`,
          transaction_date: isoDate(new Date()),
          note: `#tabungan Alokasi tabungan untuk ${adding.name}`,
          payment_method: 'Transfer Bank',
        })
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
    if (!supabase || !confirm('Hapus target ini?')) return

    const prevGoals = data.goals
    data.setGoals(prev => prev.filter(g => g.id !== goal.id))

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
          <button className="button primary" onClick={() => setShow(true)}>
            <Plus size={17} /> Target baru
          </button>
        }
      />
      
      <div className="goals-intro">
        <Target size={23} />
        <div>
          <strong>{data.goals.length ? data.goals.length + ' target lagi berjalan.' : 'Belum ada target tabungan.'}</strong>
          <span>Pelan-pelan asal konsisten.</span>
        </div>
      </div>
      
      <div className="goals-grid">
        {data.goals.map(goal => {
          const progress = Math.min(100, (Number(goal.current_amount) / Number(goal.target_amount)) * 100)
          return (
            <div className="goal-card panel" key={goal.id}>
              <div className="goal-card-top">
                <div className="goal-icon">
                  <Target size={18} />
                </div>
                <button className="icon-button danger" onClick={() => deleteGoal(goal)} aria-label="Hapus goal">
                  <Trash2 size={15} />
                </button>
              </div>
              <h3>{goal.name}</h3>
              <div className="goal-values">
                <strong>{currency(Number(goal.current_amount))}</strong>
                <span>dari {currency(Number(goal.target_amount))}</span>
              </div>
              <div className="progress-track">
                <span style={{ width: progress + '%' }} />
              </div>
              <div className="goal-bottom">
                <span>{progress.toFixed(0)}% terkumpul</span>
                <button className="text-link" onClick={() => setAdding(goal)}>
                  Tambah dana <Plus size={13} />
                </button>
              </div>
            </div>
          )
        })}
        
        {!data.goals.length && (
          <EmptyState
            icon={Target}
            title="Mulai dari satu hal dulu"
            body="Bisa buat dana darurat, beli gadget, atau jalan-jalan santai."
            action={
              <button className="button secondary small" onClick={() => setShow(true)}>
                <Plus size={15} /> Buat target
              </button>
            }
          />
        )}
      </div>
      
      {show && (
        <Modal title="Target baru" onClose={() => setShow(false)}>
          <form className="transaction-form" onSubmit={createGoal}>
            <label>
              Nama target
              <input required value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Dana darurat" />
            </label>
            <label>
              Nominal yang ditargetkan
              <input type="number" required min="1" value={target} onChange={e => setTarget(e.target.value)} placeholder="0" />
            </label>
            <button className="button primary wide">Simpan target</button>
          </form>
        </Modal>
      )}
      
      {adding && (
        <Modal title={'Tambah dana · ' + adding.name} onClose={() => setAdding(null)}>
          <form className="transaction-form" onSubmit={fundGoal}>
            <p className="modal-copy">
              Saat ini terkumpul <strong>{currency(Number(adding.current_amount))}</strong> dari target {currency(Number(adding.target_amount))}.
            </p>
            <label>
              Nominal tambahan
              <input type="number" required min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />
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
            <button className="button primary wide mt-2">Tambahkan dana</button>
          </form>
        </Modal>
      )}
    </>
  )
}
