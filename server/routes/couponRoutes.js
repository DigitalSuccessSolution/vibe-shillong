import express from 'express'
import mongoose from 'mongoose'
import Coupon from '../models/Coupon.js'
import Ticket from '../models/Ticket.js'

const router = express.Router()

// Guard: Check if MongoDB connection is ready
router.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection is being established. Please retry in a moment.',
    })
  }
  next()
})

/**
 * 1. Validate a Coupon (Customer Facing during Checkout)
 * POST /api/coupons/validate
 * Body: { code, orderAmount, eventType }
 */
router.post('/validate', async (req, res) => {
  try {
    const { code, orderAmount = 0, eventType = 'adult', email = '' } = req.body || {}

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a coupon code.',
      })
    }

    const cleanCode = code.trim().toUpperCase()
    const numericAmount = Math.max(0, Number(orderAmount) || 0)

    const coupon = await Coupon.findOne({ code: cleanCode })

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: `Coupon "${cleanCode}" is invalid.`,
      })
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${cleanCode}" is currently inactive.`,
      })
    }

    // Check expiry date
    if (coupon.validTill && new Date() > new Date(coupon.validTill)) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${cleanCode}" has expired.`,
      })
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${cleanCode}" has reached its maximum usage limit.`,
      })
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && numericAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase of ₹${coupon.minOrderAmount.toLocaleString('en-IN')} required for coupon "${cleanCode}".`,
      })
    }

    // Check applicable event type
    const eventKey = (eventType || 'all').toLowerCase()
    const isEventApplicable =
      coupon.applicableEvents.includes('all') || coupon.applicableEvents.includes(eventKey)

    if (!isEventApplicable) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${cleanCode}" is not applicable for ${eventKey.toUpperCase()} passes.`,
      })
    }

    // Check 1 use per customer email restriction (default true unless explicitly false)
    const isOneUsePerEmail = coupon.oneUsePerEmail !== false
    const cleanEmail = (email || '').trim().toLowerCase()

    if (isOneUsePerEmail && cleanEmail) {
      const priorTicket = await Ticket.findOne({
        customerEmail: cleanEmail,
        couponCode: cleanCode,
      })
      if (priorTicket) {
        return res.status(400).json({
          success: false,
          message: `Coupon "${cleanCode}" has already been used once with this email (${cleanEmail}).`,
        })
      }
    }

    // Calculate Discount
    let discountAmount = 0
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((numericAmount * coupon.discountValue) / 100)
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount
      }
    } else {
      // Flat discount
      discountAmount = Math.min(coupon.discountValue, numericAmount)
    }

    const finalAmount = Math.max(0, numericAmount - discountAmount)

    return res.json({
      success: true,
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
        applicableEvents: coupon.applicableEvents || ['all'],
        minOrderAmount: coupon.minOrderAmount || 0,
        maxDiscount: coupon.maxDiscount || null,
      },
      originalAmount: numericAmount,
      discountAmount,
      finalAmount,
      message:
        coupon.discountType === 'percentage'
          ? `🎉 Coupon "${coupon.code}" applied! ${coupon.discountValue}% discount (-₹${discountAmount.toLocaleString('en-IN')})`
          : `🎉 Coupon "${coupon.code}" applied! Flat ₹${discountAmount.toLocaleString('en-IN')} discount`,
    })
  } catch (error) {
    console.error('[Coupon Validation Error]:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error validating coupon code.',
    })
  }
})

/**
 * 1B. Public Available Coupons (For Website Visitors)
 * GET /api/coupons/public
 */
router.get('/public', async (req, res) => {
  try {
    const now = new Date()
    const coupons = await Coupon.find({
      isActive: true,
      showOnWebsite: true,
      $or: [{ validTill: null }, { validTill: { $gt: now } }],
    }).sort({ createdAt: -1 })

    const available = coupons.filter(
      (c) => !c.usageLimit || c.usedCount < c.usageLimit
    )

    return res.json({
      success: true,
      count: available.length,
      coupons: available,
    })
  } catch (error) {
    console.error('[Public Coupons Error]:', error)
    return res.status(500).json({ success: false, message: error.message })
  }
})

/**
 * 2. List All Coupons (Admin Portal)
 * GET /api/coupons
 */
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 })
    return res.json({
      success: true,
      count: coupons.length,
      coupons,
    })
  } catch (error) {
    console.error('[List Coupons Error]:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching coupons list.',
    })
  }
})

/**
 * 3. Create a New Coupon (Admin Portal)
 * POST /api/coupons
 */
router.post('/', async (req, res) => {
  try {
    const {
      code,
      discountType = 'percentage',
      discountValue,
      maxDiscount = null,
      minOrderAmount = 0,
      usageLimit = null,
      validTill = null,
      applicableEvents = ['all'],
      description = '',
      isActive = true,
      showOnWebsite = false,
      oneUsePerEmail = true,
    } = req.body || {}

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Coupon code is required.' })
    }

    const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '')
    if (cleanCode.length < 2) {
      return res.status(400).json({ success: false, message: 'Coupon code must be at least 2 characters.' })
    }

    if (discountValue === undefined || Number(discountValue) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid discount value is required.' })
    }

    const existing = await Coupon.findOne({ code: cleanCode })
    if (existing) {
      return res.status(400).json({ success: false, message: `Coupon with code "${cleanCode}" already exists.` })
    }

    const newCoupon = new Coupon({
      code: cleanCode,
      discountType: discountType === 'flat' ? 'flat' : 'percentage',
      discountValue: Number(discountValue),
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      validTill: validTill ? new Date(validTill) : null,
      applicableEvents: Array.isArray(applicableEvents) && applicableEvents.length > 0 ? applicableEvents : ['all'],
      description: (description || '').trim(),
      isActive: Boolean(isActive),
      showOnWebsite: Boolean(showOnWebsite),
      oneUsePerEmail: oneUsePerEmail !== undefined ? Boolean(oneUsePerEmail) : true,
    })

    const saved = await newCoupon.save()
    return res.status(201).json({
      success: true,
      message: `Coupon "${saved.code}" created successfully!`,
      coupon: saved,
    })
  } catch (error) {
    console.error('[Create Coupon Error]:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating coupon.',
    })
  }
})

/**
 * 4. Update Coupon (Admin Portal - Toggle active, change limit, etc.)
 * PUT /api/coupons/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const {
      isActive,
      showOnWebsite,
      oneUsePerEmail,
      discountValue,
      discountType,
      maxDiscount,
      minOrderAmount,
      usageLimit,
      validTill,
      applicableEvents,
      description,
    } = req.body || {}

    const updateFields = {}
    if (isActive !== undefined) updateFields.isActive = Boolean(isActive)
    if (showOnWebsite !== undefined) updateFields.showOnWebsite = Boolean(showOnWebsite)
    if (oneUsePerEmail !== undefined) updateFields.oneUsePerEmail = Boolean(oneUsePerEmail)
    if (discountValue !== undefined) updateFields.discountValue = Number(discountValue)
    if (discountType !== undefined) updateFields.discountType = discountType
    if (maxDiscount !== undefined) updateFields.maxDiscount = maxDiscount ? Number(maxDiscount) : null
    if (minOrderAmount !== undefined) updateFields.minOrderAmount = Number(minOrderAmount) || 0
    if (usageLimit !== undefined) updateFields.usageLimit = usageLimit ? Number(usageLimit) : null
    if (validTill !== undefined) updateFields.validTill = validTill ? new Date(validTill) : null
    if (applicableEvents !== undefined) updateFields.applicableEvents = applicableEvents
    if (description !== undefined) updateFields.description = description.trim()

    const updated = await Coupon.findByIdAndUpdate(id, updateFields, { new: true })

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' })
    }

    return res.json({
      success: true,
      message: `Coupon "${updated.code}" updated successfully!`,
      coupon: updated,
    })
  } catch (error) {
    console.error('[Update Coupon Error]:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating coupon.',
    })
  }
})

/**
 * 5. Delete Coupon (Admin Portal)
 * DELETE /api/coupons/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Coupon.findByIdAndDelete(id)

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' })
    }

    return res.json({
      success: true,
      message: `Coupon "${deleted.code}" deleted successfully!`,
    })
  } catch (error) {
    console.error('[Delete Coupon Error]:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting coupon.',
    })
  }
})

export default router
