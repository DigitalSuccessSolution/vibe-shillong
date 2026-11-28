import { useState, useEffect } from 'react'
import {
  Tag,
  Plus,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Percent,
  Calendar,
  Users,
  AlertCircle,
  X,
  Sparkles,
  Pencil,
} from 'lucide-react'
import { API_BASE_URL } from '../../config/api'
import { DEFAULT_PACKAGES } from '../../constants/packages'

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([])
  const [packages, setPackages] = useState(DEFAULT_PACKAGES)
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCouponId, setEditingCouponId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const initialForm = {
    code: '',
    discountType: 'percentage',
    discountValue: '',
    maxDiscount: '',
    minOrderAmount: '',
    usageLimit: '',
    validTill: '',
    applicableEvents: ['all'],
    description: '',
    isActive: true,
    showOnWebsite: false,
    oneUsePerEmail: true,
  }

  const [formData, setFormData] = useState(initialForm)

  const handleOpenCreate = () => {
    setEditingCouponId(null)
    setFormData(initialForm)
    setFormError('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (coupon) => {
    setEditingCouponId(coupon._id)
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue || '',
      maxDiscount: coupon.maxDiscount || '',
      minOrderAmount: coupon.minOrderAmount || '',
      usageLimit: coupon.usageLimit || '',
      validTill: coupon.validTill ? new Date(coupon.validTill).toISOString().split('T')[0] : '',
      applicableEvents: coupon.applicableEvents || ['all'],
      description: coupon.description || '',
      isActive: coupon.isActive !== undefined ? coupon.isActive : true,
      showOnWebsite: Boolean(coupon.showOnWebsite),
      oneUsePerEmail: coupon.oneUsePerEmail !== undefined ? Boolean(coupon.oneUsePerEmail) : true,
    })
    setFormError('')
    setIsModalOpen(true)
  }

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/coupons`)
      const data = await res.json()
      if (data.success && Array.isArray(data.coupons)) {
        setCoupons(data.coupons)
      }
    } catch (err) {
      console.error('Error fetching coupons:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPackages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/packages`)
      const data = await res.json()
      if (data.success && Array.isArray(data.packages) && data.packages.length > 0) {
        setPackages(data.packages)
      }
    } catch (err) {
      console.error('Error fetching packages in coupons:', err)
    }
  }

  useEffect(() => {
    fetchCoupons()
    fetchPackages()
  }, [])

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleToggleActive = async (coupon) => {
    const updatedStatus = !coupon.isActive
    setCoupons((prev) =>
      prev.map((c) => (c._id === coupon._id ? { ...c, isActive: updatedStatus } : c))
    )

    try {
      const res = await fetch(`${API_BASE_URL}/api/coupons/${coupon._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: updatedStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setStatusMessage(`Coupon "${coupon.code}" ${updatedStatus ? 'activated' : 'deactivated'}.`)
        setTimeout(() => setStatusMessage(''), 3000)
      }
    } catch (err) {
      console.error('Error toggling coupon status:', err)
      fetchCoupons()
    }
  }

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) return

    try {
      const res = await fetch(`${API_BASE_URL}/api/coupons/${coupon._id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setCoupons((prev) => prev.filter((c) => c._id !== coupon._id))
        setStatusMessage(`Coupon "${coupon.code}" deleted.`)
        setTimeout(() => setStatusMessage(''), 3000)
      }
    } catch (err) {
      console.error('Error deleting coupon:', err)
    }
  }

  const handleSaveCoupon = async (e) => {
    e.preventDefault()
    setFormError('')

    const cleanCode = (formData.code || '').trim().toUpperCase()
    if (!cleanCode) {
      setFormError('Please enter a coupon code.')
      return
    }

    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      setFormError('Please enter a valid discount value.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        code: cleanCode,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        validTill: formData.validTill ? new Date(formData.validTill).toISOString() : null,
        applicableEvents: formData.applicableEvents,
        description: formData.description.trim(),
        isActive: formData.isActive,
        showOnWebsite: Boolean(formData.showOnWebsite),
        oneUsePerEmail: Boolean(formData.oneUsePerEmail),
      }

      if (editingCouponId) {
        // UPDATE EXISTING COUPON
        const res = await fetch(`${API_BASE_URL}/api/coupons/${editingCouponId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()

        if (res.ok && data.success) {
          setCoupons((prev) =>
            prev.map((c) => (c._id === editingCouponId ? data.coupon : c))
          )
          setIsModalOpen(false)
          setEditingCouponId(null)
          setStatusMessage(`Coupon "${data.coupon.code}" updated successfully!`)
          setTimeout(() => setStatusMessage(''), 4000)
        } else {
          setFormError(data.message || 'Failed to update coupon.')
        }
      } else {
        // CREATE NEW COUPON
        const res = await fetch(`${API_BASE_URL}/api/coupons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()

        if (res.ok && data.success) {
          setCoupons((prev) => [data.coupon, ...prev])
          setIsModalOpen(false)
          setFormData(initialForm)
          setStatusMessage(`🎉 Coupon "${data.coupon.code}" created successfully!`)
          setTimeout(() => setStatusMessage(''), 4000)
        } else {
          setFormError(data.message || 'Failed to create coupon.')
        }
      }
    } catch (err) {
      setFormError('Server error saving coupon: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Summary Metrics
  const totalCoupons = coupons.length
  const activeCount = coupons.filter((c) => c.isActive).length
  const totalRedeemed = coupons.reduce((sum, c) => sum + (Number(c.usedCount) || 0), 0)

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0f0a1c] border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Tag size={20} className="text-neon-cyan" />
            <h3 className="font-bold font-space text-lg text-white">Coupons & Promo Codes</h3>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Create discount promo codes for influencers, social media reels, and early-bird attendees.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCoupons}
            title="Refresh coupons"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer border border-white/10"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neon-cyan text-[#071016] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-[0_0_20px_rgba(53,234,255,0.25)]"
          >
            <Plus size={16} />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage('')} className="text-emerald-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0e081c] border border-white/10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 block">Total Codes</span>
          <span className="font-bold font-space text-2xl text-white mt-1 block">{totalCoupons}</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0e081c] border border-white/10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">Active Codes</span>
          <span className="font-bold font-space text-2xl text-emerald-400 mt-1 block">{activeCount}</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0e081c] border border-white/10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neon-pink block">Total Times Redeemed</span>
          <span className="font-bold font-space text-2xl text-neon-pink mt-1 block">{totalRedeemed}</span>
        </div>
      </div>

      {/* Coupons Table / Grid */}
      {loading ? (
        <div className="p-12 text-center text-white/50 text-xs">
          <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-neon-cyan" />
          Loading coupon codes...
        </div>
      ) : coupons.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0e081c] border border-dashed border-white/15 text-center">
          <Tag size={36} className="mx-auto text-white/20 mb-3" />
          <h4 className="font-bold text-white text-sm mb-1">No Coupons Created Yet</h4>
          <p className="text-xs text-white/50 mb-4 max-w-sm mx-auto">
            Create your first coupon code to share with influencers or post on Instagram reels!
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-neon-cyan text-[#071016] font-bold text-xs uppercase tracking-wider hover:opacity-90"
          >
            + Create First Coupon
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0c0719]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-white/50 uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 font-bold">Code</th>
                <th className="py-3.5 px-4 font-bold">Discount</th>
                <th className="py-3.5 px-4 font-bold">Min Order</th>
                <th className="py-3.5 px-4 font-bold">Redemptions</th>
                <th className="py-3.5 px-4 font-bold">Valid Till</th>
                <th className="py-3.5 px-4 font-bold">Target</th>
                <th className="py-3.5 px-4 font-bold text-center">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {coupons.map((coupon) => {
                const isExpired = coupon.validTill && new Date() > new Date(coupon.validTill)
                const isLimitReached = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit

                return (
                  <tr key={coupon._id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Code */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-neon-cyan tracking-wider">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => handleCopy(coupon.code)}
                          title="Copy Code"
                          className="text-white/40 hover:text-white p-1 rounded"
                        >
                          {copiedCode === coupon.code ? (
                            <Check size={13} className="text-emerald-400" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                      {coupon.description && (
                        <span className="text-[10px] text-white/40 block mt-0.5 truncate max-w-[160px]">
                          {coupon.description}
                        </span>
                      )}
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        {coupon.showOnWebsite ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30">
                            🌐 Shown on Website
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/5 text-white/40 border border-white/10">
                            🔒 Private / Influencer
                          </span>
                        )}
                        {coupon.oneUsePerEmail !== false ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            👤 1 use/email
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            ♾️ Multi-use
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Discount */}
                    <td className="py-3.5 px-4">
                      {coupon.discountType === 'percentage' ? (
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded-full bg-neon-pink/15 text-neon-pink border border-neon-pink/30 font-bold text-[11px]">
                            {coupon.discountValue}% OFF
                          </span>
                          {coupon.maxDiscount && (
                            <span className="text-[10px] text-white/40 block mt-0.5">
                              Max ₹{coupon.maxDiscount.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold text-[11px]">
                          ₹{coupon.discountValue.toLocaleString('en-IN')} FLAT OFF
                        </span>
                      )}
                    </td>

                    {/* Min Order */}
                    <td className="py-3.5 px-4 text-white/70">
                      {coupon.minOrderAmount && coupon.minOrderAmount > 0
                        ? `₹${coupon.minOrderAmount.toLocaleString('en-IN')}`
                        : 'No min'}
                    </td>

                    {/* Redemptions */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <Users size={12} className="text-white/40" />
                        <span className="font-bold text-white">{coupon.usedCount || 0}</span>
                        <span className="text-white/40">
                          {coupon.usageLimit ? `/ ${coupon.usageLimit}` : '(Unlimited)'}
                        </span>
                      </div>
                      {isLimitReached && (
                        <span className="text-[9px] text-amber-400 font-bold uppercase block mt-0.5">
                          Limit Reached
                        </span>
                      )}
                    </td>

                    {/* Valid Till */}
                    <td className="py-3.5 px-4 text-white/70">
                      {coupon.validTill ? (
                        <div>
                          <span className={isExpired ? 'text-rose-400 line-through' : 'text-white'}>
                            {new Date(coupon.validTill).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          {isExpired && (
                            <span className="text-[9px] text-rose-400 font-bold uppercase block">Expired</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-white/40">No expiry</span>
                      )}
                    </td>

                    {/* Target Event */}
                    <td className="py-3.5 px-4">
                      <span className="capitalize text-white/60">
                        {coupon.applicableEvents?.includes('all')
                          ? 'All Events'
                          : coupon.applicableEvents
                              ?.map((key) => {
                                const found = packages.find(
                                  (p) => p.key?.toLowerCase() === key?.toLowerCase()
                                )
                                return found ? found.title : key
                              })
                              .join(', ')}
                      </span>
                    </td>

                    {/* Status Badge (Read-Only) */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider select-none ${
                          coupon.isActive && !isExpired && !isLimitReached
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-white/5 text-white/40 border border-white/10'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            coupon.isActive && !isExpired && !isLimitReached
                              ? 'bg-emerald-400'
                              : 'bg-white/30'
                          }`}
                        />
                        <span>{coupon.isActive && !isExpired && !isLimitReached ? 'ACTIVE' : 'DISABLED'}</span>
                      </span>
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(coupon)}
                          title="Edit coupon"
                          className="text-white/40 hover:text-neon-cyan p-1.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon)}
                          title="Delete coupon"
                          className="text-white/40 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/40 transition-all cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE COUPON MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0e081c] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-neon-cyan/15 border border-neon-cyan/40 flex items-center justify-center text-neon-cyan">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-bold font-space text-white text-base">
                    {editingCouponId ? `Edit Coupon: ${formData.code}` : 'Create Promo Coupon'}
                  </h3>
                  <p className="text-[11px] text-white/50">
                    {editingCouponId
                      ? 'Update discount rate, usage limit, or expiry date'
                      : 'For influencer marketing or ticket promotions'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/40 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1.5">
                  Coupon Code *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. ROHIT10, VIPGUEST, EARLYBIRD"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white font-mono font-bold text-sm tracking-wider focus:outline-none focus:border-neon-cyan"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1.5">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-neon-cyan"
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="flat">Flat Amount Off (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1.5">
                    {formData.discountType === 'percentage' ? 'Discount % *' : 'Discount Amount (₹) *'}
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    max={formData.discountType === 'percentage' ? '100' : '50000'}
                    placeholder={formData.discountType === 'percentage' ? 'e.g. 15 (for 15%)' : 'e.g. 300'}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-neon-cyan"
                  />
                </div>
              </div>

              {/* Max Discount & Min Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formData.discountType === 'percentage' && (
                  <div>
                    <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1.5">
                      Max Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 500 (optional)"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-neon-cyan"
                    />
                  </div>
                )}

                <div className={formData.discountType !== 'percentage' ? 'sm:col-span-2' : ''}>
                  <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1.5">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1000 (0 for no min)"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-neon-cyan"
                  />
                </div>
              </div>

              {/* Usage Limit & Expiry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1.5">
                    Usage Limit (Max Uses)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 50 (leave blank for unlimited)"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-neon-cyan"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1.5">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.validTill}
                    onChange={(e) => setFormData({ ...formData, validTill: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-neon-cyan"
                  />
                </div>
              </div>

              {/* Applicable Events */}
              <div>
                <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1.5">
                  Applicable Pass Types
                </label>
                <select
                  value={formData.applicableEvents[0] || 'all'}
                  onChange={(e) => setFormData({ ...formData, applicableEvents: [e.target.value] })}
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-neon-cyan"
                >
                  <option value="all">All Passes (Applicable to Any Pass)</option>
                  {packages.map((pkg) => (
                    <option key={pkg.key || pkg._id} value={pkg.key}>
                      {pkg.title || pkg.key.toUpperCase()} (₹{pkg.price})
                    </option>
                  ))}
                </select>
              </div>

              {/* Coupon Status Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1.5">
                  Coupon Status
                </label>
                <select
                  value={formData.isActive ? 'active' : 'disabled'}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-neon-cyan"
                >
                  <option value="active">✓ ACTIVE (Customers can apply this coupon)</option>
                  <option value="disabled">✕ DISABLED (Temporarily deactivated)</option>
                </select>
              </div>

              {/* Settings Checkboxes (Clean Simple Inline) */}
              <div className="flex items-center gap-6 py-1">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-white/90">
                  <input
                    type="checkbox"
                    checked={formData.showOnWebsite}
                    onChange={(e) => setFormData({ ...formData, showOnWebsite: e.target.checked })}
                    className="w-4 h-4 rounded text-neon-cyan focus:ring-0 cursor-pointer"
                  />
                  <span>Show on Website</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-white/90">
                  <input
                    type="checkbox"
                    checked={formData.oneUsePerEmail}
                    onChange={(e) => setFormData({ ...formData, oneUsePerEmail: e.target.checked })}
                    className="w-4 h-4 rounded text-neon-cyan focus:ring-0 cursor-pointer"
                  />
                  <span>1 Use Per Email</span>
                </label>
              </div>

              {/* Description / Influencer Note */}
              <div>
                <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1.5">
                  Internal Note / Influencer Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Assigned to @rohit_vlogs for Reel promo"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-neon-cyan"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-neon-cyan text-[#071016] text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCouponId ? 'Update Coupon' : 'Create & Activate'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
