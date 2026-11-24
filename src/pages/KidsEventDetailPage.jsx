import { useEffect } from 'react'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Sparkles,
  Palette,
  Gamepad2,
  Gift,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Music2,
  Users,
} from 'lucide-react'

export default function KidsEventDetailPage({ onOpenBooking, onNavigateHome }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="min-h-screen bg-[#070312] text-white font-dm selection:bg-neon-cyan selection:text-black">
      {/* Top Navbar Bar */}
      <header className="sticky top-0 z-40 bg-[#070312]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Festival Home</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-[11px] font-mono text-neon-cyan font-semibold">
              <Calendar size={12} /> 12 DEC 2026
            </span>
            <button
              onClick={() => onOpenBooking('kids')}
              className="px-4 py-2 rounded-xl bg-neon-cyan text-[#071016] text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-[0_0_20px_rgba(53,234,255,0.3)]"
            >
              Book Pass (₹1,000)
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-16">
        {/* ========================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================= */}
        <section className="relative rounded-3xl overflow-hidden border border-neon-cyan/30 bg-gradient-to-br from-[#0c1a2e] via-[#08101d] to-[#050914] p-6 sm:p-12 shadow-[0_0_60px_rgba(53,234,255,0.15)]">
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-neon-cyan/15 rounded-full blur-[110px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/15 border border-neon-cyan/40 text-neon-cyan text-xs font-bold tracking-wider uppercase font-mono">
              <Sparkles size={14} /> Family Day Carnival • All Ages
            </div>

            <h1 className="font-extrabold font-space text-4xl sm:text-6xl text-white tracking-tight leading-none">
              KIDS <span className="text-neon-cyan">NEON CARNIVAL</span> 2026.
            </h1>

            <p className="text-sm sm:text-lg text-white/70 leading-relaxed">
              A magical, high-energy ultraviolet wonderland created exclusively for kids and families. Safe, fully supervised, and bursting with glowing games, blacklight creative workshops, and music.
            </p>

            {/* Event Specs Quick Pill */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-white/40 font-mono uppercase block">Date</span>
                <span className="text-xs sm:text-sm font-bold text-white mt-0.5 block">Sat, 12 Dec 2026</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-white/40 font-mono uppercase block">Timing</span>
                <span className="text-xs sm:text-sm font-bold text-neon-cyan mt-0.5 block">12 PM – 7:30 PM</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-white/40 font-mono uppercase block">Venue</span>
                <span className="text-xs sm:text-sm font-bold text-white mt-0.5 block truncate">F Lounge by FTV</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-white/40 font-mono uppercase block">Family Pass</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-400 mt-0.5 block">₹1,000 (1+1 Entry)</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onOpenBooking('kids')}
                className="px-8 py-3.5 rounded-xl bg-neon-cyan text-[#071016] text-sm font-bold hover:opacity-90 transition-all cursor-pointer shadow-[0_0_25px_rgba(53,234,255,0.35)]"
              >
                Book Family Pass Now (₹1,000)
              </button>
              <a
                href="#schedule"
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all border border-white/10"
              >
                View Full Day Schedule ↓
              </a>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* CARNIVAL ACTIVITIES & EXPERIENCES */}
        {/* ========================================================= */}
        <section className="space-y-6">
          <div>
            <span className="text-xs text-neon-cyan font-mono uppercase tracking-widest font-bold">
              What to Expect
            </span>
            <h2 className="font-bold font-space text-2xl sm:text-4xl text-white mt-1">
              Carnival Arenas & Attractions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-2xl bg-[#0c1222] border border-white/10 hover:border-neon-cyan/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
                <Palette size={22} />
              </div>
              <h3 className="font-bold font-space text-lg text-white">UV Face Painting</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Non-toxic, FDA-approved, skin-safe neon face & body paint by professional artists. Watch the designs glow vibrantly under blacklights!
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0c1222] border border-white/10 hover:border-neon-cyan/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
                <Music2 size={22} />
              </div>
              <h3 className="font-bold font-space text-lg text-white">Glow Dance Arena</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Kid-friendly chartbusters, glow stick giveaways, light-up floor mats, and guided dance sessions led by energetic choreographers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0c1222] border border-white/10 hover:border-neon-cyan/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
                <Gift size={22} />
              </div>
              <h3 className="font-bold font-space text-lg text-white">DIY Craft Studio</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Hands-on blacklight crafting table. Every child designs their own glowing butterfly wings, masks, or wristbands to keep forever.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0c1222] border border-white/10 hover:border-neon-cyan/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
                <Gamepad2 size={22} />
              </div>
              <h3 className="font-bold font-space text-lg text-white">Neon Ring Toss & Games</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Interactive glowing carnival games with exciting merchandise prizes, medals, and instant certificates for all participants.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* FULL DAY SCHEDULE */}
        {/* ========================================================= */}
        <section id="schedule" className="space-y-6">
          <div className="border-b border-white/10 pb-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-neon-cyan font-mono uppercase tracking-widest font-bold">
                Timeline
              </span>
              <h2 className="font-bold font-space text-2xl sm:text-4xl text-white mt-1">
                Day Itinerary & Schedule
              </h2>
            </div>
            <span className="text-xs font-mono text-white/40">12:00 PM – 7:30 PM</span>
          </div>

          <div className="space-y-4">
            {[
              {
                time: '12:00 PM – 1:00 PM',
                title: 'Grand Carnival Gates Open & Glow Welcome',
                desc: 'Check-in, security wristband issuance, and complimentary neon glow kit distribution for each child.',
              },
              {
                time: '1:00 PM – 3:00 PM',
                title: 'Soft Play, Neon Games & Live Face Painting',
                desc: 'All carnival stalls open. Professional face painting artists begin glow styling across multiple stations.',
              },
              {
                time: '3:00 PM – 4:30 PM',
                title: 'Blacklight DIY Crafting Workshop',
                desc: 'Guided creative workshop where kids build glowing masks and take-home memorabilia with art instructors.',
              },
              {
                time: '4:30 PM – 6:00 PM',
                title: 'Kids Glow Dance Party & Interactive DJ Set',
                desc: 'High-energy dance floor with UV lasers, soap bubbles, and upbeat kid-safe anthems.',
              },
              {
                time: '6:00 PM – 7:00 PM',
                title: 'Glow Costume Parade & Prize Distribution',
                desc: 'Runway walk for children in creative glowing outfits, with prizes for the best glow costume.',
              },
              {
                time: '7:00 PM – 7:30 PM',
                title: 'Confetti Blast & Carnival Wrap-up',
                desc: 'Grand finale photo ops, souvenir collection, and safe departure transition.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#0c1222] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-all"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    0{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold font-space text-base text-white">{item.title}</h4>
                    <p className="text-xs text-white/60 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <div className="sm:text-right shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/40 border border-white/10 text-xs font-mono font-semibold text-neon-cyan">
                    <Clock size={12} /> {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SAFETY & HYGIENE (Parents Peace of Mind) */}
        {/* ========================================================= */}
        <section className="p-6 sm:p-10 rounded-3xl bg-[#0a1424] border border-emerald-500/30 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold font-space text-xl sm:text-2xl text-white">
                Child Safety, Hygiene & Security Guarantee
              </h3>
              <p className="text-xs text-white/60">
                We prioritize your family peace of mind above all else
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> 100% Non-Toxic Paints
              </span>
              <p className="text-[11px] text-white/60">
                All UV body cosmetics are hypoallergenic, water-soluble, and easily washed off with warm water.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Matching Security Wristbands
              </span>
              <p className="text-[11px] text-white/60">
                Children can only leave the venue with their verified accompanying parent holding a matched tag.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Dedicated Parent Lounge
              </span>
              <p className="text-[11px] text-white/60">
                Comfortable seating, coffee, complimentary Wi-Fi, and unobstructed views of all play arenas.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> CCTV & First Aid Station
              </span>
              <p className="text-[11px] text-white/60">
                Comprehensive 360° venue camera coverage with an on-site paramedic station and trained staff.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Clean Soft Play Equipment
              </span>
              <p className="text-[11px] text-white/60">
                All carnival mats, inflatables, and soft play blocks are sanitized before each activity block.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Strict Zero-Alcohol Policy
              </span>
              <p className="text-[11px] text-white/60">
                The entire venue maintains a strict family-safe, non-alcoholic environment throughout the day.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TICKET PASS INFO & BOOKING CARD */}
        {/* ========================================================= */}
        <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#0c1828] to-[#08101d] border-2 border-neon-cyan/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-neon-cyan/20 text-neon-cyan text-[11px] font-mono font-bold uppercase">
              Family Day Pass • Admit 2
            </span>
            <h3 className="font-extrabold font-space text-3xl sm:text-4xl text-white">
              Grab Your Family Pass Today
            </h3>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              One ticket admits <strong>1 Child + 1 Accompanying Parent</strong>. Includes full day carnival access, free craft kits, unlimited face painting, and dance floor entry.
            </p>
            <div className="text-2xl sm:text-3xl font-extrabold font-space text-neon-cyan">
              ₹1,000 <span className="text-xs text-white/40 font-mono font-normal">/ Family Pass</span>
            </div>
          </div>

          <button
            onClick={() => onOpenBooking('kids')}
            className="w-full md:w-auto px-10 py-4 rounded-2xl bg-neon-cyan text-[#071016] text-sm font-extrabold uppercase tracking-wider hover:opacity-95 transition-all cursor-pointer shadow-[0_0_35px_rgba(53,234,255,0.4)] shrink-0"
          >
            Book Kids Carnival Pass
          </button>
        </section>
      </main>
    </div>
  )
}
