import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

const slides = [
  {
    id: 1,
    badge: 'Nightlife Headliner',
    title: 'Explosive Live Stage with DJ Tina',
    subtitle: 'Heart-pumping bass, UV visual walls & celebrity live performance',
    img: '/images/tina/Neon Nightclub Dancefloor Spectacle.png',
    tag: 'Adult Neon Nights',
    color: 'pink',
    pkgKey: 'adult',
  },
  {
    id: 2,
    badge: 'Kids & Family Festival',
    title: 'Neon Face Painting & Glow Arenas',
    subtitle: 'Hypoallergenic UV paint, DIY glow craft workshops & soft play zones',
    img: '/images/tina/Neon Cat Face Painting Fun.png',
    tag: 'Kids Neon Carnival',
    color: 'cyan',
    pkgKey: 'kids',
  },
  {
    id: 3,
    badge: 'UV Blacklight Atmosphere',
    title: '360° Ultraviolet Laser Dancefloor',
    subtitle: 'Confetti cannons, glowing LED bands & immersive blacklight effects',
    img: '/images/tina/UV Neon Dance Floor Celebration.png',
    tag: 'Main Arena',
    color: 'lime',
    pkgKey: 'adult',
  },
  {
    id: 4,
    badge: 'VIP Hospitality',
    title: 'VIP Elevated Lounge & Bottle Service',
    subtitle: 'Private butler service, glowing cocktails & premium artist lounge access',
    img: '/images/tina/Neon Trio of Colorful Cocktails.png',
    tag: 'VIP Table Service',
    color: 'pink',
    pkgKey: 'vip',
  },
  {
    id: 5,
    badge: 'Costume & Glamour',
    title: 'Neon Runway & Best Glow Fashion',
    subtitle: 'Dress in whites or bright neons and compete for festival awards',
    img: '/images/tina/Neon Runway Fashion Show.png',
    tag: 'Fashion Contest',
    color: 'cyan',
    pkgKey: 'adult',
  },
  {
    id: 6,
    badge: 'Interactive Fun',
    title: 'Blacklight 360° Photo Booth',
    subtitle: 'Capture high-contrast UV memories with glowing props and group backdrops',
    img: '/images/tina/Neon Photo Booth Celebration.png',
    tag: 'Photo Experience',
    color: 'lime',
    pkgKey: 'adult',
  },
  {
    id: 7,
    badge: 'All-Ages Celebration',
    title: 'Kids Glowstick Dance Floor',
    subtitle: 'Safe, fun family dancing with glowing toys and high-energy music',
    img: '/images/tina/Neon Family Glow Party.png',
    tag: 'Family Hours',
    color: 'pink',
    pkgKey: 'kids',
  },
]

export default function GalleryStrip({ onOpenBooking }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  // Auto-play sliding every 4 seconds (pauses on hover)
  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [isPaused])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  // Touch Swipe for mobile devices
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const diff = touchStartX.current - touchEndX.current
    if (diff > 50) {
      nextSlide()
    } else if (diff < -50) {
      prevSlide()
    }
    touchStartX.current = 0
    touchEndX.current = 0
  }

  return (
    <section
      className="py-16 max-w-6xl mx-auto px-6 relative"
      id="gallery"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header with Title & Navigation Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-neon-cyan flex items-center gap-1.5 mb-2">
            <Sparkles size={14} /> Festival Atmosphere & Highlights
          </span>
          <h2 className="font-bold font-space text-3xl sm:text-5xl text-white tracking-tight">
            EXPERIENCE THE <span className="gradient-text">GLOW.</span>
          </h2>
        </div>

        {/* Slider Controls (Desktop & Mobile) */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Slide counter */}
          <span className="text-xs font-mono font-bold text-white/50 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10">
            0{currentIndex + 1} / 0{slides.length}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer hover:border-neon-cyan hover:text-neon-cyan"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer hover:border-neon-pink hover:text-neon-pink"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Carousel Viewport */}
      <div
        className="relative overflow-hidden rounded-3xl border border-white/15 bg-black/60 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative aspect-[16/9] sm:aspect-[21/9] min-h-[360px] sm:min-h-[460px] w-full">
          {slides.map((slide, index) => {
            const isActive = index === currentIndex
            const isPink = slide.color === 'pink'
            const isLime = slide.color === 'lime'
            const badgeBorder = isPink
              ? 'border-neon-pink text-neon-pink bg-neon-pink/15'
              : isLime
              ? 'border-neon-lime text-neon-lime bg-neon-lime/15'
              : 'border-neon-cyan text-neon-cyan bg-neon-cyan/15'

            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Background Festival Image with Zoom Effect */}
                <img
                  src={slide.img}
                  alt={slide.title}
                  className={`w-full h-full object-cover saturate-[1.2] transition-transform duration-7000 ease-out ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                  loading="lazy"
                />

                {/* Atmospheric Dark & Color Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080612] via-[#080612]/60 to-transparent via-50%" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#080612]/80 via-transparent to-transparent" />

                {/* Slide Content Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="max-w-xl">
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${badgeBorder}`}>
                        {slide.badge}
                      </span>
                      <span className="text-[11px] font-bold text-white/60">
                        • {slide.tag}
                      </span>
                    </div>

                    <h3 className="font-bold font-space text-2xl sm:text-4xl text-white leading-tight mb-2">
                      {slide.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70 line-clamp-2 leading-relaxed">
                      {slide.subtitle}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenBooking ? onOpenBooking(slide.pkgKey) : (window.location.hash = '#booking')}
                    className="self-start sm:self-auto shrink-0 px-5 py-2.5 rounded-xl bg-neon-pink text-[#080612] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-[0_0_20px_rgba(255,53,196,0.4)]"
                  >
                    Book This Experience →
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Slide Indicator Progress Bars */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Jump to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === currentIndex
                  ? 'w-8 bg-neon-pink shadow-[0_0_10px_rgba(255,53,196,0.8)]'
                  : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Mini Thumbnail Strip for Quick Jumping */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 mt-4">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => setCurrentIndex(i)}
            className={`relative rounded-xl overflow-hidden aspect-[16/10] border transition-all cursor-pointer group ${
              i === currentIndex
                ? 'border-neon-pink ring-2 ring-neon-pink/40 scale-[1.02]'
                : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
            }`}
          >
            <img
              src={slide.img}
              alt={slide.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
          </button>
        ))}
      </div>
    </section>
  )
}
