import { useEffect } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { kidsActivities } from '../data/eventData'

export default function KidsEventDetailPage({ packages = [], onOpenBooking, onNavigateHome }) {
  const kidsPkg = (packages || []).find((p) => p.key === 'kids')
  const kidsPrice = kidsPkg ? kidsPkg.price : 1000
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="w-full font-dm text-[#f8f5ff] selection:bg-neon-cyan selection:text-black">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-6 sm:py-10 pb-20 sm:pb-14 space-y-10">
        {/* Breadcrumb Navigation */}
        <div className="pb-2">
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Festival Landing</span>
          </button>
        </div>
        {/* Main Title & Overview (Flat, Minimal) */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-neon-cyan/15 text-neon-cyan font-bold uppercase">
              Family Day Pass
            </span>
            <span className="text-white/60">Saturday, 12 December 2026</span>
            <span className="text-white/30">•</span>
            <span className="text-white/60">12:00 PM – 7:30 PM</span>
            <span className="text-white/30">•</span>
            <span className="text-white/60">F Lounge by FTV, Shillong</span>
          </div>

          <h1 className="font-bold font-space text-4xl sm:text-6xl text-white tracking-tight">
            KIDS <span className="gradient-text">NEON CARNIVAL</span><span className="text-neon-cyan">.</span>
          </h1>

          <p className="text-white/70 text-sm sm:text-base max-w-3xl leading-relaxed">
            A safe, supervised ultraviolet glowing carnival for children and families. Features skin-safe neon face painting, interactive soft play games, DIY blacklight crafting workshops, and guided glow dance sessions.
          </p>
        </div>

        {/* 4 Clean Activity Cards (No extra icons, flat, full-bleed images) */}
        <div className="space-y-4">
          <h2 className="font-bold font-space text-xl text-white">
            Activities & Experiences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kidsActivities.map((item) => (
              <div
                key={item.title}
                className="group relative h-64 rounded-xl overflow-hidden border border-white/10 bg-[#0d071a]"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07040e]/95 via-[#07040e]/40 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-white/60 mt-1 line-clamp-2">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Essential Rules / Guidelines (Simple Flat Row, No Icon Spam) */}
        <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
          <h3 className="font-bold font-space text-base text-white">Important Parent Guidelines</h3>
          <ul className="text-xs text-white/70 space-y-2 list-disc list-inside">
            <li>Strictly family-friendly and zero-alcohol event environment.</li>
            <li>All cosmetic glow face paints are 100% non-toxic, hypoallergenic, and water-soluble.</li>
            <li>Matching security tags issued to child and accompanying parent upon entry.</li>
            <li>Dedicated parent seating and refreshment lounge available throughout the event.</li>
          </ul>
        </div>

        {/* Clean Booking Action Banner (Flat, No Heavy Shadow) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 sm:p-7 rounded-xl bg-[#0d1422] border border-neon-cyan/30">
          <div>
            <span className="text-[11px] font-mono font-bold text-neon-cyan uppercase">
              Family Pass • Admit 2 (1 Child + 1 Parent)
            </span>
            <h3 className="font-bold font-space text-2xl text-white mt-1">
              Kids Neon Carnival Pass
            </h3>
            <p className="text-xs text-white/60 mt-0.5">
              Includes full carnival entry, face painting, DIY craft materials, and dance party.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end shrink-0">
            <div className="font-bold font-space text-3xl text-white">₹{kidsPrice.toLocaleString('en-IN')}</div>
            <button
              onClick={() => onOpenBooking('kids')}
              className="inline-flex items-center gap-2 px-7 py-3 text-xs font-bold bg-neon-cyan text-[#071016] hover:opacity-90 transition-all rounded-lg cursor-pointer"
            >
              BOOK PASSES <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Booking Bar */}
      <aside aria-label="Mobile booking action" className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07040e]/95 backdrop-blur-xl border-t border-white/10 px-5 py-3 flex items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.8)]">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-white/60 block">Family Pass (Admit 2)</span>
          <span className="text-xl font-bold font-space text-white">₹{kidsPrice.toLocaleString('en-IN')}</span>
        </div>
        <button
          onClick={() => onOpenBooking('kids')}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-neon-cyan text-[#071016] text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-[0_0_15px_rgba(53,234,255,0.3)] cursor-pointer"
        >
          Book Pass <ArrowRight size={14} />
        </button>
      </aside>
    </div>
  )
}
