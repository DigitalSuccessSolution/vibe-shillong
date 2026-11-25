import { useState, useEffect, useRef } from 'react'
import { ArrowRight, Menu, X, Ticket, LogOut, ChevronDown } from 'lucide-react'
import { useAuth, GoogleIcon } from '../context/AuthContext'

export default function Navbar({
  onOpenBooking,
  onOpenMyPasses,
  onNavigateHome,
  onNavigateToSection,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const userMenuRef = useRef(null)

  const { user, loginWithGoogle, logout } = useAuth()

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

    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearInterval(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const navItems = [
    { label: 'Experience', id: 'experience' },
    { label: 'Kids Carnival', id: 'kids' },
    { label: 'Adult Nights', id: 'adult' },
    { label: 'Tickets', id: 'tickets' },
    { label: 'Contact Us', id: 'contact' },
    { label: 'FAQ', id: 'faq' },
  ]

  const closeMenu = () => setMenuOpen(false)

  const handleNavClick = (e, item) => {
    e.preventDefault()
    closeMenu()
    if (onNavigateToSection) {
      onNavigateToSection(item.id)
    } else {
      const el = document.getElementById(item.id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      {/* Permanent Fixed Header: Stays pinned and visible on scroll at all times */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full">
        {/* Top Festive Announcement Bar */}
        <div className="w-full bg-black/95 backdrop-blur-md text-white py-1.5 px-3.5 sm:px-8 text-[11px] sm:text-xs font-dm border-b border-white/10">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
            {/* Festive Date & Venue */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-pink animate-pulse shrink-0" />
              <span className="text-white/60 font-semibold uppercase tracking-wider text-[10px] hidden sm:inline">
                Festival Date:
              </span>
              <span className="font-bold text-white tracking-wide text-[11px] sm:text-xs">
                <span className="hidden sm:inline">Saturday, </span>12 Dec 2026
              </span>
              <span className="hidden sm:inline text-white/30">•</span>
              <span className="hidden sm:inline text-neon-cyan font-medium">
                F Lounge by FTV
              </span>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="text-white/80 font-medium hidden md:inline">
                Our Biggest Neon Fest Starts in
              </span>
              <span className="text-white/60 font-medium text-[10px] hidden xs:inline md:hidden">
                Starts in
              </span>
              <span className="font-bold text-neon-lime font-mono tracking-tight sm:tracking-wide text-[11px] sm:text-xs bg-white/5 px-2 py-0.5 rounded border border-white/10">
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
            <a
              href="/"
              onClick={(e) => {
                closeMenu()
                if (onNavigateHome) {
                  e.preventDefault()
                  onNavigateHome()
                }
              }}
              className="flex items-center"
            >
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
                  href={`/#${item.id}`}
                  onClick={(e) => handleNavClick(e, item)}
                  className="text-[13px] text-neon-muted hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Right CTA & Mobile Toggle */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              {/* Google Auth Button / User Avatar */}
              {!user ? (
                <button
                  type="button"
                  onClick={loginWithGoogle}
                  className="flex items-center justify-center gap-1.5 w-8 h-8 sm:w-auto sm:h-auto p-0 sm:px-3 sm:py-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-all cursor-pointer shrink-0"
                  title="Sign in with Google"
                >
                  <GoogleIcon size={14} />
                  <span className="hidden sm:inline">Sign in</span>
                </button>
              ) : (
                <div className="relative shrink-0" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="group flex items-center justify-center md:justify-start w-8 h-8 md:w-auto md:h-auto p-0 md:py-1 md:pl-1 md:pr-2.5 md:gap-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-neon-cyan/50 transition-all cursor-pointer select-none shrink-0"
                    title={user.name}
                  >
                    {/* Avatar with Online Indicator */}
                    <div className="relative w-8 h-8 rounded-full shrink-0 flex items-center justify-center p-0.5">
                      <img
                        src={user.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover ring-1 ring-white/25 group-hover:ring-neon-cyan transition-all"
                      />
                      <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black" />
                    </div>

                    {/* Desktop Name & Rotating Chevron */}
                    <div className="hidden md:flex items-center gap-1.5 min-w-0 pr-0.5">
                      <span className="text-xs font-semibold text-white/90 group-hover:text-white truncate max-w-[85px]">
                        {user.name.split(' ')[0]}
                      </span>
                      <ChevronDown
                        size={13}
                        className={`text-white/40 group-hover:text-neon-cyan transition-transform duration-200 ${
                          userMenuOpen ? 'rotate-180 text-neon-cyan' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl bg-[#0c0719]/95 backdrop-blur-xl border border-white/15 p-3 space-y-2 z-50 shadow-[0_12px_40px_rgba(0,0,0,0.85)] animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10">
                        <img
                          src={user.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-white/20"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{user.name}</p>
                          <p className="text-[10px] text-white/50 font-mono truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="pt-1 space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false)
                            if (onOpenMyPasses) onOpenMyPasses()
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-white hover:bg-neon-cyan/15 hover:text-neon-cyan transition-colors text-left font-medium cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Ticket size={15} className="text-neon-cyan" />
                            <span>My Booked Passes</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-mono">
                            Passes
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false)
                            logout()
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left font-medium cursor-pointer"
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => onOpenBooking ? onOpenBooking('adult') : (window.location.hash = '#booking')}
                className="flex items-center gap-2 border border-neon-pink px-3.5 py-1.5 text-xs text-white hover:bg-neon-pink/15 transition-all duration-200 cursor-pointer font-medium"
              >
                <span>Get tickets</span> <ArrowRight size={14} />
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
            <div className="md:hidden absolute top-full left-0 right-0 bg-black/98 backdrop-blur-2xl flex flex-col gap-4 p-6 animate-in fade-in slide-in-from-top-3 duration-200 border-b border-white/10">
              {/* Mobile User Status / Sign In */}
              <div className="pb-3 border-b border-white/10">
                {!user ? (
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu()
                      loginWithGoogle()
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/20 bg-white/5 text-xs text-white font-medium"
                  >
                    <GoogleIcon size={16} />
                    <span>Sign in with Google</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={user.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-white/50 font-mono truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          closeMenu()
                          if (onOpenMyPasses) onOpenMyPasses()
                        }}
                        className="flex-1 py-2 rounded-xl bg-neon-cyan/15 text-neon-cyan text-xs font-bold border border-neon-cyan/30 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Ticket size={14} />
                        <span>My Booked Passes</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          closeMenu()
                          logout()
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs border border-white/10"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={`/#${item.id}`}
                  onClick={(e) => handleNavClick(e, item)}
                  className="text-base text-neon-muted hover:text-white py-1 transition-colors cursor-pointer"
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Spacer to prevent page content from being pushed under fixed header */}
      <div className="w-full h-[102px] sm:h-[108px]" aria-hidden="true" />
    </>
  )
}
