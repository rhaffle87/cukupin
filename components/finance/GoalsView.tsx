import React, { useState } from 'react'
import type { SavingGoal } from '@/lib/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { Plus, Target, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { useFinanceData } from '@/hooks/useFinanceData'
import { currency } from '@/lib/finance'

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

  async function createGoal(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase || !userId) return toast.error('Hubungkan Supabase dan masuk untuk menyimpan.')
    
    const result = await supabase
      .from('saving_goals')
      .insert({ user_id: userId, name: name, target_amount: Number(target), current_amount: 0 })
      
    if (result.error) {
      toast.error(result.error.message)
    } else {
      toast.success('Goal dibuat.')
      setShow(false)
      setName('')
      setTarget('')
      data.refresh()
    }
  }

  async function fundGoal(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase || !adding) return
    
    const next = Math.min(Number(adding.target_amount), Number(adding.current_amount) + Number(amount))
    const result = await supabase.from('saving_goals').update({ current_amount: next }).eq('id', adding.id)
    
    if (result.error) {
      toast.error(result.error.message)
    } else {
      toast.success('Dana ditambahkan.')
      setAdding(null)
      setAmount('')
      data.refresh()
    }
  }

  async function deleteGoal(goal: SavingGoal) {
    if (supabase && confirm('Hapus goal ini?')) {
      await supabase.from('saving_goals').delete().eq('id', goal.id)
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
            <button className="button primary wide">Tambahkan dana</button>
          </form>
        </Modal>
      )}
    </>
  )
}
