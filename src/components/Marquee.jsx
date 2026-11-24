export default function Marquee() {
  const items = [
    { text: 'NEON PARTY', color: 'text-white' },
    { text: '✦', color: 'text-neon-pink text-base' },
    { text: '12 DECEMBER 2026', color: 'text-neon-cyan' },
    { text: '✦', color: 'text-neon-pink text-base' },
    { text: 'F LOUNGE BY FTV', color: 'text-white' },
    { text: '✦', color: 'text-neon-lime text-base' },
    { text: 'KIDS CARNIVAL', color: 'text-neon-cyan' },
    { text: '✦', color: 'text-neon-pink text-base' },
    { text: 'ADULT NIGHTS', color: 'text-neon-pink' },
    { text: '✦', color: 'text-neon-lime text-base' },
    { text: 'HEADLINER DJ TINA', color: 'gradient-text font-black' },
    { text: '✦', color: 'text-neon-pink text-base' },
  ]

  return (
    <div className="overflow-hidden py-3.5 my-6 bg-[#0f0a1c] border-y border-neon-pink/25 shadow-[0_0_25px_rgba(255,53,196,0.12)] select-none">
      <div className="flex whitespace-nowrap animate-marquee font-bold font-space text-xs sm:text-sm tracking-[2.5px] items-center">
        {[...Array(3)].map((_, loopIdx) => (
          <div key={loopIdx} className="flex items-center gap-4 shrink-0 pr-4">
            {items.map((item, idx) => (
              <span key={idx} className={`${item.color} uppercase`}>
                {item.text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
