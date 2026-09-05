import React from 'react'
import type { Transaction } from '@/lib/database.types'
import { ArrowDownLeft, ArrowUpRight, Edit3, Trash2 } from 'lucide-react'
import { currency } from '@/lib/finance'

interface TransactionRowProps {
  transaction: Transaction
  onDelete?: () => void
  onEdit?: () => void
}

export function TransactionRow({ transaction: t, onDelete, onEdit }: TransactionRowProps) {
  return (
    <div className="transaction-row">
      <div className={`transaction-icon ${t.type}`}>
        {t.type === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
      </div>
      <div className="transaction-meta">
        <strong>{t.description || t.note || t.category}</strong>
        <span>
          {t.category} · {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(t.transaction_date))}
        </span>
      </div>
      <strong className={`transaction-amount ${t.type}`}>
        {t.type === 'income' ? '+' : '-'}
        {currency(Number(t.amount))}
      </strong>
      {(onDelete || onEdit) && (
        <div className="row-actions">
          {onEdit && (
            <button className="icon-button" onClick={onEdit} aria-label="Edit transaksi">
              <Edit3 size={15} />
            </button>
          )}
          {onDelete && (
            <button className="icon-button danger" onClick={onDelete} aria-label="Hapus transaksi">
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
