import { QrCode, Users, TrendingUp, Tag, CreditCard, LogOut, ExternalLink, X } from 'lucide-react'
import { ADMIN_USER } from '../../config/api'

export default function AdminSidebar({
  activeNav,
  onNavigate,
  sidebarOpen,
  onCloseSidebar,
  onLogout,
  totalSold = 0,
}) {
  const navItems = [
    { id: 'scanner', label: 'Gate Scanner', icon: QrCode, badge: 'Live', path: '/admin/scanner' },
    { id: 'transactions', label: 'Transactions', icon: CreditCard, count: totalSold, path: '/admin/transactions' },
    { id: 'attendees', label: 'Attendee Ledger', icon: Users, path: '/admin/attendees' },
    { id: 'packages', label: 'Ticket Packages', icon: Tag, path: '/admin/packages' },
    { id: 'analytics', label: 'Analytics & Stats', icon: TrendingUp, path: '/admin/analytics' },
  ]

  return (
    <aside
      className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[#0c0719] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
    >
      {/* Top Sidebar Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpeg"
              alt="VIBE Shillong Logo"
              className="w-11 h-11 object-contain mix-blend-screen"
            />
            <div>
              <span className="font-bold font-space text-[13px] tracking-[2px] leading-tight text-white block">
                VIBE SHILLONG
              </span>
              <span className="text-[10px] text-neon-cyan font-bold tracking-widest uppercase">
                Admin Portal
              </span>
            </div>
          </div>

          <button
            onClick={onCloseSidebar}
            aria-label="Close menu"
            className="md:hidden text-white/60 hover:text-white p-1 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = activeNav === item.id
            return (
              <a
                key={item.id}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault()
                  onNavigate(item.id)
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${active
                    ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40 shadow-[0_0_15px_rgba(53,234,255,0.2)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-neon-pink text-[#080612] font-black uppercase">
                    {item.badge}
                  </span>
                )}
                {typeof item.count === 'number' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-white/80 font-mono">
                    {item.count}
                  </span>
                )}
              </a>
            )
          })}
        </nav>
      </div>

      {/* Bottom Sidebar User Info & Actions */}
      <div className="p-5 border-t border-white/10 space-y-3">
        {/* User pill */}
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-black/40 border border-white/5 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div className="flex-1 truncate">
            <span className="text-white font-bold block truncate">{ADMIN_USER}</span>
            <span className="text-[10px] text-white/40 block">Gate Supervisor</span>
          </div>
        </div>

        {/* Public site link */}
        <a
          href="/"
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all"
        >
          <span>Public Website</span>
          <ExternalLink size={13} />
        </a>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-300 hover:text-white rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 transition-all cursor-pointer"
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
