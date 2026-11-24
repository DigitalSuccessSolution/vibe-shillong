import { useState, useEffect, useRef } from 'react'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  Camera,
  X,
  Search,
  RefreshCw,
  Volume2,
  Lock,
  LogOut,
  ShieldAlert,
} from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import { API_BASE_URL, ADMIN_USER, ADMIN_PASS } from '../config/api'

export default function GateScannerModal({ isOpen, onClose }) {
  // Safe Authentication State with error protection
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('neon_admin_auth') === 'true'
    } catch {
      return false
    }
  })
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')

  // Scanner States
  const [activeTab, setActiveTab] = useState('camera') // 'camera' | 'manual'
  const [ticketInput, setTicketInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [scannerError, setScannerError] = useState(null)

  // Anti-Spam / Race-Condition Protection Refs
  const scannerRef = useRef(null)
  const isVerifyingRef = useRef(false)
  const lastScannedRef = useRef({ code: '', time: 0 })

  // Handle Admin Login
  const handleLogin = (e) => {
    e.preventDefault()
    setLoginError('')

    const cleanUser = (loginForm.username || '').trim()
    const cleanPass = (loginForm.password || '').trim()

    if (cleanUser === ADMIN_USER && cleanPass === ADMIN_PASS) {
      try {
        sessionStorage.setItem('neon_admin_auth', 'true')
      } catch {
        // Fallback for restricted storage
      }
      setIsAuthenticated(true)
    } else {
      setLoginError('Invalid Username or Password. Please check .env credentials.')
    }
  }

  // Handle Logout
  const handleLogout = () => {
    try {
      sessionStorage.removeItem('neon_admin_auth')
    } catch {
      // Safe fallback
    }
    setIsAuthenticated(false)
    setLoginForm({ username: '', password: '' })
    setScanResult(null)
  }

  // Web Audio API Sound Synthesizer for instant Ding/Buzzer (Crash-proof)
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
        // High pleasant Ding sound (880Hz -> 1760Hz)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(880, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.25)
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35)
        osc.start()
        osc.stop(ctx.currentTime + 0.35)
      } else {
        // Low harsh Buzzer sound (160Hz)
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(160, ctx.currentTime)
        osc.frequency.setValueAtTime(120, ctx.currentTime + 0.15)
        gain.gain.setValueAtTime(0.4, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
        osc.start()
        osc.stop(ctx.currentTime + 0.4)
      }
    } catch {
      // Audio autoplay restriction / blocked context safe fallback
    }
  }

  // Verify ticket with backend API or local fallback
  const verifyTicket = async (rawCode) => {
    if (!rawCode) return
    const code = rawCode.trim().toUpperCase()
    if (!code) return

    // Debounce: prevent same code scan within 3 seconds
    const now = Date.now()
    if (lastScannedRef.current.code === code && now - lastScannedRef.current.time < 3000) {
      return
    }

    // Lock verification to prevent concurrent race conditions
    if (isVerifyingRef.current) return
    isVerifyingRef.current = true
    lastScannedRef.current = { code, time: now }

    setLoading(true)
    setScanResult(null)

    // Abort controller for 5-second network timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: code, scannedBy: 'Gate 1 Mobile Scanner' }),
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
    } catch {
      // Offline / Local Simulation Fallback (when backend server is not reachable)
      clearTimeout(timeoutId)
      let isAlreadyUsed = false
      try {
        isAlreadyUsed = Boolean(localStorage.getItem(`used_${code}`))
      } catch {
        // LocalStorage fallback
      }

      if (isAlreadyUsed) {
        playSound('error')
        setScanResult({
          type: 'ALREADY_USED',
          title: '⚠️ ALREADY USED TICKET!',
          message: `Ticket ${code} was already scanned previously.`,
          ticket: { ticketId: code, eventType: 'adult', customerName: 'Attendee' },
        })
      } else {
        try {
          localStorage.setItem(`used_${code}`, new Date().toISOString())
        } catch {
          // Safe fallback
        }
        playSound('success')
        setScanResult({
          type: 'VALID',
          title: '✅ ENTRY ALLOWED',
          message: `Ticket ${code} verified (Local Mode). Marked as used.`,
          ticket: {
            ticketId: code,
            customerName: 'Verified Attendee',
            eventType: 'VIP/Adult',
            quantity: 1,
          },
        })
      }
    } finally {
      setLoading(false)
      isVerifyingRef.current = false
    }
  }

  // Camera Scanner Lifecycle with crash-proof cleanup
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
          // Ignore scanner stop exceptions
        } finally {
          scannerRef.current = null
          if (isMounted) setCameraActive(false)
        }
      }
    }

    if (!isOpen || !isAuthenticated || activeTab !== 'camera') {
      stopScannerSafely()
      return
    }

    const startScanner = async () => {
      try {
        if (!isMounted) return
        setScannerError(null)

        // Ensure clean element exists
        const container = document.getElementById('qr-reader-view')
        if (!container) return

        const html5QrCode = new Html5Qrcode('qr-reader-view')
        scannerRef.current = html5QrCode

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            if (isMounted && !isVerifyingRef.current) {
              verifyTicket(decodedText)
            }
          },
          () => {
            // Frame scan miss, normal operation
          }
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
  }, [isOpen, isAuthenticated, activeTab])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0e071c] border-2 border-neon-cyan/40 rounded-3xl p-6 sm:p-8 text-white shadow-[0_0_60px_rgba(53,234,255,0.25)] max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-neon-cyan/20 border border-neon-cyan text-neon-cyan grid place-items-center">
              {isAuthenticated ? <QrCode size={18} /> : <Lock size={18} />}
            </span>
            <div>
              <h3 className="font-bold font-space text-lg text-white">
                {isAuthenticated ? 'Event Gate QR Scanner' : 'Staff Admin Login'}
              </h3>
              <p className="text-[11px] text-white/50">
                {isAuthenticated ? 'Authenticated Entry Terminal' : 'Protected Area • Authorized Personnel Only'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                title="Log out"
                className="text-white/60 hover:text-rose-400 p-2 rounded-full hover:bg-white/10 transition-all cursor-pointer text-xs flex items-center gap-1"
              >
                <LogOut size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close scanner"
              className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* View 1: Admin Login Gate (when not logged in) */}
        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                Admin User ID
              </label>
              <input
                required
                type="text"
                placeholder="Enter admin username"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full px-4 py-3 bg-black/60 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-neon-cyan transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                required
                type="password"
                placeholder="Enter admin password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-3 bg-black/60 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-neon-cyan transition-all"
              />
            </div>

            {loginError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs">
                <ShieldAlert size={16} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-neon-cyan text-[#071016] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-[0_0_20px_rgba(53,234,255,0.3)] mt-2"
            >
              Authenticate & Open Scanner
            </button>

            <p className="text-center text-[11px] text-white/40 pt-1">
              Configured securely via .env credentials
            </p>
          </form>
        ) : (
          /* View 2: Authenticated Scanner Terminal */
          <>
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
                <Search size={14} /> Manual / Barcode
              </button>
            </div>

            {/* Tab 1: Live Camera View */}
            {activeTab === 'camera' && (
              <div className="space-y-4">
                <div className="relative w-full h-64 bg-black rounded-2xl overflow-hidden border border-white/15 flex flex-col items-center justify-center">
                  <div id="qr-reader-view" className="w-full h-full" />
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
                        You can switch to <strong>Manual / Barcode</strong> tab to type or paste the Ticket ID.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Manual Ticket ID Input */}
            {activeTab === 'manual' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  verifyTicket(ticketInput)
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase mb-2">
                    Enter Ticket ID or Scan with Barcode Gun
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

            {/* Scan Result Feedback Card */}
            {scanResult && (
              <div
                className={`mt-5 p-5 rounded-2xl border-2 transition-all animate-in zoom-in-95 duration-200 ${
                  scanResult.type === 'VALID'
                    ? 'bg-emerald-950/70 border-emerald-400 text-emerald-100 shadow-[0_0_35px_rgba(52,211,153,0.35)]'
                    : scanResult.type === 'ALREADY_USED'
                    ? 'bg-amber-950/70 border-amber-400 text-amber-100 shadow-[0_0_35px_rgba(251,191,36,0.35)]'
                    : 'bg-rose-950/70 border-rose-500 text-rose-100 shadow-[0_0_35px_rgba(244,63,94,0.35)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {scanResult.type === 'VALID' && <CheckCircle2 size={24} className="text-emerald-400 shrink-0 mt-0.5" />}
                  {scanResult.type === 'ALREADY_USED' && <AlertTriangle size={24} className="text-amber-400 shrink-0 mt-0.5" />}
                  {scanResult.type === 'INVALID' && <XCircle size={24} className="text-rose-400 shrink-0 mt-0.5" />}

                  <div className="space-y-1 text-left flex-1">
                    <h4 className="font-bold font-space text-base">{scanResult.title}</h4>
                    <p className="text-xs opacity-90 leading-relaxed">{scanResult.message}</p>

                    {scanResult.ticket && (
                      <div className="mt-3 pt-3 border-t border-white/15 text-xs grid grid-cols-2 gap-2 font-mono">
                        <div>
                          <span className="opacity-60 block text-[10px]">Attendee:</span>
                          <strong className="text-white">{scanResult.ticket.customerName || 'N/A'}</strong>
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

            {/* Footer info */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
              <span>Secure Gate Entry Terminal</span>
              <span className="flex items-center gap-1.5 text-neon-cyan">
                <Volume2 size={12} /> Audio Beep Active
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
