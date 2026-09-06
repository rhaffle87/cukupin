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
  const exportRef = useRef<HTMLDivElement>(null)
  const currentDate = new Date()
  const initialMonth = defaultMonth || `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  const [selectedMonth, setSelectedMonth] = useState(initialMonth)
  const [isExporting, setIsExporting] = useState(false)

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

  // Export PDF using html-to-image (SVG foreignObject) for 1:1 pixel-perfect mirroring.
  // html2canvas re-implements CSS rendering in JS and positions text differently (the "sag" bug).
  // html-to-image uses SVG <foreignObject>, which lets the BROWSER'S OWN CSS ENGINE render
  // the content — so fonts, line-heights, vertical-align, and baselines match the preview exactly.
  const handleExportPdf = async () => {
    if (!exportRef.current) return
    setIsExporting(true)
    const toastId = toast.loading('Memproses ekspor PDF...')
    try {
      // 1. Ensure fonts are fully loaded before capture
      if (typeof document !== 'undefined' && document.fonts) {
        await document.fonts.ready
      }
      await new Promise(resolve => setTimeout(resolve, 200))

      const { toPng } = await import('html-to-image')
      const { jsPDF } = await import('jspdf')

      const element = exportRef.current

      // Temporarily move the off-screen container into view for accurate rendering.
      // html-to-image needs the element to be in the normal flow for foreignObject.
      const origLeft = element.style.left
      const origPosition = element.style.position
      const origZIndex = element.style.zIndex
      element.style.position = 'fixed'
      element.style.left = '0'
      element.style.top = '0'
      element.style.zIndex = '-9999'

      // 2. Capture using browser's native CSS engine via SVG foreignObject
      const dataUrl = await toPng(element, {
        pixelRatio: 3,      // 3x ultra-sharp (equivalent to html2canvas scale: 3)
        cacheBust: true,
        skipAutoScale: true,
        backgroundColor: '#ffffff',
      })

      // Restore off-screen positioning
      element.style.left = origLeft
      element.style.position = origPosition
      element.style.zIndex = origZIndex

      // Expose for testing verification
      if (typeof window !== 'undefined') {
        ;(window as any).__lastPdfCanvasDataUrl = dataUrl
      }

      // 3. Load captured image to get dimensions
      const img = new Image()
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = reject
        img.src = dataUrl
      })

      // 4. Exact A4 Unit Conversion
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pdfWidth = 210 // A4 width in mm
      const pdfHeight = 297 // A4 height in mm

      const imgWidth = pdfWidth
      const imgHeight = (img.height * imgWidth) / img.width

      let heightLeft = imgHeight
      let position = 0

      // Page 1
      pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
      heightLeft -= pdfHeight

      // Subsequent pages if content overflows
      while (heightLeft > 0) {
        position -= pdfHeight
        pdf.addPage()
        pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
        heightLeft -= pdfHeight
      }

      pdf.save(`monthly-expense-tracker-${selectedMonth}.pdf`)
      toast.dismiss(toastId)
      toast.success('Laporan PDF visual berhasil diunduh!')
    } catch (err) {
      console.error(err)
      toast.dismiss(toastId)
      toast.error('Gagal mengekspor PDF.')
    } finally {
      setIsExporting(false)
    }
  }

  // Shared Sheet Content Renderer: ensures 1:1 parity between preview and export
  const renderSheetContent = (isExport: boolean) => (
    <div className="w-full text-[#111827]">
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
      <div className="mb-6 grid grid-cols-4 gap-3 rounded-xl border border-[#D1D5DB] bg-[#F9FAFB] p-3.5 text-xs w-full">
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-[#6B7280]" style={{ lineHeight: '1.5' }}>Total Anggaran/Masuk</span>
          <strong className="text-[13px] font-medium text-[#15803D] font-mono tabular-nums" style={{ display: 'block', lineHeight: '1.5' }}>{currency(stats.income)}</strong>
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-[#6B7280]" style={{ lineHeight: '1.5' }}>Total Pengeluaran</span>
          <strong className="text-[13px] font-medium text-[#DC2626] font-mono tabular-nums" style={{ display: 'block', lineHeight: '1.5' }}>{currency(stats.expense)}</strong>
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-[#6B7280]" style={{ lineHeight: '1.5' }}>Sisa Bersih</span>
          <strong className="text-[13px] font-medium text-[#1D4ED8] font-mono tabular-nums" style={{ display: 'block', lineHeight: '1.5' }}>{currency(stats.balance)}</strong>
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-[#6B7280]" style={{ lineHeight: '1.5' }}>Total Catatan</span>
          <strong className="text-[13px] font-medium text-[#111827] font-mono tabular-nums" style={{ display: 'block', lineHeight: '1.5' }}>{stats.count} Transaksi</strong>
        </div>
      </div>

      {/* Mobile Scroll Hint (Hidden during export) */}
      {!isExport && (
        <p className="md:hidden text-[10px] text-[#6B7280] text-center mb-2 italic">
          ← Geser tabel ke kanan untuk melihat kolom lengkap →
        </p>
      )}

      {/* The Ledger Table */}
      <div className={`w-full border border-[#111827] ${isExport ? 'overflow-hidden' : 'overflow-x-auto'}`}>
        <table className="w-full table-fixed border-collapse text-left text-xs" style={{ width: '800px', tableLayout: 'fixed' }} aria-label="Tabel rincian transaksi bulanan">
          <colgroup>
            <col style={{ width: '100px' }} />  {/* Date of Payment: 12.5% = 100px */}
            <col style={{ width: '116px' }} />  {/* Payment Method: 14.5% = 116px */}
            <col style={{ width: '104px' }} />  {/* Paid To: 13% = 104px */}
            <col style={{ width: '264px' }} />  {/* Description: 33% = 264px */}
            <col style={{ width: '108px' }} />  {/* Amount Paid: 13.5% = 108px */}
            <col style={{ width: '108px' }} />  {/* Running Total: 13.5% = 108px */}
          </colgroup>
          <thead>
            <tr className="border-b border-[#111827] bg-[#F3F4F6] text-[10px] font-bold uppercase tracking-wider text-[#111827]">
              <th scope="col" className="border-r border-[#111827] px-3 py-2.5" style={{ textAlign: 'left', verticalAlign: 'middle', lineHeight: '1.5' }}>DATE OF PAYMENT</th>
              <th scope="col" className="border-r border-[#111827] px-3 py-2.5" style={{ textAlign: 'left', verticalAlign: 'middle', lineHeight: '1.5' }}>PAYMENT METHOD</th>
              <th scope="col" className="border-r border-[#111827] px-3 py-2.5" style={{ textAlign: 'left', verticalAlign: 'middle', lineHeight: '1.5' }}>PAID TO</th>
              <th scope="col" className="border-r border-[#111827] px-3 py-2.5" style={{ textAlign: 'left', verticalAlign: 'middle', lineHeight: '1.5' }}>DESCRIPTION</th>
              <th scope="col" className="border-r border-[#111827] px-3 py-2.5 text-right" style={{ textAlign: 'right', verticalAlign: 'middle', lineHeight: '1.5' }}>AMOUNT PAID</th>
              <th scope="col" className="px-3 py-2.5 text-right" style={{ textAlign: 'right', verticalAlign: 'middle', lineHeight: '1.5' }}>RUNNING TOTAL</th>
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
                  <td className="border-r border-[#111827] px-3 py-2 font-mono text-[11px] whitespace-nowrap truncate" style={{ textAlign: 'left', verticalAlign: 'middle', lineHeight: '1.5' }}>
                    {tx.transaction_date}
                  </td>
                  <td className="border-r border-[#111827] px-3 py-2 text-[#4B5563] truncate" style={{ textAlign: 'left', verticalAlign: 'middle', lineHeight: '1.5' }}>
                    {tx.paymentMethod}
                  </td>
                  <td className="border-r border-[#111827] px-3 py-2 font-medium truncate" style={{ textAlign: 'left', verticalAlign: 'middle', lineHeight: '1.5' }}>
                    {tx.paidTo}
                  </td>
                  <td className="border-r border-[#111827] px-3 py-2 text-[#374151]" style={{ verticalAlign: 'middle', textAlign: 'left', lineHeight: '1.5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', overflow: 'visible' }}>
                      <span style={{ fontSize: '12px', lineHeight: '1.5', overflow: 'visible', wordBreak: 'break-word' }}>{tx.description}</span>
                      {tx.type === 'income' && (
                        <span style={{ flexShrink: 0, borderRadius: '4px', backgroundColor: '#d1fae5', padding: '2px 6px', fontSize: '9px', fontWeight: 700, color: '#065f46', lineHeight: '1.5', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                          Pemasukan
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="border-r border-[#111827] px-3 py-2 text-right font-mono font-medium tabular-nums whitespace-nowrap" style={{ textAlign: 'right', verticalAlign: 'middle', lineHeight: '1.5' }}>
                    {currency(Number(tx.amount))}
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-medium text-[#111827] tabular-nums whitespace-nowrap" style={{ textAlign: 'right', verticalAlign: 'middle', lineHeight: '1.5' }}>
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
              <td colSpan={4} className="border-r border-[#111827] px-3 py-2.5 text-right uppercase tracking-wider text-[10px]" style={{ textAlign: 'right', verticalAlign: 'middle', lineHeight: '1.5' }}>
                Total Pengeluaran Bulan Ini
              </td>
              <td className="border-r border-[#111827] px-3 py-2.5 text-right font-mono text-[12px] text-[#DC2626] tabular-nums" style={{ textAlign: 'right', verticalAlign: 'middle', lineHeight: '1.5' }}>
                {currency(stats.expense)}
              </td>
              <td className="px-3 py-2.5 text-right font-mono text-[12px] text-[#111827] tabular-nums" style={{ textAlign: 'right', verticalAlign: 'middle', lineHeight: '1.5' }}>
                {currency(runningTransactions.length > 0 ? runningTransactions[runningTransactions.length - 1].runningTotal : 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Extra Details: Top Categories & Notes Section */}
      <div className="mt-8 grid grid-cols-2 gap-6 pt-4 border-t border-[#D1D5DB] text-xs w-full">
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
                      <strong className="font-mono tabular-nums">{currency(val)}</strong>
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
  )

  return (
    <>
      {/* Modal / Sheet Viewport Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm sm:p-4 overflow-y-auto">
        <div className="relative my-auto flex w-full max-w-4xl flex-col rounded-[24px] border border-line bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Top Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-line bg-paper px-4 sm:px-6 py-3 sm:py-4">
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
                type="button"
                onClick={handleExportPdf}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-bold !text-white shadow-sm hover:bg-ink/90 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Download size={15} /> {isExporting ? 'Memproses PDF...' : 'Download PDF'}
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card px-3.5 py-2 text-xs font-bold text-ink hover:bg-paper active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <FileSpreadsheet size={15} /> CSV
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-muted hover:bg-line/50 hover:text-ink transition-colors ml-1 cursor-pointer"
                aria-label="Tutup modal"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Printable Sheet Viewport in Modal */}
          <div
            ref={sheetRef}
            id="printable-expense-sheet"
            className="max-h-[82vh] overflow-y-auto p-4 sm:p-6 md:p-9 bg-white text-[#111827]"
          >
            <div className="w-[800px] min-w-[800px] mx-auto">
              {renderSheetContent(false)}
            </div>
          </div>

        </div>
      </div>

      {/* Dedicated Off-Screen Export Container (872px outer width with 36px padding gutter, 800px inner content, 100% scale, zero modal transforms/clipping) */}
      <div
        ref={exportRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-[-9999px] top-0 z-[-9999] bg-white text-[#111827]"
        style={{
          width: '872px',
          minWidth: '872px',
          maxWidth: '872px',
          height: 'auto',
          maxHeight: 'none',
          overflow: 'visible',
          transform: 'none',
          boxSizing: 'border-box',
          padding: '36px',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ width: '800px', margin: '0 auto' }}>
          {renderSheetContent(true)}
        </div>
      </div>
    </>
  )
}
