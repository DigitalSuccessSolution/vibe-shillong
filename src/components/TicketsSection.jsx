import { useState, useEffect } from 'react'
import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { API_BASE_URL } from '../config/api'
import { DEFAULT_PACKAGES } from '../constants/packages'

export default function TicketsSection({ onOpenBooking }) {
  const [packages, setPackages] = useState(DEFAULT_PACKAGES)

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/packages`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.packages) && data.packages.length > 0) {
          setPackages(data.packages)
        }
      })
      .catch(() => {
        // Keeps default packages smoothly
      })
  }, [])

  return (
    <section className="py-24 max-w-6xl mx-auto px-6" id="tickets">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="font-bold font-space text-4xl sm:text-5xl text-white tracking-tight">
          CHOOSE YOUR <span className="gradient-text">PASS.</span>
        </h2>
        <p className="text-sm text-neon-muted mt-3">
          Select your festival session below. Early bird access and VIP tables are open for booking.
        </p>
      </div>

      {/* Ticket Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-7 items-stretch pt-3">
        {packages.map((pkg) => {
          const color = (pkg.color || 'cyan').toLowerCase()
          const isPink = color === 'pink'
          const isLime = color === 'lime'
          const accentColor = isPink ? 'neon-pink' : isLime ? 'neon-lime' : 'neon-cyan'

          return (
            <article
              key={pkg.key}
              className={`relative flex flex-col rounded-2xl p-7 sm:p-8 transition-all duration-300 ${
                isPink
                  ? 'bg-[#180a22] border-2 border-neon-pink shadow-[0_0_40px_rgba(255,53,196,0.28)] md:-translate-y-2'
                  : isLime
                  ? 'bg-[#0a1812] border border-neon-lime/40 hover:border-neon-lime/80 shadow-[0_4px_30px_rgba(0,255,136,0.06)]'
                  : 'bg-[#0c1422] border border-neon-cyan/35 hover:border-neon-cyan/60 shadow-[0_4px_30px_rgba(53,234,255,0.06)]'
              }`}
            >
              {/* Popular Floating Badge */}
              {pkg.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-neon-pink text-[#080612] shadow-[0_0_20px_rgba(255,53,196,0.6)]">
                    <Sparkles size={12} fill="currentColor" /> Most Popular
                  </span>
                </div>
              )}

              <div>
                <span
                  className={`text-[11px] font-bold tracking-widest uppercase block mb-2 ${
                    isPink ? 'text-neon-pink' : isLime ? 'text-neon-lime' : 'text-neon-cyan'
                  }`}
                >
                  {pkg.badge || 'Official Pass'}
                </span>
                <h3 className="font-bold font-space text-2xl sm:text-3xl text-white leading-tight">
                  {pkg.title}
                </h3>
                {pkg.timing && (
                  <p className="text-xs text-neon-muted mt-1.5">{pkg.timing}</p>
                )}
              </div>

              {/* Dynamic Price */}
              <div className="font-bold font-space text-3xl sm:text-4xl text-white my-4">
                ₹{Number(pkg.price).toLocaleString('en-IN')}
              </div>
              {pkg.subtitle && (
                <p className="text-xs text-neon-muted mb-6 leading-relaxed">
                  {pkg.subtitle}
                </p>
              )}

              <div className="w-full h-px bg-white/10 mb-6" />

              {/* Dynamic Feature List */}
              <ul className="space-y-3.5 mb-8 flex-1 text-xs sm:text-[13px] text-[#cec8da]">
                {pkg.features?.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check
                      size={16}
                      className={`shrink-0 mt-0.5 ${
                        isPink ? 'text-neon-pink' : isLime ? 'text-neon-lime' : 'text-neon-cyan'
                      }`}
                    />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              {pkg.soldOut ? (
                <button
                  disabled
                  className="w-full py-3.5 text-xs sm:text-sm font-bold tracking-wide bg-white/10 text-white/40 rounded-xl cursor-not-allowed"
                >
                  Sold Out
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenBooking ? onOpenBooking(pkg.key) : (window.location.hash = '#booking')}
                  className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-bold tracking-wide rounded-xl hover:opacity-90 transition-all cursor-pointer ${
                    isPink
                      ? 'bg-neon-pink text-[#080612] shadow-[0_0_25px_rgba(255,53,196,0.35)]'
                      : isLime
                      ? 'bg-neon-lime text-[#080612] shadow-[0_0_20px_rgba(0,255,136,0.25)]'
                      : 'bg-neon-cyan text-[#071016] shadow-[0_0_20px_rgba(53,234,255,0.25)]'
                  }`}
                >
                  Book Pass Now <ArrowRight size={15} />
                </button>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
