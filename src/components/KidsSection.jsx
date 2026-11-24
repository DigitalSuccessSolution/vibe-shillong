import { ArrowRight, Clock3, Gamepad2, Gift, Palette, Sparkles, Zap } from 'lucide-react'
import { kidsActivities } from '../data/eventData'

export default function KidsSection({ packages = [], onNavigateToDetail }) {
  const kidsPkg = (packages || []).find((p) => p.key === 'kids')
  const kidsPrice = kidsPkg ? kidsPkg.price : 1000
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

      {/* Sleek Ticket Pass Style Card */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0c1825] via-[#09121c] to-[#070d14] border border-neon-cyan/40 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Pass Info & Price Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Price Badge Block */}
          <div className="sm:border-r sm:border-white/10 sm:pr-6 shrink-0">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neon-cyan font-semibold block">
              Pass Price
            </span>
            <div className="font-extrabold font-space text-3xl sm:text-4xl text-white mt-0.5">
              ₹{kidsPrice.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-white/40 font-mono mt-0.5 block">
              Admit 1+1 Family
            </span>
          </div>

          {/* Details */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-neon-cyan/15 text-neon-cyan text-[10px] font-mono font-bold tracking-wider uppercase mb-1">
              Carnival Day Pass
            </div>
            <h4 className="font-bold font-space text-xl sm:text-2xl text-white">
              The Family Pass (1 Child + 1 Parent)
            </h4>
            <p className="text-xs text-white/60 max-w-lg leading-relaxed">
              Includes full festival access, UV face painting, soft play arena, DIY craft workshops & glow dance party.
            </p>
          </div>
        </div>

        {/* Right: Clean Action Buttons with Proper Spacing */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/10">
          {onNavigateToDetail && (
            <button
              onClick={onNavigateToDetail}
              className="px-5 py-3 rounded-xl border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10 text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>Explore Details</span>
              <ArrowRight size={14} />
            </button>
          )}

          <a
            href="#tickets"
            className="px-6 py-3 rounded-xl bg-neon-cyan text-[#071016] hover:opacity-90 text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-2 font-space tracking-wide shadow-[0_0_20px_rgba(53,234,255,0.25)]"
          >
            <span>Book Passes</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  )
}
