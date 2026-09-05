'use client'

import React, { useMemo, useState, useRef } from 'react'
import type { Transaction } from '@/lib/database.types'
import { currency, shortCurrency } from '@/lib/finance'
import { Download, FileSpreadsheet, X } from 'lucide-react'
import { toast } from 'sonner'

interface MonthlyExpenseTemplateProps {
  transactions: Transaction[]
  userEmail?: string
  defaultMonth?: string // YYYY-MM
  onClose: () => void
}

export function MonthlyExpenseTemplate({
  transactions,
  userEmail,
  defaultMonth,
  onClose,
}: MonthlyExpenseTemplateProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const currentDate = new Date()
  const initialMonth = defaultMonth || `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  const [selectedMonth, setSelectedMonth] = useState(initialMonth)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Filter transactions by selected month
  const { monthTx, monthName, yearName, stats, runningTransactions, categoryTotals } = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split('-')
    const year = parseInt(yearStr, 10)
    const month = parseInt(monthStr, 10) - 1
    const dateObj = new Date(year, month, 1)

    const mName = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(dateObj).toUpperCase()
    const yName = year.toString()

    const prefix = `${selectedMonth}-`
    // Sort chronologically ascending for the running total calculation
    const filtered = transactions
      .filter(t => t.transaction_date.startsWith(prefix))
      .sort((a, b) => a.transaction_date.localeCompare(b.transaction_date) || a.created_at.localeCompare(b.created_at))

    let running = 0
    const runningList = filtered.map(t => {
      const amt = Number(t.amount)
      if (t.type === 'expense') {
        running += amt
      }
      // Payment method: use explicit field if available, or extract from note, otherwise 'Tidak Ditentukan'
      let paymentMethod = (t as any).payment_method?.trim() || ''
      if (!paymentMethod || paymentMethod === '-') {
        const noteLower = (t.note || '').toLowerCase()
        if (noteLower.includes('cash') || noteLower.includes('tunai')) paymentMethod = 'Tunai / Cash'
        else if (noteLower.includes('qris')) paymentMethod = 'QRIS'
        else if (noteLower.includes('kartu') || noteLower.includes('card') || noteLower.includes('debit') || noteLower.includes('kredit')) paymentMethod = 'Debit/Kredit'
        else if (noteLower.includes('gopay') || noteLower.includes('ovo') || noteLower.includes('dana') || noteLower.includes('shopeepay')) paymentMethod = 'E-Wallet'
        else if (noteLower.includes('transfer') || noteLower.includes('bca') || noteLower.includes('mandiri') || noteLower.includes('bri') || noteLower.includes('bni')) paymentMethod = 'Transfer Bank'
        else paymentMethod = 'Tidak Ditentukan'
      }

      return {
        ...t,
        paymentMethod,
        paidTo: t.category || 'General',
        runningTotal: running,
      }
    })

    const income = filtered.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0)
    const expense = filtered.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0)
    const balance = income - expense

    // Category breakdown
    const catMap: Record<string, number> = {}
    filtered.filter(t => t.type === 'expense').forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount)
    })
    const catSorted = Object.entries(catMap).sort((a, b) => b[1] - a[1])

    return {
      monthTx: filtered,
      monthName: mName,
      yearName: yName,
      stats: { income, expense, balance, count: filtered.length },
      runningTransactions: runningList,
      categoryTotals: catSorted,
    }
  }, [transactions, selectedMonth])

  // Export CSV
  const handleExportCsv = () => {
    if (!runningTransactions.length) {
      toast.error('Tidak ada transaksi di bulan ini untuk di-export.')
      return
    }

    const headers = ['Date', 'Payment Method', 'Paid To / Category', 'Description', 'Type', 'Amount (IDR)', 'Running Expense Total (IDR)']
    const rows = runningTransactions.map(t => [
      t.transaction_date,
      `"${t.paymentMethod}"`,
      `"${t.paidTo}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.type,
      t.amount,
      t.runningTotal,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `monthly-expense-tracker-${selectedMonth}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('File CSV berhasil diunduh.')
  }

  // Export PDF using high-fidelity visual rendering matching the preview
  const handleExportPdf = async () => {
    if (!sheetRef.current) return
    const toastId = toast.loading('Memproses ekspor PDF...')
    try {
      if (typeof document !== 'undefined' && document.fonts) {
        await document.fonts.ready
      }

      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      const element = sheetRef.current
      const canvas = await html2canvas(element, {
        scale: 2, // 2x high resolution
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('printable-expense-sheet')
          if (el) {
            el.style.maxHeight = 'none'
            el.style.overflow = 'visible'
          }
        },
      })

      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth() // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight() // 297mm

      const margin = 8 // 8mm margin
      const contentWidth = pdfWidth - margin * 2
      const contentHeight = (canvas.height * contentWidth) / canvas.width

      if (contentHeight <= pdfHeight - margin * 2) {
        pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight, undefined, 'FAST')
      } else {
        let heightLeft = contentHeight
        let position = margin
        const pageContentHeight = pdfHeight - margin * 2

        pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight, undefined, 'FAST')
        heightLeft -= pageContentHeight

        while (heightLeft > 0) {
          position -= pageContentHeight
          pdf.addPage()
          pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight, undefined, 'FAST')
          heightLeft -= pageContentHeight
        }
      }

      pdf.save(`monthly-expense-tracker-${selectedMonth}.pdf`)
      toast.dismiss(toastId)
      toast.success('Laporan PDF visual berhasil diunduh!')
    } catch (err) {
      console.error(err)
      toast.dismiss(toastId)
      toast.error('Gagal mengekspor PDF.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm sm:p-4 overflow-y-auto print:static print:inset-auto print:bg-white print:p-0 print:overflow-visible">
      {/* Modal / Sheet Container */}
      <div className="relative my-auto flex w-full max-w-4xl flex-col rounded-[24px] border border-line bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 print:max-w-none print:w-full print:rounded-none print:border-none print:shadow-none print:bg-white print:overflow-visible">
        
        {/* Top Action Toolbar (Hidden during print) */}
        <div className="print:hidden flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-bold text-ink">Template Export</span>
            <div className="flex items-center gap-2">
              <label htmlFor="month-select" className="text-xs font-medium text-muted">Bulan:</label>
              <input
                id="month-select"
                type="month"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-bold text-ink outline-none focus:border-blue"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdf}
              className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-bold !text-white shadow-sm hover:bg-ink/90 active:scale-95 transition-all cursor-pointer"
            >
              <Download size={15} /> Download PDF
            </button>
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card px-3.5 py-2 text-xs font-bold text-ink hover:bg-paper active:scale-95 transition-all cursor-pointer"
            >
              <FileSpreadsheet size={15} /> CSV
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-muted hover:bg-line/50 hover:text-ink transition-colors ml-1 cursor-pointer"
              aria-label="Tutup modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Sheet Viewport - This matches Image 3 exactly */}
        <div
          ref={sheetRef}
          id="printable-expense-sheet"
          className="max-h-[82vh] overflow-y-auto p-6 md:p-10 bg-white text-[#111827] print:max-h-none print:overflow-visible print:p-0"
        >
          
          {/* Header Block matching Image 3 */}
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-2 text-[12px] font-semibold tracking-widest text-[#4B5563] uppercase">
              <span>MONTH OF</span>
              <span className="text-[#1E3249]">✦</span>
              <span className="font-bold text-[#111827]">{monthName} {yearName}</span>
              <span className="text-[#1E3249]">✦</span>
            </div>
            <h1 className="mt-1 font-display text-2xl md:text-3xl font-extrabold tracking-wider text-[#111827] uppercase">
              MONTHLY EXPENSE TRACKER
            </h1>
          </div>

          {/* Statement Metadata & Quick KPI Strip */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border border-[#D1D5DB] bg-[#F9FAFB] p-3 text-xs">
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-[#6B7280]">Total Anggaran/Masuk</span>
              <strong className="text-[13px] font-bold text-[#15803D]">{currency(stats.income)}</strong>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-[#6B7280]">Total Pengeluaran</span>
              <strong className="text-[13px] font-bold text-[#DC2626]">{currency(stats.expense)}</strong>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-[#6B7280]">Sisa Bersih</span>
              <strong className="text-[13px] font-bold text-[#1D4ED8]">{currency(stats.balance)}</strong>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-[#6B7280]">Total Catatan</span>
              <strong className="text-[13px] font-bold text-[#111827]">{stats.count} Transaksi</strong>
            </div>
          </div>

          {/* The Ledger Table matching Image 3 structure */}
          <div className="overflow-x-auto border border-[#111827]">
            <table className="w-full border-collapse text-left text-xs" aria-label="Tabel rincian transaksi bulanan">
              <thead>
                <tr className="border-b border-[#111827] bg-[#F3F4F6] text-[10px] font-bold uppercase tracking-wider text-[#111827]">
                  <th scope="col" className="border-r border-[#111827] px-3 py-2.5 w-[110px]">DATE OF PAYMENT</th>
                  <th scope="col" className="border-r border-[#111827] px-3 py-2.5 w-[130px]">PAYMENT METHOD</th>
                  <th scope="col" className="border-r border-[#111827] px-3 py-2.5 w-[120px]">PAID TO</th>
                  <th scope="col" className="border-r border-[#111827] px-3 py-2.5 min-w-[160px]">DESCRIPTION</th>
                  <th scope="col" className="border-r border-[#111827] px-3 py-2.5 text-right w-[115px]">AMOUNT PAID</th>
                  <th scope="col" className="px-3 py-2.5 text-right w-[125px]">RUNNING TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {runningTransactions.length > 0 ? (
                  runningTransactions.map((tx, idx) => (
                    <tr
                      key={tx.id}
                      className={`border-b border-[#E5E7EB] transition-colors ${
                        idx % 2 === 1 ? 'bg-[#F9FAFB]' : 'bg-white'
                      }`}
                    >
                      <td className="border-r border-[#111827] px-3 py-2 font-mono text-[11px] whitespace-nowrap">
                        {tx.transaction_date}
                      </td>
                      <td className="border-r border-[#111827] px-3 py-2 text-[#4B5563]">
                        {tx.paymentMethod}
                      </td>
                      <td className="border-r border-[#111827] px-3 py-2 font-medium">
                        {tx.paidTo}
                      </td>
                      <td className="border-r border-[#111827] px-3 py-2 text-[#374151]">
                        {tx.description}
                        {tx.type === 'income' && (
                          <span className="ml-2 inline-block rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                            Pemasukan
                          </span>
                        )}
                      </td>
                      <td className="border-r border-[#111827] px-3 py-2 text-right font-mono font-medium">
                        {currency(Number(tx.amount))}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-[#111827]">
                        {currency(tx.runningTotal)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#6B7280]">
                      Belum ada transaksi yang tercatat pada bulan {monthName} {yearName}.
                    </td>
                  </tr>
                )}
                {/* Empty filler rows to maintain that clean classic ledger look if few rows */}
                {runningTransactions.length > 0 && runningTransactions.length < 10 &&
                  Array.from({ length: 10 - runningTransactions.length }).map((_, i) => (
                    <tr key={`filler-${i}`} className="border-b border-[#E5E7EB] h-7">
                      <td className="border-r border-[#111827] px-3" />
                      <td className="border-r border-[#111827] px-3" />
                      <td className="border-r border-[#111827] px-3" />
                      <td className="border-r border-[#111827] px-3" />
                      <td className="border-r border-[#111827] px-3" />
                      <td className="px-3" />
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#111827] bg-[#F3F4F6] font-bold text-[11px] align-middle">
                  <td colSpan={4} className="border-r border-[#111827] px-3 py-2.5 text-right uppercase tracking-wider text-[10px]">
                    Total Pengeluaran Bulan Ini
                  </td>
                  <td className="border-r border-[#111827] px-3 py-2.5 text-right font-mono text-[12px] text-[#DC2626]">
                    {currency(stats.expense)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-[12px] text-[#111827]">
                    {currency(runningTransactions.length > 0 ? runningTransactions[runningTransactions.length - 1].runningTotal : 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Extra Details: Top Categories & Notes Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#D1D5DB] text-xs">
            {/* Category Breakdown list */}
            <div>
              <h3 className="font-bold text-[11px] tracking-wider uppercase text-[#374151] mb-2">
                Rincian Kategori Pengeluaran
              </h3>
              {categoryTotals.length > 0 ? (
                <div className="space-y-1.5">
                  {categoryTotals.map(([cat, val]) => {
                    const percent = stats.expense > 0 ? ((val / stats.expense) * 100).toFixed(1) : '0'
                    return (
                      <div key={cat} className="flex items-center justify-between py-0.5 border-b border-gray-100">
                        <span className="text-[#4B5563]">{cat}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-gray-400">{percent}%</span>
                          <strong className="font-mono">{currency(val)}</strong>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-400">Tidak ada kategori.</p>
              )}
            </div>

            {/* Notes & Verification Stamp */}
            <div className="flex flex-col justify-between rounded-lg border border-dashed border-[#D1D5DB] p-4 bg-[#F9FAFB]">
              <div>
                <h3 className="font-bold text-[11px] tracking-wider uppercase text-[#374151] mb-1">
                  Catatan & Rekonsiliasi
                </h3>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  Laporan keuangan bulanan ini diekspor secara otomatis melalui Cukupin (Quiet Ledger). Data dihitung secara deterministik tanpa manipulasi eksternal.
                </p>
              </div>
              <div className="mt-6 flex items-end justify-between border-t border-gray-200 pt-3">
                <div className="text-[9px] text-[#9CA3AF]">
                  Status: Terverifikasi Sistem<br />
                  Generated by {userEmail || 'Cukupin User'}
                </div>
                <div className="text-center">
                  <div className="h-6 border-b border-gray-400 w-28 mb-1" />
                  <span className="text-[9px] uppercase tracking-wider text-[#6B7280]">Tanda Tangan / Review</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
