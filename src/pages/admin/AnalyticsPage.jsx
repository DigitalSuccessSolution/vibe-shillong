import { useState, useEffect } from 'react'
import { Ticket as TicketIcon, CheckCircle2, Clock, DollarSign } from 'lucide-react'
import { API_BASE_URL } from '../../config/api'

export default function AnalyticsPage({ ticketsList = [] }) {
  const [packages, setPackages] = useState([])

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/packages`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.packages)) {
          setPackages(data.packages)
        }
      })
      .catch((err) => console.error('Error fetching packages for analytics:', err))
  }, [])

  const totalSold = ticketsList.length
  const totalScanned = ticketsList.filter((t) => t.status === 'USED').length
  const totalPending = totalSold - totalScanned
  const totalRevenue = ticketsList.reduce((acc, curr) => acc + (Number(curr.amountPaid) || 0), 0)
  const checkInPercent = totalSold > 0 ? Math.round((totalScanned / totalSold) * 100) : 0

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#0f091f] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between text-white/50 text-[11px] uppercase font-bold mb-1">
            <span>Total Passes</span>
            <TicketIcon size={14} className="text-neon-pink" />
          </div>
          <div className="font-space font-bold text-2xl text-white">{totalSold}</div>
        </div>

        <div className="bg-[#0f091f] border border-emerald-500/30 rounded-2xl p-4">
          <div className="flex items-center justify-between text-emerald-400 text-[11px] uppercase font-bold mb-1">
            <span>Checked-In</span>
            <CheckCircle2 size={14} className="text-emerald-400" />
          </div>
          <div className="font-space font-bold text-2xl text-emerald-300">{totalScanned}</div>
        </div>

        <div className="bg-[#0f091f] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between text-amber-400 text-[11px] uppercase font-bold mb-1">
            <span>Pending Entry</span>
            <Clock size={14} className="text-amber-400" />
          </div>
          <div className="font-space font-bold text-2xl text-amber-300">{totalPending}</div>
        </div>

        <div className="bg-[#0f091f] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between text-neon-cyan text-[11px] uppercase font-bold mb-1">
            <span>Total Value</span>
            <DollarSign size={14} className="text-neon-cyan" />
          </div>
          <div className="font-space font-bold text-2xl text-neon-cyan">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Attendance Ratio Bar */}
      <div className="bg-[#0f091f] border border-white/10 rounded-3xl p-6 sm:p-8">
        <h3 className="font-bold font-space text-xl text-white mb-2">Gate Check-In Progress</h3>
        <p className="text-xs text-white/50 mb-6">Real-time attendance ratio from verified gate scans</p>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span>Admitted Attendees</span>
            <span className="text-emerald-400 font-mono">
              {checkInPercent}% Checked-In ({totalScanned}/{totalSold})
            </span>
          </div>
          <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-neon-cyan to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${checkInPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dynamic Pass Tier Breakdown */}
      <div>
        <h3 className="font-bold font-space text-lg text-white mb-3">Pass Tier Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {packages.map((pkg) => {
            const count = ticketsList.filter((t) => t.eventType === pkg.key).length
            const color = (pkg.color || 'cyan').toLowerCase()
            const borderColor =
              color === 'pink'
                ? 'border-neon-pink/30 text-neon-pink'
                : color === 'lime'
                ? 'border-neon-lime/30 text-neon-lime'
                : 'border-neon-cyan/30 text-neon-cyan'

            return (
              <div
                key={pkg.key}
                className={`bg-[#0f091f] border rounded-2xl p-5 ${borderColor}`}
              >
                <span className="text-[10px] uppercase tracking-wider font-bold block mb-1 opacity-80">
                  {pkg.badge || `${pkg.title} Tier`}
                </span>
                <h4 className="font-space font-bold text-lg text-white truncate">{pkg.title}</h4>
                <div className="flex items-baseline justify-between mt-3">
                  <p className="text-2xl font-bold font-mono text-white">
                    {count} <span className="text-xs font-normal text-white/50 font-sans">Passes</span>
                  </p>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    ₹{(count * Number(pkg.price || 0)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
