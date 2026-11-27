import { useState, useEffect } from 'react'
import { ArrowRight, CalendarDays, Check, ChevronDown, MapPin, Phone, QrCode, Tag, Sparkles, AlertCircle, Lock, Ticket, Percent } from 'lucide-react'
import { API_BASE_URL } from '../config/api'
import { DEFAULT_PACKAGES } from '../constants/packages'
import { RazorpayBadge } from './BookingDrawer'

export default function BookingSection({ onTicketGenerated }) {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [packages, setPackages] = useState(DEFAULT_PACKAGES)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    event: 'adult',
    quantity: 1,
  })

  // Coupon / Promo Code State
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [publicCoupons, setPublicCoupons] = useState([])

  // Fetch active public coupons for website
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/coupons/public`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.coupons)) {
          setPublicCoupons(data.coupons)
        }
      })
      .catch((err) => console.warn('Public coupons fetch error:', err))
  }, [])

  const eventKey = formData.event === 'both' ? 'vip' : formData.event
  const selectedPkg = packages.find((p) => p.key === eventKey) || packages[0]
  const pricePerTicket = Number(selectedPkg?.price) || 1499
  const totalAmount = pricePerTicket * (Number(formData.quantity) || 1)
  const discountAmount = appliedCoupon ? Number(appliedCoupon.discountAmount) || 0 : 0
  const finalPayable = Math.max(0, totalAmount - discountAmount)

  // Validate applied coupon whenever event tier or total amount changes!
  useEffect(() => {
    if (!appliedCoupon) return

    const allowed = appliedCoupon.applicableEvents || ['all']
    const currentEvent = (eventKey || 'adult').toLowerCase()
    const isEventAllowed = allowed.includes('all') || allowed.includes(currentEvent)

    // 1. If user switched to an event tier this coupon is NOT allowed for:
    if (!isEventAllowed) {
      setCouponError(
        `Coupon "${appliedCoupon.code}" was removed because it is only valid for ${allowed.join(', ').toUpperCase()} passes.`
      )
      setAppliedCoupon(null)
      return
    }

    // 2. If user changed quantity below minimum order amount:
    if (appliedCoupon.minOrderAmount && totalAmount < appliedCoupon.minOrderAmount) {
      setCouponError(
        `Coupon "${appliedCoupon.code}" was removed because the minimum purchase is ₹${appliedCoupon.minOrderAmount.toLocaleString('en-IN')}.`
      )
      setAppliedCoupon(null)
      return
    }

    // 3. Recalculate discount if quantity or package changes
    if (appliedCoupon.discountType === 'percentage') {
      let recalculated = Math.round((totalAmount * appliedCoupon.discountValue) / 100)
      if (appliedCoupon.maxDiscount && recalculated > appliedCoupon.maxDiscount) {
        recalculated = appliedCoupon.maxDiscount
      }
      setAppliedCoupon((prev) => (prev ? { ...prev, discountAmount: recalculated } : null))
    }
  }, [eventKey, totalAmount])

  const handleApplyCoupon = async (codeOverride) => {
    const raw = typeof codeOverride === 'string' ? codeOverride : couponInput
    const clean = (raw || '').trim().toUpperCase()
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
          eventType: eventKey,
          email: formData.email || '',
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

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/packages`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.packages) && data.packages.length > 0) {
          setPackages(data.packages)
        }
      })
      .catch((err) => console.error('Packages fetch error:', err))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    const eventKey = formData.event === 'both' ? 'vip' : formData.event
    const selectedPkg = packages.find((p) => p.key === eventKey) || packages[0]
    const pricePerTicket = Number(selectedPkg?.price) || 1499
    const totalAmount = pricePerTicket * (Number(formData.quantity) || 1)

    try {
      // 1. Create strict Razorpay Order via backend
      const orderRes = await fetch(`${API_BASE_URL}/api/tickets/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          eventType: eventKey,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          quantity: formData.quantity,
          couponCode: appliedCoupon?.code || '',
        }),
      })
      const orderData = await orderRes.json()

      if (!orderData.success) {
        setErrorMessage(orderData.message || 'Payment initiation failed. Please contact event support.')
        setLoading(false)
        return
      }

      if (!window.Razorpay) {
        setErrorMessage('Razorpay payment gateway failed to load. Please check your internet connection.')
        setLoading(false)
        return
      }

      // 2. Open Official Razorpay Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'VIBE Shillong',
        description: `${selectedPkg.title} (Qty: ${formData.quantity})`,
        image: '/logo.jpeg',
        order_id: orderData.orderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: '#ff35c4' },
        handler: async function (response) {
          setLoading(true)
          try {
            // 3. Strictly verify payment on server & save in MongoDB Atlas
            const verifyRes = await fetch(`${API_BASE_URL}/api/tickets/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customerName: formData.name,
                customerPhone: formData.phone,
                customerEmail: formData.email,
                eventType: eventKey,
                quantity: formData.quantity,
                amountPaid: finalPayable,
                originalAmount: totalAmount,
                discountAmount: discountAmount,
                couponCode: appliedCoupon?.code || null,
              }),
            })
            const verifyData = await verifyRes.json()

            if (verifyData.success && verifyData.ticket) {
              if (typeof window !== 'undefined' && window.fbq) {
                window.fbq('track', 'Purchase', {
                  value: finalPayable,
                  currency: 'INR',
                  content_name: selectedPkg?.title || eventKey,
                  content_type: 'event_ticket',
                  num_items: formData.quantity,
                })
              }
              if (onTicketGenerated) onTicketGenerated(verifyData.ticket)
            } else {
              setErrorMessage(verifyData.message || 'Payment verification failed.')
            }
          } catch (err) {
            setErrorMessage('Network error during verification: ' + err.message)
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
      rzp.on('payment.failed', function (response) {
        setErrorMessage(`Payment declined: ${response.error?.description || 'Transaction failed'}`)
        setLoading(false)
      })
      rzp.open()
    } catch (err) {
      setErrorMessage('Server connection error: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <section className="py-24 max-w-6xl mx-auto px-6 relative" id="booking">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left: Copy & Details */}
        <div className="lg:col-span-6">
          <h2 className="font-bold font-space text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white mb-4 leading-tight">
            YOUR NEON
            <br />
            MOMENT <span className="gradient-text">AWAITS.</span>
          </h2>
          <p className="text-neon-muted text-sm sm:text-base leading-relaxed max-w-md mb-6">
            Book your official pass today. Instant digital ticket with secure QR entry will be generated for F Lounge by FTV.
          </p>

          {/* Clean Inline Date & Destination */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-sm text-[#ece5f4] mb-7 font-medium">
            <div className="flex items-center gap-2">
              <CalendarDays size={17} className="text-neon-cyan shrink-0" />
              <span>Saturday, 12 December 2026</span>
            </div>
            <span className="hidden sm:inline text-white/20">•</span>
            <div className="flex items-center gap-2">
              <MapPin size={17} className="text-neon-pink shrink-0" />
              <span>F Lounge by FTV</span>
            </div>
          </div>

          {/* Party Atmospheric Visual */}
          <div className="h-52 sm:h-60 overflow-hidden rounded-2xl border border-white/10 shadow-2xl relative">
            <img
              src="/images/tina/Neon Nightclub Dancefloor Spectacle.png"
              alt="Neon Festival Celebration"
              className="w-full h-full object-cover brightness-85"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080612]/90 via-transparent to-transparent flex items-end p-5">
              <span className="text-xs font-bold tracking-widest text-white/90 uppercase">
                Electric Blacklight UV Experience
              </span>
            </div>
          </div>
        </div>

        {/* Right: Registration Form */}
        <div className="lg:col-span-6 bg-[#0f0a1c] border border-white/15 hover:border-neon-pink/40 transition-colors p-8 sm:p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.7)] relative overflow-hidden">
          {/* Subtle top neon ambient glow inside the card */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-neon-pink/20 rounded-full blur-[70px] pointer-events-none" />

          <h3 className="font-bold font-space text-2xl sm:text-3xl text-white mb-2 leading-tight">
            Book your event pass
          </h3>
          <p className="text-xs text-neon-muted mb-7">
            Instant QR pass generated directly to your screen and saved in database.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                Full name
              </label>
              <input
                required
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-black/50 border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink/50 transition-all"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                Email address
              </label>
              <input
                required
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-black/50 border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink/50 transition-all"
              />
            </div>

            {/* WhatsApp / Phone Number */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                WhatsApp / Phone Number
              </label>
              <input
                required
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-black/50 border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink/50 transition-all"
              />
            </div>

            {/* Event Interest Dropdown */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                Select Session
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.event}
                  onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink/50 transition-all appearance-none cursor-pointer pr-10"
                >
                  {packages.map((pkg) => (
                    <option
                      key={pkg.key}
                      value={pkg.key}
                      disabled={pkg.soldOut}
                      className="bg-[#120a22] text-white"
                    >
                      {pkg.title} (₹{Number(pkg.price).toLocaleString('en-IN')}){' '}
                      {pkg.soldOut ? '— SOLD OUT' : ''}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            {/* Promo Code / Coupon Section */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white/80 flex items-center gap-1.5">
                  <Tag size={12} className="text-neon-cyan" />
                  <span>Promo Code</span>
                </span>
                {appliedCoupon && (
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    ✓ Applied
                  </span>
                )}
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-bold text-emerald-300">
                      {appliedCoupon.code}
                    </span>
                    <span className="text-[11px] text-emerald-400">
                      (-₹{discountAmount.toLocaleString('en-IN')})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  {/* Single Clean Input with Embedded Apply */}
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase())
                        if (couponError) setCouponError('')
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          if (couponInput.trim() && !isApplyingCoupon) {
                            handleApplyCoupon()
                          }
                        }
                      }}
                      className="w-full h-9 px-3 pr-18 rounded-lg bg-black/50 border border-white/15 text-white text-xs font-mono tracking-wider uppercase placeholder:text-white/35 placeholder:font-sans placeholder:normal-case focus:outline-none focus:border-neon-cyan"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      disabled={isApplyingCoupon || !couponInput.trim()}
                      className="absolute right-1 h-7 px-3 rounded-md bg-neon-cyan/20 hover:bg-neon-cyan text-neon-cyan hover:text-black text-[11px] font-bold uppercase tracking-wider disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all"
                    >
                      {isApplyingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>

                  {/* Public Offer Strip */}
                  {(() => {
                    const relevant = publicCoupons.find((c) => {
                      const allowed = c.applicableEvents || ['all']
                      const current = (eventKey || 'adult').toLowerCase()
                      return allowed.includes('all') || allowed.includes(current)
                    })
                    if (!relevant) return null

                    const discountText =
                      relevant.discountType === 'percentage'
                        ? `${relevant.discountValue}% OFF`
                        : `₹${relevant.discountValue} OFF`

                    return (
                      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-dashed border-neon-cyan/30 bg-neon-cyan/[0.04] text-xs">
                        <span className="text-[11px] text-white/80 truncate">
                          Use <strong className="font-mono text-neon-cyan">{relevant.code}</strong> for{' '}
                          <span className="text-neon-cyan font-bold">{discountText}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCouponInput(relevant.code)
                            handleApplyCoupon(relevant.code)
                          }}
                          className="text-[11px] font-bold text-neon-cyan hover:text-white ml-2 cursor-pointer shrink-0"
                        >
                          Apply
                        </button>
                      </div>
                    )
                  })()}
                </>
              )}

              {couponError && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>{couponError}</span>
                </p>
              )}

              {/* Price Breakdown */}
              <div className="pt-2 border-t border-white/10 space-y-1 text-xs">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal ({formData.quantity} {Number(formData.quantity) === 1 ? 'pass' : 'passes'})</span>
                  <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-1.5 border-t border-white/10">
                  <span className="font-bold text-white text-xs uppercase tracking-wider">Total Payable</span>
                  <div className="text-right">
                    {discountAmount > 0 && (
                      <span className="text-[11px] text-white/40 line-through mr-1.5">
                        ₹{totalAmount.toLocaleString('en-IN')}
                      </span>
                    )}
                    <span className="font-black text-sm text-neon-cyan">
                      ₹{finalPayable.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold animate-in fade-in">
                {errorMessage}
              </div>
            )}

            {/* Submit Button & Trust Badge */}
            <div className="mt-3 space-y-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-extrabold uppercase tracking-wider bg-[#0c83eb] hover:bg-[#0a74d4] text-white active:scale-[0.99] transition-all cursor-pointer shadow-[0_4px_16px_rgba(12,131,235,0.25)]"
              >
                {loading ? (
                  'Processing & Generating Pass...'
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Proceed to Pay ₹{finalPayable.toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>

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
    </section>
  )
}
