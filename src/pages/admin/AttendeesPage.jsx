import { useState, useEffect } from 'react'
import {
  Search,
  Clock,
  CheckCircle2,
  Calendar,
  CreditCard,
  QrCode,
  X,
  ArrowRight,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Ticket as TicketIcon,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  ChevronDown,
  Copy,
  Check,
  Trash2,
} from 'lucide-react'
import TicketModal from '../../components/TicketModal'
import Pagination from '../../components/admin/Pagination'
import DateFilter, { matchesDateFilter } from '../../components/admin/DateFilter'
import { useDebounce } from '../../hooks/useDebounce'
import { API_BASE_URL } from '../../config/api'
import { DEFAULT_PACKAGES } from '../../constants/packages'

export default function AttendeesPage({
  ticketsList: propTickets = [],
  onRefreshTickets,
  loading: propLoading = false,
}) {
  const [localTickets, setLocalTickets] = useState([])
  const [packages, setPackages] = useState(DEFAULT_PACKAGES)
  const [internalLoading, setInternalLoading] = useState(false)
  const [attendeeFilter, setAttendeeFilter] = useState('all') // 'all' | 'USED' | 'VALID' | 'CANCELLED'
  const [passFilter, setPassFilter] = useState('all')
  const [datePreset, setDatePreset] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [previewTicket, setPreviewTicket] = useState(null)
  const [copiedId, setCopiedId] = useState('')

  // Delete Ticket State
  const [ticketToDelete, setTicketToDelete] = useState(null)
  const [isDeletingTicket, setIsDeletingTicket] = useState(false)

  const copyToClipboard = (text, key) => {
    if (!text) return
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
      } else {
        const el = document.createElement('textarea')
        el.value = text
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
      }
      setCopiedId(key)
      setTimeout(() => setCopiedId(''), 2000)
    } catch (err) {
      console.error('Failed to copy ticket ID:', err)
    }
  }

  // 300ms Debounce for instant, lag-free search filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Keep localTickets in sync when parent prop updates
  useEffect(() => {
    if (Array.isArray(propTickets) && propTickets.length > 0) {
      setLocalTickets(propTickets)
    }
  }, [propTickets])

  // Automatically fetch live real-time tickets and packages from MongoDB
  useEffect(() => {
    handleRefresh()
    fetch(`${API_BASE_URL}/api/packages`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.packages) && data.packages.length > 0) {
          setPackages(data.packages)
        }
      })
      .catch((err) => console.error('Error fetching packages in attendees:', err))
  }, [])

  const ticketsList = localTickets.length > 0 ? localTickets : propTickets
  const isRefreshing = propLoading || internalLoading

  const handleRefresh = async () => {
    setInternalLoading(true)
    try {
      if (onRefreshTickets) {
        await onRefreshTickets()
      }
      const res = await fetch(`${API_BASE_URL}/api/tickets`)
      const data = await res.json()
      if (data.success && Array.isArray(data.tickets)) {
        setLocalTickets(data.tickets)
      }
    } catch (err) {
      console.error('Refresh booked tickets error:', err)
    } finally {
      setInternalLoading(false)
    }
  }

  // Delete Booked Ticket
  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return
    setIsDeletingTicket(true)
    try {
      const id = ticketToDelete._id || ticketToDelete.ticketId
      const res = await fetch(`${API_BASE_URL}/api/tickets/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setLocalTickets((prev) =>
          prev.filter((t) => t._id !== ticketToDelete._id && t.ticketId !== ticketToDelete.ticketId)
        )
        if (
          selectedTicket &&
          (selectedTicket._id === ticketToDelete._id || selectedTicket.ticketId === ticketToDelete.ticketId)
        ) {
          setSelectedTicket(null)
        }
        setTicketToDelete(null)
      } else {
        alert(data.message || 'Error deleting ticket.')
      }
    } catch (err) {
      alert('Delete failed: ' + err.message)
    } finally {
      setIsDeletingTicket(false)
    }
  }

  // Export Booked Tickets to CSV
  const handleExportCSV = () => {
    if (ticketsList.length === 0) {
      alert('No booked tickets to export.')
      return
    }

    const headers = [
      'Ticket ID',
      'Attendee Name',
      'Phone',
      'Email',
      'Pass Type',
      'Quantity',
      'Amount Paid',
      'Coupon Code',
      'Discount',
      'Payment Mode',
      'Status',
      'Booked Date',
      'Booked Time',
      'Check-In Status',
      'Check-In Time',
    ]

    const rows = filteredAttendees.map((t) => {
      const bookedDt = formatDateTime(t.createdAt)
      const checkInDt = formatDateTime(t.scannedAt)
      return [
        t.ticketId,
        `"${(t.customerName || '').replace(/"/g, '""')}"`,
        `"${t.customerPhone || ''}"`,
        `"${t.customerEmail || ''}"`,
        t.eventType || '',
        t.quantity || 1,
        t.amountPaid || 0,
        t.couponCode || '',
        t.discountAmount || 0,
        t.paymentMode || '',
        t.status || 'VALID',
        bookedDt?.date || '',
        bookedDt?.time || '',
        t.status === 'USED' ? 'Checked-In' : t.status === 'CANCELLED' ? 'Cancelled/Refunded' : 'Pending',
        checkInDt ? `${checkInDt.date} ${checkInDt.time}` : '',
      ]
    })

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `VIBE_booked_tickets_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalSold = ticketsList.length
  const totalScanned = ticketsList.filter((t) => t.status === 'USED').length
  const totalCancelled = ticketsList.filter((t) => t.status === 'CANCELLED').length
  const totalPending = ticketsList.filter((t) => t.status === 'VALID').length

  const filteredAttendees = ticketsList.filter((t) => {
    const matchesFilter =
      attendeeFilter === 'all' ? true : t.status === attendeeFilter
    const matchesPass =
      passFilter === 'all' ? true : t.eventType?.toLowerCase() === passFilter?.toLowerCase()
    const q = debouncedSearchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      (t.customerName || '').toLowerCase().includes(q) ||
      (t.ticketId || '').toLowerCase().includes(q) ||
      (t.customerPhone || '').includes(q) ||
      (t.customerEmail || '').toLowerCase().includes(q)
    const matchesDate = matchesDateFilter(t.createdAt, datePreset, startDate, endDate)
    return matchesFilter && matchesPass && matchesSearch && matchesDate
  })

  // Automatically reset to page 1 whenever search query, filter, date range, or page size changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery, attendeeFilter, passFilter, pageSize, datePreset, startDate, endDate])

  // Paginated slice
  const paginatedAttendees = filteredAttendees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Format Date and Time helper
  const formatDateTime = (dateString) => {
    if (!dateString) return null
    try {
      const d = new Date(dateString)
      if (isNaN(d.getTime())) return null
      return {
        date: d.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        time: d.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      }
    } catch {
      return null
    }
  }

  return (
    <div className="bg-[#0f091f] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="font-bold font-space text-lg text-white">Attendee Directory & Timeline</h3>
          <p className="text-xs text-white/50 mt-0.5">
            Audit trail of ticket booking, payment mode, and gate check-in timestamps
          </p>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search name, phone, ticket ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-44 sm:w-56 pl-8 pr-7 bg-black/50 border border-white/15 rounded-lg text-xs text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                title="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Compact Pass Status Filter Dropdown */}
          <div className="relative">
            <select
              value={attendeeFilter}
              onChange={(e) => setAttendeeFilter(e.target.value)}
              className="h-9 appearance-none pl-3 pr-7 bg-black/60 border border-white/15 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-neon-cyan cursor-pointer hover:bg-white/5 transition-all"
            >
              <option value="all" className="bg-[#0f091f] text-white">All Status ({totalSold})</option>
              <option value="USED" className="bg-[#0f091f] text-emerald-300">Checked-In ({totalScanned})</option>
              <option value="VALID" className="bg-[#0f091f] text-amber-300">Valid / Pending ({totalPending})</option>
              <option value="CANCELLED" className="bg-[#0f091f] text-red-300">Refunded ({totalCancelled})</option>
            </select>
            <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
          </div>

          {/* Dynamic Pass Type Filter */}
          <div className="relative">
            <select
              value={passFilter}
              onChange={(e) => setPassFilter(e.target.value)}
              className="h-9 appearance-none pl-3 pr-7 bg-black/60 border border-white/15 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-neon-cyan cursor-pointer hover:bg-white/5 transition-all"
            >
              <option value="all" className="bg-[#0f091f] text-white">All Passes</option>
              {packages.map((pkg) => (
                <option key={pkg.key || pkg._id} value={pkg.key} className="bg-[#0f091f] text-white">
                  {pkg.title || pkg.key}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
          </div>

          {/* Date Filter */}
          <DateFilter
            datePreset={datePreset}
            setDatePreset={setDatePreset}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 shrink-0"
            title="Refresh Booked Tickets"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-neon-cyan' : ''} />
          </button>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="h-9 px-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
            title="Export Booked Tickets to CSV"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Roster Table with Booking & Check-In Timelines */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider font-bold">
              <th className="py-3 px-4">Ticket ID</th>
              <th className="py-3 px-4">Attendee</th>
              <th className="py-3 px-4">Pass & Mode</th>
              <th className="py-3 px-4">Booked Date & Time</th>
              <th className="py-3 px-4">Check-In Status & Time</th>
              <th className="py-3 px-4 text-right">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isRefreshing && filteredAttendees.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-white/50 font-mono">
                  <RefreshCw size={18} className="animate-spin inline-block mr-2 text-neon-cyan" />
                  Loading real-time booked passes from database...
                </td>
              </tr>
            ) : filteredAttendees.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-white/40">
                  No matching records found.
                </td>
              </tr>
            ) : (
              paginatedAttendees.map((t) => {
                const bookedDt = formatDateTime(t.createdAt)
                const checkInDt = formatDateTime(t.scannedAt)

                return (
                  <tr
                    key={t.ticketId}
                    onClick={() => setSelectedTicket(t)}
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    {/* Ticket ID */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="font-bold text-neon-cyan select-all">
                          {t.ticketId}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            copyToClipboard(t.ticketId, t.ticketId)
                          }}
                          className="p-1 rounded-md hover:bg-white/10 text-white/40 hover:text-neon-cyan transition-colors cursor-pointer"
                          title={copiedId === t.ticketId ? 'Copied to clipboard!' : 'Copy Ticket ID'}
                        >
                          {copiedId === t.ticketId ? (
                            <Check size={13} className="text-emerald-400 animate-in zoom-in-75" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Attendee Info */}
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div>{t.customerName}</div>
                      <div className="text-[11px] font-normal text-white/50">{t.customerPhone}</div>
                    </td>

                    {/* Pass Type & Payment Mode */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white capitalize">
                        {packages.find((p) => p.key?.toLowerCase() === t.eventType?.toLowerCase())?.title ||
                          t.eventTitle ||
                          `${(t.eventType || 'adult').replace(/[_-]+/g, ' ')} Pass`}
                      </div>
                      <div className="text-[10px] text-neon-pink font-semibold flex items-center gap-1">
                        <CreditCard size={11} />
                        <span>{t.paymentMode || 'Online UPI'} • ₹{t.amountPaid}</span>
                      </div>
                      {t.couponCode && (
                        <div className="text-[10px] text-emerald-400 font-mono font-bold mt-0.5 flex items-center gap-1">
                          <span>🏷️ {t.couponCode}</span>
                          <span className="text-white/40">(-₹{t.discountAmount})</span>
                        </div>
                      )}
                    </td>

                    {/* Booked Date & Time */}
                    <td className="py-3.5 px-4">
                      {bookedDt ? (
                        <div>
                          <div className="text-white font-medium">{bookedDt.date}</div>
                          <div className="text-[11px] text-white/50 font-mono">{bookedDt.time}</div>
                        </div>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </td>

                    {/* Check-In Date & Time / Status */}
                    <td className="py-3.5 px-4">
                      {t.status === 'USED' && checkInDt ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-1">
                            <CheckCircle2 size={11} /> CHECKED-IN
                          </span>
                          <div className="text-[11px] text-emerald-200/80 font-mono">
                            {checkInDt.date} at {checkInDt.time}
                          </div>
                        </div>
                      ) : t.status === 'CANCELLED' ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 mb-0.5">
                            <XCircle size={11} /> CANCELLED / REFUNDED
                          </span>
                          <div className="text-[10px] text-red-300/70 font-mono">
                            {t.cancellationReason || 'Gate Entry Blocked'}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-0.5">
                            <Clock size={11} /> PENDING ENTRY
                          </span>
                          <div className="text-[10px] text-white/40">Awaiting at gate</div>
                        </div>
                      )}
                    </td>

                    {/* Action Buttons: View Ticket & Timeline */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewTicket(t)
                          }}
                          className="px-3 py-1.5 rounded-lg bg-neon-pink/15 hover:bg-neon-pink/25 border border-neon-pink/30 text-neon-pink text-[11px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <TicketIcon size={12} />
                          <span>View Ticket</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTicket(t)
                          }}
                          className="px-3 py-1.5 rounded-lg bg-neon-cyan/15 hover:bg-neon-cyan/25 border border-neon-cyan/30 text-neon-cyan text-[11px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          Timeline <ArrowRight size={11} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setTicketToDelete(t)
                          }}
                          className="p-1.5 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Ticket"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredAttendees.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredAttendees.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      )}

      {/* INTERACTIVE TIMELINE MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto no-scrollbar">
          <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[#0d071a] border border-white/20 rounded-3xl p-6 sm:p-8 text-white my-auto no-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <span className="text-[10px] text-neon-cyan uppercase font-bold tracking-widest block">
                  Complete Verification Audit
                </span>
                <h3 className="font-bold font-space text-xl text-white">
                  Ticket Lifecycle Timeline
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                aria-label="Close modal"
                className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Attendee Snapshot */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 grid grid-cols-2 gap-3 mb-6 text-xs">
              <div>
                <span className="text-[10px] text-white/40 uppercase block">Attendee</span>
                <strong className="text-white text-sm">{selectedTicket.customerName}</strong>
                <div className="text-[11px] text-white/60">{selectedTicket.customerPhone}</div>
              </div>
              <div>
                <span className="text-[10px] text-white/40 uppercase block">Ticket ID</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <strong className="text-neon-cyan font-mono text-sm select-all">
                    {selectedTicket.ticketId}
                  </strong>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedTicket.ticketId, `modal_${selectedTicket.ticketId}`)}
                    className="p-1 rounded-md hover:bg-white/10 text-white/40 hover:text-neon-cyan transition-colors cursor-pointer"
                    title={copiedId === `modal_${selectedTicket.ticketId}` ? 'Copied!' : 'Copy Ticket ID'}
                  >
                    {copiedId === `modal_${selectedTicket.ticketId}` ? (
                      <Check size={13} className="text-emerald-400" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>
                <div className="text-[11px] text-neon-pink capitalize font-semibold">
                  {selectedTicket.eventTitle ||
                    packages.find((p) => p.key?.toLowerCase() === selectedTicket.eventType?.toLowerCase())?.title ||
                    `${(selectedTicket.eventType || 'adult').replace(/[_-]+/g, ' ')} Pass`}{' '}
                  • ₹{selectedTicket.amountPaid}
                </div>
              </div>
            </div>

            {/* Vertical Stepper Timeline */}
            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/15 pl-10 text-xs">
              {/* Event Schedule Info */}
              <div className="relative">
                <span className="absolute -left-10 top-0.5 w-8 h-8 rounded-full bg-[#180f2e] border-2 border-neon-pink text-neon-pink grid place-items-center">
                  <Calendar size={14} />
                </span>
                <div>
                  <h4 className="font-bold text-white text-sm">Festival Event Date</h4>
                  <p className="text-white/70">Saturday, 12 December 2026</p>
                  <p className="text-[11px] text-neon-cyan">Venue: F Lounge by FTV</p>
                </div>
              </div>

              {/* Step 1: Ticket Booked */}
              <div className="relative">
                <span className="absolute -left-10 top-0.5 w-8 h-8 rounded-full bg-[#180f2e] border-2 border-emerald-400 text-emerald-400 grid place-items-center">
                  <CreditCard size={14} />
                </span>
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span>Ticket Booked & Payment Confirmed</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">
                      SUCCESS
                    </span>
                  </h4>
                  {formatDateTime(selectedTicket.createdAt) ? (
                    <p className="text-white/80 font-mono">
                      📅 Date: {formatDateTime(selectedTicket.createdAt).date} at{' '}
                      {formatDateTime(selectedTicket.createdAt).time}
                    </p>
                  ) : (
                    <p className="text-white/60">Booking timestamp recorded</p>
                  )}
                  <p className="text-[11px] text-white/60">
                    💳 Payment Mode: <strong className="text-white">{selectedTicket.paymentMode || 'Online UPI'}</strong>
                  </p>
                  <p className="text-[11px] text-white/50 font-mono">
                    Ref ID: {selectedTicket.paymentId || 'PAY_OFFLINE'}
                  </p>
                </div>
              </div>

              {/* Step 2: Digital QR Pass Issued */}
              <div className="relative">
                <span className="absolute -left-10 top-0.5 w-8 h-8 rounded-full bg-[#180f2e] border-2 border-neon-cyan text-neon-cyan grid place-items-center">
                  <QrCode size={14} />
                </span>
                <div>
                  <h4 className="font-bold text-white text-sm">Digital QR E-Pass Generated</h4>
                  <p className="text-white/70">
                    Unique encrypted QR token issued to attendee mobile for gate scanning.
                  </p>
                </div>
              </div>

              {/* Step 3: Gate Check-In & Entry */}
              <div className="relative">
                <span
                  className={`absolute -left-10 top-0.5 w-8 h-8 rounded-full grid place-items-center ${
                    selectedTicket.status === 'USED'
                      ? 'bg-emerald-950 border-2 border-emerald-400 text-emerald-400'
                      : selectedTicket.status === 'CANCELLED'
                      ? 'bg-red-950 border-2 border-red-400 text-red-400'
                      : 'bg-amber-950 border-2 border-amber-400 text-amber-400'
                  }`}
                >
                  {selectedTicket.status === 'USED' ? (
                    <CheckCircle2 size={16} />
                  ) : selectedTicket.status === 'CANCELLED' ? (
                    <XCircle size={16} />
                  ) : (
                    <Clock size={16} />
                  )}
                </span>
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span>Gate Check-In & Entry</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedTicket.status === 'USED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : selectedTicket.status === 'CANCELLED'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {selectedTicket.status === 'USED'
                        ? 'CHECKED-IN'
                        : selectedTicket.status === 'CANCELLED'
                        ? 'CANCELLED / REFUNDED'
                        : 'PENDING'}
                    </span>
                  </h4>
                  {selectedTicket.status === 'USED' && formatDateTime(selectedTicket.scannedAt) ? (
                    <>
                      <p className="text-emerald-300 font-mono">
                        ⏰ Check-In Time: {formatDateTime(selectedTicket.scannedAt).date} at{' '}
                        {formatDateTime(selectedTicket.scannedAt).time}
                      </p>
                      <p className="text-[11px] text-white/50">
                        Gate Officer: {selectedTicket.scannedBy || 'Gate 1 Scanner'}
                      </p>
                    </>
                  ) : selectedTicket.status === 'CANCELLED' ? (
                    <p className="text-red-300 text-xs">
                      ⚠️ Ticket Pass Cancelled: {selectedTicket.cancellationReason || 'Refund processed. Entry is blocked at gate.'}
                    </p>
                  ) : (
                    <p className="text-amber-200/80">
                      Attendee has not checked in at the gate yet. Awaiting QR code scan at F Lounge by FTV.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setTicketToDelete(selectedTicket)}
                className="h-10 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Trash2 size={13} className="shrink-0" />
                <span>Delete Ticket</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="h-10 px-5 rounded-xl bg-neon-cyan text-[#071016] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer flex items-center justify-center whitespace-nowrap"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Visual Ticket Modal for Admin */}
      <TicketModal
        isOpen={Boolean(previewTicket)}
        ticket={previewTicket}
        onClose={() => setPreviewTicket(null)}
      />

      {/* CONFIRM DELETE TICKET MODAL */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0f091f] border border-rose-500/30 rounded-2xl p-6 text-white shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-white">Delete Booked Ticket?</h4>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Are you sure you want to permanently delete ticket{' '}
                  <strong className="text-white font-mono">{ticketToDelete.ticketId}</strong> for{' '}
                  <strong className="text-white">{ticketToDelete.customerName}</strong>?
                  This will revoke their entry and remove all ticket records.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                disabled={isDeletingTicket}
                onClick={() => setTicketToDelete(null)}
                className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingTicket}
                onClick={handleDeleteTicket}
                className="h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-lg shadow-rose-900/30 whitespace-nowrap"
              >
                {isDeletingTicket ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
