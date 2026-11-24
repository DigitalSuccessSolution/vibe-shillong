import { useState, useEffect } from 'react'
import { img } from '../data/eventData'

export default function CountdownSection() {
  const getTime = () => {
    const diff = new Date('2026-12-12T12:00:00+05:30').getTime() - Date.now()
    if (diff <= 0) return { days: '00', hours: '00', minutes: '00', seconds: '00' }
    return {
      days: String(Math.floor(diff / 86400000)).padStart(2, '0'),
      hours: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
      minutes: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
      seconds: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
    }
  }

  const [time, setTime] = useState(getTime)

  useEffect(() => {
    const timer = setInterval(() => setTime(getTime()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative overflow-hidden py-16 px-6">
      <img
        src={img.confetti}
        alt="Confetti background"
        className="absolute inset-0 w-full h-full object-cover brightness-[0.25] saturate-150"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-[#080612]/75" />

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h2 className="font-bold font-space text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white">
            THE GLOW IS
            <br />
            <span className="gradient-text">GETTING CLOSER.</span>
          </h2>
        </div>

        {/* Counter Cells */}
        <div className="flex gap-3 sm:gap-4">
          {Object.entries(time).map(([label, value]) => (
            <div
              key={label}
              className="w-18 sm:w-20 h-20 sm:h-22 bg-[#100b20]/90 border border-neon-pink/40 flex flex-col items-center justify-center rounded-lg"
            >
              <strong className="font-bold font-space text-2xl sm:text-3xl text-neon-pink tabular-nums">
                {value}
              </strong>
              <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-[#a099af] uppercase mt-0.5">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
