import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'

export default function MobileStickyCTA({ onOpenBooking }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past 320px
      setVisible(window.scrollY > 320)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-5 py-3 pb-5 bg-[#0a0616]/95 backdrop-blur-2xl border-t border-white/12 shadow-[0_-12px_40px_rgba(0,0,0,0.9)] animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
        {/* Left: Pricing & Session Label */}
        <div className="flex flex-col justify-center">
          <span className="text-[11px] font-medium tracking-wide text-neon-muted leading-tight">
            Early Bird Passes
          </span>
          <div className="font-bold font-space text-lg text-white leading-tight mt-0.5">
            ₹1,000<span className="text-xs text-neon-pink font-normal tracking-normal ml-1">onwards</span>
          </div>
        </div>

        {/* Right: Primary Action Button */}
        <button
          type="button"
          onClick={() => onOpenBooking ? onOpenBooking('adult') : (window.location.hash = '#booking')}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neon-pink text-[#080612] text-xs font-extrabold uppercase tracking-wider font-space shadow-[0_0_22px_rgba(255,53,196,0.5)] active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          Book Passes <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}
