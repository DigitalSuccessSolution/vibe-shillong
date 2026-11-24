import { ArrowRight, Clock3, Gamepad2, Gift, Palette, Sparkles, Zap } from 'lucide-react'
import { kidsActivities } from '../data/eventData'

export default function KidsSection({ onNavigateToDetail }) {
  const getIcon = (type) => {
    switch (type) {
      case 'palette': return <Palette size={18} className="text-neon-cyan shrink-0" />
      case 'zap': return <Zap size={18} className="text-neon-cyan shrink-0" />
      case 'gift': return <Gift size={18} className="text-neon-cyan shrink-0" />
      case 'star': return <Gamepad2 size={18} className="text-neon-cyan shrink-0" />
      default: return <Sparkles size={18} className="text-neon-cyan shrink-0" />
    }
  }

  return (
    <section className="py-20 max-w-6xl mx-auto px-6 relative" id="kids">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
        <div>
          <h2 className="font-bold font-space text-4xl sm:text-6xl text-white tracking-tight leading-none">
            KIDS <span className="gradient-text">NEON CARNIVAL</span><span className="text-neon-cyan">.</span>
          </h2>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-sm font-bold text-white flex items-center sm:justify-end gap-2">
            <Clock3 size={16} className="text-neon-cyan" /> 12:00 PM – 7:30 PM
          </div>
          <span className="text-xs text-neon-cyan font-semibold">All Ages Welcome • Family Friendly</span>
        </div>
      </div>

      {/* Intro Description */}
      <div className="max-w-2xl mb-10">
        <h3 className="font-bold font-space text-2xl sm:text-3xl text-white mb-3">
          Safe, Creative & High-Energy Glow Fun.
        </h3>
        <p className="text-neon-muted text-sm sm:text-base leading-relaxed">
          From UV neon face painting to DIY glow crafts and dance competitions, children experience a magical glowing world in a secure, premium venue at F Lounge by FTV.
        </p>
      </div>

      {/* 4 Activity Cards Grid - Exact Adult Section Style (Full-bleed image with overlay text) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-12">
        {kidsActivities.map((item) => (
          <div
            key={item.title}
            className="group relative h-56 sm:h-64 lg:h-72 rounded-2xl overflow-hidden border border-white/10 hover:border-neon-cyan/50 transition-all duration-300 shadow-xl"
          >
            <img
              src={item.img}
              alt={item.title}
              className="w-full h-full object-cover brightness-[0.85] saturate-[1.15] group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080612]/95 via-[#080612]/30 to-transparent flex items-end p-5">
              <span className="text-sm sm:text-base text-white font-bold flex items-center gap-2 leading-snug">
                {getIcon(item.iconType)}
                {item.title}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Family Pass Highlight Action Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-2xl bg-[#0c1825] border border-neon-cyan/35 shadow-[0_0_25px_rgba(53,234,255,0.12)]">
        <div>
          <h4 className="font-bold font-space text-xl text-white">The Family Pass (1 Child + 1 Parent)</h4>
          <span className="text-xs text-neon-muted mt-1 block">
            Includes full festival access, UV face painting, craft materials, dance entertainment & awards entry
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="font-bold font-space text-2xl text-white">
            ₹1,000<span className="text-neon-cyan font-normal">–</span>₹1,200
          </div>
          {onNavigateToDetail && (
            <button
              onClick={onNavigateToDetail}
              className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold tracking-wide bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all rounded cursor-pointer"
            >
              EVENT DETAILS <ArrowRight size={15} />
            </button>
          )}
          <a
            href="#tickets"
            className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 text-xs sm:text-sm font-bold tracking-wide bg-neon-cyan text-[#071016] hover:opacity-90 transition-all rounded shadow-[0_0_20px_rgba(53,234,255,0.25)]"
          >
            BOOK PASSES <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}
