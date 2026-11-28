import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { API_BASE_URL } from '../../config/api'

// Helper to automatically generate clean, short, unique slug from Pass Title
function generateShortKey(title = '', existingPackages = []) {
  if (!title || !title.trim()) return ''
  const stopWords = new Set([
    'with', 'and', 'the', 'for', 'at', 'by', 'in', 'on', 'of', 'to',
    'pass', 'passes', 'ticket', 'tickets', 'package', 'packages', 'entry', 'neon', 'special'
  ])

  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w && !stopWords.has(w))

  let baseKey = ''
  if (words.length >= 2) {
    baseKey = `${words[0].slice(0, 5)}_${words[1].slice(0, 5)}`
  } else if (words.length === 1) {
    baseKey = words[0].slice(0, 8)
  } else {
    baseKey = title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6) || 'pass'
  }

  // Ensure uniqueness across existing packages ("same nahi ho")
  const existingKeys = new Set(existingPackages.map((p) => (p.key || '').toLowerCase().trim()))
  let finalKey = baseKey
  let attempt = 0

  while (existingKeys.has(finalKey.toLowerCase())) {
    attempt++
    const suffix = Math.random().toString(36).substring(2, 4)
    finalKey = `${baseKey}_${suffix}`
    if (attempt > 10) break
  }

  return finalKey
}

export default function PackagesPage() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [saveMessage, setSaveMessage] = useState('')

  // Edit Modal State
  const [editingPkg, setEditingPkg] = useState(null)
  const [editFeatureInput, setEditFeatureInput] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Add New Package Modal State
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newPkg, setNewPkg] = useState({
    key: '',
    title: '',
    price: '',
    badge: '',
    timing: '',
    subtitle: '',
    color: 'cyan',
    features: [],
    popular: false,
  })
  const [newFeatureInput, setNewFeatureInput] = useState('')

  const fetchPackages = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/packages`)
      const data = await res.json()
      if (data.success && Array.isArray(data.packages)) {
        setPackages(data.packages)
      }
    } catch (err) {
      console.error('Error fetching packages:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  // Quick Sold Out / Active toggle right on card
  const handleToggleSoldOut = async (pkg) => {
    const updatedSoldOut = !pkg.soldOut
    setPackages((prev) =>
      prev.map((p) => (p.key === pkg.key ? { ...p, soldOut: updatedSoldOut } : p))
    )

    try {
      await fetch(`${API_BASE_URL}/api/packages/${pkg.key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soldOut: updatedSoldOut }),
      })
      setSaveMessage(`Status updated for "${pkg.title}" (${updatedSoldOut ? 'Sold Out' : 'Active'})`)
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (err) {
      alert('Error updating status: ' + err.message)
      fetchPackages()
    }
  }

  // Open Edit Modal for a package
  const handleOpenEdit = (pkg) => {
    setEditingPkg({
      ...pkg,
      badge: pkg.badge || '',
      color: (pkg.color || 'cyan').toLowerCase(),
      popular: Boolean(pkg.popular),
      features: Array.isArray(pkg.features) ? [...pkg.features] : [],
    })
    setEditFeatureInput('')
  }

  // Save changes from Edit Modal
  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editingPkg) return

    setIsSavingEdit(true)
    const sanitizedPrice = Math.max(0, Number(editingPkg.price) || 0)

    try {
      const res = await fetch(`${API_BASE_URL}/api/packages/${editingPkg.key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: sanitizedPrice,
          title: editingPkg.title,
          badge: editingPkg.badge || '',
          timing: editingPkg.timing || '',
          subtitle: editingPkg.subtitle || '',
          color: (editingPkg.color || 'cyan').toLowerCase(),
          features: editingPkg.features,
          popular: Boolean(editingPkg.popular),
          soldOut: Boolean(editingPkg.soldOut),
        }),
      })
      const data = await res.json()
      if (data.success && data.package) {
        setPackages((prev) =>
          prev.map((p) => (p.key === editingPkg.key ? data.package : p))
        )
        setSaveMessage(`✅ "${data.package.title}" updated successfully!`)
        setTimeout(() => setSaveMessage(''), 4000)
        setEditingPkg(null)
      } else {
        alert(data.message || 'Error updating package')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setIsSavingEdit(false)
    }
  }

  // Delete package
  const handleDelete = async (pkg) => {
    if (!window.confirm(`Are you sure you want to delete "${pkg.title}"?`)) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/packages/${pkg.key}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setPackages((prev) => prev.filter((p) => p.key !== pkg.key))
        setSaveMessage(`🗑️ Package "${pkg.title}" deleted.`)
        setTimeout(() => setSaveMessage(''), 4000)
      }
    } catch (err) {
      alert('Error deleting package: ' + err.message)
    }
  }

  // Create brand-new package
  const handleCreateNewPackage = async (e) => {
    e.preventDefault()
    if (!newPkg.key || !newPkg.title || newPkg.price === '') {
      alert('Please enter Key, Title and Price.')
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPkg,
          price: Math.max(0, Number(newPkg.price) || 0),
        }),
      })
      const data = await res.json()
      if (data.success && data.package) {
        setPackages((prev) => [...prev, data.package])
        setIsAddingNew(false)
        setSaveMessage(`🎉 New package "${data.package.title}" created successfully!`)
        setTimeout(() => setSaveMessage(''), 4000)
        setNewPkg({
          key: '',
          title: '',
          price: '',
          badge: 'Special Pass',
          timing: '8:00 PM Onwards',
          subtitle: 'Official festival entry pass',
          color: 'pink',
          features: ['Stage access', 'Welcome drink token'],
          popular: false,
        })
      } else {
        alert(data.message || 'Error creating package')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-white/50 text-sm">
        Loading ticket packages...
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-white/5">
        <p className="text-xs text-white/60">
          Showing <span className="text-white font-bold">{packages.length} festival packages</span>. Click <strong>Edit Package</strong> to update price or perks.
        </p>

        <button
          type="button"
          onClick={() => {
            setNewPkg({
              key: '',
              title: '',
              price: '',
              badge: 'Special Pass',
              timing: '8:00 PM Onwards',
              subtitle: 'Official festival entry pass',
              color: 'pink',
              features: ['Stage access', 'Welcome drink token'],
              popular: false,
            })
            setIsAddingNew(true)
          }}
          className="px-4 py-2 rounded-xl bg-neon-pink text-[#080612] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer"
        >
          + Add New Package
        </button>
      </div>

      {saveMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-in fade-in">
          {saveMessage}
        </div>
      )}

      {/* POPUP MODAL: Edit Package */}
      {editingPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto no-scrollbar">
          <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[#0d081b] border border-white/15 rounded-2xl p-6 sm:p-7 text-white my-auto no-scrollbar">
            {/* Header: Simple & Icon-free */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div>
                <h3 className="font-bold font-space text-lg text-white">
                  Edit Package
                </h3>
                <p className="text-xs text-white/50 mt-0.5">{editingPkg.title}</p>
              </div>

              <button
                type="button"
                onClick={() => setEditingPkg(null)}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white grid place-items-center transition-colors cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Form: Clean, Flat, No Nested Card Divs */}
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Title & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-white/70 font-semibold block mb-1">
                    Pass Title
                  </label>
                  <input
                    required
                    type="text"
                    value={editingPkg.title}
                    onChange={(e) => setEditingPkg({ ...editingPkg, title: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-3.5 py-2.5 text-white font-medium text-sm focus:outline-none focus:border-neon-cyan"
                  />
                </div>

                <div>
                  <label className="text-white/70 font-semibold block mb-1">
                    Price (₹ INR)
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={editingPkg.price}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value))
                      setEditingPkg({ ...editingPkg, price: val })
                    }}
                    className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-3.5 py-2.5 text-emerald-400 font-bold text-sm font-space focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Timing & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-white/70 font-semibold block mb-1">
                    Timing & Restrictions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8:00 PM Onwards • Strictly 18+"
                    value={editingPkg.timing || ''}
                    onChange={(e) => setEditingPkg({ ...editingPkg, timing: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-3.5 py-2.5 text-white/90 text-sm focus:outline-none focus:border-neon-cyan"
                  />
                </div>

                <div>
                  <label className="text-white/70 font-semibold block mb-1">
                    Subtitle / Summary
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Single adult pass • Includes DJ set"
                    value={editingPkg.subtitle || ''}
                    onChange={(e) => setEditingPkg({ ...editingPkg, subtitle: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-3.5 py-2.5 text-white/90 text-sm focus:outline-none focus:border-neon-cyan"
                  />
                </div>
              </div>

              {/* Badge & Color Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-white/70 font-semibold block mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Most Popular"
                    value={editingPkg.badge || ''}
                    onChange={(e) => setEditingPkg({ ...editingPkg, badge: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-neon-cyan"
                  />
                </div>

                <div>
                  <label className="text-white/70 font-semibold block mb-1">
                    Theme Color
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'cyan', label: 'Cyan', border: 'border-neon-cyan', bg: 'bg-neon-cyan/20 text-neon-cyan' },
                      { id: 'pink', label: 'Pink', border: 'border-neon-pink', bg: 'bg-neon-pink/20 text-neon-pink' },
                      { id: 'lime', label: 'Lime', border: 'border-neon-lime', bg: 'bg-neon-lime/20 text-neon-lime' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setEditingPkg({ ...editingPkg, color: c.id })}
                        className={`py-2 rounded-xl text-center font-bold text-xs border transition-all cursor-pointer ${
                          (editingPkg.color || 'cyan').toLowerCase() === c.id ? `${c.border} ${c.bg}` : 'border-white/10 bg-white/[0.02] text-white/50 hover:text-white'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Inclusions List */}
              <div className="space-y-2 pt-1">
                <label className="text-white/70 font-semibold block">
                  Included Perks ({editingPkg.features?.length || 0})
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a perk and press Add..."
                    value={editFeatureInput}
                    onChange={(e) => setEditFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (editFeatureInput.trim()) {
                          setEditingPkg({
                            ...editingPkg,
                            features: [...editingPkg.features, editFeatureInput.trim()],
                          })
                          setEditFeatureInput('')
                        }
                      }
                    }}
                    className="flex-1 bg-white/[0.04] border border-white/15 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-neon-cyan"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (editFeatureInput.trim()) {
                        setEditingPkg({
                          ...editingPkg,
                          features: [...editingPkg.features, editFeatureInput.trim()],
                        })
                        setEditFeatureInput('')
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 no-scrollbar pt-1">
                  {editingPkg.features?.map((feat, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/10">
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => {
                          const nextFeats = [...editingPkg.features]
                          nextFeats[i] = e.target.value
                          setEditingPkg({ ...editingPkg, features: nextFeats })
                        }}
                        className="flex-1 bg-transparent text-xs text-white/90 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPkg({
                            ...editingPkg,
                            features: editingPkg.features.filter((_, idx) => idx !== i),
                          })
                        }}
                        className="text-white/40 hover:text-red-400 text-xs px-1 cursor-pointer"
                        title="Remove perk"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingPkg(null)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-1 py-3 rounded-xl bg-neon-cyan text-[#071016] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer"
                >
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Add New Package */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto no-scrollbar">
          <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[#0d081b] border border-white/15 rounded-2xl p-6 sm:p-7 text-white my-auto no-scrollbar">
            {/* Header: Simple & Icon-free */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div>
                <h3 className="font-bold font-space text-lg text-white">
                  Add New Package
                </h3>
                <p className="text-xs text-white/50 mt-0.5">Publish a new ticket tier for the event</p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white grid place-items-center transition-colors cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Form: Clean, Flat, No Nested Card Divs */}
            <form onSubmit={handleCreateNewPackage} className="space-y-4 text-xs">
              <div>
                <label className="text-white/70 font-semibold block mb-1">
                  Pass Title *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Girls Platinum Pass, Couple Night Pass"
                  value={newPkg.title}
                  onChange={(e) => {
                    const title = e.target.value
                    const autoKey = generateShortKey(title, packages)
                    setNewPkg((prev) => ({
                      ...prev,
                      title,
                      key: autoKey,
                    }))
                  }}
                  className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-3.5 py-2.5 text-white font-medium text-sm focus:outline-none focus:border-neon-pink"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-white/70 font-semibold block mb-1">
                    Unique Key (Slug)
                  </label>
                  <input
                    readOnly
                    type="text"
                    tabIndex={-1}
                    placeholder="Auto-generated from title..."
                    value={newPkg.key}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-3.5 py-2.5 text-neon-cyan font-mono text-sm cursor-not-allowed select-none focus:outline-none"
                  />
                  <span className="text-[10px] text-white/40 block mt-1">
                    {newPkg.key ? `🔒 Auto short & unique ID: "${newPkg.key}"` : '🔒 Auto-generated from title (Read-only)'}
                  </span>
                </div>

                <div>
                  <label className="text-white/70 font-semibold block mb-1">
                    Price (₹ INR) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="e.g. 2499"
                    value={newPkg.price}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value))
                      setNewPkg({ ...newPkg, price: val })
                    }}
                    className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-3.5 py-2.5 text-emerald-400 font-bold text-sm font-space focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-white/70 font-semibold block mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Limited Edition"
                    value={newPkg.badge}
                    onChange={(e) => setNewPkg({ ...newPkg, badge: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-neon-pink"
                  />
                </div>

                <div>
                  <label className="text-white/70 font-semibold block mb-1">
                    Theme Color
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'cyan', label: 'Cyan', border: 'border-neon-cyan', bg: 'bg-neon-cyan/20 text-neon-cyan' },
                      { id: 'pink', label: 'Pink', border: 'border-neon-pink', bg: 'bg-neon-pink/20 text-neon-pink' },
                      { id: 'lime', label: 'Lime', border: 'border-neon-lime', bg: 'bg-neon-lime/20 text-neon-lime' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setNewPkg({ ...newPkg, color: c.id })}
                        className={`py-2 rounded-xl text-center font-bold text-xs border transition-all cursor-pointer ${
                          newPkg.color === c.id ? `${c.border} ${c.bg}` : 'border-white/10 bg-white/[0.02] text-white/50 hover:text-white'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-white/70 font-semibold block mb-1">
                    Timing & Restrictions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8:00 PM Onwards • Strictly 18+"
                    value={newPkg.timing}
                    onChange={(e) => setNewPkg({ ...newPkg, timing: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-neon-pink"
                  />
                </div>

                <div>
                  <label className="text-white/70 font-semibold block mb-1">
                    Subtitle / Summary
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Entry for 2 Adults + 2 Welcome Drinks"
                    value={newPkg.subtitle}
                    onChange={(e) => setNewPkg({ ...newPkg, subtitle: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-neon-pink"
                  />
                </div>
              </div>

              {/* Inclusions */}
              <div className="space-y-2 pt-1">
                <label className="text-white/70 font-semibold block">
                  Included Perks
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a perk and press Add..."
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (newFeatureInput.trim()) {
                          setNewPkg({ ...newPkg, features: [...newPkg.features, newFeatureInput.trim()] })
                          setNewFeatureInput('')
                        }
                      }
                    }}
                    className="flex-1 bg-white/[0.04] border border-white/15 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-neon-pink"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newFeatureInput.trim()) {
                        setNewPkg({ ...newPkg, features: [...newPkg.features, newFeatureInput.trim()] })
                        setNewFeatureInput('')
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 no-scrollbar pt-1">
                  {newPkg.features.map((feat, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/10">
                      <span className="text-white/90 text-xs">{feat}</span>
                      <button
                        type="button"
                        onClick={() => setNewPkg({ ...newPkg, features: newPkg.features.filter((_, idx) => idx !== i) })}
                        className="text-white/40 hover:text-red-400 text-xs px-1 cursor-pointer"
                        title="Remove perk"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-neon-pink text-[#080612] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer"
                >
                  Publish Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clean Display Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const color = (pkg.color || 'cyan').toLowerCase()
          const borderColor =
            color === 'pink'
              ? 'border-neon-pink/40 hover:border-neon-pink/70'
              : color === 'lime'
              ? 'border-neon-lime/40 hover:border-neon-lime/70'
              : 'border-neon-cyan/40 hover:border-neon-cyan/70'

          const badgeColor =
            color === 'pink'
              ? 'bg-neon-pink/20 text-neon-pink border-neon-pink/40'
              : color === 'lime'
              ? 'bg-neon-lime/20 text-neon-lime border-neon-lime/40'
              : 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/40'

          return (
            <div
              key={pkg.key}
              className={`rounded-2xl p-6 bg-[#0e071d] border-2 ${borderColor} transition-all duration-200 flex flex-col justify-between`}
            >
              <div className="space-y-4">
                {/* Header Tag, Sold Out Toggle & Delete */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${badgeColor}`}>
                    {pkg.badge || pkg.key.toUpperCase()}
                  </span>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={pkg.soldOut || false}
                        onChange={() => handleToggleSoldOut(pkg)}
                        className="rounded accent-neon-pink cursor-pointer"
                      />
                      <span className={pkg.soldOut ? 'text-red-400 font-bold' : 'text-white/50'}>
                        {pkg.soldOut ? 'SOLD OUT' : 'Active'}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleDelete(pkg)}
                      title="Delete package"
                      className="text-white/30 hover:text-red-400 p-1 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Title & Timing Display */}
                <div>
                  <h3 className="text-lg font-bold font-space text-white leading-tight">
                    {pkg.title}
                  </h3>
                  {pkg.timing && (
                    <p className="text-xs text-white/50 mt-1">{pkg.timing}</p>
                  )}
                </div>

                {/* Price Display */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-0.5">Price</span>
                  <span className="text-2xl font-bold font-space text-emerald-400">
                    ₹{Number(pkg.price).toLocaleString('en-IN')}
                  </span>
                </div>

                {pkg.subtitle && (
                  <p className="text-xs text-white/70 italic">{pkg.subtitle}</p>
                )}

                {/* Inclusions List Display */}
                <div>
                  <span className="text-[10px] font-bold uppercase text-white/40 tracking-wider block mb-2">
                    Inclusions ({pkg.features?.length || 0})
                  </span>
                  <ul className="space-y-1.5 text-xs text-white/80">
                    {pkg.features?.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold select-none">•</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Edit Package Button */}
              <button
                type="button"
                onClick={() => handleOpenEdit(pkg)}
                className="w-full mt-6 py-2.5 rounded-xl bg-white/10 hover:bg-neon-cyan hover:text-[#071016] text-white font-bold text-xs uppercase tracking-wider transition-all text-center cursor-pointer border border-white/15"
              >
                Edit Package
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
