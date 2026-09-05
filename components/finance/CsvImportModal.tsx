'use client'

import React, { useState, useRef } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { Check, FileSpreadsheet, Loader2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { currency, isoDate } from '@/lib/finance'
import { sanitizeNumericInput } from '@/lib/validations/finance'
import type { Transaction } from '@/lib/database.types'

interface CsvImportModalProps {
  supabase: SupabaseClient | null
  userId?: string
  onClose: () => void
  onSuccess: () => void
}

interface ParsedRow {
  transaction_date: string
  type: 'income' | 'expense'
  category: string
  description: string
  amount: number
  note?: string
  payment_method?: string
}

const defaultCategories = ['Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Salary', 'Freelance', 'Other']

export function CsvImportModal({ supabase, userId, onClose, onSuccess }: CsvImportModalProps) {
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function parseCsvText(text: string) {
    const lines = text
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean)

    if (lines.length < 2) {
      toast.error('File CSV kosong atau tidak memiliki baris data.')
      return
    }

    const header = lines[0].toLowerCase().split(',').map(h => h.replace(/^["']|["']$/g, '').trim())
    
    // Find column indexes
    const dateIdx = header.findIndex(h => h.includes('tanggal') || h.includes('date'))
    const typeIdx = header.findIndex(h => h.includes('tipe') || h.includes('type') || h.includes('jenis'))
    const catIdx = header.findIndex(h => h.includes('kategori') || h.includes('category'))
    const descIdx = header.findIndex(h => h.includes('deskripsi') || h.includes('desc') || h.includes('nama') || h.includes('keterangan'))
    const amountIdx = header.findIndex(h => h.includes('jumlah') || h.includes('amount') || h.includes('nominal') || h.includes('harga'))
    const noteIdx = header.findIndex(h => h.includes('catatan') || h.includes('note'))
    const methodIdx = header.findIndex(h => h.includes('metode') || h.includes('method') || h.includes('payment'))

    const parsed: ParsedRow[] = []

    for (let i = 1; i < lines.length; i++) {
      // Basic CSV splitter respecting quotes
      const parts = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/^["']|["']$/g, '').trim())
      if (!parts.length || parts.every(p => !p)) continue

      const rawAmount = amountIdx !== -1 ? parts[amountIdx] : parts[3] || '0'
      const amount = sanitizeNumericInput(rawAmount)
      if (amount <= 0) continue

      const rawDate = dateIdx !== -1 ? parts[dateIdx] : parts[0] || isoDate(new Date())
      let validDate = isoDate(new Date())
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        validDate = rawDate
      }

      const rawType = (typeIdx !== -1 ? parts[typeIdx] : '').toLowerCase()
      const type: 'income' | 'expense' = rawType.includes('in') || rawType.includes('masuk') ? 'income' : 'expense'

      let desc = descIdx !== -1 ? parts[descIdx] : parts[1] || 'Transaksi'
      let cat = catIdx !== -1 ? parts[catIdx] : 'Other'
      if (!defaultCategories.includes(cat)) {
        cat = 'Other'
      }

      const note = noteIdx !== -1 ? parts[noteIdx] : undefined
      const payment_method = methodIdx !== -1 ? parts[methodIdx] : undefined

      parsed.push({
        transaction_date: validDate,
        type,
        category: cat,
        description: desc.slice(0, 120),
        amount,
        note: note ? note.slice(0, 300) : undefined,
        payment_method: payment_method ? payment_method.slice(0, 50) : undefined,
      })
    }

    if (!parsed.length) {
      toast.error('Tidak ada baris transaksi yang valid ditemukan.')
      return
    }

    setRows(parsed)
    toast.success(`${parsed.length} transaksi siap diimpor.`)
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = evt => {
      const content = evt.target?.result as string
      if (content) parseCsvText(content)
    }
    reader.readAsText(file)
  }

  async function handleImport() {
    if (!supabase || !userId) {
      toast.error('Sesi tidak aktif')
      return
    }

    if (!rows.length) {
      toast.error('Pilih file CSV terlebih dahulu')
      return
    }

    setLoading(true)
    const payloads = rows.map(r => ({
      user_id: userId,
      type: r.type,
      category: r.category,
      description: r.description,
      amount: r.amount,
      transaction_date: r.transaction_date,
      note: r.note || null,
      payment_method: r.payment_method || null,
    }))

    let { error } = await supabase.from('transactions').insert(payloads)

    if (error && (error.message?.includes('payment_method') || (error as any).code === 'PGRST204')) {
      const fallbackPayloads = payloads.map(({ payment_method, ...rest }) => ({
        ...rest,
        note: payment_method ? (rest.note ? `${rest.note} [Metode: ${payment_method}]` : `[Metode: ${payment_method}]`) : rest.note,
      }))
      const resRetry = await supabase.from('transactions').insert(fallbackPayloads)
      error = resRetry.error
    }

    setLoading(false)

    if (error) {
      toast.error('Gagal mengimpor transaksi: ' + error.message)
    } else {
      toast.success(`${rows.length} transaksi berhasil diimpor!`)
      onSuccess()
      onClose()
    }
  }

  return (
    <Modal title="Impor Transaksi CSV" onClose={onClose}>
      <div className="flex flex-col gap-4 text-xs">
        <p className="text-muted">
          Pilih file CSV dari mutasi rekening, e-wallet, atau aplikasi pencatat lain untuk dimasukkan sekaligus ke Cukupin.
        </p>

        {rows.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-line bg-paper/60 p-8 text-center cursor-pointer transition-colors hover:border-green/50 hover:bg-green-soft/20"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-soft text-green">
              <Upload size={22} />
            </div>
            <div>
              <strong className="block text-sm font-bold text-ink">Klik untuk memilih file CSV</strong>
              <span className="text-[11px] text-muted">Format: Tanggal, Tipe, Kategori, Deskripsi, Jumlah</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-xl bg-card border border-line p-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-green" />
                <div>
                  <strong className="block text-xs font-bold text-ink">{fileName}</strong>
                  <span className="text-[10px] text-muted">{rows.length} baris valid</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setRows([]); setFileName('') }}
                className="text-[11px] font-bold text-coral hover:underline"
              >
                Ganti File
              </button>
            </div>

            {/* Preview Table */}
            <div className="max-h-56 overflow-y-auto rounded-xl border border-line bg-card">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="sticky top-0 bg-paper border-b border-line text-[10px] font-bold text-muted">
                  <tr>
                    <th className="p-2">Tanggal</th>
                    <th className="p-2">Tipe</th>
                    <th className="p-2">Deskripsi</th>
                    <th className="p-2 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {rows.slice(0, 15).map((r, i) => (
                    <tr key={i}>
                      <td className="p-2 font-mono">{r.transaction_date}</td>
                      <td className="p-2">
                        <span className={`font-bold ${r.type === 'income' ? 'text-green' : 'text-coral'}`}>
                          {r.type === 'income' ? 'Masuk' : 'Keluar'}
                        </span>
                      </td>
                      <td className="p-2 truncate max-w-[140px]">{r.description}</td>
                      <td className="p-2 text-right font-mono font-semibold">{currency(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 15 && (
                <p className="p-2 text-center text-[10px] text-muted bg-paper/50">
                  ... dan {rows.length - 15} transaksi lainnya
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-line px-4 py-2 text-xs font-bold text-muted hover:bg-black/5"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2 text-xs font-bold !text-white shadow-sm transition-all hover:bg-ink/90 active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                <span>{loading ? 'Mengimpor...' : `Impor ${rows.length} Transaksi`}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
