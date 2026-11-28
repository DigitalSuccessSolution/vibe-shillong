import { useState, useRef, useEffect } from 'react'
import { CalendarDays, Download, MapPin, X, ShieldCheck, Clock, Ticket as TicketIcon, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

export default function TicketModal({ isOpen, onClose, ticket, autoDownload = false }) {
  const ticketRef = useRef(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (isOpen && autoDownload && ticket) {
      const timer = setTimeout(() => {
        handleDownload()
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [isOpen, autoDownload, ticket])

  if (!isOpen || !ticket) return null

  const handleDownload = async () => {
    if (!ticketRef.current) return
    setDownloading(true)
    try {
      let html2canvas
      try {
        const proModule = await import('html2canvas-pro')
        html2canvas = proModule.default || proModule
      } catch {
        const standardModule = await import('html2canvas')
        html2canvas = standardModule.default || standardModule
      }

      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#0d071a',
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          // Flatten outer corners on exported PNG so no black corner triangles exist
          const printable = clonedDoc.getElementById('printable-ticket')
          if (printable) {
            printable.style.borderRadius = '0px'
            printable.style.boxShadow = 'none'
            if (printable.firstElementChild) {
              printable.firstElementChild.style.borderRadius = '0px'
            }
          }

          // Double safety net: convert any unsupported color functions to standard rgb/rgba
          try {
            const helperCanvas = document.createElement('canvas')
            const ctx = helperCanvas.getContext('2d')
            if (ctx) {
              const elements = clonedDoc.querySelectorAll('*')
              elements.forEach((el) => {
                const computed = window.getComputedStyle(el)
                const props = ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'fill', 'stroke']
                props.forEach((prop) => {
                  const val = computed[prop]
                  if (val && (val.includes('oklab') || val.includes('oklch') || val.includes('color('))) {
                    try {
                      ctx.fillStyle = '#ffffff'
                      ctx.fillStyle = val
                      el.style[prop] = ctx.fillStyle
                    } catch {}
                  }
                })
              })
            }
          } catch {}
        },
      })
      const link = document.createElement('a')
      link.download = `VIBE-Ticket-${ticket.ticketId || 'Pass'}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Ticket download error:', err)
    } finally {
      setDownloading(false)
    }
  }

  const passColors = {
    kids: {
      border: 'border-neon-cyan',
      glow: 'shadow-[0_0_60px_rgba(53,234,255,0.3)]',
      badge: 'bg-neon-cyan text-[#071016]',
      text: 'text-neon-cyan',
      accent: '#35eaff',
    },
    adult: {
      border: 'border-neon-pink',
      glow: 'shadow-[0_0_60px_rgba(255,53,196,0.35)]',
      badge: 'bg-neon-pink text-[#080612]',
      text: 'text-neon-pink',
      accent: '#ff35c4',
    },
    vip: {
      border: 'border-neon-lime',
      glow: 'shadow-[0_0_60px_rgba(200,255,61,0.35)]',
      badge: 'bg-neon-lime text-[#080612]',
      text: 'text-neon-lime',
      accent: '#c8ff3d',
    },
  }

  const eventTypeKey = (ticket.eventType || 'adult').toLowerCase()
  const currentTheme = passColors[eventTypeKey] || passColors.adult
  const ticketIdDisplay = ticket.ticketId || 'NEON-VALID'
  const customerNameDisplay = ticket.customerName || 'Verified Attendee'
  const quantity = Number(ticket.quantity) || 1

  // Clean, professional pass title (no underscores or raw internal keys)
  const passTitleDisplay = (() => {
    if (ticket.eventTitle) {
      const stripped = ticket.eventTitle.replace(/\s*\([^)]*\)/g, '').replace(/[_-]+/g, ' ').trim()
      if (stripped.length > 0) {
        const upper = stripped.toUpperCase()
        return upper.endsWith('PASS') ? upper : `${upper} PASS`
      }
    }
    const clean = (ticket.eventType || 'adult')
      .replace(/[_-]+/g, ' ')
      .trim()
      .toUpperCase()
    return clean.endsWith('PASS') ? clean : `${clean} PASS`
  })()

  const rawStatus = (ticket.status || 'VALID').toUpperCase()
  const isCancelled = rawStatus.includes('CANCEL') || rawStatus === 'VOID'
  const isUsed = rawStatus === 'USED'

  const eventTimings = {
    kids: '12:00 PM – 7:30 PM',
    adult: '8:00 PM Onwards',
    vip: '8:00 PM Onwards',
  }
  const timingDisplay = eventTimings[eventTypeKey] || '8:00 PM Onwards'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto no-scrollbar">
      <div className="relative w-full max-w-2xl my-auto no-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close ticket"
          className="absolute -top-11 right-0 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer z-30"
        >
          <X size={18} />
        </button>

        {/* Real Ticket Pass Container with Perforated Tear-off Stub */}
        <div
          ref={ticketRef}
          id="printable-ticket"
          className={`relative bg-[#0d071a] border-2 ${currentTheme.border} ${currentTheme.glow} rounded-3xl text-white shadow-2xl overflow-hidden`}
        >
          {/* Decorative Subtle Background Glow (Clipped inside) */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div
              className="absolute -top-24 -left-24 w-60 h-60 rounded-full blur-3xl opacity-20"
              style={{ backgroundColor: currentTheme.accent }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 relative">
            {/* ========================================================= */}
            {/* LEFT / MAIN PASS SECTION (8 Columns on desktop) */}
            {/* ========================================================= */}
            <div className="md:col-span-8 p-6 sm:p-7 flex flex-col justify-between space-y-5">
              {/* Header: Brand & Pass Tier */}
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo.jpeg"
                    alt="VIBE Shillong"
                    className="w-10 h-10 object-contain mix-blend-screen shrink-0"
                  />
                  <div>
                    <h3 className="font-bold font-space text-base tracking-wider leading-none text-white">
                      VIBE SHILLONG
                    </h3>
                    <span className="text-[10px] text-white/50 tracking-widest uppercase mt-0.5 block font-mono">
                      Official Festival Pass · 2026
                    </span>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black tracking-wider uppercase shrink-0 whitespace-nowrap ${currentTheme.badge}`}>
                  {passTitleDisplay}
                </span>
              </div>

              {/* Attendee Name */}
              <div>
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono font-semibold block mb-0.5">
                  Attendee Name
                </span>
                <h2 className="font-extrabold font-space text-2xl sm:text-3xl text-white tracking-tight uppercase">
                  {customerNameDisplay}
                </h2>
              </div>

              {/* Boarding-Pass Style 2-Column Event Specs (No Gate) */}
              <div className="grid grid-cols-2 gap-2 py-3 px-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                <div className="border-r border-white/10 pr-2">
                  <span className="text-[9px] uppercase tracking-wider text-white/40 block font-mono">Date</span>
                  <span className="font-bold font-space text-xs sm:text-sm text-white">12 DEC 2026</span>
                </div>
                <div className="pl-2">
                  <span className="text-[9px] uppercase tracking-wider text-white/40 block font-mono">Timing</span>
                  <span className={`font-bold font-space text-xs sm:text-sm ${currentTheme.text}`}>
                    {timingDisplay}
                  </span>
                </div>
              </div>

              {/* Venue & Metadata */}
              <div className="space-y-1.5 text-xs text-white/80">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-neon-pink shrink-0" />
                  <span className="font-medium">F Lounge by FTV, Shillong</span>
                </div>
                <div className="flex items-center gap-2 text-white/50 text-[11px]">
                  <TicketIcon size={13} className="text-neon-cyan shrink-0" />
                  <span>Qty: {quantity} Pass • Admit One • Non-Transferable</span>
                </div>
              </div>

              {/* Status Badge & Barcode Strip */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
                {isCancelled ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[11px] font-bold">
                    <XCircle size={13} />
                    Status: CANCELLED
                  </span>
                ) : isUsed ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                    <CheckCircle2 size={13} />
                    Status: USED (CHECKED-IN)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                    <ShieldCheck size={13} />
                    Status: VALID
                  </span>
                )}
                <span className="font-mono text-xs text-white/30 tracking-[4px] uppercase select-none hidden sm:inline">
                  |||||||||||||||||||
                </span>
              </div>
            </div>

            {/* ========================================================= */}
            {/* RIGHT / STUB SECTION (4 Columns on desktop, stacked on mobile) */}
            {/* ========================================================= */}
            <div className="md:col-span-4 border-t-2 md:border-t-0 md:border-l-2 border-dashed border-white/20 bg-black/40 p-6 flex flex-col items-center justify-between text-center">
              <div className="w-full">
                <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase block mb-3 font-semibold">
                  Digital Entry Stub
                </span>

                {/* QR Code Container */}
                <div className={`p-3 rounded-2xl shadow-xl inline-block mx-auto relative ${isCancelled ? 'bg-[#1a0b16] border border-rose-500/40' : 'bg-white'}`}>
                  <div className={isCancelled ? 'opacity-25 blur-[1px]' : ''}>
                    <QRCodeSVG
                      value={ticketIdDisplay}
                      size={135}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  {isCancelled && (
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                      <span className="px-2.5 py-1 rounded bg-rose-600 text-white font-black font-space text-[10px] sm:text-[11px] tracking-wider uppercase rotate-[-12deg] shadow-2xl border border-white/50">
                        VOID / CANCELLED
                      </span>
                    </div>
                  )}
                  <span className={`text-[9px] font-mono font-bold mt-1.5 block tracking-wider uppercase ${isCancelled ? 'text-rose-400' : 'text-black/80'}`}>
                    {isCancelled ? 'Pass Void & Cancelled' : 'Scan for Entry'}
                  </span>
                </div>
              </div>

              {/* Ticket ID & Security Code */}
              <div className="mt-4 w-full">
                <span className="text-[9px] text-white/40 uppercase tracking-wider block font-mono">
                  Official Code
                </span>
                <p className={`font-mono font-bold text-xs sm:text-sm ${currentTheme.text} tracking-wider mt-0.5`}>
                  {ticketIdDisplay}
                </p>
                <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-white/40 font-mono">
                  1-Time Fast Scan
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer border border-white/10 disabled:opacity-50"
          >
            {downloading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Preparing Download...
              </>
            ) : (
              <>
                <Download size={14} /> Download Ticket
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-neon-pink hover:opacity-90 text-[#080612] text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(255,53,196,0.4)]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
