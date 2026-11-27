import { useState, useEffect } from 'react'
import { X, ArrowRight, Ticket, ChevronUp, ChevronDown, Sparkles } from 'lucide-react'
import { API_BASE_URL } from '../config/api'

export default function FloatingOfferPill({ onClaimOffer }) {
  const [coupons, setCoupons] = useState([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem('dismiss_offer_pill') === 'true'
      if (dismissed) {
        setIsDismissed(true)
        return
      }
    } catch {}

    fetch(`${API_BASE_URL}/api/coupons/public`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.coupons) && data.coupons.length > 0) {
          setCoupons(data.coupons)
        }
      })
      .catch((err) => console.warn('Public offers fetch error:', err))
  }, [])

  if (isDismissed || coupons.length === 0) return null

  const handleDismiss = (e) => {
    e.stopPropagation()
    setIsDismissed(true)
    try {
      sessionStorage.setItem('dismiss_offer_pill', 'true')
    } catch {}
  }

  const handleApply = (coupon) => {
    let targetEvent = 'adult'
    const allowed = (coupon.applicableEvents || ['all']).map((e) => String(e).toLowerCase())
    if (allowed.includes('kids') && !allowed.includes('all')) {
      targetEvent = 'kids'
    } else if (allowed.includes('vip') && !allowed.includes('all')) {
      targetEvent = 'vip'
    }

    if (onClaimOffer) {
      onClaimOffer(coupon.code, targetEvent)
    }
    setIsExpanded(false)
  }

  const singleCoupon = coupons[0]
  const isMultiple = coupons.length > 1

  return (
    <aside
      aria-label="Live Offers"
      className="fixed bottom-4 left-4 z-40 flex flex-col items-start max-w-[calc(100vw-5rem)] sm:max-w-md animate-in fade-in slide-in-from-bottom-3 duration-300 font-sans pointer-events-auto"
    >
      {/* Expanded Multi-Offers Popover (BookMyShow / Zomato Live Style) */}
      {isExpanded && (
        <div className="mb-2 w-full sm:w-[340px] rounded-2xl bg-[#09131a]/95 border border-neon-cyan/40 shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(53,234,255,0.2)] backdrop-blur-xl p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-200">
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-neon-cyan/15 text-neon-cyan flex items-center justify-center">
                <Ticket size={13} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Available Offers
                </span>
                <span className="text-[10px] text-white/50 block">
                  {coupons.length} {coupons.length === 1 ? 'offer' : 'offers'} active on passes
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {/* Offers List */}
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {coupons.map((c) => {
              const discountText =
                c.discountType === 'percentage'
                  ? `${c.discountValue}% OFF`
                  : `₹${c.discountValue} FLAT OFF`

              let appliesTo = 'All Passes'
              if (c.applicableEvents && !c.applicableEvents.includes('all')) {
                appliesTo = c.applicableEvents.map((e) => e.toUpperCase()).join(', ') + ' Passes'
              }

              return (
                <div
                  key={c._id || c.code}
                  className="p-2.5 rounded-xl border border-dashed border-white/20 hover:border-neon-cyan/50 bg-white/[0.02] hover:bg-neon-cyan/[0.04] transition-all flex items-center justify-between gap-2.5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-neon-cyan tracking-wider bg-neon-cyan/15 px-2 py-0.5 rounded border border-neon-cyan/30">
                        {c.code}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {discountText}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-white/50 mt-1">
                      <span>{appliesTo}</span>
                      {c.minOrderAmount > 0 && (
                        <span>• Min ₹{c.minOrderAmount.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApply(c)}
                    className="shrink-0 px-3 py-1 rounded-lg bg-neon-cyan hover:bg-white text-[#071016] text-xs font-semibold uppercase tracking-wide transition-all shadow-[0_0_8px_rgba(53,234,255,0.3)] cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              )
            })}
          </div>

          <div className="pt-1 text-center">
            <span className="text-[10px] text-white/40">
              Discounts apply automatically at checkout
            </span>
          </div>
        </div>
      )}

      {/* Floating Pill (Always Visible Trigger - Snug w-fit, zero dead space) */}
      <div
        onClick={() => {
          if (isMultiple) {
            setIsExpanded(!isExpanded)
          } else {
            handleApply(singleCoupon)
          }
        }}
        className="group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#071016]/95 border border-neon-cyan/40 hover:border-neon-cyan/80 shadow-[0_4px_24px_rgba(0,0,0,0.6),0_0_15px_rgba(53,234,255,0.25)] backdrop-blur-md cursor-pointer transition-all hover:scale-[1.02] w-fit select-none"
      >
        {/* Pulsing Live Dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan shadow-[0_0_6px_#35eaff]" />
        </span>

        {/* Content */}
        {isMultiple ? (
          <div className="flex items-center gap-2 text-xs text-white/90 truncate min-w-0">
            <span className="font-semibold text-white text-xs flex items-center gap-1.5">
              <Ticket size={13} className="text-neon-cyan" />
              <span>{coupons.length} Offers Available</span>
            </span>
            <span className="text-[11px] text-neon-cyan flex items-center gap-0.5 font-medium">
              <span>{isExpanded ? 'Close' : 'View'}</span>
              {isExpanded ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-white/90 truncate min-w-0">
            <span className="text-[11px] text-white/60">Use</span>
            <span className="font-mono font-bold text-neon-cyan tracking-wider bg-neon-cyan/15 px-1.5 py-0.5 rounded border border-neon-cyan/30 text-[11px]">
              {singleCoupon.code}
            </span>
            <span className="font-semibold text-white text-[11px]">
              for{' '}
              {singleCoupon.discountType === 'percentage'
                ? `${singleCoupon.discountValue}% OFF`
                : `₹${singleCoupon.discountValue} OFF`}
            </span>
            <span className="text-[11px] text-neon-cyan flex items-center gap-0.5 font-medium ml-1">
              <span>Apply</span>
              <ArrowRight size={11} />
            </span>
          </div>
        )}

        {/* Divider & Dismiss Button */}
        <div className="flex items-center gap-1 shrink-0 pl-1 border-l border-white/15">
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss offer"
            className="p-0.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    </aside>
  )
}
