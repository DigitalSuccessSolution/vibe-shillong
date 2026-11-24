import { useState, useEffect } from 'react'
import { ArrowRight, CalendarDays, Check, ChevronDown, MapPin, Phone, QrCode } from 'lucide-react'
import { API_BASE_URL } from '../config/api'
import { DEFAULT_PACKAGES } from '../constants/packages'

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
        body: JSON.stringify({ amount: totalAmount, eventType: eventKey }),
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
                amountPaid: totalAmount,
              }),
            })
            const verifyData = await verifyRes.json()

            if (verifyData.success && verifyData.ticket) {
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

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold animate-in fade-in">
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-sm font-extrabold uppercase tracking-wider bg-neon-pink text-[#080612] shadow-[0_0_25px_rgba(255,53,196,0.4)] hover:shadow-[0_0_35px_rgba(255,53,196,0.65)] hover:opacity-95 transition-all cursor-pointer mt-3"
            >
              {loading ? (
                'Processing & Generating Pass...'
              ) : (
                <>
                  <QrCode size={18} /> Pay with Razorpay & Get E-Pass
                </>
              )}
            </button>

            <p className="text-center text-xs text-[#8a8299] pt-1">
              Secure UPI / Card Payment • Instant QR Pass on Screen & Email
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
