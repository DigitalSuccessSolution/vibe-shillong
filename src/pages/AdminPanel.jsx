import { useState, useEffect } from 'react'
import {
  Lock,
  ShieldAlert,
  ArrowLeft,
  Menu,
  RefreshCw,
} from 'lucide-react'
import AdminSidebar from '../components/admin/AdminSidebar'
import ScannerPage from './admin/ScannerPage'
import TransactionsPage from './admin/TransactionsPage'
import AttendeesPage from './admin/AttendeesPage'
import AnalyticsPage from './admin/AnalyticsPage'
import PackagesPage from './admin/PackagesPage'
import InquiriesPage from './admin/InquiriesPage'
import { API_BASE_URL, ADMIN_USER, ADMIN_PASS } from '../config/api'

export default function AdminPanel() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('neon_admin_auth') === 'true'
    } catch {
      return false
    }
  })
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')

  // Route & Navigation State
  const getTabFromUrl = () => {
    if (typeof window === 'undefined') return 'scanner'
    const full = (window.location.pathname + window.location.hash).toLowerCase()
    if (full.includes('transactions')) return 'transactions'
    if (full.includes('attendees')) return 'attendees'
    if (full.includes('packages')) return 'packages'
    if (full.includes('inquiries')) return 'inquiries'
    if (full.includes('analytics')) return 'analytics'
    return 'scanner'
  }

  const [activeNav, setActiveNav] = useState(getTabFromUrl)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Real-time Database Tickets
  const [ticketsList, setTicketsList] = useState([])
  const [statsLoading, setStatsLoading] = useState(false)
  const [dbStatus, setDbStatus] = useState('checking') // 'connected' | 'offline' | 'checking'

  // Listen for Browser Back / Forward buttons
  useEffect(() => {
    const handleUrlChange = () => {
      setActiveNav(getTabFromUrl())
    }
    window.addEventListener('popstate', handleUrlChange)
    window.addEventListener('hashchange', handleUrlChange)
    return () => {
      window.removeEventListener('popstate', handleUrlChange)
      window.removeEventListener('hashchange', handleUrlChange)
    }
  }, [])

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault()
    setLoginError('')

    const cleanUser = (loginForm.username || '').trim()
    const cleanPass = (loginForm.password || '').trim()

    if (cleanUser === ADMIN_USER && cleanPass === ADMIN_PASS) {
      try {
        sessionStorage.setItem('neon_admin_auth', 'true')
      } catch {
        // Fallback
      }
      setIsAuthenticated(true)
    } else {
      setLoginError('Invalid Username or Password. Please check .env credentials.')
    }
  }

  // Handle Logout
  const handleLogout = () => {
    try {
      sessionStorage.removeItem('neon_admin_auth')
    } catch {
      // Fallback
    }
    setIsAuthenticated(false)
    setLoginForm({ username: '', password: '' })
  }

  // Navigate to separate page URLs
  const navigateTo = (tab) => {
    const targetPath = tab === 'scanner' ? '/admin/scanner' : `/admin/${tab}`
    try {
      window.history.pushState({}, '', targetPath)
    } catch {
      window.location.hash = `#/admin/${tab}`
    }
    setActiveNav(tab)
    setSidebarOpen(false)
  }

  // Fetch Tickets from MongoDB
  const fetchTickets = async () => {
    setStatsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets`)
      const data = await res.json()
      if (data.success && Array.isArray(data.tickets)) {
        setTicketsList(data.tickets)
        setDbStatus('connected')
      } else {
        setDbStatus('offline')
      }
    } catch {
      setDbStatus('offline')
    } finally {
      setStatsLoading(false)
    }
  }

  // Fetch fresh real data on login AND every time active tab changes (e.g. going to Attendees / Booked Tickets)
  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets()
    }
  }, [isAuthenticated, activeNav])

  // Calculated Stats
  const totalSold = ticketsList.length
  const totalScanned = ticketsList.filter((t) => t.status === 'USED').length
  const totalPending = totalSold - totalScanned
  const totalRevenue = ticketsList.reduce((acc, curr) => acc + (Number(curr.amountPaid) || 0), 0)

  // Login Card (Unauthenticated)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#06030b] text-[#f8f5ff] font-dm flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0f0a1c] border-2 border-neon-cyan/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(53,234,255,0.15)]">
          <div className="text-center mb-6">
            <img
              src="/logo.jpeg"
              alt="VIBE Shillong Logo"
              className="w-16 h-16 object-contain mix-blend-screen mx-auto mb-4"
            />
            <h2 className="font-bold font-space text-2xl text-white">Staff Admin Login</h2>
            <p className="text-xs text-white/50 mt-1">VIBE Shillong · Gate Management</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                Admin User ID
              </label>
              <input
                required
                type="text"
                placeholder="Enter admin username"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full px-4 py-3 bg-black/60 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-neon-cyan"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                required
                type="password"
                placeholder="Enter admin password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-3 bg-black/60 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-neon-cyan"
              />
            </div>

            {loginError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs">
                <ShieldAlert size={16} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-neon-cyan text-[#071016] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-[0_0_20px_rgba(53,234,255,0.3)] mt-2"
            >
              Authenticate & Access
            </button>

            <div className="pt-2 text-center">
              <a href="/" className="text-xs text-white/50 hover:text-white inline-flex items-center gap-1">
                <ArrowLeft size={12} /> Back to Public Site
              </a>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const pageTitles = {
    scanner: 'Gate Scanner Terminal',
    transactions: 'Payment Transactions & Orders',
    attendees: 'Attendee Database Ledger',
    packages: 'Ticket Packages & Pricing',
    inquiries: 'Contact Form Leads & Inquiries',
    analytics: 'Analytics & Pass Distribution',
  }

  return (
    <div className="min-h-screen bg-[#07040e] text-[#f8f5ff] font-dm flex flex-col md:flex-row overflow-hidden">
      {/* Dedicated Separate Sidebar Component */}
      <AdminSidebar
        activeNav={activeNav}
        onNavigate={navigateTo}
        sidebarOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        totalSold={totalSold}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#07040e]/95 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="md:hidden text-white/70 hover:text-white p-1 rounded-lg"
            >
              <Menu size={22} />
            </button>
            <h2 className="font-bold font-space text-lg text-white capitalize">
              {pageTitles[activeNav] || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {dbStatus === 'connected' ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/40 text-[11px] text-emerald-300 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>System Active</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/50 border border-rose-500/40 text-[11px] text-rose-300 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Service Offline</span>
              </div>
            )}

            <button
              onClick={fetchTickets}
              title="Refresh data"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs transition-all cursor-pointer border border-white/10"
            >
              <RefreshCw size={13} className={statsLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        {/* View Content - Expanded Width, No Extra Dead Margin */}
        <div className="px-6 py-6 sm:px-8 w-full max-w-[1600px] mx-auto space-y-6 flex-1">
          {/* DEDICATED SEPARATE PAGES */}
          {activeNav === 'scanner' && (
            <ScannerPage ticketsList={ticketsList} onRefreshTickets={fetchTickets} />
          )}

          {activeNav === 'transactions' && (
            <TransactionsPage ticketsList={ticketsList} />
          )}

          {activeNav === 'attendees' && (
            <AttendeesPage
              ticketsList={ticketsList}
              onRefreshTickets={fetchTickets}
              loading={statsLoading}
            />
          )}

          {activeNav === 'packages' && (
            <PackagesPage />
          )}

          {activeNav === 'inquiries' && (
            <InquiriesPage />
          )}

          {activeNav === 'analytics' && (
            <AnalyticsPage ticketsList={ticketsList} />
          )}
        </div>
      </div>
    </div>
  )
}
