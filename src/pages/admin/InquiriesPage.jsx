import { useState, useEffect } from 'react'
import {
  Search,
  Mail,
  Phone,
  Trash2,
  Download,
  MessageCircle,
  RefreshCw,
  X,
  Calendar,
} from 'lucide-react'
import { API_BASE_URL } from '../../config/api'

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [updatingId, setUpdatingId] = useState(null)
  const [selectedInquiry, setSelectedInquiry] = useState(null)

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
  const handleStatusChange = async (id, newStatus, e) => {
    if (e) e.stopPropagation()
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
        if (selectedInquiry && selectedInquiry._id === id) {
          setSelectedInquiry(data.inquiry)
        }
      }
    } catch (err) {
      console.error('Error updating inquiry status:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  // Delete an inquiry
  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setInquiries((prev) => prev.filter((item) => item._id !== id))
        if (selectedInquiry && selectedInquiry._id === id) {
          setSelectedInquiry(null)
        }
      }
    } catch (err) {
      console.error('Error deleting inquiry:', err)
    }
  }

  // Export to CSV
  const exportToCSV = () => {
    if (inquiries.length === 0) return
    const headers = ['Date', 'Time', 'Name', 'Phone', 'Email', 'Subject', 'Message', 'Status']
    const rows = inquiries.map((i) => {
      const d = new Date(i.createdAt)
      return [
        `"${d.toLocaleDateString('en-IN')}"`,
        `"${d.toLocaleTimeString('en-IN')}"`,
        `"${(i.name || '').replace(/"/g, '""')}"`,
        `"${(i.phone || '').replace(/"/g, '""')}"`,
        `"${(i.email || '').replace(/"/g, '""')}"`,
        `"${(i.subject || '').replace(/"/g, '""')}"`,
        `"${(i.message || '').replace(/"/g, '""')}"`,
        `"${i.status || 'NEW'}"`,
      ]
    })
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `VYBE-Contact-Inquiries-${new Date().toISOString().split('T')[0]}.csv`
    )
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
    const matchesStatus =
      statusFilter === 'ALL' || (item.status || 'NEW') === statusFilter
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
    <div className="bg-[#0f091f] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h3 className="font-bold font-space text-xl text-white">Contact & VIP Leads</h3>
          <p className="text-xs text-white/50">
            Incoming inquiries from the festival website contact form
          </p>
        </div>

        {/* Filter and Search Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search name, phone, message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-black/50 border border-white/15 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan w-48 sm:w-60"
            />
          </div>

          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-neon-cyan cursor-pointer"
          >
            <option value="ALL" className="bg-[#0f091f]">All Status ({totalCount})</option>
            <option value="NEW" className="bg-[#0f091f]">New ({newCount})</option>
            <option value="CONTACTED" className="bg-[#0f091f]">Contacted ({contactedCount})</option>
            <option value="RESOLVED" className="bg-[#0f091f]">Resolved ({resolvedCount})</option>
          </select>

          {/* Refresh & CSV */}
          <button
            onClick={fetchInquiries}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white transition-all cursor-pointer"
            title="Refresh Inquiries"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={exportToCSV}
            disabled={inquiries.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-40"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Clean Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider font-bold">
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Phone / WhatsApp</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Message</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-white/40 font-mono">
                  <RefreshCw size={16} className="animate-spin inline-block mr-2" />
                  Loading inquiries...
                </td>
              </tr>
            ) : filteredInquiries.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-white/40">
                  No inquiries found.
                </td>
              </tr>
            ) : (
              filteredInquiries.map((inquiry) => {
                const d = new Date(inquiry.createdAt)
                const dateStr = d.toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
                const timeStr = d.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })
                const rawPhone = (inquiry.phone || '').replace(/\D/g, '')
                const waPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone
                const currentStatus = inquiry.status || 'NEW'

                return (
                  <tr
                    key={inquiry._id}
                    onClick={() => setSelectedInquiry(inquiry)}
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    {/* Date & Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-white font-medium">{dateStr}</div>
                      <div className="text-[11px] text-white/50 font-mono">{timeStr}</div>
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      {inquiry.name}
                    </td>

                    {/* Phone & WhatsApp */}
                    <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${inquiry.phone}`}
                          className="text-white/80 hover:text-white font-mono hover:underline"
                        >
                          {inquiry.phone}
                        </a>
                        {waPhone && (
                          <a
                            href={`https://wa.me/${waPhone}?text=Hi%20${encodeURIComponent(
                              inquiry.name
                            )},%20this%20is%20regarding%20your%20inquiry%20for%20VYBE%20Shillong%20Festival.`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                            title="WhatsApp"
                          >
                            <MessageCircle size={13} />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 text-white/70 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={`mailto:${inquiry.email}`}
                        className="hover:text-neon-cyan hover:underline flex items-center gap-1 font-mono"
                      >
                        <Mail size={12} className="text-white/40" />
                        <span>{inquiry.email}</span>
                      </a>
                    </td>

                    {/* Subject */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] font-semibold text-neon-cyan">
                        {inquiry.subject || 'General'}
                      </span>
                    </td>

                    {/* Message Preview */}
                    <td className="py-3.5 px-4 max-w-xs truncate text-white/70">
                      {inquiry.message}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={currentStatus}
                        disabled={updatingId === inquiry._id}
                        onChange={(e) => handleStatusChange(inquiry._id, e.target.value, e)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border focus:outline-none cursor-pointer ${
                          currentStatus === 'NEW'
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                            : currentStatus === 'CONTACTED'
                            ? 'bg-neon-pink/15 border-neon-pink/40 text-neon-pink'
                            : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                        }`}
                      >
                        <option value="NEW" className="bg-[#0f091f] text-white">NEW</option>
                        <option value="CONTACTED" className="bg-[#0f091f] text-white">CONTACTED</option>
                        <option value="RESOLVED" className="bg-[#0f091f] text-white">RESOLVED</option>
                      </select>
                    </td>

                    {/* Delete Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleDelete(inquiry._id, e)}
                        className="p-1.5 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete inquiry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal when row is clicked */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0f091f] border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">
                  Inquiry Details
                </span>
                <h3 className="font-bold font-space text-lg text-white mt-0.5">
                  {selectedInquiry.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Meta Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-white/40 block font-mono uppercase">Submitted On</span>
                <span className="font-semibold text-white mt-0.5 block">
                  {new Date(selectedInquiry.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-white/40 block font-mono uppercase">Subject</span>
                <span className="font-semibold text-neon-cyan mt-0.5 block truncate">
                  {selectedInquiry.subject || 'General'}
                </span>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={`tel:${selectedInquiry.phone}`}
                className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white"
              >
                <Phone size={13} />
                <span>{selectedInquiry.phone}</span>
              </a>

              <a
                href={`https://wa.me/${(selectedInquiry.phone || '').replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(
                  selectedInquiry.name
                )},%20this%20is%20regarding%20your%20inquiry%20for%20VYBE%20Shillong%20Festival.`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-semibold text-emerald-400"
              >
                <MessageCircle size={14} />
                <span>WhatsApp</span>
              </a>

              <a
                href={`mailto:${selectedInquiry.email}`}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white"
              >
                <Mail size={13} />
                <span>Email</span>
              </a>
            </div>

            {/* Full Message */}
            <div>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono block mb-1">
                Full Message:
              </span>
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-xs text-white/90 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Footer with Status Changer */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">Status:</span>
                <select
                  value={selectedInquiry.status || 'NEW'}
                  onChange={(e) => handleStatusChange(selectedInquiry._id, e.target.value)}
                  className="px-3 py-1 rounded-xl bg-black/60 border border-white/20 text-xs font-bold text-white focus:outline-none"
                >
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
