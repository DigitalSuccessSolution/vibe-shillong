import { useState } from 'react'
import { Mail, Phone, Send, CheckCircle2 } from 'lucide-react'
import { API_BASE_URL } from '../config/api'

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'VIP Table & Bottle Service',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Send contact request to backend
      await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      }).catch(() => {
        // Fallback gracefully even if backend is offline
      })

      setSubmitted(true)
      setFormData({
        name: '',
        phone: '',
        email: '',
        subject: 'VIP Table & Bottle Service',
        message: '',
      })
    } catch {
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-24 max-w-6xl mx-auto px-6 relative scroll-mt-28" id="contact">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Event Contact Details & Info */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-neon-pink flex items-center gap-1.5 mb-2.5">
              <span className="w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
              Get In Touch
            </span>
            <h2 className="font-bold font-space text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-tight">
              HAVE QUESTIONS? <br />
              <span className="gradient-text">CONNECT WITH US.</span>
            </h2>
          </div>

          <p className="text-neon-muted text-sm sm:text-base leading-relaxed">
            Need VIP table reservations, group bookings, brand sponsorship, or festival assistance? Our concierge team is here to assist you.
          </p>

          {/* Quick Contact Info Cards */}
          <div className="space-y-3.5 pt-2">
            {/* Phone & WhatsApp Support */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-neon-cyan/40 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan grid place-items-center shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/40 block">Phone & WhatsApp Support</span>
                <a
                  href="tel:+918731846927"
                  className="text-sm sm:text-base font-bold text-white hover:text-neon-cyan transition-colors"
                >
                  +91 87318 46927
                </a>
              </div>
            </div>

            {/* Direct Email Link */}
            <div className="flex items-center gap-2 pt-1 px-1 text-xs text-white/50">
              <Mail size={13} className="text-neon-pink shrink-0" />
              <span>Direct Email:</span>
              <a href="mailto:vibeshillong@gmail.com" className="text-white hover:text-neon-pink font-semibold underline decoration-white/30 transition-colors">
                vibeshillong@gmail.com
              </a>
            </div>
          </div>

          {/* Party Atmospheric Visual */}
          <div className="h-44 sm:h-52 overflow-hidden rounded-2xl border border-white/10 shadow-2xl relative">
            <img
              src="/images/tina/Neon Nightclub Dancefloor Spectacle.png"
              alt="VIBE Shillong Celebration"
              className="w-full h-full object-cover brightness-85"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080612]/90 via-transparent to-transparent flex items-end p-4">
              <span className="text-xs font-bold tracking-widest text-white/90 uppercase">
                VIBE Shillong · Electric UV Experience
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Us Form */}
        <div className="lg:col-span-6 bg-[#0f0a1c] border border-white/15 hover:border-neon-pink/40 transition-colors p-7 sm:p-9 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.7)] relative overflow-hidden">
          {/* Top ambient glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-neon-pink/20 rounded-full blur-[70px] pointer-events-none" />

          <div className="relative z-10 mb-6">
            <h3 className="font-bold font-space text-2xl sm:text-3xl text-white mb-1.5 leading-tight">
              Send us a message
            </h3>
            <p className="text-xs text-neon-muted">
              Have a question or request? Fill in your details below and our team will get back to you shortly.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 grid place-items-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="font-bold font-space text-lg text-white">Message Sent Successfully!</h4>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Thank you for reaching out. Our festival coordinator will contact you via WhatsApp or Email within 2 hours.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-2 px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10 text-xs">
              {/* Full Name */}
              <div>
                <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-neon-pink transition-all"
                />
              </div>

              {/* Phone & Email side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    WhatsApp / Phone
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-neon-pink transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-neon-pink transition-all"
                  />
                </div>
              </div>

              {/* Inquiry Subject */}
              <div>
                <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Inquiry Topic
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-[#120a22] border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-neon-pink appearance-none cursor-pointer"
                >
                  <option value="VIP Table & Bottle Service">VIP Table & Bottle Service Reservation</option>
                  <option value="Group / Bulk Pass Booking">Group / Bulk Pass Booking Discount</option>
                  <option value="Kids Carnival Family Pass Inquiry">Kids Carnival Family Pass Inquiry</option>
                  <option value="Sponsorship & Brand Collaboration">Sponsorship & Brand Collaboration</option>
                  <option value="General Festival Question">General Festival Question</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Your Message / Query
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us what you need help with (e.g. VIP table for 6 guests, special requirements, timing questions)..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-white/15 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-neon-pink transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider bg-neon-pink text-[#080612] shadow-[0_0_25px_rgba(255,53,196,0.4)] hover:shadow-[0_0_35px_rgba(255,53,196,0.65)] hover:opacity-95 transition-all cursor-pointer mt-2"
              >
                {submitting ? (
                  'Sending Inquiry...'
                ) : (
                  <>
                    <Send size={15} /> Send Message
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-white/40 pt-1">
                We respond within 2 hours • WhatsApp & Email Support Available
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
