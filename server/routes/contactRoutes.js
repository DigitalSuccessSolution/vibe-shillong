import express from 'express'
import mongoose from 'mongoose'
import Contact from '../models/Contact.js'

const router = express.Router()

// Guard: Check if MongoDB connection is ready
router.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection is being established. Please retry in a few seconds.',
    })
  }
  next()
})

/**
 * POST /api/contact
 * Submit a new Contact / VIP inquiry from website
 */
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body || {}

    if (!name || !phone || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, Phone, Email, and Message are required.',
      })
    }

    const newContact = new Contact({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      subject: (subject || 'General Festival Question').trim(),
      message: message.trim(),
      status: 'NEW',
    })

    const saved = await newContact.save()

    console.log(`[Contact Inquiry]: New inquiry from "${saved.name}" (${saved.phone}) regarding "${saved.subject}"`)

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your inquiry has been saved. Our team will contact you shortly.',
      inquiry: saved,
    })
  } catch (error) {
    console.error('Contact submit error:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error saving inquiry.',
    })
  }
})

/**
 * GET /api/contact
 * List all inquiries (For Admin Panel)
 */
router.get('/', async (req, res) => {
  try {
    const inquiries = await Contact.find().sort({ createdAt: -1 })
    return res.json({
      success: true,
      count: inquiries.length,
      inquiries,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching inquiries.',
    })
  }
})

/**
 * PUT /api/contact/:id
 * Update inquiry status (NEW -> CONTACTED -> RESOLVED)
 */
router.put('/:id', async (req, res) => {
  try {
    const { status, notes } = req.body
    const updated = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
      { new: true }
    )

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Inquiry record not found.' })
    }

    return res.json({ success: true, inquiry: updated })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

/**
 * DELETE /api/contact/:id
 * Delete inquiry
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id)
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Inquiry not found.' })
    }
    return res.json({ success: true, message: 'Inquiry deleted successfully.' })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

export default router
