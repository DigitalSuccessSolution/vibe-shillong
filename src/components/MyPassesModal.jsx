import { useState, useEffect } from 'react'
import { Ticket as TicketIcon, Calendar, CheckCircle2, Clock, X, Download, ExternalLink, QrCode } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../config/api'

export default function MyPassesModal({ isOpen, onClose, onSelectTicket, onOpenBooking }) {
  const { user, logout } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen || !user?.email) return

    setLoading(true)
    setError('')

    fetch(`${API_BASE_URL}/api/tickets/my-tickets?email=${encodeURIComponent(user.email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.tickets)) {
          setTickets(data.tickets)
        } else {
          setTickets([])
        }
      })
      .catch((err) => {
        console.error('My tickets fetch error:', err)
        setError('Could not connect to ticketing database.')
      })
      .finally(() => setLoading(false))
  }, [isOpen, user?.email])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-[#0c0719] border border-white/20 rounded-3xl p-6 sm:p-7 flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={user?.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Guest'}`}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-bold font-space text-base sm:text-lg text-white leading-tight">
                {user?.name || 'Festival Guest'}
              </h3>
              <p className="text-[11px] text-white/50 font-mono">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                logout()
                onClose()
              }}
              className="text-[11px] px-2.5 py-1 rounded-md bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 text-white/60 border border-white/10 transition-colors cursor-pointer"
            >
              Sign out
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="pt-4 pb-2 shrink-0 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider font-space">
            My Booked Passes ({tickets.length})
          </span>
          <span className="text-[10px] text-white/40 font-mono">
            Event: Sat, 12 Dec 2026
          </span>
        </div>

        {/* Scrollable Passes List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-2">
          {loading ? (
            <div className="py-16 text-center text-white/40 space-y-2">
              <div className="w-6 h-6 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Fetching your passes...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-rose-400 text-xs">
              {error}
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-14 text-center text-white/40 space-y-3">
              <TicketIcon size={36} className="mx-auto text-white/20" />
              <div>
                <p className="text-sm font-medium text-white/70">No Passes Found</p>
                <p className="text-xs text-white/40 mt-1 max-w-xs mx-auto">
                  You haven't booked any passes with {user?.email} yet.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  if (onOpenBooking) onOpenBooking('adult')
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neon-pink text-black text-xs font-bold font-space uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer"
              >
                Book Pass Now
              </button>
            </div>
          ) : (
            tickets.map((t) => {
              const isUsed = t.status === 'USED'
              const passType = (t.eventType || 'adult').toLowerCase()
              const badgeColor =
                passType === 'vip'
                  ? 'bg-neon-lime/20 text-neon-lime border-neon-lime/40'
                  : passType === 'kids'
                  ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/40'
                  : 'bg-neon-pink/20 text-neon-pink border-neon-pink/40'

              return (
                <div
                  key={t.ticketId}
                  className="p-4 rounded-2xl bg-black/50 border border-white/10 hover:border-white/25 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${badgeColor}`}>
                        {t.eventType} Pass
                      </span>
                      {isUsed ? (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={11} /> Checked-In
                        </span>
                      ) : (
                        <span className="text-[10px] text-neon-cyan flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" /> Valid Pass
                        </span>
                      )}
                    </div>

                    <div className="font-mono text-sm font-bold text-white">
                      {t.ticketId}
                    </div>

                    <div className="text-[11px] text-white/50 flex items-center gap-2">
                      <span>₹{t.amountPaid}</span>
                      <span>•</span>
                      <span>{t.quantity || 1} {t.quantity > 1 ? 'Attendees' : 'Attendee'}</span>
                      {t.createdAt && (
                        <>
                          <span>•</span>
                          <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      if (onSelectTicket) onSelectTicket(t)
                    }}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-all cursor-pointer shrink-0"
                  >
                    <QrCode size={14} className="text-neon-cyan" />
                    <span>View Pass & QR</span>
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
