import React from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function Modal({ title, onClose, children, className }: ModalProps) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className={`modal max-h-[90vh] flex flex-col overflow-hidden shadow-2xl ${className || ''}`}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-heading shrink-0 border-b border-line/50 pb-3 mb-4">
          <h2 id="modal-title" className="font-display font-bold text-lg text-ink">{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Tutup modal">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto pr-2.5 pl-0.5 flex-1 overscroll-contain custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  )
}
