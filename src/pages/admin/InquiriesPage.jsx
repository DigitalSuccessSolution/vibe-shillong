import { useState, useEffect } from 'react'
import {
  MessageSquare,
  Search,
  Mail,
  Phone,
  Calendar,
  Trash2,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { API_BASE_URL } from '../../config/api'

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [updatingId, setUpdatingId] = useState(null)

  // Fetch inquiries from backend
  const fetchInquiries = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`)
      const data = await res.json()
      if (data.success && Array.isArray(data.inquiries)) {
        setInquiries(data.inquiries)
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInquiries()
  }, [])

  // Update status (NEW -> CONTACTED -> RESOLVED)
  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success && data.inquiry) {
        setInquiries((prev) =>
          prev.map((item) => (item._id === id ? data.inquiry : item))
        )
      }
    } catch (err) {
      console.error('Error updating inquiry status:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  // Delete an inquiry
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setInquiries((prev) => prev.filter((item) => item._id !== id))
      }
    } catch (err) {
      console.error('Error deleting inquiry:', err)
    }
  }

  // Export to CSV
  const exportToCSV = () => {
    if (inquiries.length === 0) return
    const headers = ['Date', 'Name', 'Phone', 'Email', 'Subject', 'Message', 'Status']
    const rows = inquiries.map((i) => [
      `"${new Date(i.createdAt).toLocaleString('en-IN')}"`,
      `"${(i.name || '').replace(/"/g, '""')}"`,
      `"${(i.phone || '').replace(/"/g, '""')}"`,
      `"${(i.email || '').replace(/"/g, '""')}"`,
      `"${(i.subject || '').replace(/"/g, '""')}"`,
      `"${(i.message || '').replace(/"/g, '""')}"`,
      `"${i.status || 'NEW'}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `VYBE-Inquiries-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Counts
  const totalCount = inquiries.length
  const newCount = inquiries.filter((i) => (i.status || 'NEW') === 'NEW').length
  const contactedCount = inquiries.filter((i) => i.status === 'CONTACTED').length
  const resolvedCount = inquiries.filter((i) => i.status === 'RESOLVED').length

  // Filtered List
  const filteredInquiries = inquiries.filter((item) => {
    const matchesStatus = statusFilter === 'ALL' || (item.status || 'NEW') === statusFilter
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.email && item.email.toLowerCase().includes(q)) ||
      (item.phone && item.phone.toLowerCase().includes(q)) ||
      (item.subject && item.subject.toLowerCase().includes(q)) ||
      (item.message && item.message.toLowerCase().includes(q))
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0c0719] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs text-white/50 font-mono uppercase tracking-wider block">Total Inquiries</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-space text-white mt-1 block">{totalCount}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan">
            <MessageSquare size={20} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c0719] border border-amber-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-400/70 font-mono uppercase tracking-wider block">New / Unread</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-space text-amber-400 mt-1 block">{newCount}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock size={20} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c0719] border border-neon-pink/20 flex items-center justify-between">
          <div>
            <span className="text-xs text-neon-pink/70 font-mono uppercase tracking-wider block">Contacted</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-space text-neon-pink mt-1 block">{contactedCount}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-neon-pink/10 border border-neon-pink/30 flex items-center justify-center text-neon-pink">
            <Phone size={20} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c0719] border border-emerald-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-400/70 font-mono uppercase tracking-wider block">Resolved</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-space text-emerald-400 mt-1 block">{resolvedCount}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Control Bar: Filters, Search, CSV Export */}
      <div className="p-4 rounded-2xl bg-[#0c0719] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search by name, email, phone, message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-neon-cyan transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: `All (${totalCount})` },
            { id: 'NEW', label: `New (${newCount})` },
            { id: 'CONTACTED', label: `Contacted (${contactedCount})` },
            { id: 'RESOLVED', label: `Resolved (${resolvedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-neon-cyan text-[#071016]'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={fetchInquiries}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            title="Refresh Inquiries"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={exportToCSV}
            disabled={inquiries.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all border border-white/10 disabled:opacity-40 cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Inquiries Cards / Table */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-[#0c0719] border border-white/10">
          <RefreshCw size={24} className="animate-spin text-neon-cyan mx-auto mb-3" />
          <p className="text-xs text-white/50 font-mono">Loading inquiries from MongoDB...</p>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0c0719] border border-white/10">
          <MessageSquare size={32} className="text-white/20 mx-auto mb-3" />
          <h3 className="font-bold text-white text-sm">No Inquiries Found</h3>
          <p className="text-xs text-white/40 mt-1">
            {searchQuery
              ? 'No inquiries match your search filter.'
              : 'Contact submissions from the website will appear here in real-time.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInquiries.map((inquiry) => {
            const rawPhone = (inquiry.phone || '').replace(/\D/g, '')
            const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone
            const currentStatus = inquiry.status || 'NEW'

            const statusBadges = {
              NEW: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
              CONTACTED: 'bg-neon-pink/15 border-neon-pink/40 text-neon-pink',
              RESOLVED: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
            }

            return (
              <div
                key={inquiry._id}
                className={`p-5 rounded-2xl bg-[#0c0719] border transition-all ${
                  currentStatus === 'NEW'
                    ? 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.06)]'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-3 border-b border-white/10">
                  {/* Left: User Info & Subject */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h4 className="font-bold font-space text-base text-white">{inquiry.name}</h4>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                          statusBadges[currentStatus] || statusBadges.NEW
                        }`}
                      >
                        {currentStatus}
                      </span>
                      <span className="text-[11px] text-white/40 font-mono flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(inquiry.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[11px] font-mono text-neon-cyan font-semibold">
                        {inquiry.subject || 'General Inquiry'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Contact Buttons & Status Dropdown */}
                  <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
                    {/* Direct WhatsApp button */}
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(
                          inquiry.name
                        )},%20this%20is%20regarding%20your%20inquiry%20for%20VYBE%20Shillong%20Festival.`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle size={13} />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    {/* Direct Call button */}
                    {inquiry.phone && (
                      <a
                        href={`tel:${inquiry.phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-semibold transition-all"
                        title="Call"
                      >
                        <Phone size={13} />
                        <span>{inquiry.phone}</span>
                      </a>
                    )}

                    {/* Direct Email button */}
                    {inquiry.email && (
                      <a
                        href={`mailto:${inquiry.email}?subject=Regarding%20your%20inquiry%20-%20VYBE%20Shillong`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-semibold transition-all"
                        title="Send Email"
                      >
                        <Mail size={13} />
                        <span className="hidden sm:inline">{inquiry.email}</span>
                      </a>
                    )}

                    {/* Status Select */}
                    <select
                      value={currentStatus}
                      disabled={updatingId === inquiry._id}
                      onChange={(e) => handleStatusChange(inquiry._id, e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/20 text-xs font-bold text-white focus:outline-none focus:border-neon-cyan cursor-pointer"
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(inquiry._id)}
                      className="p-1.5 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                      title="Delete inquiry"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Message Body */}
                <div className="pt-3">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono block mb-1">
                    Message:
                  </span>
                  <p className="text-xs sm:text-sm text-white/80 bg-black/30 p-3 rounded-xl border border-white/5 whitespace-pre-wrap leading-relaxed">
                    {inquiry.message}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
