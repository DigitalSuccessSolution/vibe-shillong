import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { adultHighlights } from '../data/eventData'

const tinaGallery = [
  { src: '/images/tina/E76D84EF-50E0-41C7-B4AF-B009482CBAC0.png', label: 'Headliner Look' },
  { src: '/images/tina/IMG_0841.JPG', label: 'Press Portrait' },
  { src: '/images/tina/6087D83F-D009-4606-B5A5-A59A91308B6B.png', label: 'Neon Stage' },
  { src: '/images/tina/BDD827D8-4D57-4476-BDC5-A4595A3E229E.png', label: 'Live Energy' },
  { src: '/images/tina/8F45F607-7A6B-4481-B99A-8CA026FA00BF.png', label: 'Club Edition' },
]

export default function AdultEventDetailPage({ packages = [], onOpenBooking, onNavigateHome }) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)
  const adultPkg = (packages || []).find((p) => p.key === 'adult')
  const vipPkg = (packages || []).find((p) => p.key === 'vip')
  const adultPrice = adultPkg ? adultPkg.price : 1499
  const vipPrice = vipPkg ? vipPkg.price : 3500

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="min-h-screen bg-[#07040e] font-dm text-[#f8f5ff] selection:bg-neon-pink selection:text-black">
      {/* Clean Sticky Header (No heavy shadows) */}
      <header className="sticky top-0 z-50 w-full bg-[#07040e]/95 backdrop-blur-md border-b border-white/10 px-6 sm:px-10 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span className="hidden xs:inline">Back to Festival Landing</span>
            <span className="xs:hidden">Back to Festival</span>
          </button>

          <button
            onClick={() => onOpenBooking('adult')}
            className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-neon-pink text-[#080612] hover:opacity-90 transition-all rounded-lg cursor-pointer"
          >
            Book Pass (₹{adultPrice.toLocaleString('en-IN')}) <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10 sm:py-14 pb-28 sm:pb-14 space-y-12">
        {/* Main Title & Overview (Flat, Minimal) */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-neon-pink/15 text-neon-pink font-bold uppercase">
              Strictly 18+
            </span>
            <span className="text-white/60">Saturday, 12 December 2026</span>
            <span className="text-white/30">•</span>
            <span className="text-white/60">8:00 PM Onwards</span>
            <span className="text-white/30">•</span>
            <span className="text-white/60">F Lounge by FTV, Shillong</span>
          </div>

          <h1 className="font-bold font-space text-4xl sm:text-6xl text-white tracking-tight">
            ADULT <span className="gradient-text">NEON NIGHTS</span><span className="text-neon-pink">.</span>
          </h1>

          <p className="text-white/70 text-sm sm:text-base max-w-3xl leading-relaxed">
            Shillong’s premier ultraviolet nightlife party featuring high-energy bass, UV laser rigging, blacklight fashion competition, and celebrity headliner <strong>DJ Tina</strong> performing live.
          </p>
        </div>

        {/* Headliner Spotlight: DJ Tina (Clean, Minimal, No Clutter) */}
        <div className="p-6 sm:p-8 rounded-xl bg-white/[0.02] border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Gallery Left */}
            <div className="md:col-span-4">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-white/10 bg-black">
                <img
                  src={tinaGallery[activePhotoIdx].src}
                  alt={tinaGallery[activePhotoIdx].label}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
                  <span className="text-xs font-mono text-neon-pink font-bold">
                    {tinaGallery[activePhotoIdx].label}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setActivePhotoIdx(
                          (prev) => (prev - 1 + tinaGallery.length) % tinaGallery.length
                        )
                      }
                      className="p-1 rounded-full bg-black/60 hover:bg-white/20 text-white cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() =>
                        setActivePhotoIdx((prev) => (prev + 1) % tinaGallery.length)
                      }
                      className="p-1 rounded-full bg-black/60 hover:bg-white/20 text-white cursor-pointer"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Minimal Dots */}
              <div className="flex items-center justify-center gap-1.5 mt-2">
                {tinaGallery.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      activePhotoIdx === idx ? 'w-5 bg-neon-pink' : 'w-1.5 bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Bio Right */}
            <div className="md:col-span-8 space-y-3">
              <span className="text-xs font-mono font-bold text-neon-pink uppercase">
                Main Stage Headliner
              </span>
              <h2 className="font-bold font-space text-2xl sm:text-3xl text-white">
                DJ Tina Live Performance
              </h2>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Known across India’s major music circuits, DJ Tina headlines the night with a curated two-hour set of commercial EDM, Bollywood remixes, and electro-house synchronized with ultraviolet lasers and confetti drops.
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-mono text-white/60 pt-2">
                <span>Set: 11:30 PM – 1:30 AM</span>
                <span>•</span>
                <span>Genre: Commercial EDM & Bollywood</span>
                <span>•</span>
                <span>Production: Lasers & Confetti</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Clean Highlight Cards (No extra icons, flat, full-bleed images) */}
        <div className="space-y-4">
          <h2 className="font-bold font-space text-xl text-white">
            Nightclub Highlights
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {adultHighlights.map((h) => (
              <div
                key={h.label}
                className="group relative h-60 rounded-xl overflow-hidden border border-white/10 bg-[#0d071a]"
              >
                <img
                  src={h.img}
                  alt={h.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07040e]/95 via-[#07040e]/40 to-transparent flex items-end p-4">
                  <h3 className="text-sm font-bold text-white">{h.label}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Essential Guidelines (Simple Flat Row, No Icon Spam) */}
        <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
          <h3 className="font-bold font-space text-base text-white">Event Guidelines & Dress Code</h3>
          <ul className="text-xs text-white/70 space-y-2 list-disc list-inside">
            <li>Strictly 18+ event. Physical government photo ID (Aadhaar/Passport/Driving License) mandatory at the gate.</li>
            <li>Dress Code: White, fluorescent neon green, or electric pink outfits glow best under UV blacklights.</li>
            <li>Complimentary neon paint styling booths available inside the club.</li>
            <li>Standard club rules apply. Management reserves the right of admission.</li>
          </ul>
        </div>

        {/* Clean Pass Options Banner (Flat, No Heavy Shadow) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* General Pass */}
          <div className="p-6 rounded-xl bg-[#140b22] border border-neon-pink/30 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-mono font-bold text-neon-pink uppercase">
                Standard Entry
              </span>
              <h3 className="font-bold font-space text-xl text-white mt-1">Adult Entry Pass</h3>
              <p className="text-xs text-white/60 mt-0.5">
                Includes main stage access, DJ Tina live set, 1 welcome drink, and glow bands.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-2xl font-bold font-space text-white">₹{adultPrice.toLocaleString('en-IN')}</span>
              <button
                onClick={() => onOpenBooking('adult')}
                className="px-6 py-2.5 rounded-lg bg-neon-pink text-[#080612] text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
              >
                Book Pass
              </button>
            </div>
          </div>

          {/* VIP Pass */}
          <div className="p-6 rounded-xl bg-[#10170a] border border-neon-lime/30 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-mono font-bold text-neon-lime uppercase">
                VIP Access
              </span>
              <h3 className="font-bold font-space text-xl text-white mt-1">VIP Table & Bottle Service</h3>
              <p className="text-xs text-white/60 mt-0.5">
                Reserved elevated table, dedicated butler & bottle service, and express zero-queue entry.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-2xl font-bold font-space text-white">₹{vipPrice.toLocaleString('en-IN')}</span>
              <button
                onClick={() => onOpenBooking('vip')}
                className="px-6 py-2.5 rounded-lg bg-neon-lime text-[#080612] text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
              >
                Reserve Table
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Booking Bar */}
      <aside aria-label="Mobile booking action" className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07040e]/95 backdrop-blur-xl border-t border-white/10 px-5 py-3 flex items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.8)]">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-white/60 block">Passes from</span>
          <span className="text-xl font-bold font-space text-white">₹{adultPrice.toLocaleString('en-IN')}</span>
        </div>
        <button
          onClick={() => onOpenBooking('adult')}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-neon-pink text-[#080612] text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,53,196,0.3)] cursor-pointer"
        >
          Book Pass <ArrowRight size={14} />
        </button>
      </aside>
    </div>
  )
}
