import { useState, useEffect, useRef } from 'react'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  Search,
  RefreshCw,
  Volume2,
} from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import { API_BASE_URL } from '../../config/api'

export default function ScannerPage({ ticketsList = [], onRefreshTickets }) {
  const [activeTab, setActiveTab] = useState('camera') // 'camera' | 'manual'
  const [ticketInput, setTicketInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [scannerError, setScannerError] = useState(null)

  const scannerRef = useRef(null)
  const isVerifyingRef = useRef(false)
  const lastScannedRef = useRef({ code: '', time: 0 })

  // Web Audio Synthesizer
  const playSound = (type) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      if (type === 'success') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(880, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.25)
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35)
        osc.start()
        osc.stop(ctx.currentTime + 0.35)
      } else {
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(160, ctx.currentTime)
        osc.frequency.setValueAtTime(120, ctx.currentTime + 0.15)
        gain.gain.setValueAtTime(0.4, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
        osc.start()
        osc.stop(ctx.currentTime + 0.4)
      }
    } catch {
      // Audio fallback
    }
  }

  // Verify ticket with MongoDB
  const verifyTicket = async (rawCode) => {
    if (!rawCode) return
    const code = rawCode.trim().toUpperCase()
    if (!code) return

    const now = Date.now()
    if (lastScannedRef.current.code === code && now - lastScannedRef.current.time < 3000) {
      return
    }

    if (isVerifyingRef.current) return
    isVerifyingRef.current = true
    lastScannedRef.current = { code, time: now }

    setLoading(true)
    setScanResult(null)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: code, scannedBy: 'Admin Portal Terminal' }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      const data = await res.json()

      if (data.result === 'VALID' || data.success) {
        playSound('success')
        setScanResult({
          type: 'VALID',
          title: '✅ ENTRY ALLOWED',
          message: 'Official ticket verified. Entry recorded successfully.',
          ticket: data.ticket,
        })
        if (onRefreshTickets) onRefreshTickets()
      } else if (data.result === 'ALREADY_USED') {
        playSound('error')
        setScanResult({
          type: 'ALREADY_USED',
          title: '⚠️ ALREADY USED TICKET!',
          message: `Ticket was already scanned at ${new Date(
            data.ticket?.scannedAt || Date.now()
          ).toLocaleTimeString()}`,
          ticket: data.ticket,
        })
      } else {
        playSound('error')
        setScanResult({
          type: 'INVALID',
          title: '❌ INVALID TICKET',
          message: data.message || 'No matching ticket found in system.',
        })
      }
    } catch (err) {
      clearTimeout(timeoutId)
      playSound('error')
      setScanResult({
        type: 'INVALID',
        title: '⚠️ SERVER OFFLINE',
        message: 'Unable to connect to validation server. Please ensure the backend service is running.',
      })
    } finally {
      setLoading(false)
      isVerifyingRef.current = false
    }
  }

  // Camera Scanner Lifecycle
  useEffect(() => {
    let isMounted = true

    const stopScannerSafely = async () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop()
          }
          await scannerRef.current.clear()
        } catch {
          // Ignore
        } finally {
          scannerRef.current = null
          if (isMounted) setCameraActive(false)
        }
      }
    }

    if (activeTab !== 'camera') {
      stopScannerSafely()
      return
    }

    const startScanner = async () => {
      try {
        if (!isMounted) return
        setScannerError(null)

        const container = document.getElementById('admin-qr-reader')
        if (!container) return

        const html5QrCode = new Html5Qrcode('admin-qr-reader')
        scannerRef.current = html5QrCode

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            if (isMounted && !isVerifyingRef.current) {
              verifyTicket(decodedText)
            }
          },
          () => {}
        )
        if (isMounted) setCameraActive(true)
      } catch (err) {
        if (isMounted) {
          setCameraActive(false)
          setScannerError(err?.message || 'Camera permission denied or camera not available.')
        }
      }
    }

    const timer = setTimeout(startScanner, 250)

    return () => {
      isMounted = false
      clearTimeout(timer)
      stopScannerSafely()
    }
  }, [activeTab])

  const recentScans = ticketsList.filter((t) => t.status === 'USED')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Live Scanner Box */}
      <div className="lg:col-span-7 bg-[#0f091f] border-2 border-neon-cyan/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(53,234,255,0.15)]">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <h3 className="font-bold font-space text-lg text-white">Live Gate Scanner</h3>
          <div className="flex items-center gap-1.5 text-xs text-neon-cyan">
            <Volume2 size={14} /> Beep Active
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-black/60 rounded-xl mb-5 border border-white/10 text-xs font-bold">
          <button
            onClick={() => setActiveTab('camera')}
            className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-neon-cyan text-[#071016] shadow-[0_0_15px_rgba(53,234,255,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Camera size={14} /> Camera Scanner
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-neon-pink text-[#080612] shadow-[0_0_15px_rgba(255,53,196,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Search size={14} /> Manual / Barcode Gun
          </button>
        </div>

        {/* Camera View */}
        {activeTab === 'camera' && (
          <div className="relative w-full h-72 bg-black rounded-2xl overflow-hidden border border-white/15 flex flex-col items-center justify-center mb-4">
            <div id="admin-qr-reader" className="w-full h-full" />
            {!cameraActive && !scannerError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/60 text-xs">
                <RefreshCw className="animate-spin text-neon-cyan" size={24} />
                <span>Activating device camera...</span>
              </div>
            )}
            {scannerError && (
              <div className="p-4 text-center space-y-2">
                <AlertTriangle className="mx-auto text-amber-400" size={28} />
                <p className="text-xs text-white/80">{scannerError}</p>
                <p className="text-[11px] text-neon-cyan">
                  Switch to Manual tab to enter or paste Ticket ID.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Manual Input */}
        {activeTab === 'manual' && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              verifyTicket(ticketInput)
            }}
            className="space-y-3 mb-4"
          >
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase mb-2">
                Ticket ID (or scan with USB Barcode reader)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. NEON-7829-K"
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value)}
                  className="flex-1 px-4 py-3 bg-black/60 border border-white/20 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-neon-cyan"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-3 rounded-xl bg-neon-cyan text-[#071016] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer"
                >
                  {loading ? 'Checking...' : 'Verify'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Result Card */}
        {scanResult && (
          <div
            className={`p-5 rounded-2xl border-2 transition-all animate-in zoom-in-95 duration-200 ${
              scanResult.type === 'VALID'
                ? 'bg-emerald-950/70 border-emerald-400 text-emerald-100 shadow-[0_0_35px_rgba(52,211,153,0.35)]'
                : scanResult.type === 'ALREADY_USED'
                ? 'bg-amber-950/70 border-amber-400 text-amber-100 shadow-[0_0_35px_rgba(251,191,36,0.35)]'
                : 'bg-rose-950/70 border-rose-500 text-rose-100 shadow-[0_0_35px_rgba(244,63,94,0.35)]'
            }`}
          >
            <div className="flex items-start gap-3">
              {scanResult.type === 'VALID' && (
                <CheckCircle2 size={24} className="text-emerald-400 shrink-0 mt-0.5" />
              )}
              {scanResult.type === 'ALREADY_USED' && (
                <AlertTriangle size={24} className="text-amber-400 shrink-0 mt-0.5" />
              )}
              {scanResult.type === 'INVALID' && (
                <XCircle size={24} className="text-rose-400 shrink-0 mt-0.5" />
              )}

              <div className="space-y-1 text-left flex-1">
                <h4 className="font-bold font-space text-base">{scanResult.title}</h4>
                <p className="text-xs opacity-90 leading-relaxed">{scanResult.message}</p>

                {scanResult.ticket && (
                  <div className="mt-3 pt-3 border-t border-white/15 text-xs grid grid-cols-2 gap-2 font-mono">
                    <div>
                      <span className="opacity-60 block text-[10px]">Attendee:</span>
                      <strong className="text-white">
                        {scanResult.ticket.customerName || 'N/A'}
                      </strong>
                    </div>
                    <div>
                      <span className="opacity-60 block text-[10px]">Ticket ID:</span>
                      <strong className="text-white">{scanResult.ticket.ticketId}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Recent Scans */}
      <div className="lg:col-span-5 bg-[#0f091f] border border-white/10 rounded-3xl p-6 shadow-lg">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <h3 className="font-bold font-space text-base text-white">Recent Gate Activity</h3>
          <span className="text-[11px] text-white/40">Latest Entries</span>
        </div>

        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
          {recentScans.length === 0 ? (
            <p className="text-xs text-white/40 text-center py-8">
              No check-ins yet. Scanned attendees will appear here in real-time.
            </p>
          ) : (
            recentScans.map((ticket) => (
              <div
                key={ticket.ticketId}
                className="p-3 bg-black/40 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <strong className="text-white block font-medium">
                    {ticket.customerName}
                  </strong>
                  <span className="font-mono text-[11px] text-white/50">
                    {ticket.ticketId} • {(ticket.eventType || 'adult').toUpperCase()}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {ticket.scannedAt
                    ? new Date(ticket.scannedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'CHECKED-IN'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
