import type { Transaction } from '@/lib/database.types'
import { currency } from '@/lib/finance'

export interface UnifiedPdfOptions {
  title?: string
  periodLabel: string
  transactions: Transaction[]
  stats?: {
    income: number
    expense: number
    balance: number
    count: number
  }
  userEmail?: string
  filename?: string
}

/**
 * Standardized PDF exporter for Cukupin.
 * Creates an elegant, high-resolution document matching Cukupin's signature design system.
 */
export async function exportUnifiedPdf({
  title = 'LAPORAN KEUANGAN BULANAN',
  periodLabel,
  transactions,
  stats,
  userEmail,
  filename,
}: UnifiedPdfOptions) {
  if (typeof window === 'undefined') return

  const html2canvas = (await import('html2canvas')).default
  const { jsPDF } = await import('jspdf')

  // Calculate statistics if not provided
  const income = stats?.income ?? transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0)
  const expense = stats?.expense ?? transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0)
  const balance = stats?.balance ?? (income - expense)
  const count = stats?.count ?? transactions.length

  // Calculate running total and ensure clean payment methods
  let running = 0
  const sortedTx = [...transactions].sort((a, b) => a.transaction_date.localeCompare(b.transaction_date))
  const runningList = sortedTx.map(t => {
    const amt = Number(t.amount)
    if (t.type === 'expense') {
      running += amt
    }

    let paymentMethod = (t as any).payment_method?.trim() || ''
    if (!paymentMethod || paymentMethod === '-') {
      const noteLower = (t.note || '').toLowerCase()
      if (noteLower.includes('cash') || noteLower.includes('tunai')) paymentMethod = 'Tunai / Cash'
      else if (noteLower.includes('qris')) paymentMethod = 'QRIS'
      else if (noteLower.includes('kartu') || noteLower.includes('debit') || noteLower.includes('kredit')) paymentMethod = 'Debit/Kredit'
      else if (noteLower.includes('gopay') || noteLower.includes('ovo') || noteLower.includes('dana') || noteLower.includes('shopeepay')) paymentMethod = 'E-Wallet'
      else if (noteLower.includes('transfer') || noteLower.includes('bca') || noteLower.includes('mandiri') || noteLower.includes('bri') || noteLower.includes('bni')) paymentMethod = 'Transfer Bank'
      else paymentMethod = 'Tidak Ditentukan'
    }

    return {
      ...t,
      cleanPaymentMethod: paymentMethod,
      runningTotal: running,
    }
  })

  // Category breakdown for expenses
  const catMap: Record<string, number> = {}
  transactions.filter(t => t.type === 'expense').forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount)
  })
  const catSorted = Object.entries(catMap).sort((a, b) => b[1] - a[1])

  // Create an off-screen container for rendering
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = '794px' // A4 width at standard 96dpi
  container.style.backgroundColor = '#ffffff'
  container.style.color = '#111827'
  container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  container.style.padding = '40px'
  container.style.boxSizing = 'border-box'

  container.innerHTML = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #4B5563; text-transform: uppercase;">
        PERIODE ✦ ${periodLabel.toUpperCase()} ✦
      </div>
      <h1 style="margin: 4px 0 0 0; font-size: 24px; font-weight: 900; letter-spacing: 1px; color: #111827; text-transform: uppercase;">
        ${title}
      </h1>
      <p style="margin: 4px 0 0 0; font-size: 10px; color: #6B7280;">Cukupin · Quiet Ledger Financial Statement</p>
    </div>

    <!-- Summary Box -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid #D1D5DB; background-color: #F9FAFB; border-radius: 8px; margin-bottom: 24px; font-size: 11px; overflow: hidden;">
      <div style="padding: 12px 14px; border-right: 1px solid #E5E7EB;">
        <span style="display: block; font-size: 9px; text-transform: uppercase; color: #6B7280; font-weight: 700; letter-spacing: 0.5px;">Total Pemasukan</span>
        <strong style="display: block; margin-top: 4px; font-size: 13px; color: #15803D; font-family: monospace; font-variant-numeric: tabular-nums;">${currency(income)}</strong>
      </div>
      <div style="padding: 12px 14px; border-right: 1px solid #E5E7EB;">
        <span style="display: block; font-size: 9px; text-transform: uppercase; color: #6B7280; font-weight: 700; letter-spacing: 0.5px;">Total Pengeluaran</span>
        <strong style="display: block; margin-top: 4px; font-size: 13px; color: #DC2626; font-family: monospace; font-variant-numeric: tabular-nums;">${currency(expense)}</strong>
      </div>
      <div style="padding: 12px 14px; border-right: 1px solid #E5E7EB;">
        <span style="display: block; font-size: 9px; text-transform: uppercase; color: #6B7280; font-weight: 700; letter-spacing: 0.5px;">Sisa Saldo</span>
        <strong style="display: block; margin-top: 4px; font-size: 13px; color: #1D4ED8; font-family: monospace; font-variant-numeric: tabular-nums;">${currency(balance)}</strong>
      </div>
      <div style="padding: 12px 14px;">
        <span style="display: block; font-size: 9px; text-transform: uppercase; color: #6B7280; font-weight: 700; letter-spacing: 0.5px;">Total Transaksi</span>
        <strong style="display: block; margin-top: 4px; font-size: 13px; color: #111827;">${count} Catatan</strong>
      </div>
    </div>

    <!-- Table -->
    <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #111827;">
      <thead>
        <tr style="background-color: #F3F4F6; border-bottom: 1px solid #111827; text-align: left; font-weight: 700; text-transform: uppercase; vertical-align: middle;">
          <th style="padding: 8px 10px; border-right: 1px solid #111827; width: 85px; vertical-align: middle;">Tanggal</th>
          <th style="padding: 8px 10px; border-right: 1px solid #111827; width: 105px; vertical-align: middle;">Metode</th>
          <th style="padding: 8px 10px; border-right: 1px solid #111827; width: 85px; vertical-align: middle;">Kategori</th>
          <th style="padding: 8px 10px; border-right: 1px solid #111827; vertical-align: middle;">Deskripsi</th>
          <th style="padding: 8px 10px; border-right: 1px solid #111827; text-align: right; width: 110px; vertical-align: middle;">Jumlah</th>
          <th style="padding: 8px 10px; text-align: right; width: 125px; vertical-align: middle; white-space: nowrap;">Akumulasi Belanja</th>
        </tr>
      </thead>
      <tbody>
        ${
          runningList.length > 0
            ? runningList
                .map(
                  (tx, idx) => `
          <tr style="border-bottom: 1px solid #E5E7EB; background-color: ${idx % 2 === 1 ? '#F9FAFB' : '#FFFFFF'}; vertical-align: middle;">
            <td style="padding: 6px 10px; border-right: 1px solid #111827; font-family: monospace; vertical-align: middle;">${tx.transaction_date}</td>
            <td style="padding: 6px 10px; border-right: 1px solid #111827; color: #4B5563; vertical-align: middle;">${tx.cleanPaymentMethod}</td>
            <td style="padding: 6px 10px; border-right: 1px solid #111827; font-weight: 500; vertical-align: middle;">${tx.category}</td>
            <td style="padding: 6px 10px; border-right: 1px solid #111827; color: #1F2937; vertical-align: middle;">
              <span style="vertical-align: middle;">${tx.description || '-'}</span>
              ${tx.type === 'income' ? '<span style="display: inline-block; vertical-align: middle; margin-left: 6px; padding: 1px 5px; background: #D1FAE5; color: #065F46; font-size: 8px; font-weight: 700; border-radius: 3px; line-height: 1.2;">+ Masuk</span>' : ''}
            </td>
            <td style="padding: 6px 10px; border-right: 1px solid #111827; text-align: right; font-family: monospace; font-weight: 600; font-variant-numeric: tabular-nums; vertical-align: middle; color: ${tx.type === 'income' ? '#15803D' : '#111827'};">
              ${tx.type === 'income' ? '+' : '-'} ${currency(Number(tx.amount))}
            </td>
            <td style="padding: 6px 10px; text-align: right; font-family: monospace; font-weight: 700; font-variant-numeric: tabular-nums; vertical-align: middle; color: #111827;">
              ${currency(tx.runningTotal)}
            </td>
          </tr>`
                )
                .join('')
            : `
          <tr>
            <td colspan="6" style="padding: 24px; text-align: center; color: #6B7280;">Tidak ada catatan transaksi pada periode ini.</td>
          </tr>`
        }
      </tbody>
      <tfoot>
        <tr style="border-top: 2px solid #111827; background-color: #F3F4F6; font-weight: 700; vertical-align: middle;">
          <td colspan="4" style="padding: 8px 10px; border-right: 1px solid #111827; text-align: right; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; vertical-align: middle;">Total Pengeluaran Periode Ini</td>
          <td style="padding: 8px 10px; border-right: 1px solid #111827; text-align: right; font-family: monospace; font-size: 11px; font-weight: 700; color: #DC2626; font-variant-numeric: tabular-nums; vertical-align: middle;">${currency(expense)}</td>
          <td style="padding: 8px 10px; text-align: right; font-family: monospace; font-size: 11px; font-weight: 700; color: #111827; font-variant-numeric: tabular-nums; vertical-align: middle;">${currency(runningList.length > 0 ? runningList[runningList.length - 1].runningTotal : 0)}</td>
        </tr>
      </tfoot>
    </table>

    <!-- Footer breakdown -->
    <div style="margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 10px; border-top: 1px solid #D1D5DB; padding-top: 16px;">
      <div>
        <h4 style="margin: 0 0 8px 0; font-size: 10px; text-transform: uppercase; color: #374151; font-weight: 700;">Rincian Pengeluaran</h4>
        ${
          catSorted.length > 0
            ? catSorted
                .map(
                  ([cat, val]) => `
            <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #F3F4F6;">
              <span style="color: #4B5563;">${cat}</span>
              <strong style="font-family: monospace;">${currency(val)} (${expense > 0 ? ((val / expense) * 100).toFixed(1) : 0}%)</strong>
            </div>`
                )
                .join('')
            : '<p style="color: #9CA3AF; margin: 0;">Tidak ada pengeluaran.</p>'
        }
      </div>

      <div style="border: 1px dashed #D1D5DB; border-radius: 6px; padding: 12px; background-color: #F9FAFB; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <h4 style="margin: 0 0 4px 0; font-size: 10px; text-transform: uppercase; color: #374151; font-weight: 700;">Catatan & Rekonsiliasi</h4>
          <p style="margin: 0; font-size: 9px; color: #6B7280; line-height: 1.4;">
            Laporan ini dibuat otomatis melalui Cukupin (Quiet Ledger). Data dihitung secara deterministik untuk pemantauan arus kas pribadi.
          </p>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 16px; border-top: 1px solid #E5E7EB; padding-top: 8px;">
          <div style="font-size: 8px; color: #9CA3AF;">
            Status: Terverifikasi Sistem<br />
            Dicetak untuk: ${userEmail || 'Pengguna Cukupin'}
          </div>
          <div style="text-align: center;">
            <div style="width: 90px; border-bottom: 1px solid #9CA3AF; height: 16px; margin-bottom: 2px;"></div>
            <span style="font-size: 8px; text-transform: uppercase; color: #6B7280;">Tanda Tangan / Review</span>
          </div>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    const imgWidth = pdfWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 0

    // First page
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
    heightLeft -= pdfHeight

    // Subsequent pages if long statement
    while (heightLeft > 0) {
      position -= pdfHeight
      pdf.addPage()
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
      heightLeft -= pdfHeight
    }

    const saveName = filename || `laporan-cukupin-${periodLabel.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`
    pdf.save(saveName)
  } finally {
    document.body.removeChild(container)
  }
}
