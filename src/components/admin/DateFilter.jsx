import { Calendar, ChevronDown, X } from 'lucide-react'

/**
 * Reusable Date Filter Helper for checking if an ISO/MongoDB date matches selected filter
 */
export function matchesDateFilter(dateStr, preset, startDate, endDate) {
  if (!preset || preset === 'all') return true
  if (!dateStr) return false

  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return false

  const now = new Date()

  if (preset === 'today') {
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    )
  }

  if (preset === 'yesterday') {
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    return (
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear()
    )
  }

  if (preset === 'last7') {
    const past7 = new Date(now)
    past7.setDate(now.getDate() - 7)
    past7.setHours(0, 0, 0, 0)
    return d >= past7 && d <= now
  }

  if (preset === 'last30') {
    const past30 = new Date(now)
    past30.setDate(now.getDate() - 30)
    past30.setHours(0, 0, 0, 0)
    return d >= past30 && d <= now
  }

  if (preset === 'custom') {
    if (startDate) {
      const s = new Date(startDate)
      s.setHours(0, 0, 0, 0)
      if (d < s) return false
    }
    if (endDate) {
      const e = new Date(endDate)
      e.setHours(23, 59, 59, 999)
      if (d > e) return false
    }
    return true
  }

  return true
}

export default function DateFilter({
  datePreset = 'all',
  setDatePreset,
  startDate = '',
  setStartDate,
  endDate = '',
  setEndDate,
}) {
  const isFiltered = datePreset !== 'all' || startDate || endDate

  const handleClear = () => {
    setDatePreset('all')
    if (setStartDate) setStartDate('')
    if (setEndDate) setEndDate('')
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Date Preset Dropdown */}
      <div className="relative">
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
          <Calendar size={13} className={isFiltered ? 'text-neon-cyan' : ''} />
        </div>
        <select
          value={datePreset}
          onChange={(e) => {
            setDatePreset(e.target.value)
            if (e.target.value !== 'custom') {
              if (setStartDate) setStartDate('')
              if (setEndDate) setEndDate('')
            }
          }}
          className={`h-9 appearance-none pl-8 pr-7 bg-black/60 border rounded-lg text-xs font-semibold focus:outline-none transition-all cursor-pointer ${
            isFiltered
              ? 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/5'
              : 'border-white/15 text-white hover:bg-white/5'
          }`}
        >
          <option value="all" className="bg-[#0f091f] text-white">All Dates</option>
          <option value="today" className="bg-[#0f091f] text-white">Today</option>
          <option value="yesterday" className="bg-[#0f091f] text-white">Yesterday</option>
          <option value="last7" className="bg-[#0f091f] text-white">Last 7 Days</option>
          <option value="last30" className="bg-[#0f091f] text-white">Last 30 Days</option>
          <option value="custom" className="bg-[#0f091f] text-white">Custom Range...</option>
        </select>
        <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
      </div>

      {/* Custom Range Inputs (Shown when 'custom' is selected) */}
      {datePreset === 'custom' && (
        <div className="flex items-center gap-1.5 animate-fadeIn">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-9 px-2 bg-black/60 border border-white/20 rounded-lg text-[11px] text-white [color-scheme:dark] focus:outline-none focus:border-neon-cyan transition-all"
            title="Start Date"
          />
          <span className="text-white/40 text-xs">to</span>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-9 px-2 bg-black/60 border border-white/20 rounded-lg text-[11px] text-white [color-scheme:dark] focus:outline-none focus:border-neon-cyan transition-all"
            title="End Date"
          />
        </div>
      )}

      {/* Clear Filter Button */}
      {isFiltered && (
        <button
          type="button"
          onClick={handleClear}
          className="h-9 px-2.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/60 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 flex items-center gap-1 text-[11px] font-medium transition-all cursor-pointer"
          title="Reset date filter"
        >
          <X size={12} />
          <span>Reset Date</span>
        </button>
      )}
    </div>
  )
}
