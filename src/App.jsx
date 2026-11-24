import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Concept from './components/Concept'
import KidsSection from './components/KidsSection'
import GalleryStrip from './components/GalleryStrip'
import AdultSection from './components/AdultSection'
import VideoShowcase from './components/VideoShowcase'
import VenueBanner from './components/VenueBanner'
import TicketsSection from './components/TicketsSection'
import CountdownSection from './components/CountdownSection'
import ContactSection from './components/ContactSection'
import FAQSection from './components/FAQSection'
import Footer from './components/Footer'
import MobileStickyCTA from './components/MobileStickyCTA'
import TicketModal from './components/TicketModal'
import BookingDrawer from './components/BookingDrawer'
import AdminPanel from './pages/AdminPanel'
import KidsEventDetailPage from './pages/KidsEventDetailPage'
import AdultEventDetailPage from './pages/AdultEventDetailPage'
import { API_BASE_URL } from './config/api'
import { DEFAULT_PACKAGES } from './constants/packages'

export default function App() {
  const [activeTicket, setActiveTicket] = useState(null)
  const [autoDownloadTicket, setAutoDownloadTicket] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedPackageKey, setSelectedPackageKey] = useState('adult')
  const [packages, setPackages] = useState(DEFAULT_PACKAGES)

  // Fetch real-time dynamic packages & prices from MongoDB
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/packages`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.packages) && data.packages.length > 0) {
          setPackages(data.packages)
        }
      })
      .catch(() => {})

    // Check if user came from Email with ?ticket= or ?ticketId=
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const ticketParam = urlParams.get('ticket') || urlParams.get('ticketId')
      const downloadParam = urlParams.get('download') === 'true'
      if (ticketParam) {
        setAutoDownloadTicket(downloadParam)
        fetch(`${API_BASE_URL}/api/tickets/${ticketParam.trim().toUpperCase()}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.ticket) {
              setActiveTicket(data.ticket)
            }
          })
          .catch((err) => console.error('Ticket load error from email link:', err))
      }
    } catch {}
  }, [])

  const handleOpenBooking = (packageKey = 'adult') => {
    setSelectedPackageKey(packageKey)
    setIsBookingOpen(true)
  }

  const getRouteFromUrl = () => {
    if (typeof window === 'undefined') return 'home'
    const path = window.location.pathname.toLowerCase()
    const hash = window.location.hash.toLowerCase()
    const full = path + hash

    if (full.includes('/admin')) return 'admin'
    if (full.includes('/event/kids')) return 'kids-event'
    if (full.includes('/event/adult')) return 'adult-event'
    return 'home'
  }

  const [currentRoute, setCurrentRoute] = useState(getRouteFromUrl)

  const navigateTo = (target) => {
    const routeMap = {
      home: '/',
      'kids-event': '/event/kids',
      'adult-event': '/event/adult',
      admin: '/admin',
    }
    const targetUrl = routeMap[target] || '/'
    try {
      window.history.pushState({}, '', targetUrl)
    } catch {
      window.location.hash = targetUrl === '/' ? '' : `#${targetUrl}`
    }
    setCurrentRoute(target)
  }

  useEffect(() => {
    const handleRouteCheck = () => {
      setCurrentRoute(getRouteFromUrl())
    }

    window.addEventListener('popstate', handleRouteCheck)
    window.addEventListener('hashchange', handleRouteCheck)
    return () => {
      window.removeEventListener('popstate', handleRouteCheck)
      window.removeEventListener('hashchange', handleRouteCheck)
    }
  }, [])

  // If URL is /admin or #/admin, render the private Admin Panel
  if (currentRoute === 'admin') {
    return <AdminPanel />
  }

  // If URL is /event/kids, render Kids Event Detail Page
  if (currentRoute === 'kids-event') {
    return (
      <>
        <KidsEventDetailPage
          packages={packages}
          onOpenBooking={handleOpenBooking}
          onNavigateHome={() => navigateTo('home')}
        />
        <BookingDrawer
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          selectedPackageKey={selectedPackageKey}
          onTicketGenerated={(ticket) => setActiveTicket(ticket)}
        />
        <TicketModal
          isOpen={Boolean(activeTicket)}
          ticket={activeTicket}
          autoDownload={autoDownloadTicket}
          onClose={() => {
            setActiveTicket(null)
            setAutoDownloadTicket(false)
          }}
        />
      </>
    )
  }

  // If URL is /event/adult, render Adult Event Detail Page
  if (currentRoute === 'adult-event') {
    return (
      <>
        <AdultEventDetailPage
          packages={packages}
          onOpenBooking={handleOpenBooking}
          onNavigateHome={() => navigateTo('home')}
        />
        <BookingDrawer
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          selectedPackageKey={selectedPackageKey}
          onTicketGenerated={(ticket) => setActiveTicket(ticket)}
        />
        <TicketModal
          isOpen={Boolean(activeTicket)}
          ticket={activeTicket}
          autoDownload={autoDownloadTicket}
          onClose={() => {
            setActiveTicket(null)
            setAutoDownloadTicket(false)
          }}
        />
      </>
    )
  }

  // Public Landing Page (Zero scanner clutter)
  return (
    <div className="relative overflow-x-clip min-h-screen bg-neon-bg font-dm text-[#f8f5ff] selection:bg-neon-pink selection:text-black">
      {/* Subtle Atmospheric Lighting */}
      <div className="absolute top-40 -left-40 w-96 h-96 bg-neon-pink/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[1800px] -right-40 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Navigation */}
      <Navbar onOpenBooking={handleOpenBooking} />

      <main id="top" className="relative z-10">
        <Hero onOpenBooking={handleOpenBooking} />
        <Marquee />
        <Concept
          onNavigateToKids={() => navigateTo('kids-event')}
          onNavigateToAdult={() => navigateTo('adult-event')}
        />
        <KidsSection
          packages={packages}
          onNavigateToDetail={() => navigateTo('kids-event')}
        />
        <GalleryStrip onOpenBooking={handleOpenBooking} />
        <AdultSection
          packages={packages}
          onNavigateToDetail={() => navigateTo('adult-event')}
        />
        <VideoShowcase />
        <VenueBanner />
        <TicketsSection
          packages={packages}
          onOpenBooking={handleOpenBooking}
        />
        <CountdownSection />
        <ContactSection />
        <FAQSection />
      </main>

      {/* Public Footer (Clean, no scanner buttons) */}
      <Footer />

      {/* Slide-over Fast Booking Drawer */}
      <BookingDrawer
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedPackageKey={selectedPackageKey}
        onTicketGenerated={(ticket) => setActiveTicket(ticket)}
      />

      {/* Digital QR Ticket Modal for user upon booking */}
      <TicketModal
        isOpen={Boolean(activeTicket)}
        ticket={activeTicket}
        autoDownload={autoDownloadTicket}
        onClose={() => {
          setActiveTicket(null)
          setAutoDownloadTicket(false)
        }}
      />
    </div>
  )
}
