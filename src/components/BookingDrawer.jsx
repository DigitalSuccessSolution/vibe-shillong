import { useState, useEffect } from 'react'
import { X, Check, Lock, Minus, Plus, ShieldCheck, Sparkles, AlertCircle, Tag } from 'lucide-react'
import { API_BASE_URL } from '../config/api'
import { DEFAULT_PACKAGES } from '../constants/packages'
import { useAuth, GoogleIcon } from '../context/AuthContext'

export function RazorpayBadge({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-black tracking-normal ${className}`}>
      <img
        src="/razorpay.svg"
        alt="Razorpay"
        className="w-4 h-4 object-contain brightness-0"
      />
      <span>Razorpay</span>
    </span>
  )
}

export default function BookingDrawer({
  isOpen,
  onClose,
  selectedPackageKey = 'adult',
  onTicketGenerated,
}) {
  const { user, loginWithGoogle } = useAuth()
  const [packages, setPackages] = useState(DEFAULT_PACKAGES)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    event: selectedPackageKey || 'adult',
    quantity: 1,
  })

  // Coupon / Promo Code State
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [couponError, setCouponError] = useState('')

  // Reset form and coupon state whenever drawer opens fresh
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('')
      setCouponError('')
      setCouponInput('')
      setAppliedCoupon(null)

      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        event: selectedPackageKey || 'adult',
        quantity: 1,
      })
    }
  }, [isOpen, selectedPackageKey, user])

  // Fetch live packages from database
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/packages`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.packages) && data.packages.length > 0) {
          setPackages(data.packages)
        }
      })
      .catch((err) => console.error('Packages fetch error in drawer:', err))
  }, [])

  // Manage body scroll and Escape key
  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Calculate live pricing
  const selectedPkg = packages.find((p) => p.key === formData.event) || packages[0] || {}
  const pricePerTicket = Number(selectedPkg.price) || 0
  const quantity = Math.max(1, Number(formData.quantity) || 1)
  const totalAmount = pricePerTicket * quantity
  const discountAmount = appliedCoupon ? Number(appliedCoupon.discountAmount) || 0 : 0
  const finalPayable = Math.max(0, totalAmount - discountAmount)

  // Validate applied coupon whenever event tier or total amount changes!
  useEffect(() => {
    if (!isOpen || !appliedCoupon) return

    const allowed = appliedCoupon.applicableEvents || ['all']
    const currentEvent = (formData.event || 'adult').toLowerCase()
    const isEventAllowed = allowed.includes('all') || allowed.includes(currentEvent)

    // 1. If user switched to an event tier this coupon is NOT allowed for:
    if (!isEventAllowed) {
      setCouponError(
        `Coupon "${appliedCoupon.code}" was removed because it is only valid for ${allowed.join(', ').toUpperCase()} passes.`
      )
      setAppliedCoupon(null)
      return
    }

    // 2. If user decreased quantity below minimum order amount:
    if (appliedCoupon.minOrderAmount && totalAmount < appliedCoupon.minOrderAmount) {
      setCouponError(
        `Coupon "${appliedCoupon.code}" was removed because the minimum purchase is ₹${appliedCoupon.minOrderAmount.toLocaleString('en-IN')}.`
      )
      setAppliedCoupon(null)
      return
    }

    // 3. If still valid, recalculate discount
    if (appliedCoupon.discountType === 'percentage') {
      let recalculated = Math.round((totalAmount * appliedCoupon.discountValue) / 100)
      if (appliedCoupon.maxDiscount && recalculated > appliedCoupon.maxDiscount) {
        recalculated = appliedCoupon.maxDiscount
      }
      setAppliedCoupon((prev) => (prev ? { ...prev, discountAmount: recalculated } : null))
    }
  }, [formData.event, totalAmount, isOpen])

  const handleApplyCoupon = async () => {
    const clean = (couponInput || '').trim().toUpperCase()
    if (!clean) return

    setIsApplyingCoupon(true)
    setCouponError('')

    try {
      const res = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: clean,
          orderAmount: totalAmount,
          eventType: formData.event,
        }),
      })
      const data = await res.json()

      if (res.ok && data.success && data.valid) {
        setAppliedCoupon({
          code: data.coupon.code,
          discountAmount: data.discountAmount,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue,
          maxDiscount: data.coupon.maxDiscount,
          applicableEvents: data.coupon.applicableEvents || ['all'],
          minOrderAmount: data.coupon.minOrderAmount || 0,
          message: data.message,
        })
        setCouponError('')
      } else {
        setCouponError(data.message || 'Invalid coupon code')
        setAppliedCoupon(null)
      }
    } catch (err) {
      setCouponError('Network error checking coupon')
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    // 1. Full Name check
    if (!formData.name || !formData.name.trim()) {
      setErrorMessage('Please enter your full name.')
      setLoading(false)
      return
    }

    // 2. Google Verification Check
    if (!user || !user.email) {
      setErrorMessage('Please sign in with Google to verify your email address.')
      setLoading(false)
      return
    }

    // 3. Mobile Number Check
    const cleanPhone = (formData.phone || '').replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.')
      setLoading(false)
      return
    }

    const verifiedEmail = user.email.toLowerCase().trim()
    const verifiedName = formData.name.trim() || user.name || 'Festival Guest'
    const fullPhone = `+91 ${cleanPhone}`

    try {
      // 1. Create Razorpay order via server
      const orderRes = await fetch(`${API_BASE_URL}/api/tickets/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          eventType: formData.event,
          customerName: verifiedName,
          customerEmail: verifiedEmail,
          customerPhone: fullPhone,
          quantity: quantity,
          couponCode: appliedCoupon?.code || '',
        }),
      })
      const orderData = await orderRes.json()

      if (!orderData.success) {
        setErrorMessage(orderData.message || 'Payment initiation failed. Please check your internet connection.')
        setLoading(false)
        return
      }

      // If in sandbox mode (sample/test credentials), simulate successful test checkout & verify
      if (orderData.sandbox) {
        setTimeout(async () => {
          try {
            const fakePaymentId = `pay_test_${Date.now().toString(36)}`
            const verifyRes = await fetch(`${API_BASE_URL}/api/tickets/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: orderData.orderId,
                razorpay_payment_id: fakePaymentId,
                razorpay_signature: 'sandbox_verified',
                customerName: verifiedName,
                customerPhone: fullPhone,
                customerEmail: verifiedEmail,
                eventType: formData.event,
                quantity: quantity,
                amountPaid: finalPayable,
                originalAmount: totalAmount,
                discountAmount: discountAmount,
                couponCode: appliedCoupon?.code || null,
              }),
            })
            const verifyData = await verifyRes.json()

            if (verifyData.success && verifyData.ticket) {
              // Trigger Meta Pixel Purchase Event
              if (typeof window !== 'undefined' && window.fbq) {
                window.fbq('track', 'Purchase', {
                  value: finalPayable,
                  currency: 'INR',
                  content_name: selectedPkg?.title || formData.event,
                  content_type: 'event_ticket',
                  num_items: quantity,
                })
              }
              onClose()
              if (onTicketGenerated) onTicketGenerated(verifyData.ticket)
            } else {
              setErrorMessage(verifyData.message || 'Payment verification failed.')
            }
          } catch (err) {
            setErrorMessage('Verification server error: ' + err.message)
          } finally {
            setLoading(false)
          }
        }, 800)
        return
      }

      if (!window.Razorpay) {
        setErrorMessage('Razorpay payment gateway failed to load. Please disable ad-blockers and retry.')
        setLoading(false)
        return
      }

      // 2. Open Official Razorpay Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'VIBE Shillong',
        description: `${selectedPkg.title} (Qty: ${quantity})`,
        image: '/logo.jpeg',
        order_id: orderData.orderId,
        prefill: {
          name: verifiedName,
          email: verifiedEmail,
          contact: fullPhone,
        },
        theme: { color: '#0c83eb' },
        handler: async function (response) {
          setLoading(true)
          try {
            // 3. Strictly verify payment on server & save in MongoDB
            const verifyRes = await fetch(`${API_BASE_URL}/api/tickets/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customerName: verifiedName,
                customerPhone: fullPhone,
                customerEmail: verifiedEmail,
                eventType: formData.event,
                quantity: quantity,
                amountPaid: finalPayable,
                originalAmount: totalAmount,
                discountAmount: discountAmount,
                couponCode: appliedCoupon?.code || null,
              }),
            })
            const verifyData = await verifyRes.json()

            if (verifyData.success && verifyData.ticket) {
              // Trigger Meta Pixel Purchase Event
              if (typeof window !== 'undefined' && window.fbq) {
                window.fbq('track', 'Purchase', {
                  value: finalPayable,
                  currency: 'INR',
                  content_name: selectedPkg?.title || formData.event,
                  content_type: 'event_ticket',
                  num_items: quantity,
                })
              }
              onClose()
              if (onTicketGenerated) onTicketGenerated(verifyData.ticket)
            } else {
              setErrorMessage(verifyData.message || 'Payment verification failed.')
            }
          } catch (err) {
            setErrorMessage('Verification server error: ' + err.message)
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (resp) {
        setErrorMessage(`Payment declined: ${resp.error?.description || 'Transaction failed'}`)
        setLoading(false)
      })
      rzp.open()
    } catch (err) {
      setErrorMessage('Server connection error: ' + err.message)
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dark Ambient Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300 animate-in fade-in cursor-pointer"
      />

      {/* Slide-over Drawer Panel - Generous 600px Width, Human-Crafted Aesthetic */}
      <div className="relative z-10 w-full max-w-xl sm:max-w-2xl h-full bg-[#0c0717] border-l border-white/15 shadow-[0_0_80px_rgba(0,0,0,0.95)] flex flex-col justify-between overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-300">
        {/* Top Header - Compact, Sleek, Professional */}
        <div className="px-5 sm:px-7 py-3 sm:py-3.5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0c0717]/95 backdrop-blur-xl z-20">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <img
              src="/logo.jpeg"
              alt="VIBE Shillong"
              className="w-8 h-8 object-contain mix-blend-screen shrink-0"
            />
            <div className="min-w-0">
              <h2 className="font-bold font-space text-sm sm:text-base text-white tracking-wide leading-tight truncate">
                Book Festival Passes
              </h2>
              <p className="text-[11px] text-white/50 leading-tight truncate">
                Sat, 12 Dec 2026 · F Lounge by FTV
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white grid place-items-center transition-colors cursor-pointer border border-white/10 shrink-0 ml-3"
          >
            <X size={14} />
          </button>
        </div>

        {/* Drawer Form Body */}
        <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 space-y-6 flex-1">
          {/* Section 1: Choose Pass Tier (Visual Interactive Cards) */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <label className="text-xs uppercase font-bold tracking-wider text-white/80 whitespace-nowrap">
                1. Select Pass Tier
              </label>
              <span className="text-[11px] text-white/40 hidden sm:inline truncate">Choose festival session</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {packages.map((pkg) => {
                const isSelected = formData.event === pkg.key
                const color = (pkg.color || 'cyan').toLowerCase()
                const activeBorder =
                  color === 'pink'
                    ? 'border-neon-pink bg-neon-pink/15 shadow-[0_0_20px_rgba(255,53,196,0.25)]'
                    : color === 'lime'
                      ? 'border-neon-lime bg-neon-lime/15 shadow-[0_0_20px_rgba(0,255,136,0.2)]'
                      : 'border-neon-cyan bg-neon-cyan/15 shadow-[0_0_20px_rgba(53,234,255,0.2)]'

                return (
                  <button
                    key={pkg.key}
                    type="button"
                    disabled={pkg.soldOut}
                    onClick={() => setFormData({ ...formData, event: pkg.key })}
                    className={`relative p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${isSelected
                        ? activeBorder
                        : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]'
                      } ${pkg.soldOut ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        {pkg.badge ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 truncate">
                            {pkg.badge}
                          </span>
                        ) : (
                          <span />
                        )}
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-white text-black grid place-items-center shrink-0">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <h4 className="font-bold font-space text-sm text-white leading-tight">
                        {pkg.title}
                      </h4>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/10 flex items-baseline justify-between">
                      <span className="text-xs text-white/50">Price</span>
                      <span className="font-bold font-space text-base text-emerald-400">
                        ₹{Number(pkg.price).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 2: Quantity & Live Price Summary */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-white/50 block mb-0.5">
                Pass Summary
              </span>
              <h4 className="font-bold text-white text-base">
                {selectedPkg.title}
              </h4>
              <p className="text-xs text-white/50 font-mono mt-0.5">
                ₹{pricePerTicket.toLocaleString('en-IN')} × {quantity} {quantity === 1 ? 'ticket' : 'tickets'}
              </p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
              {/* Stepper */}
              <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-xl border border-white/15">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      quantity: Math.max(1, (Number(prev.quantity) || 1) - 1),
                    }))
                  }
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white grid place-items-center transition-colors cursor-pointer"
                >
                  <Minus size={14} />
                </button>
                <span className="font-mono font-bold text-base text-white px-2 min-w-6 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      quantity: Math.min(10, (Number(prev.quantity) || 1) + 1),
                    }))
                  }
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white grid place-items-center transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Total Amount */}
              <div className="text-right">
                <span className="text-[10px] text-white/40 uppercase block">Total Payable</span>
                <span className="text-2xl font-bold font-space text-emerald-400">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Attendee Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs uppercase font-bold tracking-wider text-white/80 whitespace-nowrap">
                2. Attendee Information
              </label>
              <span className="text-[11px] text-white/40 hidden sm:inline truncate">E-Pass delivered via email</span>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold text-white/70 block mb-1.5">
                Full Name <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="Enter attendee full name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  if (errorMessage) setErrorMessage('')
                }}
                className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/15 text-white text-sm focus:outline-none focus:border-neon-pink focus:bg-white/[0.07] transition-all"
              />
            </div>

            {/* Phone & Email Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1.5">
                  WhatsApp / Phone Number <span className="text-rose-500 font-bold">*</span>
                </label>

                <div className="relative flex items-center">
                  <span className="absolute left-0 top-0 bottom-0 px-3 flex items-center justify-center bg-white/[0.06] border-r border-white/15 text-xs font-mono font-bold text-white/80 rounded-l-xl select-none pointer-events-none">
                    +91
                  </span>
                  <input
                    required
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="98765 43210"
                    value={formData.phone}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 10)
                      setFormData({ ...formData, phone: clean })
                      if (errorMessage) setErrorMessage('')
                    }}
                    className="w-full h-12 pl-14 pr-4 rounded-xl bg-white/[0.04] border border-white/15 text-white text-sm font-mono tracking-wider focus:outline-none focus:border-neon-pink focus:bg-white/[0.07] transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-white/70">
                    Email Address <span className="text-rose-500 font-bold">*</span>
                  </label>
                  {user ? (
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                        <GoogleIcon size={11} className="shrink-0" /> Verified
                      </span>
                      <button
                        type="button"
                        onClick={loginWithGoogle}
                        className="text-[10px] text-white/40 hover:text-white underline cursor-pointer"
                        title="Switch Google Account"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-rose-400 font-medium">Google Required</span>
                  )}
                </div>

                {user ? (
                  <div className="relative">
                    <input
                      required
                      readOnly
                      type="email"
                      value={user.email}
                      className="w-full h-12 pl-3.5 pr-8 rounded-xl bg-black/50 border border-white/15 text-white/90 text-xs sm:text-sm cursor-not-allowed select-none focus:outline-none truncate"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400">
                      <Lock size={14} />
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('')
                      loginWithGoogle()
                    }}
                    className="w-full h-12 px-3 rounded-xl border border-white/20 bg-white/[0.05] hover:bg-white/[0.09] active:scale-[0.99] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <GoogleIcon size={16} className="shrink-0" />
                    <span className="truncate">Sign in with Google to Verify</span>
                  </button>
                )}
                <span className="text-[10px] text-white/40 block mt-1 leading-tight">
                  {user
                    ? 'Verified via Google'
                    : 'Your E-Pass will be delivered to this verified email'}
                </span>
              </div>
            </div>

            {/* Promo Code / Coupon Section */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                  <Tag size={13} className="text-neon-cyan" />
                  <span>Have a Promo Code?</span>
                </label>
                {appliedCoupon && (
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={11} /> Applied
                  </span>
                )}
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <span className="font-mono font-bold text-xs text-emerald-300 block">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-[10px] text-emerald-400/80 block">
                        {appliedCoupon.message || `Saved ₹${discountAmount.toLocaleString('en-IN')}`}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[11px] text-white/50 hover:text-rose-400 font-bold px-2 py-1 rounded cursor-pointer transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. ROHIT10)"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase())
                      if (couponError) setCouponError('')
                    }}
                    className="flex-1 h-10 px-3 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono tracking-wider uppercase focus:outline-none focus:border-neon-cyan"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponInput.trim()}
                    className="h-10 px-4 rounded-xl bg-white/10 hover:bg-neon-cyan hover:text-[#071016] text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                  >
                    {isApplyingCoupon ? 'Checking...' : 'Apply'}
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>{couponError}</span>
                </p>
              )}

              {/* Price Breakdown */}
              <div className="pt-2 border-t border-white/10 space-y-1 text-xs">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal ({quantity} {quantity === 1 ? 'pass' : 'passes'})</span>
                  <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold text-sm pt-1 border-t border-white/10">
                  <span>Total Payable</span>
                  <span className="text-neon-cyan">₹{finalPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2 min-w-0">
                <AlertCircle size={16} className="shrink-0 text-rose-400" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage('')}
                className="text-rose-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer shrink-0"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Section 4: Primary Checkout Action & Trust Badge */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading || selectedPkg.soldOut}
              className="w-full h-13 sm:h-14 rounded-2xl bg-[#0c83eb] hover:bg-[#0a74d4] text-white font-extrabold text-sm uppercase tracking-wider active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 px-4 shadow-[0_4px_16px_rgba(12,131,235,0.25)]"
            >
              {loading ? (
                'Securing Payment...'
              ) : selectedPkg.soldOut ? (
                'This Pass Tier is Sold Out'
              ) : (
                <>
                  <Lock size={16} className="shrink-0" />
                  <span>Proceed to Pay ₹{finalPayable.toLocaleString('en-IN')}</span>
                </>
              )}
            </button>

            {/* Secured by Razorpay */}
            <div className="flex items-center justify-center gap-1.5 pt-0.5 text-xs text-white/50 select-none">
              <span>Secured by</span>
              <span className="inline-flex items-center gap-1">
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  className="w-3.5 h-3.5 fill-[#0C83EB] shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z" />
                </svg>
                <span className="font-sans font-semibold tracking-tight text-xs text-white/90">
                  Razorpay
                </span>
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
