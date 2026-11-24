import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  ShieldAlert,
  Sparkles,
  Music2,
  Camera,
  Wine,
  Glasses,
  CheckCircle2,
  Crown,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react'

const tinaGallery = [
  { src: '/images/tina/E76D84EF-50E0-41C7-B4AF-B009482CBAC0.png', label: 'Headliner Look' },
  { src: '/images/tina/IMG_0841.JPG', label: 'Press Portrait' },
  { src: '/images/tina/6087D83F-D009-4606-B5A5-A59A91308B6B.png', label: 'Neon Stage' },
  { src: '/images/tina/BDD827D8-4D57-4476-BDC5-A4595A3E229E.png', label: 'Live Energy' },
  { src: '/images/tina/8F45F607-7A6B-4481-B99A-8CA026FA00BF.png', label: 'Club Edition' },
]

export default function AdultEventDetailPage({ onOpenBooking, onNavigateHome }) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="min-h-screen bg-[#070311] text-white font-dm selection:bg-neon-pink selection:text-black">
      {/* Top Navbar Bar */}
      <header className="sticky top-0 z-40 bg-[#070311]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Festival Home</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-pink/10 border border-neon-pink/30 text-[11px] font-mono text-neon-pink font-semibold">
              <Calendar size={12} /> 12 DEC 2026
            </span>
            <button
              onClick={() => onOpenBooking('adult')}
              className="px-4 py-2 rounded-xl bg-neon-pink text-[#080612] text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-[0_0_20px_rgba(255,53,196,0.35)]"
            >
              Book Pass (₹1,499)
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-16">
        {/* ========================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================= */}
        <section className="relative rounded-3xl overflow-hidden border border-neon-pink/35 bg-gradient-to-br from-[#1a0826] via-[#12061c] to-[#070311] p-6 sm:p-12 shadow-[0_0_60px_rgba(255,53,196,0.18)]">
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-neon-pink/15 rounded-full blur-[110px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-pink/15 border border-neon-pink/40 text-neon-pink text-xs font-bold tracking-wider uppercase font-mono">
              <Flame size={14} /> Strictly 18+ • Nightclub Production
            </div>

            <h1 className="font-extrabold font-space text-4xl sm:text-6xl text-white tracking-tight leading-none">
              ADULT <span className="text-neon-pink">NEON NIGHTS</span> ft. DJ TINA.
            </h1>

            <p className="text-sm sm:text-lg text-white/70 leading-relaxed">
              Shillong’s most electrifying ultraviolet nightlife spectacle. High bass, hypnotic UV laser shows, celebrity headliner DJ Tina, neon runway competitions, and signature glowing cocktails.
            </p>

            {/* Event Specs Quick Pill */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-white/40 font-mono uppercase block">Date</span>
                <span className="text-xs sm:text-sm font-bold text-white mt-0.5 block">Sat, 12 Dec 2026</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-white/40 font-mono uppercase block">Doors Open</span>
                <span className="text-xs sm:text-sm font-bold text-neon-pink mt-0.5 block">8:00 PM Onwards</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-white/40 font-mono uppercase block">Headliner</span>
                <span className="text-xs sm:text-sm font-bold text-neon-lime mt-0.5 block truncate">DJ Tina (Live)</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-white/40 font-mono uppercase block">Entry Pass</span>
                <span className="text-xs sm:text-sm font-bold text-neon-cyan mt-0.5 block">Starts ₹1,499</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onOpenBooking('adult')}
                className="px-8 py-3.5 rounded-xl bg-neon-pink text-[#080612] text-sm font-extrabold hover:opacity-90 transition-all cursor-pointer shadow-[0_0_25px_rgba(255,53,196,0.35)]"
              >
                Book General Pass (₹1,499)
              </button>
              <button
                onClick={() => onOpenBooking('vip')}
                className="px-6 py-3.5 rounded-xl bg-neon-lime/10 hover:bg-neon-lime/20 text-neon-lime text-sm font-bold transition-all border border-neon-lime/30 flex items-center gap-2"
              >
                <Crown size={15} /> Reserve VIP Table (₹3,500)
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* HEADLINER SPOTLIGHT: DJ TINA */}
        {/* ========================================================= */}
        <section className="p-8 sm:p-10 rounded-3xl bg-[#0f071a] border border-white/10 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 border-b border-white/10 pb-5">
            <div>
              <span className="text-xs text-neon-lime font-mono uppercase tracking-widest font-bold">
                Main Stage Headliner
              </span>
              <h2 className="font-extrabold font-space text-3xl sm:text-4xl text-white mt-1">
                DJ Tina Live in Shillong
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-neon-pink/15 text-neon-pink border border-neon-pink/30 text-xs font-mono font-bold">
              EDM • Commercial • Bollywood • Bass
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Gallery Left */}
            <div className="lg:col-span-5 space-y-3">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
                <img
                  src={tinaGallery[activePhotoIdx].src}
                  alt={tinaGallery[activePhotoIdx].label}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between">
                  <span className="text-xs font-mono text-neon-pink font-bold">
                    {tinaGallery[activePhotoIdx].label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        setActivePhotoIdx(
                          (prev) => (prev - 1 + tinaGallery.length) % tinaGallery.length
                        )
                      }
                      className="p-1 rounded-full bg-black/60 hover:bg-white/20 text-white"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() =>
                        setActivePhotoIdx((prev) => (prev + 1) % tinaGallery.length)
                      }
                      className="p-1 rounded-full bg-black/60 hover:bg-white/20 text-white"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-5 gap-2">
                {tinaGallery.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border transition-all ${
                      activePhotoIdx === idx
                        ? 'border-neon-pink shadow-[0_0_10px_rgba(255,53,196,0.6)]'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={item.src} alt={item.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Bio Right */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-bold font-space text-2xl text-white">
                The Energy Powerhouse Behind the Decks
              </h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Celebrated across high-profile festival stages and premium club circuits across India, DJ Tina is known for her signature fusion of pulsating electro basslines, commercial party anthems, and adrenaline-pumping transitions.
              </p>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Her 120-minute headline set for VYBE Shillong is curated exclusively for the ultraviolet production: syncing massive laser drops, confetti cannons, and blacklight visualizers with heart-thumping beats.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] text-white/40 font-mono uppercase block">Set Timing</span>
                  <span className="font-bold text-white text-sm mt-0.5 block">11:30 PM – 1:30 AM</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] text-white/40 font-mono uppercase block">Production</span>
                  <span className="font-bold text-neon-pink text-sm mt-0.5 block">Lasers + Confetti Drop</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* FULL NIGHT TIMELINE */}
        {/* ========================================================= */}
        <section className="space-y-6">
          <div className="border-b border-white/10 pb-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-neon-pink font-mono uppercase tracking-widest font-bold">
                Timeline
              </span>
              <h2 className="font-bold font-space text-2xl sm:text-4xl text-white mt-1">
                Night Schedule & Flow
              </h2>
            </div>
            <span className="text-xs font-mono text-white/40">8:00 PM Onwards</span>
          </div>

          <div className="space-y-4">
            {[
              {
                time: '8:00 PM – 9:00 PM',
                title: 'Red Carpet Check-In & Blacklight Photo Booths',
                desc: 'Doors open, UV wristbands issued, and opening photo sessions at interactive glow walls.',
              },
              {
                time: '9:00 PM – 10:30 PM',
                title: 'Warmup DJ Set & Neon Face Styling Lounge',
                desc: 'Resident DJ spins progressive deep house while professional glow body artists prep partygoers.',
              },
              {
                time: '10:30 PM – 11:30 PM',
                title: 'Neon Runway Fashion Competition',
                desc: 'Best glow outfits walk the blacklight ramp with cash prizes & VIP bottle upgrades.',
              },
              {
                time: '11:30 PM – 1:30 AM',
                title: 'DJ TINA LIVE HEADLINER SET',
                desc: 'High-octane performance with full ultraviolet lasers, CO2 jets, and midnight confetti countdown.',
              },
              {
                time: '1:30 AM Onwards',
                title: 'Midnight Afterparty Session',
                desc: 'Dance floor remains live with late-night tech-house and signature glowing cocktails.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#0f071a] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-all"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-neon-pink/20 border border-neon-pink/40 text-neon-pink text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    0{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold font-space text-base text-white">{item.title}</h4>
                    <p className="text-xs text-white/60 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <div className="sm:text-right shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/40 border border-white/10 text-xs font-mono font-semibold text-neon-pink">
                    <Clock size={12} /> {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* DRESS CODE & UV GLOW GUIDE */}
        {/* ========================================================= */}
        <section className="p-6 sm:p-10 rounded-3xl bg-[#0d071a] border border-neon-lime/30 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-neon-lime/10 border border-neon-lime/30 flex items-center justify-center text-neon-lime">
              <Glasses size={24} />
            </div>
            <div>
              <h3 className="font-bold font-space text-xl sm:text-2xl text-white">
                Dress to Glow • Ultraviolet Wardrobe Guide
              </h3>
              <p className="text-xs text-white/60">
                How to make the most of the 10,000-watt UV blacklight production
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-xs font-bold text-neon-lime flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Crisp White Clothing
              </span>
              <p className="text-[11px] text-white/60">
                White fabrics reflect ultraviolet rays with maximum luminosity, making you stand out effortlessly on the dance floor.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-xs font-bold text-neon-lime flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Neon Green, Pink & Cyan
              </span>
              <p className="text-[11px] text-white/60">
                Fluorescent shades react instantly under blacklights. Neon hats, vests, jackets, and glowing sneakers shine brightly.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-xs font-bold text-neon-lime flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Free Glow Accessories
              </span>
              <p className="text-[11px] text-white/60">
                Every ticket holder receives complimentary neon glow wristbands, and body paint artists are on-site all night.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TICKET PACKAGES SELECTION */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Adult Pass */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#140822] to-[#0a0512] border-2 border-neon-pink/40 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full bg-neon-pink/20 text-neon-pink text-[11px] font-mono font-bold uppercase">
                General Admission
              </span>
              <h3 className="font-extrabold font-space text-3xl text-white">Adult Neon Nights Pass</h3>
              <p className="text-xs text-white/70">
                Full access to the main stage, dance floor, DJ Tina headliner set, and blacklight photo booths.
              </p>
              <div className="text-3xl font-extrabold font-space text-neon-pink">
                ₹1,499 <span className="text-xs text-white/40 font-mono font-normal">/ Pass</span>
              </div>
            </div>

            <button
              onClick={() => onOpenBooking('adult')}
              className="w-full py-3.5 rounded-xl bg-neon-pink text-[#080612] text-xs font-extrabold uppercase tracking-wider hover:opacity-95 transition-all cursor-pointer shadow-[0_0_25px_rgba(255,53,196,0.35)]"
            >
              Book General Pass
            </button>
          </div>

          {/* VIP Pass */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#161f10] to-[#080d05] border-2 border-neon-lime/40 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full bg-neon-lime/20 text-neon-lime text-[11px] font-mono font-bold uppercase flex items-center gap-1.5 w-fit">
                <Crown size={12} /> VIP Reserved Lounge
              </span>
              <h3 className="font-extrabold font-space text-3xl text-white">VIP Table & Bottle Service</h3>
              <p className="text-xs text-white/70">
                Elevated private table, dedicated butler & bottle service, express zero-queue gate entry, and glowing merchandise kit.
              </p>
              <div className="text-3xl font-extrabold font-space text-neon-lime">
                ₹3,500 <span className="text-xs text-white/40 font-mono font-normal">/ Table</span>
              </div>
            </div>

            <button
              onClick={() => onOpenBooking('vip')}
              className="w-full py-3.5 rounded-xl bg-neon-lime text-[#080612] text-xs font-extrabold uppercase tracking-wider hover:opacity-95 transition-all cursor-pointer shadow-[0_0_25px_rgba(200,255,61,0.35)]"
            >
              Reserve VIP Table
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
