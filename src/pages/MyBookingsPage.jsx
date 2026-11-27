import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Ticket as TicketIcon,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  RefreshCw,
  Search,
  LogOut,
  ExternalLink,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { useAuth, GoogleIcon } from '../context/AuthContext'
import { API_BASE_URL } from '../config/api'

export default function MyBookingsPage({
  packages = [],
  onOpenBooking,
  onNavigateHome,
  onSelectTicket,
}) {
  const { user, loginWithGoogle, logout } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  const fetchMyTickets = async () => {
    if (!user?.email) {
      setTickets([])
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/tickets/my-tickets?email=${encodeURIComponent(user.email)}`
      )
      const data = await res.json()
      if (data.success && Array.isArray(data.tickets)) {
        setTickets(data.tickets)
      } else {
        setTickets([])
      }
    } catch (err) {
      console.error('My tickets fetch error:', err)
      setError('Could not connect to ticketing database. Please check your network and try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (user?.email) {
      fetchMyTickets()
    }
  }, [user?.email])

  const copyToClipboard = (ticketId) => {
    if (!ticketId) return
    navigator.clipboard?.writeText(ticketId)
    setCopiedId(ticketId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filter tickets by search query
  const filteredTickets = tickets.filter((t) => {
    return (
      !searchQuery ||
      t.ticketId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.attendeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.eventType?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className="w-full font-dm text-[#f8f5ff] selection:bg-neon-pink selection:text-black relative overflow-x-hidden">
      {/* Background Neon Ambiance */}
      <div className="absolute top-20 -left-40 w-96 h-96 bg-neon-pink/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[400px] -right-40 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8 relative z-10">
        {/* Breadcrumb Navigation */}
        <div className="pb-2">
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Festival Landing</span>
          </button>
        </div>
        {/* Title & Introduction */}
        <div className="space-y-2">
          <h1 className="font-bold font-space text-3xl sm:text-5xl text-white tracking-tight">
            MY BOOKED <span className="gradient-text">PASSES</span>.
          </h1>

          <p className="text-white/60 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Manage your festival passes, view digital QR entry stubs, and verify check-in credentials for Saturday, 12 December 2026 at F Lounge by FTV, Shillong.
          </p>
        </div>

        {/* User Authentication Status Card */}
        {!user ? (
          /* Logged Out State Banner */
          <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/15 backdrop-blur-md text-center max-w-2xl mx-auto space-y-5 my-8 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-neon-cyan shadow-inner">
              <TicketIcon size={28} />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-bold font-space text-white">
                Sign in to View Your Booked Passes
              </h2>
              <p className="text-xs sm:text-sm text-white/60 max-w-md mx-auto leading-relaxed">
                Sign in with the Google account you used during ticket booking to instantly retrieve your verified passes, attendee barcodes, and QR code stubs.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={loginWithGoogle}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 text-sm font-semibold text-white transition-all cursor-pointer shadow-lg hover:border-neon-cyan/60"
              >
                <GoogleIcon size={18} />
                <span>Sign in with Google</span>
              </button>
            </div>
          </div>
        ) : (
          /* Logged In User Profile Capsule */
          <div className="p-4 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={user.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-neon-cyan/50"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#07040e]" />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-bold font-space text-base sm:text-lg text-white truncate">
                  {user.name}
                </h2>
                <p className="text-xs text-white/50 font-mono truncate">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
              <button
                type="button"
                onClick={fetchMyTickets}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs border border-white/10 transition-colors cursor-pointer"
                title="Refresh passes"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin text-neon-cyan' : ''} />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs border border-rose-500/30 transition-colors cursor-pointer"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Passes Section (Only if Logged In) */}
        {user && (
          <div className="space-y-6">
            {/* Search Bar */}
            {tickets.length > 0 && (
              <div className="relative max-w-md">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search by ticket ID, attendee name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan transition-colors"
                />
              </div>
            )}

            {/* Passes Content Stream */}
            {loading ? (
              /* Loading State */
              <div className="py-24 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-white/50 font-mono tracking-wide">
                  Loading verified passes from festival server...
                </p>
              </div>
            ) : error ? (
              /* Error State */
              <div className="py-16 text-center space-y-3 bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6">
                <p className="text-xs text-rose-300">{error}</p>
                <button
                  type="button"
                  onClick={fetchMyTickets}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-500/20 text-rose-200 border border-rose-500/30 hover:bg-rose-500/30 transition-colors"
                >
                  Retry Loading
                </button>
              </div>
            ) : filteredTickets.length === 0 ? (
              /* Empty Passes State */
              <div className="py-16 text-center space-y-4 bg-white/[0.02] border border-white/10 rounded-3xl p-8">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/30">
                  <TicketIcon size={28} />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold font-space text-white">
                    {searchQuery ? 'No matching passes found' : 'No Passes Booked Yet'}
                  </h3>
                  <p className="text-xs text-white/50 max-w-sm mx-auto leading-relaxed">
                    {searchQuery
                      ? 'Try clearing your search term or filtering across all passes.'
                      : `No passes have been registered under ${user.email} yet. Book your spot today!`}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onOpenBooking && onOpenBooking('adult')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neon-pink text-black text-xs font-bold font-space uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer"
                  >
                    <span>Book Your Festival Pass</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              /* Passes Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {filteredTickets.map((t) => {
                  const rawStatus = (t.status || '').toUpperCase()
                  const isCancelled = rawStatus.includes('CANCEL') || rawStatus === 'VOID'
                  const isUsed = rawStatus === 'USED'
                  const passType = (t.eventType || 'adult').toLowerCase()

                  const badgeBorder =
                    passType === 'vip'
                      ? 'border-neon-lime/40 bg-neon-lime/15 text-neon-lime'
                      : passType === 'kids'
                      ? 'border-neon-cyan/40 bg-neon-cyan/15 text-neon-cyan'
                      : 'border-neon-pink/40 bg-neon-pink/15 text-neon-pink'

                  const timingText =
                    passType === 'kids' ? '12:00 PM – 7:30 PM' : '8:00 PM Onwards'

                  return (
                    <div
                      key={t.ticketId}
                      className={`group relative rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-5 overflow-hidden shadow-xl transition-all duration-200 ${
                        isCancelled
                          ? 'bg-[#120716]/90 border border-rose-500/30'
                          : 'bg-[#0c0719]/90 border border-white/15 hover:border-white/30'
                      }`}
                    >
                      {/* Top Pass Badges & Status */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-space uppercase tracking-wider border ${badgeBorder}`}
                          >
                            {t.eventType} Pass
                          </span>

                          {isCancelled ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              <XCircle size={12} />
                              <span>Cancelled</span>
                            </span>
                          ) : isUsed ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 size={12} />
                              <span>Checked-In</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                              <span>Valid Pass</span>
                            </span>
                          )}
                        </div>

                        {/* Attendee Name & Ticket ID */}
                        <div className="space-y-1">
                          <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                            Official Pass ID
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base sm:text-lg font-bold text-white tracking-wide">
                              {t.ticketId}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(t.ticketId)}
                              className="p-1 rounded bg-white/5 hover:bg-white/15 text-white/50 hover:text-white transition-colors cursor-pointer"
                              title="Copy Ticket ID"
                            >
                              {copiedId === t.ticketId ? (
                                <Check size={13} className="text-emerald-400" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>
                          <p className="text-xs font-semibold text-white/90">
                            {t.customerName || t.attendeeName || user?.name || 'Festival Guest'}
                          </p>
                        </div>

                        {/* Event Details Grid */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[11px] text-white/60">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-neon-pink shrink-0" />
                            <span>12 Dec 2026</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={13} className="text-neon-cyan shrink-0" />
                            <span>{timingText}</span>
                          </div>
                          <div className="flex items-center gap-1.5 col-span-2">
                            <MapPin size={13} className="text-neon-lime shrink-0" />
                            <span className="truncate">F Lounge by FTV, Shillong</span>
                          </div>
                        </div>

                        {/* Financial and Quantity Summary */}
                        <div className="flex items-center justify-between text-xs pt-1 text-white/50 font-mono">
                          <div className="flex items-center gap-2">
                            <span>
                              {t.quantity || 1} {t.quantity > 1 ? 'Attendees' : 'Attendee'}
                            </span>
                            {t.createdAt && (
                              <>
                                <span>•</span>
                                <span className="text-[10px] text-white/40">
                                  {new Date(t.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                  })}
                                </span>
                              </>
                            )}
                          </div>
                          <span className="font-bold text-white text-sm">
                            ₹{(t.amountPaid || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectTicket && onSelectTicket(t)}
                          className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs font-space uppercase tracking-wider transition-all cursor-pointer shadow-lg ${
                            isCancelled
                              ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 shadow-rose-500/10'
                              : 'bg-neon-cyan text-black hover:bg-neon-cyan/90 shadow-neon-cyan/15'
                          }`}
                        >
                          <QrCode size={15} />
                          <span>{isCancelled ? 'View Cancelled Pass' : 'View Pass & QR'}</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Support & Contact Help Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck size={16} className="text-neon-cyan" />
              <span>Need Help with Your Event Passes?</span>
            </h3>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Facing any issues at venue entry or need to update your guest details? Contact our on-ground festival helpline.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://wa.me/918256985382"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors"
            >
              WhatsApp Support
            </a>
            <a
              href="mailto:vibeshillong@gmail.com"
              className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-medium transition-colors"
            >
              Email Us
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
