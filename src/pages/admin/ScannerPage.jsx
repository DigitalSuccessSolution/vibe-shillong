import { useState, useEffect, useRef } from 'react'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  Search,
  RefreshCw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  ChevronLeft,
  ChevronRight,
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
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(true)

  const scannerRef = useRef(null)
  const isVerifyingRef = useRef(false)
  const lastScannedRef = useRef({ code: '', time: 0 })
  const scanResultRef = useRef(null)

  // Clear result and ready scanner for next ticket immediately
  const dismissResultAndScanNext = () => {
    setScanResult(null)
    scanResultRef.current = null
    lastScannedRef.current = { code: '', time: 0 }
    isVerifyingRef.current = false
    setTicketInput('')
  }

  // Quick Dismiss Keyboard Shortcut (Enter, Space, or Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (scanResult && (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape')) {
        e.preventDefault()
        dismissResultAndScanNext()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [scanResult])

  // Preload SpeechSynthesis Voices
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices()
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices()
        }
      }
    }
  }, [])

  // Industry Standard Audio Synthesizer (Zebra / Apple Pay / Boarding Gate Chimes)
  const playSound = (type = 'success') => {
    if (!audioEnabled) return
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const t = ctx.currentTime

      if (type === 'success') {
        // Dual-Tone Bell Chime: C6 (1046.5Hz) -> G6 (1567.98Hz)
        const osc1 = ctx.createOscillator()
        const gain1 = ctx.createGain()
        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(1046.5, t)
        gain1.gain.setValueAtTime(0.28, t)
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
        osc1.connect(gain1)
        gain1.connect(ctx.destination)
        osc1.start(t)
        osc1.stop(t + 0.12)

        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(1567.98, t + 0.08)
        gain2.gain.setValueAtTime(0.32, t + 0.08)
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.start(t + 0.08)
        osc2.stop(t + 0.35)
      } else if (type === 'warning') {
        // Amber Warning Double-Tone: 480Hz -> 380Hz
        const osc1 = ctx.createOscillator()
        const gain1 = ctx.createGain()
        osc1.type = 'triangle'
        osc1.frequency.setValueAtTime(480, t)
        gain1.gain.setValueAtTime(0.3, t)
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
        osc1.connect(gain1)
        gain1.connect(ctx.destination)
        osc1.start(t)
        osc1.stop(t + 0.12)

        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.type = 'triangle'
        osc2.frequency.setValueAtTime(380, t + 0.14)
        gain2.gain.setValueAtTime(0.35, t + 0.14)
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.32)
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.start(t + 0.14)
        osc2.stop(t + 0.32)
      } else {
        // Low Double-Buzz Rejection Tone: 220Hz -> 165Hz
        const osc1 = ctx.createOscillator()
        const gain1 = ctx.createGain()
        osc1.type = 'sawtooth'
        osc1.frequency.setValueAtTime(220, t)
        gain1.gain.setValueAtTime(0.25, t)
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
        osc1.connect(gain1)
        gain1.connect(ctx.destination)
        osc1.start(t)
        osc1.stop(t + 0.12)

        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.type = 'sawtooth'
        osc2.frequency.setValueAtTime(165, t + 0.15)
        gain2.gain.setValueAtTime(0.3, t + 0.15)
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.start(t + 0.15)
        osc2.stop(t + 0.35)
      }
    } catch {
      // Audio fallback
    }
  }

  // Natural Speech Synthesis Voice Assistant (Paytm / Airport Gate Scanner style)
  const speakVoice = (text) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return
    try {
      window.speechSynthesis.cancel() // Cancel previous queue to avoid overlap
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.05
      utterance.pitch = 1.0
      utterance.volume = 1.0

      const voices = window.speechSynthesis.getVoices()
      const naturalVoice =
        voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Google') ||
              v.name.includes('Natural') ||
              v.name.includes('Samantha') ||
              v.name.includes('Jenny') ||
              v.name.includes('Zira') ||
              v.name.includes('David'))
        ) || voices.find((v) => v.lang.startsWith('en'))

      if (naturalVoice) utterance.voice = naturalVoice
      window.speechSynthesis.speak(utterance)
    } catch (e) {
      console.warn('[Voice Assistant Error]:', e)
    }
  }

  // Verify ticket with MongoDB
  const verifyTicket = async (rawCode) => {
    if (!rawCode) return
    const code = rawCode.trim().toUpperCase()
    if (!code) return

    // Prevent scanning if a result is already on screen or currently in verification
    if (isVerifyingRef.current || scanResultRef.current) return

    const now = Date.now()
    if (lastScannedRef.current.code === code && now - lastScannedRef.current.time < 3000) {
      return
    }

    isVerifyingRef.current = true
    lastScannedRef.current = { code, time: now }

    setLoading(true)
    setScanResult(null)
    scanResultRef.current = null

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
        const attendeeName = data.ticket?.customerName ? data.ticket.customerName.trim().split(' ')[0] : ''
        playSound('success')
        speakVoice(attendeeName ? `Entry allowed. Welcome, ${attendeeName}!` : 'Entry allowed. Welcome to VIBE Shillong!')
        const resObj = {
          type: 'VALID',
          title: '✅ ENTRY ALLOWED',
          message: 'Official ticket verified. Entry recorded successfully.',
          ticket: data.ticket,
        }
        scanResultRef.current = resObj
        setScanResult(resObj)
        if (onRefreshTickets) onRefreshTickets()
      } else if (data.result === 'ALREADY_USED') {
        playSound('warning')
        speakVoice('Warning. Ticket already used!')
        const resObj = {
          type: 'ALREADY_USED',
          title: '⚠️ ALREADY USED TICKET!',
          message: `Ticket was already scanned at ${new Date(
            data.ticket?.scannedAt || Date.now()
          ).toLocaleTimeString()}`,
          ticket: data.ticket,
        }
        scanResultRef.current = resObj
        setScanResult(resObj)
      } else if (data.ticket?.status === 'CANCELLED' || (data.message && data.message.toLowerCase().includes('cancel'))) {
        playSound('error')
        speakVoice('Stop. Ticket cancelled due to refund!')
        const resObj = {
          type: 'INVALID',
          title: '❌ TICKET CANCELLED',
          message: data.message || 'This pass was cancelled or refunded. Entry blocked.',
          ticket: data.ticket,
        }
        scanResultRef.current = resObj
        setScanResult(resObj)
      } else {
        playSound('error')
        speakVoice('Invalid ticket. Entry denied.')
        const resObj = {
          type: 'INVALID',
          title: '❌ INVALID TICKET',
          message: data.message || 'No matching ticket found in system.',
        }
        scanResultRef.current = resObj
        setScanResult(resObj)
      }
    } catch (err) {
      clearTimeout(timeoutId)
      playSound('error')
      speakVoice('Connection error. Server offline.')
      const resObj = {
        type: 'INVALID',
        title: '⚠️ SERVER OFFLINE',
        message: 'Unable to connect to validation server. Please ensure the backend service is running.',
      }
      scanResultRef.current = resObj
      setScanResult(resObj)
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
          { fps: 15 },
          (decodedText) => {
            if (isMounted && !isVerifyingRef.current && !scanResultRef.current) {
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

  const renderResultModal = () => {
    if (!scanResult) return null

    const isValid = scanResult.type === 'VALID'
    const isAlreadyUsed = scanResult.type === 'ALREADY_USED'

    return (
      <div
        className={`w-full max-w-sm sm:max-w-md mx-auto p-5 sm:p-6 rounded-3xl border-2 text-center transition-all animate-in zoom-in-95 duration-200 flex flex-col items-center justify-between gap-3 sm:gap-4 ${
          isValid
            ? 'bg-gradient-to-b from-[#09261a]/95 to-[#04120c]/95 border-emerald-400 text-emerald-100'
            : isAlreadyUsed
            ? 'bg-gradient-to-b from-[#331c04]/95 to-[#170c02]/95 border-amber-400 text-amber-100'
            : 'bg-gradient-to-b from-[#330814]/95 to-[#170308]/95 border-rose-500 text-rose-100'
        }`}
      >
        {/* Status Icon Badge */}
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-2 shrink-0 ${
            isValid
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
              : isAlreadyUsed
              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
              : 'bg-rose-500/20 border-rose-500 text-rose-300'
          }`}
        >
          {isValid && <CheckCircle2 size={36} className="animate-in zoom-in-75" />}
          {isAlreadyUsed && <AlertTriangle size={36} className="animate-in zoom-in-75" />}
          {!isValid && !isAlreadyUsed && <XCircle size={36} className="animate-in zoom-in-75" />}
        </div>

        {/* Title & Message */}
        <div className="space-y-1">
          <h4
            className={`font-space font-extrabold text-xl sm:text-2xl tracking-wide uppercase ${
              isValid
                ? 'text-emerald-300'
                : isAlreadyUsed
                ? 'text-amber-300'
                : 'text-rose-300'
            }`}
          >
            {scanResult.title}
          </h4>
          <p className="text-xs sm:text-sm opacity-90 max-w-xs mx-auto leading-snug">
            {scanResult.message}
          </p>
        </div>

        {/* Ticket Details Box */}
        {scanResult.ticket && (
          <div className="w-full bg-black/60 border border-white/10 rounded-2xl p-3 sm:p-3.5 text-left font-mono space-y-1.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="text-[10px] text-white/50 uppercase tracking-wider">Attendee</span>
              <span className="font-space font-bold text-sm sm:text-base text-white truncate max-w-[200px]">
                {scanResult.ticket.customerName || 'N/A'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-[10px] text-white/50 block">Ticket ID</span>
                <span className="font-bold text-neon-cyan">{scanResult.ticket.ticketId}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/50 block">Pass Type</span>
                <span className="font-bold text-neon-pink uppercase">
                  {scanResult.ticket.eventType || 'Adult'}
                </span>
              </div>
            </div>

            {scanResult.ticket.quantity && scanResult.ticket.quantity > 1 && (
              <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
                <span className="text-white/50">Total Entries:</span>
                <span className="font-bold text-neon-lime">{scanResult.ticket.quantity} Attendees</span>
              </div>
            )}

            {isAlreadyUsed && scanResult.ticket.scannedAt && (
              <div className="flex items-center justify-between pt-1 border-t border-amber-500/20 text-[11px] text-amber-300">
                <span>First Scanned:</span>
                <span className="font-bold">
                  {new Date(scanResult.ticket.scannedAt).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* OK / Scan Next Button */}
        <button
          type="button"
          onClick={dismissResultAndScanNext}
          className={`w-full py-3.5 px-6 rounded-2xl font-space font-extrabold text-sm sm:text-base tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
            isValid
              ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 text-black hover:brightness-110'
              : isAlreadyUsed
              ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-black hover:brightness-110'
              : 'bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 text-white hover:brightness-110'
          }`}
        >
          <span>OK • Scan Next</span>
          <span className="text-[11px] bg-black/20 px-2 py-0.5 rounded font-mono font-normal">
            (Enter ↵)
          </span>
        </button>
      </div>
    )
  }

  const [recentPage, setRecentPage] = useState(1)
  const recentPageSize = 6
  const recentScans = ticketsList.filter((t) => t.status === 'USED')
  const totalRecentPages = Math.max(1, Math.ceil(recentScans.length / recentPageSize))
  const paginatedRecentScans = recentScans.slice(
    (recentPage - 1) * recentPageSize,
    recentPage * recentPageSize
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Live Scanner Box */}
      <div className="lg:col-span-7 bg-[#0f091f] border-2 border-neon-cyan/40 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <h3 className="font-bold font-space text-lg text-white">Live Gate Scanner</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                voiceEnabled
                  ? 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan'
                  : 'bg-white/5 border-white/10 text-white/40'
              }`}
              title={voiceEnabled ? 'Voice Announcements ON' : 'Voice Announcements OFF'}
            >
              {voiceEnabled ? <Mic size={12} /> : <MicOff size={12} />}
              <span>{voiceEnabled ? 'Voice: ON' : 'Voice: OFF'}</span>
            </button>

            <button
              type="button"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                audioEnabled
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-white/40'
              }`}
              title={audioEnabled ? 'Sound Chime ON' : 'Mute'}
            >
              {audioEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
              <span>{audioEnabled ? 'Chime: ON' : 'Mute'}</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-black/60 rounded-xl mb-5 border border-white/10 text-xs font-bold">
          <button
            onClick={() => setActiveTab('camera')}
            className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-neon-cyan text-[#071016]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Camera size={14} /> Camera Scanner
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-neon-pink text-[#080612]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Search size={14} /> Manual / Barcode Gun
          </button>
        </div>

        {/* Camera View */}
        {activeTab === 'camera' && (
          <div className="relative w-full h-[400px] sm:h-[460px] md:h-[500px] bg-black rounded-3xl overflow-hidden border-2 border-white/15 flex flex-col items-center justify-center mb-4">
            <div id="admin-qr-reader" className="w-full h-full" />

            {/* Middle Full-Box Viewfinder Overlay (Hidden when result modal is showing) */}
            {cameraActive && !scannerError && !scanResult && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-3xl border-2 border-white/30 flex items-center justify-center">
                  {/* Glowing Neon Cyan Corner Reticles */}
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-neon-cyan rounded-tl-xl" />
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-neon-cyan rounded-tr-xl" />
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-neon-cyan rounded-bl-xl" />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-neon-cyan rounded-br-xl" />

                  {/* Animated Laser Scanning Beam */}
                  <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-neon-cyan to-transparent animate-scanner-laser" />

                  {/* Center Target Crosshair */}
                  <div className="w-8 h-8 border border-white/20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-neon-cyan rounded-full animate-ping" />
                  </div>

                  {/* Bottom Instruction Badge */}
                  <div className="absolute -bottom-10 left-0 right-0 text-center">
                    <span className="px-3.5 py-1 rounded-full bg-black/80 border border-white/20 text-[11px] font-mono text-neon-cyan tracking-wider uppercase font-bold">
                      ⚡ Align QR Code Inside Box
                    </span>
                  </div>
                </div>
              </div>
            )}

            {!cameraActive && !scannerError && !scanResult && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/60 text-xs bg-black/80 z-20">
                <RefreshCw className="animate-spin text-neon-cyan" size={24} />
                <span>Activating device camera...</span>
              </div>
            )}
            {scannerError && !scanResult && (
              <div className="absolute inset-0 p-4 text-center flex flex-col items-center justify-center space-y-2 bg-black/90 z-20">
                <AlertTriangle className="mx-auto text-amber-400" size={28} />
                <p className="text-xs text-white/80">{scannerError}</p>
                <p className="text-[11px] text-neon-cyan">
                  Switch to Manual tab to enter or paste Ticket ID.
                </p>
              </div>
            )}

            {/* Overlaid Result Modal Directly on Top of Camera Scanner */}
            {scanResult && (
              <div className="absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
                {renderResultModal()}
              </div>
            )}
          </div>
        )}

        {/* Manual Input */}
        {activeTab === 'manual' && (
          <div className="space-y-4 mb-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                verifyTicket(ticketInput)
              }}
              className="space-y-3"
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

            {/* In Manual Tab, render result modal directly below input */}
            {scanResult && renderResultModal()}
          </div>
        )}
      </div>

      {/* Right Column: Recent Scans */}
      <div className="lg:col-span-5 bg-[#0f091f] border border-white/10 rounded-3xl p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3.5">
          <div>
            <h3 className="font-bold font-space text-base text-white">Recent Gate Activity</h3>
            <span className="text-[11px] text-white/40">{recentScans.length} Check-Ins</span>
          </div>

          {totalRecentPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRecentPage((p) => Math.max(1, p - 1))}
                disabled={recentPage === 1}
                className="w-7 h-7 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white flex items-center justify-center disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
                title={`Previous (Page ${recentPage - 1} of ${totalRecentPages})`}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => setRecentPage((p) => Math.min(totalRecentPages, p + 1))}
                disabled={recentPage === totalRecentPages}
                className="w-7 h-7 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white flex items-center justify-center disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
                title={`Next (Page ${recentPage + 1} of ${totalRecentPages})`}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {paginatedRecentScans.length === 0 ? (
            <div className="py-12 text-center text-white/40">
              <p className="text-xs">No check-ins yet.</p>
              <p className="text-[11px] text-white/30 mt-1">
                Scanned attendees will appear here in real-time.
              </p>
            </div>
          ) : (
            paginatedRecentScans.map((ticket) => (
              <div
                key={ticket.ticketId}
                className="px-3.5 py-2.5 bg-black/40 border border-emerald-500/20 hover:border-emerald-500/40 rounded-lg flex items-center justify-between text-xs transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <strong className="text-white block font-medium truncate text-sm">
                    {ticket.customerName}
                  </strong>
                  <div className="font-mono text-[11px] text-white/50 flex items-center gap-1.5 mt-0.5">
                    <span className="text-neon-cyan">{ticket.ticketId}</span>
                    <span>•</span>
                    <span className="uppercase text-white/60">{ticket.eventType || 'adult'}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
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
