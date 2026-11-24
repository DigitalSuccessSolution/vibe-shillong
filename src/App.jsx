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

export default function App() {
  const [activeTicket, setActiveTicket] = useState(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedPackageKey, setSelectedPackageKey] = useState('adult')

  const handleOpenBooking = (packageKey = 'adult') => {
    setSelectedPackageKey(packageKey)
    setIsBookingOpen(true)
  }

  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        window.location.pathname.startsWith('/admin') ||
        window.location.hash.startsWith('#/admin')
      )
    }
    return false
  })

  useEffect(() => {
    const handleRouteCheck = () => {
      const match =
        window.location.pathname.startsWith('/admin') ||
        window.location.hash.startsWith('#/admin')
      setIsAdmin(match)
    }

    window.addEventListener('popstate', handleRouteCheck)
    window.addEventListener('hashchange', handleRouteCheck)
    return () => {
      window.removeEventListener('popstate', handleRouteCheck)
      window.removeEventListener('hashchange', handleRouteCheck)
    }
  }, [])

  // If URL is /admin or #/admin, render the private Admin Panel
  if (isAdmin) {
    return <AdminPanel />
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
        <Concept />
        <KidsSection />
        <GalleryStrip onOpenBooking={handleOpenBooking} />
        <AdultSection />
        <VideoShowcase />
        <VenueBanner />
        <TicketsSection onOpenBooking={handleOpenBooking} />
        <CountdownSection />
        <ContactSection />
        <FAQSection />
      </main>

      {/* Public Footer (Clean, no scanner buttons) */}
      <Footer />

      {/* High-Converting Mobile Sticky Bar (Hidden on desktop, active on mobile) */}
      <MobileStickyCTA onOpenBooking={handleOpenBooking} />

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
        onClose={() => setActiveTicket(null)}
      />
    </div>
  )
}
