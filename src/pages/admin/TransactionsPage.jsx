import { useState, useEffect } from 'react'
import { Search, Download, CheckCircle2, Copy, Check, RefreshCw, Plus } from 'lucide-react'
import { API_BASE_URL } from '../../config/api'

export default function TransactionsPage({ ticketsList: propTickets = [] }) {
  const [ticketsList, setTicketsList] = useState(propTickets)
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [passFilter, setPassFilter] = useState('all')
  const [selectedTx, setSelectedTx] = useState(null)
  const [copiedId, setCopiedId] = useState('')

  // Modal: Add / Record Counter Payment
  const [isAddingOffline, setIsAddingOffline] = useState(false)
  const [isSubmittingOffline, setIsSubmittingOffline] = useState(false)
  const [offlineForm, setOfflineForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    eventType: '',
    quantity: 1,
    paymentMode: 'Cash at Counter',
  })

  // Fetch real-time tickets from MongoDB
  const fetchLiveTickets = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets`)
      const data = await res.json()
      if (data.success && Array.isArray(data.tickets)) {
        setTicketsList(data.tickets)
      }
    } catch (err) {
      console.error('Error fetching live tickets:', err)
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
    fetchLiveTickets()
    fetchDynamicPackages()
  }, [])

  // Sync prop changes
  useEffect(() => {
    if (propTickets.length > 0 && ticketsList.length === 0) {
      setTicketsList(propTickets)
    }
  }, [propTickets])

  // Live Metrics
  const totalRevenue = ticketsList.reduce((acc, curr) => acc + (Number(curr.amountPaid) || 0), 0)
  const totalOrders = ticketsList.length
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  // Filtered transactions
  const filteredTransactions = ticketsList.filter((t) => {
    const matchesPass = passFilter === 'all' ? true : t.eventType === passFilter
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      (t.paymentId || '').toLowerCase().includes(q) ||
      (t.orderId || '').toLowerCase().includes(q) ||
      (t.ticketId || '').toLowerCase().includes(q) ||
      (t.customerName || '').toLowerCase().includes(q) ||
      (t.customerPhone || '').includes(q) ||
      (t.customerEmail || '').toLowerCase().includes(q)

    return matchesPass && matchesSearch
  })

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
      if (data.success && data.ticket) {
        setTicketsList((prev) => [data.ticket, ...prev])
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

  // Export CSV
  const handleExportCSV = () => {
    if (ticketsList.length === 0) {
      alert('No transactions to export.')
      return
    }

    const headers = [
      'Transaction Date',
      'Time',
      'Payment ID',
      'Order ID',
      'Ticket ID',
      'Customer Name',
      'Phone',
      'Email',
      'Pass Type',
      'Quantity',
      'Amount (INR)',
      'Payment Mode',
      'Status',
    ]

    const rows = ticketsList.map((t) => {
      const dt = formatDateTime(t.createdAt)
      return [
        dt.date,
        dt.time,
        t.paymentId || 'PAY_DIRECT',
        t.orderId || 'ORDER_DIRECT',
        t.ticketId || '',
        `"${(t.customerName || '').replace(/"/g, '""')}"`,
        t.customerPhone || '',
        t.customerEmail || '',
        t.eventType || '',
        t.quantity || 1,
        t.amountPaid || 0,
        t.paymentMode || 'Online UPI',
        'PAID',
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
      {/* 3 Live Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f091f] border border-white/10 rounded-2xl p-5 shadow-lg">
          <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold block mb-1">
            Total Revenue Collected
          </span>
          <div className="font-space font-bold text-2xl sm:text-3xl text-emerald-400">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-white/40 mt-1 block">Live database settlement total</span>
        </div>

        <div className="bg-[#0f091f] border border-white/10 rounded-2xl p-5 shadow-lg">
          <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold block mb-1">
            Total Paid Orders
          </span>
          <div className="font-space font-bold text-2xl sm:text-3xl text-white">
            {totalOrders}
          </div>
          <span className="text-[11px] text-white/40 mt-1 block">Verified booking entries in MongoDB</span>
        </div>

        <div className="bg-[#0f091f] border border-white/10 rounded-2xl p-5 shadow-lg">
          <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold block mb-1">
            Average Order Value
          </span>
          <div className="font-space font-bold text-2xl sm:text-3xl text-neon-cyan">
            ₹{avgOrderValue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-white/40 mt-1 block">Revenue per transaction</span>
        </div>
      </div>

      {/* Main Ledger Card */}
      <div className="bg-[#0f091f] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h3 className="font-bold font-space text-xl text-white">Payment Transactions & Orders</h3>
            <p className="text-xs text-white/50 mt-0.5">
              Live MongoDB & Razorpay transaction ledger ({ticketsList.length} total records)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search Payment ID, Order ID, Name, Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-black/50 border border-white/15 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan w-56 sm:w-64"
              />
            </div>

            {/* Dynamic Pass Filters */}
            <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setPassFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${passFilter === 'all'
                    ? 'bg-neon-cyan text-[#071016]'
                    : 'text-white/60 hover:text-white'
                  }`}
              >
                All ({totalOrders})
              </button>
              {packages.map((pkg) => (
                <button
                  key={pkg.key}
                  type="button"
                  onClick={() => setPassFilter(pkg.key)}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer capitalize ${passFilter === pkg.key
                      ? 'bg-neon-cyan text-[#071016]'
                      : 'text-white/60 hover:text-white'
                    }`}
                >
                  {pkg.title.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Refresh Live Data */}
            <button
              type="button"
              onClick={fetchLiveTickets}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
              title="Refresh live data from database"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* Record Counter Payment Button */}
            <button
              type="button"
              onClick={() => setIsAddingOffline(true)}
              className="px-3.5 py-2 rounded-xl bg-neon-pink text-[#080612] font-bold text-xs uppercase tracking-wider hover:opacity-90 flex items-center gap-1 transition-all cursor-pointer"
            >
              <Plus size={14} /> Record Payment
            </button>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
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
                <th className="py-3 px-4">Payment Ref ID</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Attendee / Customer</th>
                <th className="py-3 px-4">Pass Tier</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Gateway Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-white/40">
                    No transactions found in database.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const dt = formatDateTime(tx.createdAt)
                  const paymentDisplay = tx.paymentId || 'PAY_DIRECT'

                  return (
                    <tr
                      key={tx.ticketId}
                      onClick={() => setSelectedTx(tx)}
                      className="hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      {/* Payment ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-neon-cyan">
                            {paymentDisplay}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopy(paymentDisplay, `pay_${tx.ticketId}`)
                            }}
                            className="text-white/30 hover:text-white p-1 transition-colors"
                            title="Copy payment ID"
                          >
                            {copiedId === `pay_${tx.ticketId}` ? (
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
                        <span className="text-[10px] text-neon-pink font-mono font-bold">
                          {tx.ticketId}
                        </span>
                      </td>

                      {/* Amount Paid */}
                      <td className="py-3.5 px-4">
                        <span className="font-space font-bold text-sm text-emerald-400">
                          ₹{Number(tx.amountPaid).toLocaleString('en-IN')}
                        </span>
                        <div className="text-[10px] text-white/40">
                          {tx.paymentMode || 'Online UPI'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <CheckCircle2 size={11} /> PAID
                        </span>
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
                <label className="text-white/70 font-semibold block mb-1">Customer Name</label>
                <input
                  required
                  type="text"
                  placeholder="Full name"
                  value={offlineForm.customerName}
                  onChange={(e) => setOfflineForm({ ...offlineForm, customerName: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-neon-pink"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-white/70 font-semibold block mb-1">Phone Number</label>
                  <input
                    required
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={offlineForm.customerPhone}
                    onChange={(e) => setOfflineForm({ ...offlineForm, customerPhone: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-neon-pink"
                  />
                </div>
                <div>
                  <label className="text-white/70 font-semibold block mb-1">Email (For E-Pass)</label>
                  <input
                    required
                    type="email"
                    placeholder="email@domain.com"
                    value={offlineForm.customerEmail}
                    onChange={(e) => setOfflineForm({ ...offlineForm, customerEmail: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-neon-pink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-white/70 font-semibold block mb-1">Pass Package</label>
                  <select
                    required
                    value={offlineForm.eventType}
                    onChange={(e) => setOfflineForm({ ...offlineForm, eventType: e.target.value })}
                    className="w-full bg-[#120a22] border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-neon-pink"
                  >
                    {packages.map((pkg) => (
                      <option key={pkg.key} value={pkg.key}>
                        {pkg.title} (₹{pkg.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-white/70 font-semibold block mb-1">Payment Method</label>
                  <select
                    value={offlineForm.paymentMode}
                    onChange={(e) => setOfflineForm({ ...offlineForm, paymentMode: e.target.value })}
                    className="w-full bg-[#120a22] border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-neon-pink"
                  >
                    <option value="Cash at Counter">Cash at Counter</option>
                    <option value="Counter UPI / POS">Counter UPI / POS</option>
                    <option value="Card Swipe Machine">Card Swipe Machine</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3 border-t border-white/10">
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
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400/80 block">
                    Amount Paid
                  </span>
                  <div className="text-2xl font-bold font-space text-emerald-300">
                    ₹{Number(selectedTx.amountPaid).toLocaleString('en-IN')}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Payment Confirmed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                <div>
                  <span className="text-[10px] text-white/40 uppercase block mb-0.5">
                    Payment Reference ID
                  </span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-neon-cyan">
                    <span>{selectedTx.paymentId || 'PAY_DIRECT'}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedTx.paymentId, 'modal_pay')}
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
                    {selectedTx.ticketId}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-white/40 uppercase block mb-0.5">
                    Payment Mode
                  </span>
                  <span className="text-white font-medium">
                    {selectedTx.paymentMode || 'Online UPI'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <span className="text-[10px] text-white/40 uppercase font-bold block">
                  Customer Billing Information
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-white/40 block text-[10px]">Name</span>
                    <strong className="text-white">{selectedTx.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">Phone</span>
                    <span className="text-white/90 font-mono">{selectedTx.customerPhone}</span>
                  </div>
                </div>
                {selectedTx.customerEmail && (
                  <div>
                    <span className="text-white/40 block text-[10px]">Email (E-Pass Delivery)</span>
                    <span className="text-white/90 font-mono">{selectedTx.customerEmail}</span>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-white/40 uppercase block">Booked Package</span>
                  <strong className="text-white capitalize">{selectedTx.eventType} Pass</strong>
                  <div className="text-[11px] text-white/50">{selectedTx.eventTitle}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-white/40 uppercase block">Quantity</span>
                  <span className="text-white font-bold">{selectedTx.quantity || 1} Pass</span>
                </div>
              </div>

              <div className="text-center text-[11px] text-white/40 font-mono pt-1">
                Transaction logged: {formatDateTime(selectedTx.createdAt).date} at{' '}
                {formatDateTime(selectedTx.createdAt).time}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTx(null)}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
