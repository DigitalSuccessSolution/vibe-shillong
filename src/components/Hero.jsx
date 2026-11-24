import { useState, useEffect } from 'react'
import { ArrowRight, CalendarDays, Clock3, MapPin, Zap } from 'lucide-react'
import { neonSound } from '../utils/soundEffects'

const bgImages = [
  {
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=2560&q=95',
    alt: 'DJ live concert on stage with crowd & lasers',
    pos: 'object-center sm:object-[75%_center]',
  },
  {
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=2560&q=95',
    alt: 'DJ mixing console with neon lights',
    pos: 'object-center sm:object-[70%_center]',
  },
  {
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=2560&q=95',
    alt: 'Neon festival stage laser lights',
    pos: 'object-center sm:object-[65%_center]',
  },
  {
    url: 'https://images.unsplash.com/photo-1504680177321-2e6a879aac86?auto=format&fit=crop&w=2560&q=95',
    alt: 'Electric UV dance floor with neon lights and crowd',
    pos: 'object-center sm:object-[70%_center]',
  },
]

export default function Hero({ onOpenBooking }) {
  const [currentBgIndex, setCurrentBgIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % bgImages.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative w-full overflow-hidden flex items-start lg:items-center pt-6 sm:pt-8 pb-8 sm:pb-12 lg:py-0 lg:h-[calc(100vh-86px)]">
      {/* Background DJ & Concert Crowd Atmosphere - Ultra-Sharp 4K Crossfade */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {bgImages.map((bg, index) => (
          <img
            key={bg.url}
            src={bg.url}
            alt={bg.alt}
            className={`absolute inset-0 w-full h-full object-cover ${bg.pos} saturate-[1.25] transition-opacity duration-1000 ease-in-out ${
              index === currentBgIndex ? 'opacity-85 lg:opacity-95' : 'opacity-0'
            }`}
          />
        ))}
        {/* Crisp Lighting Overlay: Dark on the text side (left), 100% crystal-clear on the visual side (right) */}
        <div className="absolute inset-0 bg-[#080612]/50 sm:bg-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080612] via-[#080612]/85 to-transparent via-35% to-75%" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080612] via-transparent to-transparent" />

        {/* Small subtle slide indicators at bottom right */}
        <div className="absolute bottom-5 right-8 z-10 hidden sm:flex items-center gap-1.5 pointer-events-auto">
          {bgImages.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                neonSound.playClick()
                setCurrentBgIndex(i)
              }}
              onMouseEnter={() => neonSound.playHover()}
              aria-label={`Show background image ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === currentBgIndex ? 'w-6 bg-neon-pink shadow-[0_0_8px_rgba(255,53,196,0.6)]' : 'w-1.5 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
        {/* Responsive Content Block - Perfectly aligned with Navbar and other sections */}
        <div className="flex flex-col justify-center max-w-xl lg:max-w-2xl text-left">
          {/* Responsive Heading */}
          <h1 className="font-bold font-space text-[36px] xs:text-[44px] sm:text-[54px] md:text-[64px] lg:text-[70px] xl:text-[78px] leading-[0.98] sm:leading-[0.93] tracking-tight sm:tracking-[-2px] lg:tracking-[-3px] text-white my-2 sm:my-3">
            TWO <span className="gradient-text">NEON</span>
            <br />
            <span className="gradient-text">EVENTS.</span>
            <br />
            <span className="text-white">ONE EPIC DATE.</span>
          </h1>

          {/* Description */}
          <p className="text-neon-muted text-xs sm:text-sm lg:text-[15px] leading-relaxed max-w-lg mb-3 sm:mb-4">
            The brightest family blacklight festival by day turns into an explosive nightlife party featuring <strong className="text-neon-pink">DJ Tina</strong> after dark. Put on your brightest whites and get ready to glow.
          </p>

          {/* Clean Responsive Event Meta Line */}
          <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3.5 sm:gap-x-5 text-xs sm:text-sm text-neon-muted mb-4 sm:mb-5">
            <div className="flex items-center gap-2 text-white">
              <CalendarDays size={15} className="text-neon-pink shrink-0" />
              <span className="font-semibold">Saturday, 12 December 2026</span>
            </div>
            <span className="text-white/25 hidden sm:inline">•</span>
            <div className="flex items-center gap-2 text-white">
              <MapPin size={15} className="text-neon-cyan shrink-0" />
              <span className="font-semibold">F Lounge by FTV</span>
            </div>
            <span className="text-white/25 hidden sm:inline">•</span>
            <div className="flex items-center gap-2 text-neon-lime">
              <Clock3 size={14} className="shrink-0" />
              <span>Day Carnival (12 PM) & Night Party (8 PM)</span>
            </div>
          </div>

          {/* Clean Action Buttons (Stack on mobile, row on tablet/desktop) */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-1 w-full sm:w-auto">
            <button
              type="button"
              onMouseEnter={() => neonSound.playHover()}
              onClick={() => {
                neonSound.playClick()
                if (onOpenBooking) onOpenBooking('adult')
                else window.location.hash = '#booking'
              }}
              className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-bold tracking-wide bg-neon-pink text-[#080612] hover:bg-neon-pink/90 active:scale-95 transition-all rounded shadow-[0_0_25px_rgba(255,53,196,0.35)] cursor-pointer"
            >
              BOOK YOUR PASSES <ArrowRight size={16} />
            </button>
            <a
              href="#adult"
              onMouseEnter={() => neonSound.playHover()}
              onClick={() => neonSound.playClick()}
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white bg-white/5 border border-white/15 hover:border-neon-cyan hover:text-neon-cyan active:scale-95 transition-all rounded cursor-pointer"
            >
              <Zap size={15} className="text-neon-cyan" /> DJ Tina Lineup
            </a>
          </div>

          <div className="mt-3 sm:mt-4 flex items-center gap-2 text-[11px] sm:text-xs text-neon-muted">
            <span>Dress Code: <strong className="text-neon-lime">Wear White or Neon to Glow</strong></span>
          </div>
        </div>
      </div>
    </section>
  )
}
