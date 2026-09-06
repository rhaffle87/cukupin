import React, { useRef, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import type { Transaction } from '@/lib/database.types'
import { currency, shortCurrency, budgetRule503020, totals, monthLabel } from '@/lib/finance'
import { Download, Sparkles, Award, ShieldCheck, TrendingUp, CheckCircle2, Share2, HeartHandshake, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface FinancialWrappedModalProps {
  isOpen: boolean
  onClose: () => void
  transactions: Transaction[]
  userName?: string
}

export function FinancialWrappedModal({
  isOpen,
  onClose,
  transactions,
  userName = 'Teman Cukupin',
}: FinancialWrappedModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  if (!isOpen) return null

  const { income, expense, balance } = totals(transactions)
  const rule = budgetRule503020(transactions)

  // 1. Savings Rate Score (0 - 35 pts)
  const savingsRate = income > 0 ? (balance / income) * 100 : 0
  let savingsScore = 0
  if (savingsRate >= 25) savingsScore = 35
  else if (savingsRate >= 15) savingsScore = 28
  else if (savingsRate > 0) savingsScore = 18
  else savingsScore = 5

  // 2. Budget Adherence Score (0 - 25 pts)
  let budgetScore = 0
  if (income > 0) {
    const expenseRatio = (expense / income) * 100
    if (expenseRatio <= 75) budgetScore = 25
    else if (expenseRatio <= 95) budgetScore = 20
    else if (expenseRatio <= 100) budgetScore = 15
    else budgetScore = 5
  } else {
    budgetScore = 10
  }

  // 3. Logging Frequency & Discipline (0 - 20 pts)
  const uniqueDays = new Set(transactions.map(t => t.transaction_date)).size
  let loggingScore = 0
  if (transactions.length >= 15 || uniqueDays >= 10) loggingScore = 20
  else if (transactions.length >= 7 || uniqueDays >= 5) loggingScore = 15
  else if (transactions.length >= 3) loggingScore = 10
  else loggingScore = 5

  // 4. Ratio Balance Score (0 - 20 pts)
  let ratioScore = 0
  if (rule.needsPct <= 60 && rule.wantsPct <= 35) ratioScore = 20
  else if (rule.needsPct <= 75) ratioScore = 14
  else ratioScore = 8

  // Overall 100-Point Financial Health Score
  const totalScore = Math.min(100, Math.max(10, Math.round(savingsScore + budgetScore + loggingScore + ratioScore)))

  // Grade Determination
  let grade = 'B'
  let gradeTextColor = '#315DCB'
  let gradeBgColor = '#EBF0FA'
  let gradeLabel = 'Cukup Sehat'

  if (totalScore >= 85) {
    grade = 'A+'
    gradeTextColor = '#1B5E3C'
    gradeBgColor = '#DDEEE5'
    gradeLabel = 'Sangat Sehat'
  } else if (totalScore >= 70) {
    grade = 'A'
    gradeTextColor = '#1B5E3C'
    gradeBgColor = '#DDEEE5'
    gradeLabel = 'Sehat & Terkendali'
  } else if (totalScore >= 50) {
    grade = 'B'
    gradeTextColor = '#315DCB'
    gradeBgColor = '#EBF0FA'
    gradeLabel = 'Cukup Terkendali'
  } else {
    grade = 'C'
    gradeTextColor = '#BA4828'
    gradeBgColor = '#FBECE7'
    gradeLabel = 'Perlu Evaluasi'
  }

  // Financial Personality Archetype
  let archetype = 'Pengatur Santai'
  let archetypeDesc = 'Kamu mencatat dengan rileks dan mengalir, menjaga keuangan tetap cukup tanpa tekanan berlebih.'
  let archetypeIcon = HeartHandshake

  if (savingsRate >= 25 && totalScore >= 75) {
    archetype = 'Penabung Ulung'
    archetypeDesc = 'Disiplin mengamankan masa depan. Sebagian besar pemasukan berhasil dialokasikan ke tabungan dan impian.'
    archetypeIcon = TrendingUp
  } else if (rule.needsPct >= 65) {
    archetype = 'Fokus Kebutuhan Pokok'
    archetypeDesc = 'Pragmatis dan realistis. Pengeluaranmu terfokus pada kebutuhan utama keluarga dan sehari-hari.'
    archetypeIcon = ShieldCheck
  } else if (totalScore >= 80) {
    archetype = 'Si Paling Terencana'
    archetypeDesc = 'Presisi dalam alokasi pos. Anggaran terbagi rapi antara kebutuhan, keinginan, dan tabungan.'
    archetypeIcon = Award
  }

  const ArchetypeIcon = archetypeIcon

  // 1-Click PNG Export using html-to-image (SVG foreignObject).
  // html2canvas re-implements CSS in JS — causing text sag, missing backdrop-blur,
  // and gradient/border-radius artifacts. html-to-image delegates rendering to the
  // browser's own CSS engine for pixel-perfect output.
  const exportToImage = async () => {
    if (!cardRef.current) return
    setIsExporting(true)
    try {
      const originalCard = cardRef.current

      // Clone card into isolated off-screen element with fixed width and unrestrained height
      const clone = originalCard.cloneNode(true) as HTMLElement
      clone.style.position = 'fixed'
      clone.style.left = '0'
      clone.style.top = '0'
      clone.style.width = '480px'
      clone.style.maxWidth = '480px'
      clone.style.height = 'auto'
      clone.style.maxHeight = 'none'
      clone.style.overflow = 'visible'
      clone.style.transform = 'none'
      clone.style.zIndex = '-9999'
      document.body.appendChild(clone)

      // Wait for fonts and paint
      if (document.fonts) {
        await document.fonts.ready
      }
      await new Promise((resolve) => setTimeout(resolve, 200))

      const { toPng } = await import('html-to-image')

      const dataUrl = await toPng(clone, {
        pixelRatio: 3,
        cacheBust: true,
        skipAutoScale: true,
        backgroundColor: '#16273A',
      })

      // Clean up clone node from DOM
      document.body.removeChild(clone)

      if (typeof window !== 'undefined') {
        ;(window as any).__lastWrappedDataUrl = dataUrl
      }
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `rapor-cukupin-${new Date().toISOString().slice(0, 7)}.png`
      link.click()
      toast.success('Rapor Cukupin berhasil diunduh sebagai gambar PNG!')
    } catch (err) {
      console.error('Failed to export card image:', err)
      toast.error('Gagal mengunduh gambar. Coba ulangi kembali.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Modal title="Rapor Keuangan Cukupin" onClose={onClose} className="!w-[min(540px,100%)] !max-w-[540px]">
      <div className="flex flex-col gap-5">
        {/* Shareable Card Area */}
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-[26px] p-6 pb-7 sm:p-7 sm:pb-8 text-white shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-white/20"
          style={{
            background: 'radial-gradient(circle at 10% 90%, rgba(62, 143, 104, 0.18) 0%, transparent 45%), radial-gradient(circle at 90% 10%, rgba(255, 255, 255, 0.06) 0%, transparent 40%), linear-gradient(145deg, #1E3249 0%, #16273A 50%, #0D1824 100%)',
          }}
        >
          {/* Decorative Backing Rings (Smooth SVG/CSS with zero negative scroll expansion) */}
          <div
            className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full border border-white/10"
            style={{ transform: 'translate(25%, -25%)' }}
          />

          {/* Header Row */}
          <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-mint text-ink font-bold text-xs">
                C
              </div>
              <span className="font-extrabold tracking-wider text-xs uppercase font-sans">
                RAPOR CUKUPIN
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#BEE6CF] uppercase tracking-wider">
              {monthLabel().toUpperCase()}
            </span>
          </div>

          {/* Health Score & Grade Hero */}
          <div className="relative z-10 my-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#B9C6BD] uppercase">
                SKOR KESEHATAN FINANSIAL
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <strong className="font-mono text-4xl sm:text-5xl font-extrabold text-mint tabular-nums">
                  {totalScore}
                </strong>
                <span className="font-mono text-sm text-white/50">/ 100</span>
              </div>
              <p className="mt-1 text-xs text-[#BAC9C0]">
                Predikat: <span className="font-bold text-white">{gradeLabel}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3.5 border border-white/10 backdrop-blur-sm sm:self-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-xl font-mono text-2xl font-black shrink-0 border border-white/15"
                style={{ backgroundColor: gradeBgColor, color: gradeTextColor }}
              >
                {grade}
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-[#B9C6BD] uppercase">Tipe Pengelola</p>
                <p className="font-display text-sm font-bold text-white">{archetype}</p>
              </div>
            </div>
          </div>

          {/* Archetype Description Pill */}
          <div className="relative z-10 mb-6 rounded-2xl bg-white/[0.04] p-3.5 border border-white/10 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-mint/15 text-mint shrink-0 mt-0.5">
              <ArchetypeIcon size={16} />
            </div>
            <p className="text-xs leading-relaxed text-[#C0CBC4]">
              {archetypeDesc}
            </p>
          </div>

          {/* 50/30/20 Breakdown Bars (Explicit canvas-safe positioning & solid colors) */}
          <div className="relative z-10 mb-6">
            <span className="text-[10px] font-bold tracking-widest text-[#B9C6BD] uppercase block mb-3">
              ALOKASI ANGGARAN (50 / 30 / 20)
            </span>

            {/* Needs */}
            <div className="mb-3.5">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-white/80">Kebutuhan (Needs · Target 50%)</span>
                <span className="font-mono font-bold" style={{ color: '#BEE6CF' }}>
                  {rule.needsPct}% ({shortCurrency(rule.needs)})
                </span>
              </div>
              <div
                className="relative w-full rounded-full overflow-hidden"
                style={{ height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, rule.needsPct))}%`,
                    height: '8px',
                    backgroundColor: '#BEE6CF',
                  }}
                />
              </div>
            </div>

            {/* Wants */}
            <div className="mb-3.5">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-white/80">Keinginan (Wants · Target 30%)</span>
                <span className="font-mono font-bold" style={{ color: '#F2A68D' }}>
                  {rule.wantsPct}% ({shortCurrency(rule.wants)})
                </span>
              </div>
              <div
                className="relative w-full rounded-full overflow-hidden"
                style={{ height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, rule.wantsPct))}%`,
                    height: '8px',
                    backgroundColor: '#D98362',
                  }}
                />
              </div>
            </div>

            {/* Savings */}
            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-white/80">Sisa / Tabungan (Savings · Target 20%)</span>
                <span className="font-mono font-bold" style={{ color: '#B0C5F8' }}>
                  {Math.max(0, Math.round(savingsRate))}% ({shortCurrency(Math.max(0, balance))})
                </span>
              </div>
              <div
                className="relative w-full rounded-full overflow-hidden"
                style={{ height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, savingsRate))}%`,
                    height: '8px',
                    backgroundColor: '#315DCB',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Footer Metrics */}
          <div className="relative z-10 pt-4 pb-2 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
            <div>
              <p className="font-mono text-[10px] tracking-wider text-white/50 mb-0.5">DIBUAT UNTUK</p>
              <p
                className="font-bold text-white uppercase text-[11px] tracking-wider"
                style={{
                  lineHeight: '1.6',
                  overflow: 'visible',
                  whiteSpace: 'normal',
                }}
              >
                {userName}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] tracking-wider text-white/50 mb-0.5">TOTAL TERCATAT</p>
              <p
                className="font-mono font-bold text-mint text-xs tabular-nums"
                style={{
                  color: '#BEE6CF',
                  lineHeight: '1.6',
                  overflow: 'visible',
                }}
              >
                {transactions.length} Transaksi
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl border border-line bg-paper px-4 py-2.5 text-xs font-semibold text-muted hover:text-ink transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={exportToImage}
            disabled={isExporting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-bold !text-white shadow-md hover:bg-ink/90 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Membuat Gambar...</span>
              </>
            ) : (
              <>
                <Download size={15} className="text-mint" />
                <span>Unduh Kartu Rapor (PNG)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
