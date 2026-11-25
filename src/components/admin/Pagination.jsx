import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className = '',
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)
  const startIndex = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1
  const endIndex = Math.min(totalItems, safePage * pageSize)

  // Generate page numbers array with ellipses
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (safePage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages]
    }

    if (safePage >= totalPages - 3) {
      return [
        1,
        '...',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ]
    }

    return [1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages]
  }

  const pages = getPageNumbers()

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs ${className}`}
    >
      {/* Showing entries info & Page size dropdown */}
      <div className="flex flex-wrap items-center gap-3 text-white/50">
        <span>
          Showing{' '}
          <strong className="text-white font-mono">
            {startIndex}-{endIndex}
          </strong>{' '}
          of <strong className="text-white font-mono">{totalItems}</strong> entries
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-white/10">
            <span className="text-[11px] text-white/50">Rows:</span>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                aria-label="Rows per page"
                className="appearance-none pl-2.5 pr-6 py-1 bg-black/60 border border-white/15 rounded-md text-white text-[11px] font-mono focus:outline-none focus:border-neon-cyan cursor-pointer hover:bg-white/5 transition-all"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#0f091f] text-white">
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5 self-center sm:self-auto">
        {/* Previous Page Single Arrow */}
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage === 1}
          className="p-1.5 rounded-md border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft size={15} />
        </button>

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1 mx-1">
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-2 text-white/30 font-mono text-xs select-none">
                  …
                </span>
              )
            }

            const isActive = p === safePage
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-[28px] h-7 px-2 rounded-md font-mono text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-neon-cyan text-[#071016]'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                }`}
              >
                {p}
              </button>
            )
          })}
        </div>

        {/* Next Page Single Arrow */}
        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage === totalPages}
          className="p-1.5 rounded-md border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
          title="Next Page"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}

