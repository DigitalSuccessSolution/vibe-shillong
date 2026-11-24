import { useState, useEffect } from 'react'
import { ArrowRight, Camera, ChevronLeft, ChevronRight, Clock3, Glasses, Music2, Palette, Sparkles, Wine } from 'lucide-react'
import { adultHighlights } from '../data/eventData'

const tinaGallery = [
  { src: '/images/tina/E76D84EF-50E0-41C7-B4AF-B009482CBAC0.png', label: 'Headliner Look' },
  { src: '/images/tina/IMG_0841.JPG', label: 'Press Portrait' },
  { src: '/images/tina/6087D83F-D009-4606-B5A5-A59A91308B6B.png', label: 'Neon Stage' },
  { src: '/images/tina/BDD827D8-4D57-4476-BDC5-A4595A3E229E.png', label: 'Live Energy' },
  { src: '/images/tina/8F45F607-7A6B-4481-B99A-8CA026FA00BF.png', label: 'Club Edition' },
]

export default function AdultSection({ packages = [], onNavigateToDetail }) {
  const adultPkg = (packages || []).find((p) => p.key === 'adult')
  const adultPrice = adultPkg ? adultPkg.price : 1499
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)

  // Automatic slideshow transition every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePhotoIdx((prev) => (prev + 1) % tinaGallery.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  const nextPhoto = () => {
    setActivePhotoIdx((prev) => (prev + 1) % tinaGallery.length)
  }

  const prevPhoto = () => {
    setActivePhotoIdx((prev) => (prev - 1 + tinaGallery.length) % tinaGallery.length)
  }

  const getAdultIcon = (label) => {
    switch (label) {
      case 'UV dance floor': return <Music2 size={18} className="text-neon-lime shrink-0" />
      case 'Neon face painting': return <Palette size={18} className="text-neon-lime shrink-0" />
      case 'Fashion competition': return <Sparkles size={18} className="text-neon-lime shrink-0" />
      case 'Photo booth': return <Camera size={18} className="text-neon-lime shrink-0" />
      case 'Signature drinks': return <Wine size={18} className="text-neon-lime shrink-0" />
      case 'Glow accessories': return <Glasses size={18} className="text-neon-lime shrink-0" />
      default: return <Sparkles size={18} className="text-neon-lime shrink-0" />
    }
  }

  return (
    <section className="py-14 sm:py-16 max-w-6xl mx-auto px-6 relative" id="adult">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 mb-6">
        <div>
          <h2 className="font-bold font-space text-4xl sm:text-6xl text-white tracking-tight leading-none">
            ADULT <span className="gradient-text">NEON NIGHTS</span><span className="text-[#38bdf8]">.</span>
          </h2>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-sm font-bold text-white flex items-center sm:justify-end gap-2">
            <Clock3 size={16} className="text-neon-pink" /> 8:00 PM Onwards
          </div>
          <span className="text-xs text-neon-lime font-semibold">Strictly 18+ • Dress to Glow</span>
        </div>
      </div>

      {/* Intro Description */}
      <div className="max-w-2xl mb-8">
        <h3 className="font-bold font-space text-2xl sm:text-3xl text-white mb-2">
          High Bass. UV Blacklights. Pure Nightclub Energy.
        </h3>
        <p className="text-neon-muted text-sm sm:text-base leading-relaxed">
          Step into F Lounge by FTV drenched in ultraviolet lasers, blacklight visual production, and pumping sound while <strong>DJ Tina</strong> takes over the decks for an unforgettable all-night party.
        </p>
      </div>

      {/* Headliner Artist Spotlight: Compact Multi-Image Showcase */}
      <div className="relative rounded-3xl overflow-hidden border border-neon-pink/40 bg-gradient-to-br from-[#180a26] via-[#10081d] to-[#080514] p-6 sm:p-7 mb-8 shadow-[0_0_50px_rgba(255,53,196,0.18)]">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-neon-pink/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
          {/* Left Column: Interactive Multi-Photo Gallery (No left dead space) */}
          <div className="lg:col-span-4 xl:col-span-4 flex flex-col">
            {/* Main Active Photo with Smooth Auto-Crossfade */}
            <div className="relative aspect-[4/5] w-full max-w-sm rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
              {tinaGallery.map((photo, idx) => (
                <img
                  key={photo.label}
                  src={photo.src}
                  alt={`DJ Tina - ${photo.label}`}
                  className={`absolute inset-0 w-full h-full object-cover object-top brightness-95 transition-opacity duration-700 ease-in-out ${
                    activePhotoIdx === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                  loading="lazy"
                />
              ))}

              {/* Top Photo Counter */}
              <div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold text-white">
                {activePhotoIdx + 1} / {tinaGallery.length}
              </div>

              {/* Prev / Next Quick Controls */}
              <button
                onClick={prevPhoto}
                aria-label="Previous photo"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/70 hover:bg-neon-pink hover:text-black text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer z-20"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextPhoto}
                aria-label="Next photo"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/70 hover:bg-neon-pink hover:text-black text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer z-20"
              >
                <ChevronRight size={16} />
              </button>

              {/* Bottom Tag */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-3.5 pointer-events-none z-20">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neon-pink animate-ping" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                    {tinaGallery[activePhotoIdx].label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Bio & Information */}
          <div className="lg:col-span-8 xl:col-span-8 flex flex-col justify-center">
            <div className="flex items-center justify-between gap-4 mb-1">
              <h3 className="font-bold font-space text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
                DJ TINA
              </h3>
              {/* Equalizer Wave Indicator */}
              <div className="hidden sm:flex items-center gap-1 h-5">
                <span className="w-1 bg-neon-pink rounded-full animate-eq-bounce h-5" />
                <span className="w-1 bg-neon-pink rounded-full animate-eq-bounce h-3" />
                <span className="w-1 bg-neon-pink rounded-full animate-eq-bounce h-5" />
                <span className="w-1 bg-neon-pink rounded-full animate-eq-bounce h-4" />
                <span className="w-1 bg-neon-pink rounded-full animate-eq-bounce h-2" />
              </div>
            </div>

            <p className="text-neon-pink font-semibold text-xs sm:text-sm mb-3">
              High-Energy Commercial Club • EDM • Bollywood Electro Remixes
            </p>

            <p className="text-neon-muted text-xs sm:text-sm leading-relaxed mb-4">
              Renowned for her explosive live sets and electric crowd engagement, DJ Tina brings her signature festival sound to F Lounge by FTV. Expect a pumping 3-hour blacklight headline set packed with heavy bass drops, UV lasers, and non-stop party anthems.
            </p>

            {/* Quick Feature Badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white/90">
                ⚡ 3-Hour Extended Set
              </span>
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white/90">
                🔊 Custom UV Stage Audio
              </span>
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white/90">
                ✨ Midnight Blacklight Drop
              </span>
            </div>

            <a
              href="#aftermovie"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-neon-pink hover:text-white transition-colors w-fit group"
            >
              Watch DJ Tina in Party Reels <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* 6 Original Highlights Grid - Large, high-impact 3-column layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-8">
        {adultHighlights.map((h) => (
          <div
            key={h.label}
            className="group relative h-56 sm:h-64 lg:h-72 rounded-2xl overflow-hidden border border-white/10 hover:border-neon-pink/50 transition-all duration-300 shadow-xl"
          >
            <img
              src={h.img}
              alt={h.label}
              className="w-full h-full object-cover brightness-[0.85] saturate-[1.15] group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080612]/95 via-[#080612]/30 to-transparent flex items-end p-5">
              <span className="text-sm sm:text-base text-white font-bold flex items-center gap-2 leading-snug">
                {getAdultIcon(h.label)}
                {h.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Sleek Ticket Pass Style Card */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#170a24] via-[#10071a] to-[#0a0510] border border-neon-pink/40 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Pass Info & Price Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Price Badge Block */}
          <div className="sm:border-r sm:border-white/10 sm:pr-6 shrink-0">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neon-pink font-semibold block">
              Pass Price
            </span>
            <div className="font-extrabold font-space text-3xl sm:text-4xl text-white mt-0.5">
              ₹{adultPrice.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-white/40 font-mono mt-0.5 block">
              Single Adult Pass
            </span>
          </div>

          {/* Details */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-neon-pink/15 text-neon-pink text-[10px] font-mono font-bold tracking-wider uppercase mb-1">
              Strictly 18+ • Night Pass
            </div>
            <h4 className="font-bold font-space text-xl sm:text-2xl text-white">
              Adult Neon Nights Entry Pass
            </h4>
            <p className="text-xs text-white/60 max-w-lg leading-relaxed">
              Includes main stage entry, live headliner set by DJ Tina, 1 complimentary Neon Paradise Welcome Drink & glow accessories.
            </p>
          </div>
        </div>

        {/* Right: Clean Action Buttons with Proper Spacing */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/10">
          {onNavigateToDetail && (
            <button
              onClick={onNavigateToDetail}
              className="px-5 py-3 rounded-xl border border-neon-pink/40 text-neon-pink hover:bg-neon-pink/10 text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>Explore Details</span>
              <ArrowRight size={14} />
            </button>
          )}

          <a
            href="#tickets"
            className="px-6 py-3 rounded-xl bg-neon-pink text-[#080612] hover:opacity-90 text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-2 font-space tracking-wide shadow-[0_0_20px_rgba(255,53,196,0.3)]"
          >
            <span>Book Passes</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  )
}
