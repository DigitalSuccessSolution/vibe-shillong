import { ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react'
import { img } from '../data/eventData'

export default function Concept() {
  return (
    <section className="py-24 max-w-6xl mx-auto px-6" id="experience">
      {/* Clean Editorial Heading */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end mb-14">
        <div className="md:col-span-7">
          <h2 className="font-bold font-space text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-tight">
            One Iconic Venue.
            <br />
            <span className="gradient-text">Two Distinct Worlds.</span>
          </h2>
        </div>
        <p className="md:col-span-5 text-neon-muted text-sm sm:text-base leading-relaxed">
          Saturday, 12 December at F Lounge by FTV is programmed into two standalone sessions — an afternoon glow carnival for families, followed by an electrifying nightclub experience after dark.
        </p>
      </div>

      {/* Two Standalone Event Experience Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kids Card */}
        <article className="group relative min-h-[420px] rounded-2xl overflow-hidden border border-neon-cyan/30 flex items-end transition-all duration-300">
          <img
            src="/images/tina/Neon Family Glow Party.png"
            alt="Neon Family Glow Party"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080612] via-[#080612]/60 to-transparent" />

          <div className="relative z-10 p-8 w-full">
            <h3 className="font-bold font-space text-3xl sm:text-4xl text-white my-2 leading-tight">
              Kids Neon Carnival
            </h3>
            <p className="text-sm text-[#d0cae0] max-w-md leading-relaxed mb-6">
              A vibrant daytime wonderland with blacklight crafts, glow-in-the-dark dance battles, UV face art, and awards for kids.
            </p>

            <a
              href="#kids"
              className="inline-flex items-center gap-2 text-sm font-bold text-neon-cyan hover:underline"
            >
              Explore daytime activities <ArrowUpRight size={16} />
            </a>
          </div>
        </article>

        {/* Adult Card */}
        <article className="group relative min-h-[420px] rounded-2xl overflow-hidden border border-neon-pink/30 flex items-end transition-all duration-300">
          <img
            src="/images/tina/Neon Nightclub Dancefloor Spectacle.png"
            alt="Neon Nightclub Dancefloor Spectacle"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080612] via-[#080612]/60 to-transparent" />

          <div className="relative z-10 p-8 w-full">
            <h3 className="font-bold font-space text-3xl sm:text-4xl text-white my-2 leading-tight">
              Adult Neon Nights ft. DJ Tina
            </h3>
            <p className="text-sm text-[#d0cae0] max-w-md leading-relaxed mb-6">
              Full nightclub production, headline live set by DJ Tina, UV dancefloor, glow mixology, and VIP lounge tables.
            </p>

            <a
              href="#adult"
              className="inline-flex items-center gap-2 text-sm font-bold text-neon-pink hover:underline"
            >
              Explore nightlife details <ArrowRight size={16} />
            </a>
          </div>
        </article>
      </div>
    </section>
  )
}
