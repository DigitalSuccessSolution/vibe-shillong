import { useState, useEffect } from 'react'
import { ArrowRight, Menu, X } from 'lucide-react'

export default function Navbar({ onOpenBooking }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Live countdown to Festival Date (12 Dec 2026, 12:00 PM IST)
  const getCountdown = () => {
    const diff = new Date('2026-12-12T12:00:00+05:30').getTime() - Date.now()
    if (diff <= 0) return { days: '00', hours: '00', minutes: '00', seconds: '00' }
    return {
      days: String(Math.floor(diff / 86400000)).padStart(2, '0'),
      hours: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
      minutes: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
      seconds: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
    }
  }

  const [countdown, setCountdown] = useState(getCountdown)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    const timer = setInterval(() => setCountdown(getCountdown()), 1000)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearInterval(timer)
    }
  }, [])

  const navItems = [
    { label: 'Experience', href: '#experience' },
    { label: 'Kids Carnival', href: '#kids' },
    { label: 'Adult Nights', href: '#adult' },
    { label: 'Tickets', href: '#tickets' },
    { label: 'Contact Us', href: '#contact' },
    { label: 'FAQ', href: '#faq' },
  ]

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      {/* Permanent Fixed Header: Stays pinned and visible on scroll at all times */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full">
        {/* Top Festive Announcement Bar */}
        <div className="w-full bg-black/95 backdrop-blur-md text-white py-2 px-4 sm:px-8 text-xs font-dm">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
            {/* Festive Date & Venue */}
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-pink animate-pulse" />
              <span className="text-white/60 font-semibold uppercase tracking-wider text-[11px]">
                Festival Date:
              </span>
              <span className="font-bold text-white tracking-wide">
                Saturday, 12 December 2026
              </span>
              <span className="hidden sm:inline text-white/30">•</span>
              <span className="hidden sm:inline text-neon-cyan font-medium">
                F Lounge by FTV
              </span>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-white/90 font-medium">
                Our Biggest Neon Fest Starts in
              </span>
              <span className="font-bold text-white font-mono tracking-wide">
                {countdown.days}d : {countdown.hours}h : {countdown.minutes}m : {countdown.seconds}s
              </span>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div
          className={`relative w-full h-[74px] sm:h-[80px] flex items-center justify-between transition-all duration-300 px-6 sm:px-10 lg:px-16 ${scrolled
              ? 'bg-black/95 backdrop-blur-xl'
              : 'bg-black/95 backdrop-blur-lg'
            }`}
        >
          <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
            {/* Brand Logo - Seamlessly blended with navbar bg */}
            <a href="#top" onClick={closeMenu} className="flex items-center">
              <img
                src="/logo.jpeg"
                alt="VIBE Shillong"
                className="h-14 sm:h-[62px] w-auto object-contain mix-blend-screen transition-transform duration-200 hover:scale-105"
              />
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-7">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-[13px] text-neon-muted hover:text-white transition-colors duration-200"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Right CTA & Mobile Toggle */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => onOpenBooking ? onOpenBooking('adult') : (window.location.hash = '#booking')}
                className="flex items-center gap-2.5 border border-neon-pink px-4 py-2 text-[13px] text-white hover:bg-neon-pink/15 transition-all duration-200 cursor-pointer"
              >
                Get tickets <ArrowRight size={15} />
              </button>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
                className="md:hidden text-white p-1 hover:text-neon-pink transition-colors"
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {menuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-black/98 backdrop-blur-2xl flex flex-col gap-4 p-6 animate-in fade-in slide-in-from-top-3 duration-200">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={closeMenu}
                  className="text-base text-neon-muted hover:text-white py-1 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Spacer to prevent page content from being pushed under fixed header */}
      <div className="w-full h-[112px] sm:h-[118px]" aria-hidden="true" />
    </>
  )
}
