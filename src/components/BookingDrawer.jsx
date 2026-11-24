import { useState, useEffect } from 'react'
import { X, Check, Lock, Minus, Plus, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react'
import { API_BASE_URL } from '../config/api'
import { DEFAULT_PACKAGES } from '../constants/packages'

export default function BookingDrawer({
  isOpen,
  onClose,
  selectedPackageKey = 'adult',
  onTicketGenerated,
}) {
  const [packages, setPackages] = useState(DEFAULT_PACKAGES)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    event: selectedPackageKey || 'adult',
    quantity: 1,
  })

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

  // Sync selected package when prop changes or drawer opens
  useEffect(() => {
    if (selectedPackageKey) {
      setFormData((prev) => ({ ...prev, event: selectedPackageKey }))
    }
  }, [selectedPackageKey, isOpen])

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

  if (!isOpen) return null

  // Calculate live pricing
  const selectedPkg = packages.find((p) => p.key === formData.event) || packages[0] || {}
  const pricePerTicket = Number(selectedPkg.price) || 0
  const quantity = Math.max(1, Number(formData.quantity) || 1)
  const totalAmount = pricePerTicket * quantity

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      // 1. Create Razorpay order via server
      const orderRes = await fetch(`${API_BASE_URL}/api/tickets/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          eventType: formData.event,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          quantity: quantity,
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
                customerName: formData.name,
                customerPhone: formData.phone,
                customerEmail: formData.email,
                eventType: formData.event,
                quantity: quantity,
                amountPaid: totalAmount,
              }),
            })
            const verifyData = await verifyRes.json()

            if (verifyData.success && verifyData.ticket) {
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
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: '#ff35c4' },
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
                customerName: formData.name,
                customerPhone: formData.phone,
                customerEmail: formData.email,
                eventType: formData.event,
                quantity: quantity,
                amountPaid: totalAmount,
              }),
            })
            const verifyData = await verifyRes.json()

            if (verifyData.success && verifyData.ticket) {
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

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dark Ambient Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300 animate-in fade-in cursor-pointer"
      />

      {/* Slide-over Drawer Panel - Generous 600px Width, Human-Crafted Aesthetic */}
      <div className="relative z-10 w-full max-w-xl sm:max-w-2xl h-full bg-[#0c0717] border-l border-white/15 shadow-[0_0_80px_rgba(0,0,0,0.95)] flex flex-col justify-between overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-300">
        {/* Top Header - Clean, Sleek, Professional */}
        <div className="px-6 sm:px-8 py-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0c0717]/95 backdrop-blur-xl z-20">
          <div className="flex items-center gap-3.5">
            <img
              src="/logo.jpeg"
              alt="VIBE Shillong"
              className="w-10 h-10 object-contain mix-blend-screen shrink-0"
            />
            <div>
              <h2 className="font-bold font-space text-lg sm:text-xl text-white tracking-wide leading-tight">
                Book Festival Passes
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Saturday, 12 December 2026 · F Lounge by FTV
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white grid place-items-center transition-colors cursor-pointer border border-white/10"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Form Body */}
        <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 space-y-6 flex-1">
          {/* Section 1: Choose Pass Tier (Visual Interactive Cards) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs uppercase font-bold tracking-wider text-white/80">
                1. Select Pass Tier
              </label>
              <span className="text-xs text-white/40">Choose your festival session</span>
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

          {/* Section 3: Attendee Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase font-bold tracking-wider text-white/80">
                2. Attendee Information
              </label>
              <span className="text-xs text-white/40">E-Pass will be sent to this email</span>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold text-white/70 block mb-1.5">
                Full Name
              </label>
              <input
                required
                type="text"
                placeholder="Enter attendee full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/15 text-white text-sm focus:outline-none focus:border-neon-pink focus:bg-white/[0.07] transition-all"
              />
            </div>

            {/* Phone & Email Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1.5">
                  WhatsApp / Phone Number
                </label>
                <input
                  required
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/15 text-white text-sm focus:outline-none focus:border-neon-pink focus:bg-white/[0.07] transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1.5">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/15 text-white text-sm focus:outline-none focus:border-neon-pink focus:bg-white/[0.07] transition-all"
                />
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 4: Primary Checkout Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || selectedPkg.soldOut}
              className="w-full h-14 rounded-2xl bg-neon-pink text-[#080612] font-extrabold text-sm uppercase tracking-wider hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer shadow-[0_0_35px_rgba(255,53,196,0.45)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                'Securing Payment...'
              ) : selectedPkg.soldOut ? (
                'This Pass Tier is Sold Out'
              ) : (
                <>
                  <Lock size={16} /> Proceed to Pay ₹{totalAmount.toLocaleString('en-IN')} via Razorpay
                </>
              )}
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-5 text-xs text-white/50 pt-2 pb-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" /> Official 256-Bit SSL Checkout
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-neon-cyan" /> Instant QR E-Pass Delivery
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
