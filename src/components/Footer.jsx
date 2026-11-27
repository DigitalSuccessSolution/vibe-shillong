export default function Footer() {
  return (
    <footer className="w-full bg-black pt-10 pb-8 px-6 sm:px-10 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <a href="#top" className="flex items-center gap-3">
            <img
              src="/logo.jpeg"
              alt="VIBE Shillong Logo"
              className="w-12 h-12 object-contain mix-blend-screen"
            />
            <span className="font-bold font-space text-[14px] tracking-[2px] leading-tight text-white">
              VIBE
              <span className="block font-medium font-dm text-[9px] tracking-[3px] text-neon-cyan mt-0.5 uppercase">
                SHILLONG
              </span>
            </span>
          </a>

          <p className="text-xs sm:text-sm text-[#a099af]">VIBE Shillong · Two Neon Events. One Epic Date.</p>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 mt-8 pt-6 text-xs text-[#847d94]">
          <span>© 2026 VIBE Shillong · Event concept</span>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#/my-bookings" className="text-neon-cyan hover:underline">
              My Booked Passes
            </a>
            <span>•</span>
            <a
              href="https://wa.me/918256985382"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              WhatsApp Support: +91 82569 85382
            </a>
            <span>•</span>
            <span>F Lounge by FTV</span>
          </div>
          <a href="#top" className="text-neon-lime hover:underline">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
