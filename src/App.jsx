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
import FloatingOfferPill from './components/FloatingOfferPill'
import WhatsAppCTA from './components/WhatsAppCTA'
import AdminPanel from './pages/AdminPanel'
import KidsEventDetailPage from './pages/KidsEventDetailPage'
import AdultEventDetailPage from './pages/AdultEventDetailPage'
import MyBookingsPage from './pages/MyBookingsPage'
import { API_BASE_URL, ADMIN_ROUTE_PATH } from './config/api'
import { DEFAULT_PACKAGES } from './constants/packages'

export default function App() {
  const [activeTicket, setActiveTicket] = useState(null)
  const [autoDownloadTicket, setAutoDownloadTicket] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedPackageKey, setSelectedPackageKey] = useState('adult')
  const [initialCouponCode, setInitialCouponCode] = useState('')
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

  const handleOpenBooking = (packageKey = 'adult', couponCode = '') => {
    setSelectedPackageKey(packageKey)
    setInitialCouponCode(couponCode || '')
    setIsBookingOpen(true)
  }

  const getRouteFromUrl = () => {
    if (typeof window === 'undefined') return 'home'
    const path = window.location.pathname.toLowerCase()
    const hash = window.location.hash.toLowerCase()
    const full = path + hash

    // Secret Admin Route (Only active if VITE_ADMIN_PATH is configured in .env)
    const secretSlug = (ADMIN_ROUTE_PATH || '').toLowerCase()
    if (secretSlug && (full.includes(`/${secretSlug}`) || full.includes(`#/${secretSlug}`))) {
      return 'admin'
    }

    // Block common default /admin URLs and redirect curious bots/visitors to home
    if (full.includes('/admin')) {
      try {
        window.history.replaceState({}, '', '/')
      } catch {}
      return 'home'
    }

    if (full.includes('/event/kids')) return 'kids-event'
    if (full.includes('/event/adult')) return 'adult-event'
    if (full.includes('/my-bookings') || full.includes('/my-passes')) return 'my-bookings'
    return 'home'
  }

  const [currentRoute, setCurrentRoute] = useState(getRouteFromUrl)

  const navigateTo = (target) => {
    const routeMap = {
      home: '/',
      'kids-event': '/event/kids',
      'adult-event': '/event/adult',
      admin: `/${ADMIN_ROUTE_PATH}`,
      'my-bookings': '/my-bookings',
    }
    const targetUrl = routeMap[target] || '/'
    try {
      window.history.pushState({}, '', targetUrl)
    } catch {
      window.location.hash = targetUrl === '/' ? '' : `#${targetUrl}`
    }
    setCurrentRoute(target)
  }

  // Smoothly scroll to any homepage section (Experience, FAQ, Contact, etc.) from any page
  const handleNavigateToSection = (sectionId) => {
    if (!sectionId) return

    if (currentRoute !== 'home') {
      navigateTo('home')
      let attempts = 0
      const checkInterval = setInterval(() => {
        attempts++
        const el = document.getElementById(sectionId)
        if (el) {
          clearInterval(checkInterval)
          try {
            window.history.replaceState({}, '', `/#${sectionId}`)
          } catch {}
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else if (attempts > 35) {
          clearInterval(checkInterval)
        }
      }, 40)
    } else {
      const el = document.getElementById(sectionId)
      if (el) {
        try {
          window.history.replaceState({}, '', `/#${sectionId}`)
        } catch {}
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
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

  // Track Meta Pixel PageView on route navigation
  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView')
    }
  }, [currentRoute])

  // If URL is /admin or #/admin, render the private Admin Panel
  if (currentRoute === 'admin') {
    return <AdminPanel />
  }

  // Unified Public Shell: Persistent Navbar and Footer across all pages!
  return (
    <div className="relative overflow-x-clip min-h-screen bg-neon-bg font-dm text-[#f8f5ff] selection:bg-neon-pink selection:text-black flex flex-col">
      {/* Main Persistent Navbar */}
      <Navbar
        onOpenBooking={handleOpenBooking}
        onOpenMyPasses={() => navigateTo('my-bookings')}
        onNavigateHome={() => navigateTo('home')}
        onNavigateToSection={handleNavigateToSection}
      />

      {/* Dynamic Main Page Content */}
      <div className="flex-1 w-full flex flex-col">
        {currentRoute === 'kids-event' && (
          <KidsEventDetailPage
            packages={packages}
            onOpenBooking={handleOpenBooking}
            onNavigateHome={() => navigateTo('home')}
          />
        )}

        {currentRoute === 'adult-event' && (
          <AdultEventDetailPage
            packages={packages}
            onOpenBooking={handleOpenBooking}
            onNavigateHome={() => navigateTo('home')}
          />
        )}

        {currentRoute === 'my-bookings' && (
          <MyBookingsPage
            packages={packages}
            onOpenBooking={handleOpenBooking}
            onNavigateHome={() => navigateTo('home')}
            onSelectTicket={(ticket) => setActiveTicket(ticket)}
          />
        )}

        {currentRoute === 'home' && (
          <main id="top" className="relative z-10 flex-1">
            {/* Home Atmospheric Background Lighting */}
            <div className="absolute top-40 -left-40 w-96 h-96 bg-neon-pink/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-[1800px] -right-40 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[140px] pointer-events-none" />

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
        )}
      </div>

      {/* Main Persistent Footer */}
      <Footer />

      {/* Slide-over Fast Booking Drawer */}
      <BookingDrawer
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false)
          setInitialCouponCode('')
        }}
        selectedPackageKey={selectedPackageKey}
        initialCouponCode={initialCouponCode}
        onTicketGenerated={(ticket) => setActiveTicket(ticket)}
      />

      {/* Floating Live Offer Pill (Bottom-Left Corner) */}
      <FloatingOfferPill
        onClaimOffer={(code, eventType) => handleOpenBooking(eventType || 'adult', code)}
      />

      {/* Floating WhatsApp Support CTA (Bottom-Right Corner) */}
      <WhatsAppCTA />

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
