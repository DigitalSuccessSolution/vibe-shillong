import { useState, useEffect } from 'react'
import { Search, Download, CheckCircle2, Copy, Check, RefreshCw, Plus, XCircle, AlertTriangle, X, ChevronDown } from 'lucide-react'
import Pagination from '../../components/admin/Pagination'
import DateFilter, { matchesDateFilter } from '../../components/admin/DateFilter'
import { useDebounce } from '../../hooks/useDebounce'
import { API_BASE_URL } from '../../config/api'

export default function TransactionsPage({ ticketsList: propTickets = [] }) {
  const [transactionsList, setTransactionsList] = useState([])
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalRefunded: 0,
    failedCount: 0,
  })
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
  const [passFilter, setPassFilter] = useState('all')
  const [datePreset, setDatePreset] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedTx, setSelectedTx] = useState(null)
  const [copiedId, setCopiedId] = useState('')

  // 300ms Search Debounce
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Modal: Add / Record Counter Payment
  const [isAddingOffline, setIsAddingOffline] = useState(false)
  const [isSubmittingOffline, setIsSubmittingOffline] = useState(false)
  const [isRefunding, setIsRefunding] = useState(false)
  const [offlineForm, setOfflineForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    eventType: '',
    quantity: 1,
    paymentMode: 'Cash at Counter',
  })

  // Fetch real-time transactions from MongoDB Transaction Collection
  const fetchLiveTransactions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/transactions`)
      const data = await res.json()
      if (data.success && Array.isArray(data.transactions)) {
        setTransactionsList(data.transactions)
        if (data.metrics) setMetrics(data.metrics)
      } else {
        // Fallback to /api/tickets if /api/transactions is warming up
        const ticketRes = await fetch(`${API_BASE_URL}/api/tickets`)
        const ticketData = await ticketRes.json()
        if (ticketData.success && Array.isArray(ticketData.tickets)) {
          const mapped = ticketData.tickets.map((t) => ({
            transactionId: t.paymentId || `PAY_${t.ticketId}`,
            orderId: t.orderId || '',
            ticketId: t.ticketId,
            customerName: t.customerName,
            customerPhone: t.customerPhone,
            customerEmail: t.customerEmail,
            eventType: t.eventType,
            amount: t.amountPaid,
            paymentMode: t.paymentMode || 'Online UPI',
            status: t.status === 'CANCELLED' ? 'REFUNDED' : 'SUCCESS',
            createdAt: t.createdAt,
          }))
          setTransactionsList(mapped)
        }
      }
    } catch (err) {
      console.error('Error fetching live transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch dynamic packages from MongoDB
  const fetchDynamicPackages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/packages`)
      const data = await res.json()
      if (data.success && Array.isArray(data.packages)) {
        setPackages(data.packages)
        if (!offlineForm.eventType && data.packages.length > 0) {
          setOfflineForm((prev) => ({ ...prev, eventType: data.packages[0].key }))
        }
      }
    } catch (err) {
      console.error('Error fetching packages:', err)
    }
  }

  useEffect(() => {
    fetchLiveTransactions()
    fetchDynamicPackages()
  }, [])

  // Filtered transactions
  const filteredTransactions = transactionsList.filter((t) => {
    const matchesPass = passFilter === 'all' ? true : t.eventType === passFilter
    const matchesStatus = statusFilter === 'all' ? true : t.status === statusFilter
    const q = debouncedSearchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      (t.transactionId || '').toLowerCase().includes(q) ||
      (t.orderId || '').toLowerCase().includes(q) ||
      (t.ticketId || '').toLowerCase().includes(q) ||
      (t.customerName || '').toLowerCase().includes(q) ||
      (t.customerPhone || '').includes(q) ||
      (t.customerEmail || '').toLowerCase().includes(q)
    const matchesDate = matchesDateFilter(t.createdAt, datePreset, startDate, endDate)

    return matchesPass && matchesStatus && matchesSearch && matchesDate
  })

  // Reset to page 1 on filter, search, date range, or page size change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery, statusFilter, passFilter, pageSize, datePreset, startDate, endDate])

  // Paginated slice
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Format Date and Time
  const formatDateTime = (dateString) => {
    if (!dateString) return { date: '—', time: '—' }
    try {
      const d = new Date(dateString)
      if (isNaN(d.getTime())) return { date: '—', time: '—' }
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
      return { date: '—', time: '—' }
    }
  }

  // Copy to clipboard helper
  const handleCopy = (text, id) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(''), 2000)
  }

  // Handle Record Counter Ticket (Database direct)
  const handleRecordOfflinePayment = async (e) => {
    e.preventDefault()
    setIsSubmittingOffline(true)

    const selectedPkg = packages.find((p) => p.key === offlineForm.eventType) || packages[0]
    const unitPrice = Number(selectedPkg?.price) || 0
    const totalAmount = unitPrice * (Number(offlineForm.quantity) || 1)

    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: offlineForm.customerName.trim(),
          customerPhone: offlineForm.customerPhone.trim(),
          customerEmail: offlineForm.customerEmail.trim(),
          eventType: offlineForm.eventType,
          quantity: Number(offlineForm.quantity) || 1,
          amountPaid: totalAmount,
          paymentMode: offlineForm.paymentMode,
          paymentId: `COUNTER_${Date.now()}`,
        }),
      })

      const data = await res.json()
      if (data.success) {
        fetchLiveTransactions()
        setIsAddingOffline(false)
        setOfflineForm({
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          eventType: packages[0]?.key || '',
          quantity: 1,
          paymentMode: 'Cash at Counter',
        })
      } else {
        alert(data.message || 'Error recording offline transaction.')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setIsSubmittingOffline(false)
    }
  }

  // Handle Refund & Ticket Invalidation
  const handleRefundTransaction = async (txId) => {
    if (!window.confirm('Are you sure you want to refund this transaction? The attendee ticket will be immediately cancelled at the gate.')) return
    setIsRefunding(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/transactions/${txId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refundReason: 'Initiated from Admin Panel' }),
      })
      const data = await res.json()
      if (data.success) {
        alert(data.message)
        await fetchLiveTransactions()
        setSelectedTx(null)
      } else {
        alert(data.message || 'Refund processing failed.')
      }
    } catch (err) {
      alert('Refund error: ' + err.message)
    } finally {
      setIsRefunding(false)
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    if (transactionsList.length === 0) {
      alert('No transactions to export.')
      return
    }

    const headers = [
      'Transaction Date',
      'Time',
      'Transaction ID',
      'Razorpay Order ID',
      'Ticket ID',
      'Customer Name',
      'Phone',
      'Email',
      'Pass Type',
      'Quantity',
      'Amount (INR)',
      'Coupon Code',
      'Discount (INR)',
      'Payment Mode',
      'Status',
      'Failure / Refund Note',
    ]

    const rows = filteredTransactions.map((t) => {
      const dt = formatDateTime(t.createdAt)
      return [
        dt.date,
        dt.time,
        t.transactionId || '',
        t.orderId || '',
        t.ticketId || '',
        `"${(t.customerName || '').replace(/"/g, '""')}"`,
        t.customerPhone || '',
        t.customerEmail || '',
        t.eventType || '',
        t.quantity || 1,
        t.amount || 0,
        t.couponCode || '',
        t.discountAmount || 0,
        t.paymentMode || 'Online UPI',
        t.status || 'SUCCESS',
        `"${(t.failureReason || (t.refundAmount ? `Refund: ₹${t.refundAmount}` : '') || '').replace(/"/g, '""')}"`,
      ]
    })

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `VIBE_transactions_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 w-full">
      {/* 4 Live Metric Cards from MongoDB Transaction Model */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-[#0f091f] border border-white/10 rounded-2xl p-5">
          <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold block mb-1">
            Total Revenue Collected
          </span>
          <div className="font-space font-bold text-2xl sm:text-3xl text-emerald-400">
            ₹{metrics.totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-white/40 mt-1 block">Live settled payments in database</span>
        </div>

        {/* Paid Orders */}
        <div className="bg-[#0f091f] border border-white/10 rounded-2xl p-5">
          <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold block mb-1">
            Paid Successful Orders
          </span>
          <div className="font-space font-bold text-2xl sm:text-3xl text-white">
            {metrics.totalOrders}
          </div>
          <span className="text-[11px] text-white/40 mt-1 block">Verified booking transactions</span>
        </div>

        {/* Refunded */}
        <div className="bg-[#0f091f] border border-white/10 rounded-2xl p-5">
          <span className="text-[10px] text-amber-400/80 uppercase tracking-wider font-bold block mb-1">
            Total Refunded
          </span>
          <div className="font-space font-bold text-2xl sm:text-3xl text-amber-300">
            ₹{metrics.totalRefunded.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-white/40 mt-1 block">Reversed / Cancelled passes</span>
        </div>

        {/* Failed Attempts */}
        <div className="bg-[#0f091f] border border-white/10 rounded-2xl p-5">
          <span className="text-[10px] text-red-400/80 uppercase tracking-wider font-bold block mb-1">
            Failed Gateway Attempts
          </span>
          <div className="font-space font-bold text-2xl sm:text-3xl text-red-400">
            {metrics.failedCount}
          </div>
          <span className="text-[11px] text-white/40 mt-1 block">Declined / Bank errors</span>
        </div>
      </div>

      {/* Main Ledger Card */}
      <div className="bg-[#0f091f] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-bold font-space text-lg text-white">Payment Transactions & Orders</h3>
            <p className="text-xs text-white/50 mt-0.5">
              Dedicated MongoDB Transaction Model • {transactionsList.length} total transaction records
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search ID, Order, Name, Phone..."
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

            {/* Compact Status Filter Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 appearance-none pl-3 pr-7 bg-black/60 border border-white/15 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-neon-cyan cursor-pointer hover:bg-white/5 transition-all"
              >
                <option value="all" className="bg-[#0f091f] text-white">All Status</option>
                <option value="SUCCESS" className="bg-[#0f091f] text-emerald-300">Paid</option>
                <option value="REFUNDED" className="bg-[#0f091f] text-amber-300">Refunded</option>
                <option value="FAILED" className="bg-[#0f091f] text-red-300">Failed</option>
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

            {/* Refresh Live Data */}
            <button
              type="button"
              onClick={fetchLiveTransactions}
              disabled={loading}
              className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 shrink-0"
              title="Refresh live data from database"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-neon-cyan' : ''} />
            </button>

            {/* Record Counter Payment Button */}
            <button
              type="button"
              onClick={() => setIsAddingOffline(true)}
              className="h-9 px-3 rounded-lg bg-neon-pink text-[#080612] font-bold text-xs uppercase tracking-wider hover:opacity-90 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus size={13} /> Record Counter Sale
            </button>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="h-9 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/10 whitespace-nowrap shrink-0"
              title="Download full transaction spreadsheet"
            >
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Transaction / Ref ID</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Attendee / Customer</th>
                <th className="py-3 px-4">Pass Tier</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-white/40">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const dt = formatDateTime(tx.createdAt)
                  const paymentDisplay = tx.transactionId || tx.paymentId || 'TX_DIRECT'

                  return (
                    <tr
                      key={tx._id || tx.transactionId}
                      onClick={() => setSelectedTx(tx)}
                      className="hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      {/* Transaction ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-neon-cyan">
                            {paymentDisplay}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopy(paymentDisplay, `pay_${paymentDisplay}`)
                            }}
                            className="text-white/30 hover:text-white p-1 transition-colors"
                            title="Copy transaction ID"
                          >
                            {copiedId === `pay_${paymentDisplay}` ? (
                              <Check size={12} className="text-emerald-400" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                        {tx.orderId && (
                          <div className="text-[10px] text-white/40 font-mono mt-0.5">
                            Order: {tx.orderId}
                          </div>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4">
                        <div className="text-white font-medium">{dt.date}</div>
                        <div className="text-[11px] text-white/50 font-mono">{dt.time}</div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{tx.customerName}</div>
                        <div className="text-[11px] text-white/50">{tx.customerPhone}</div>
                        {tx.customerEmail && (
                          <div className="text-[10px] text-white/40 truncate max-w-[180px]">
                            {tx.customerEmail}
                          </div>
                        )}
                      </td>

                      {/* Pass Tier & Ticket ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-white capitalize">
                          {tx.eventType} Pass
                        </div>
                        {tx.ticketId && (
                          <span className="text-[10px] text-neon-pink font-mono font-bold">
                            {tx.ticketId}
                          </span>
                        )}
                      </td>

                      {/* Amount Paid */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-space font-bold text-sm ${
                            tx.status === 'REFUNDED'
                              ? 'text-amber-400 line-through'
                              : tx.status === 'FAILED'
                              ? 'text-red-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          ₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                        </span>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-white/5 border border-white/10 text-white/70">
                            {tx.paymentMode || 'UPI'}
                          </span>
                          {tx.couponCode && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                              🏷️ {tx.couponCode}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {tx.status === 'REFUNDED' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              <AlertTriangle size={11} /> REFUNDED
                            </span>
                            {tx.refundAmount > 0 && (
                              <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">
                                ₹{tx.refundAmount} refunded
                              </div>
                            )}
                          </div>
                        ) : tx.status === 'FAILED' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                              <XCircle size={11} /> FAILED
                            </span>
                            {tx.failureReason && (
                              <div className="text-[10px] text-red-400/80 max-w-[140px] truncate mt-0.5" title={tx.failureReason}>
                                {tx.failureReason}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 size={11} /> PAID
                          </span>
                        )}
                      </td>

                      {/* View Button */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-[11px] text-neon-cyan font-bold group-hover:underline">
                          View Receipt →
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredTransactions.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredTransactions.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        )}
      </div>

      {/* MODAL: Record Counter Payment / Ticket */}
      {isAddingOffline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto no-scrollbar">
          <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[#0d081b] border border-white/15 rounded-2xl p-6 sm:p-7 text-white my-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div>
                <h3 className="font-bold font-space text-lg text-white">Record Counter / Gate Sale</h3>
                <p className="text-xs text-white/50 mt-0.5">Directly issue pass & save transaction in database</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingOffline(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white grid place-items-center transition-colors cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordOfflinePayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/70 mb-1 font-semibold">Attendee Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={offlineForm.customerName}
                  onChange={(e) => setOfflineForm({ ...offlineForm, customerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-neon-pink"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 mb-1 font-semibold">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={offlineForm.customerPhone}
                    onChange={(e) => setOfflineForm({ ...offlineForm, customerPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-neon-pink"
                  />
                </div>
                <div>
                  <label className="block text-white/70 mb-1 font-semibold">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="attendee@gmail.com"
                    value={offlineForm.customerEmail}
                    onChange={(e) => setOfflineForm({ ...offlineForm, customerEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-neon-pink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 mb-1 font-semibold">Select Pass Package *</label>
                  <select
                    value={offlineForm.eventType}
                    onChange={(e) => setOfflineForm({ ...offlineForm, eventType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/80 border border-white/15 rounded-xl text-white focus:outline-none focus:border-neon-pink"
                  >
                    {packages.map((pkg) => (
                      <option key={pkg.key} value={pkg.key}>
                        {pkg.title} (₹{pkg.price})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white/70 mb-1 font-semibold">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={offlineForm.quantity}
                    onChange={(e) => setOfflineForm({ ...offlineForm, quantity: Math.max(1, Number(e.target.value)) })}
                    className="w-full px-3.5 py-2.5 bg-black/50 border border-white/15 rounded-xl text-white focus:outline-none focus:border-neon-pink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-semibold">Payment Received Via</label>
                <select
                  value={offlineForm.paymentMode}
                  onChange={(e) => setOfflineForm({ ...offlineForm, paymentMode: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black/80 border border-white/15 rounded-xl text-white focus:outline-none focus:border-neon-pink"
                >
                  <option value="Cash at Counter">Cash at Counter</option>
                  <option value="UPI / QR Scanner">UPI / QR at Counter</option>
                  <option value="Card POS Machine">Card POS Machine</option>
                  <option value="VIP Complimentary">VIP Complimentary</option>
                </select>
              </div>

              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingOffline(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOffline}
                  className="flex-1 py-3 rounded-xl bg-neon-pink text-[#080612] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer"
                >
                  {isSubmittingOffline ? 'Saving...' : 'Confirm & Issue Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRANSACTION DETAILS MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto no-scrollbar">
          <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[#0d081b] border border-white/15 rounded-2xl p-6 sm:p-7 text-white my-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div>
                <h3 className="font-bold font-space text-lg text-white">Payment Receipt</h3>
                <p className="text-xs text-white/50 mt-0.5">Database transaction verification record</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white grid place-items-center transition-colors cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  selectedTx.status === 'REFUNDED'
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : selectedTx.status === 'FAILED'
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-emerald-500/10 border-emerald-500/30'
                }`}
              >
                <div>
                  <span
                    className={`text-[10px] uppercase font-bold block ${
                      selectedTx.status === 'REFUNDED'
                        ? 'text-amber-400/80'
                        : selectedTx.status === 'FAILED'
                        ? 'text-red-400/80'
                        : 'text-emerald-400/80'
                    }`}
                  >
                    Amount Paid
                  </span>
                  <div
                    className={`text-2xl font-bold font-space ${
                      selectedTx.status === 'REFUNDED'
                        ? 'text-amber-300 line-through'
                        : selectedTx.status === 'FAILED'
                        ? 'text-red-300'
                        : 'text-emerald-300'
                    }`}
                  >
                    ₹{Number(selectedTx.amount || selectedTx.amountPaid || 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    selectedTx.status === 'REFUNDED'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : selectedTx.status === 'FAILED'
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {selectedTx.status === 'REFUNDED'
                    ? 'Refunded / Cancelled'
                    : selectedTx.status === 'FAILED'
                    ? 'Payment Failed'
                    : 'Payment Confirmed (Paid)'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                <div>
                  <span className="text-[10px] text-white/40 uppercase block mb-0.5">
                    Transaction ID
                  </span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-neon-cyan">
                    <span>{selectedTx.transactionId || selectedTx.paymentId || 'TX_DIRECT'}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedTx.transactionId || selectedTx.paymentId, 'modal_pay')}
                      className="text-white/30 hover:text-white p-0.5"
                      title="Copy"
                    >
                      {copiedId === 'modal_pay' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-white/40 uppercase block mb-0.5">
                    Razorpay Order ID
                  </span>
                  <div className="font-mono text-white/80 font-bold truncate">
                    {selectedTx.orderId || 'ORDER_DIRECT'}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-white/40 uppercase block mb-0.5">
                    Ticket ID
                  </span>
                  <span className="font-mono font-bold text-neon-pink">
                    {selectedTx.ticketId || '—'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-white/40 uppercase block mb-0.5">
                    Payment Method
                  </span>
                  <span className="text-white font-medium">
                    {selectedTx.paymentMode || 'UPI'}
                  </span>
                </div>
              </div>

              {selectedTx.failureReason && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300">
                  <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5 text-red-400">
                    Failure Reason:
                  </span>
                  {selectedTx.failureReason}
                </div>
              )}

              {selectedTx.refundAmount > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300">
                  <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5 text-amber-400">
                    Refund Amount:
                  </span>
                  ₹{selectedTx.refundAmount} was reversed back to customer bank.
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">
                  Customer & Pass Info
                </span>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/60">Attendee Name</span>
                  <strong className="text-white">{selectedTx.customerName}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/60">Phone Number</span>
                  <span className="text-white font-mono">{selectedTx.customerPhone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/60">Email</span>
                  <span className="text-white font-mono">{selectedTx.customerEmail || '—'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-white/60">Pass Type & Quantity</span>
                  <span className="text-neon-cyan font-bold capitalize">
                    {selectedTx.eventType} Pass ({selectedTx.quantity || 1} {selectedTx.quantity === 1 ? 'ticket' : 'tickets'})
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              {selectedTx.status === 'SUCCESS' ? (
                <button
                  type="button"
                  disabled={isRefunding}
                  onClick={() => handleRefundTransaction(selectedTx.transactionId)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <AlertTriangle size={13} />
                  {isRefunding ? 'Processing Refund...' : 'Refund & Cancel Pass'}
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
