import express from 'express'
import mongoose from 'mongoose'
import Package from '../models/Package.js'
import { DEFAULT_PACKAGES } from '../constants/packages.js'

const router = express.Router()

// GET /api/packages - List packages (auto-seeds defaults in MongoDB if collection is empty)
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Database connection is being established' })
    }

    let packages = await Package.find().sort({ createdAt: 1 })
    if (!packages || packages.length === 0) {
      packages = await Package.insertMany(DEFAULT_PACKAGES)
    }
    return res.json({ success: true, packages })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

// PUT /api/packages/:key - Update a package
router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params
    const { price, title, badge, timing, subtitle, color, features, popular, soldOut } = req.body

    const sanitizedPrice = price !== undefined ? Math.max(0, Number(price) || 0) : undefined

    const updated = await Package.findOneAndUpdate(
      { key },
      {
        ...(sanitizedPrice !== undefined && { price: sanitizedPrice }),
        ...(title !== undefined && { title }),
        ...(badge !== undefined && { badge }),
        ...(timing !== undefined && { timing }),
        ...(subtitle !== undefined && { subtitle }),
        ...(color !== undefined && { color }),
        ...(Array.isArray(features) && { features }),
        ...(popular !== undefined && { popular: Boolean(popular) }),
        ...(soldOut !== undefined && { soldOut: Boolean(soldOut) }),
      },
      { new: true, upsert: true }
    )

    return res.json({ success: true, package: updated })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

// POST /api/packages - Create a new package
router.post('/', async (req, res) => {
  try {
    const { key, title, price, badge, timing, subtitle, features, color = 'cyan', popular = false } = req.body

    if (!key || !title || price === undefined) {
      return res.status(400).json({ success: false, message: 'Package key, title and price are required.' })
    }

    const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
    const existing = await Package.findOne({ key: cleanKey })
    if (existing) {
      return res.status(400).json({ success: false, message: `Package with key "${cleanKey}" already exists.` })
    }

    const sanitizedPrice = Math.max(0, Number(price) || 0)

    const newPkg = new Package({
      key: cleanKey,
      title: title.trim(),
      price: sanitizedPrice,
      badge: (badge || '').trim(),
      timing: (timing || '').trim(),
      subtitle: (subtitle || '').trim(),
      features: Array.isArray(features) ? features : [],
      color,
      popular: Boolean(popular),
      soldOut: false,
    })

    const saved = await newPkg.save()
    return res.status(201).json({ success: true, package: saved })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

// DELETE /api/packages/:key - Delete a package
router.delete('/:key', async (req, res) => {
  try {
    const { key } = req.params
    await Package.findOneAndDelete({ key })
    return res.json({ success: true, message: `Package "${key}" deleted successfully.` })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

export default router
