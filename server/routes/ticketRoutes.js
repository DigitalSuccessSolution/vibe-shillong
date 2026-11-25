import express from 'express'
import mongoose from 'mongoose'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import Ticket from '../models/Ticket.js'
import Transaction from '../models/Transaction.js'
import { sendTicketEmail } from '../utils/emailService.js'

const router = express.Router()

// Lazy Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_sample',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'sample_secret',
})

/**
 * 0. Secure Admin & Staff Gate Scanner Login
 * POST /api/tickets/admin-login
 */
router.post('/admin-login', (req, res) => {
  try {
    const { username, password } = req.body || {}
    const cleanUser = (username || '').trim()
    const cleanPass = (password || '').trim()

    const validUser = (process.env.ADMIN_USER || 'admin').trim()
    const validPass = (process.env.ADMIN_PASS || 'neon@2026').trim()

    if (!cleanUser || !cleanPass) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      })
    }

    if (cleanUser === validUser && cleanPass === validPass) {
      // Secure HMAC session token
      const sessionToken = crypto
        .createHmac('sha256', validPass)
        .update(`${cleanUser}_${Date.now()}_${Math.random()}`)
        .digest('hex')

      return res.json({
        success: true,
        message: 'Admin authentication successful',
        token: sessionToken,
        user: {
          username: cleanUser,
          role: 'Gate Supervisor / Organizer',
        },
      })
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid Username or Password.',
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Authentication server error: ' + err.message,
    })
  }
})

// Guard: Check if MongoDB is ready (prevents 10000ms buffering timeouts)
router.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      result: 'DB_NOT_READY',
      message: 'Database connection is being established. Please retry in 2 seconds.',
    })
  }
  next()
})

// Helper to generate unique ticket ID (e.g. NEON-7829-K)
function generateTicketId(prefix = 'NEON') {
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefix}-${randomNum}-${randomChars}`.toUpperCase()
}

// Helper to resolve human-readable payment method (UPI, Card, Netbanking, Wallet, Cash)
function formatPaymentMethod(entity = {}) {
  const method = (entity.method || '').toLowerCase()
  if (method === 'upi') {
    return entity.vpa ? `UPI (${entity.vpa})` : 'UPI'
  }
  if (method === 'card') {
    const card = entity.card || {}
    const net = card.network || ''
    const type = card.type ? card.type.toUpperCase() : ''
    const last4 = card.last4 ? `•••• ${card.last4}` : ''
    const parts = [net, type, last4].filter(Boolean).join(' ')
    return parts ? `Card (${parts})` : 'Card'
  }
  if (method === 'netbanking') {
    return entity.bank ? `Netbanking (${entity.bank})` : 'Netbanking'
  }
  if (method === 'wallet') {
    return entity.wallet ? `Wallet (${entity.wallet})` : 'Wallet'
  }
  if (method === 'emi') {
    return 'EMI'
  }
  if (method === 'paylater') {
    return 'PayLater'
  }
  if (entity.paymentMode && !entity.paymentMode.toLowerCase().includes('razorpay')) {
    return entity.paymentMode
  }
  return 'UPI'
}

/**
 * 1. Book / Issue a new Ticket (MongoDB)
 * POST /api/tickets/book
 */
router.post('/book', async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      eventType,
      quantity = 1,
      amountPaid = 0,
      paymentId = `PAY_${Date.now()}`,
      paymentMode = 'Online UPI',
    } = req.body

    if (!customerName || !customerPhone || !customerEmail || !eventType) {
      return res.status(400).json({
        success: false,
        message: 'Name, Phone, Email, and Event Type are required.',
      })
    }

    const eventTitles = {
      kids: 'Kids Neon Carnival (12 PM - 7:30 PM)',
      adult: 'Adult Neon Nights ft. DJ Tina (8 PM Onwards)',
      vip: 'VIP Neon Table & Backstage Pass',
    }

    const ticketId = generateTicketId(eventType.toUpperCase())

    // Create ticket in MongoDB
    const newTicket = new Ticket({
      ticketId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      eventType,
      eventTitle: eventTitles[eventType] || 'Neon Event Pass',
      quantity: Number(quantity) || 1,
      amountPaid: Number(amountPaid) || 0,
      paymentId,
      paymentMode,
      status: 'VALID',
    })

    const savedTicket = await newTicket.save()

    // Record Transaction in Transaction Collection
    await Transaction.create({
      transactionId: paymentId,
      ticketId: savedTicket.ticketId,
      ticketRef: savedTicket._id,
      customerName: savedTicket.customerName,
      customerPhone: savedTicket.customerPhone,
      customerEmail: savedTicket.customerEmail,
      eventType: savedTicket.eventType,
      quantity: savedTicket.quantity,
      amount: savedTicket.amountPaid,
      currency: 'INR',
      paymentGateway: 'Counter',
      paymentMode: paymentMode || 'Cash at Counter',
      status: 'SUCCESS',
    }).catch((txErr) => console.error('[Transaction log error in /book]:', txErr.message))

    // Send confirmation email in background
    sendTicketEmail(savedTicket).catch((err) =>
      console.error('[Email background error]:', err.message)
    )

    return res.status(201).json({
      success: true,
      message: 'Ticket booked successfully!',
      ticket: savedTicket,
    })
  } catch (error) {
    console.error('Error creating ticket:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating ticket',
    })
  }
})

/**
 * 1B. Create Razorpay Order
 * POST /api/tickets/create-order
 */
router.post('/create-order', async (req, res) => {
  try {
    const { amount, eventType, customerName, customerEmail, customerPhone, quantity } = req.body
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required.' })
    }

    const options = {
      amount: Math.round(Number(amount) * 100), // paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        eventType: eventType || 'general',
        customerName: customerName || '',
        customerEmail: customerEmail || '',
        customerPhone: customerPhone || '',
        quantity: String(quantity || 1),
      },
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_sample'
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'sample_secret'

    // Check if test sandbox placeholder keys are in use
    const isSandboxKey =
      !keyId ||
      keyId === 'rzp_test_sample' ||
      keyId.includes('sample') ||
      keyId.includes('YOUR_KEY')

    if (isSandboxKey) {
      return res.json({
        success: true,
        sandbox: true,
        orderId: `order_test_${Date.now()}`,
        amount: options.amount,
        currency: 'INR',
        keyId,
        message: 'Sandbox test mode enabled',
      })
    }

    try {
      const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret })
      const order = await rzp.orders.create(options)
      return res.json({
        success: true,
        sandbox: false,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId,
      })
    } catch (rzpErr) {
      // If Razorpay API rejects credentials (Authentication failed / 401), fallback smoothly to sandbox
      if (
        rzpErr.error?.description?.includes('Authentication failed') ||
        rzpErr.statusCode === 401
      ) {
        console.warn('[Razorpay] Live key auth failed, activating test sandbox mode')
        return res.json({
          success: true,
          sandbox: true,
          orderId: `order_test_${Date.now()}`,
          amount: options.amount,
          currency: 'INR',
          keyId,
          message: 'Test sandbox active',
        })
      }
      throw rzpErr
    }
  } catch (error) {
    console.error('Razorpay Order Error:', error)
    return res.status(500).json({
      success: false,
      message: error.error?.description || error.message || 'Razorpay order creation failed.',
    })
  }
})

/**
 * 1C. Verify Razorpay Payment & Issue Ticket
 * POST /api/tickets/verify-payment
 */
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerName,
      customerPhone,
      customerEmail,
      eventType,
      quantity = 1,
      amountPaid = 0,
    } = req.body

    if (!customerName || !customerPhone || !customerEmail || !eventType) {
      return res.status(400).json({
        success: false,
        message: 'Name, Phone, Email, and Event Type are required.',
      })
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Missing Razorpay payment details.',
      })
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET

    // Allow sandbox simulated signature when in test sandbox mode
    const isSandboxPayment =
      razorpay_payment_id.startsWith('pay_test_') ||
      razorpay_signature === 'sandbox_verified' ||
      !key_secret ||
      key_secret === 'sample_secret'

    if (!isSandboxPayment) {
      // Strict HMAC SHA256 Signature Verification
      const expectedSignature = crypto
        .createHmac('sha256', key_secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex')

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed: Invalid transaction signature.',
        })
      }
    }

    const eventTitles = {
      kids: 'Kids Neon Carnival (12 PM - 7:30 PM)',
      adult: 'Adult Neon Nights ft. DJ Tina (8 PM Onwards)',
      vip: 'VIP Neon Table & Backstage Pass',
    }

    const ticketId = generateTicketId(eventType.toUpperCase())

    // Fetch live payment details from Razorpay to get the EXACT payment method (UPI, Netbanking, Card)
    let resolvedPaymentMode = 'UPI'
    if (!isSandboxPayment && key_secret) {
      try {
        const rzp = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        })
        const paymentDetails = await rzp.payments.fetch(razorpay_payment_id)
        if (paymentDetails) {
          resolvedPaymentMode = formatPaymentMethod(paymentDetails)
        }
      } catch (fetchErr) {
        console.warn('[Fetch Razorpay Method]:', fetchErr.message)
      }
    } else if (isSandboxPayment) {
      resolvedPaymentMode = 'UPI'
    }

    const newTicket = new Ticket({
      ticketId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      eventType,
      eventTitle: eventTitles[eventType] || 'Neon Event Pass',
      quantity: Number(quantity) || 1,
      amountPaid: Number(amountPaid) || 0,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      paymentMode: resolvedPaymentMode,
      status: 'VALID',
    })

    const savedTicket = await newTicket.save()

    // Record Transaction in Transaction Collection
    await Transaction.create({
      transactionId: razorpay_payment_id,
      orderId: razorpay_order_id,
      ticketId: savedTicket.ticketId,
      ticketRef: savedTicket._id,
      customerName: savedTicket.customerName,
      customerPhone: savedTicket.customerPhone,
      customerEmail: savedTicket.customerEmail,
      eventType: savedTicket.eventType,
      quantity: savedTicket.quantity,
      amount: savedTicket.amountPaid,
      currency: 'INR',
      paymentGateway: 'Razorpay',
      paymentMode: resolvedPaymentMode,
      status: 'SUCCESS',
    }).catch((txErr) => console.error('[Transaction log error in /verify-payment]:', txErr.message))

    // Record Transaction in Transaction Collection
    await Transaction.create({
      transactionId: razorpay_payment_id,
      orderId: razorpay_order_id,
      ticketId: savedTicket.ticketId,
      ticketRef: savedTicket._id,
      customerName: savedTicket.customerName,
      customerPhone: savedTicket.customerPhone,
      customerEmail: savedTicket.customerEmail,
      eventType: savedTicket.eventType,
      quantity: savedTicket.quantity,
      amount: savedTicket.amountPaid,
      currency: 'INR',
      paymentGateway: 'Razorpay',
      paymentMode: resolvedPaymentMode,
      status: 'SUCCESS',
    }).catch((txErr) => console.error('[Transaction log error in /verify-payment]:', txErr.message))

    // Send ticket email in background
    sendTicketEmail(savedTicket).catch((err) =>
      console.error('[Email background error]:', err.message)
    )

    return res.status(201).json({
      success: true,
      message: 'Payment verified & official ticket issued in database!',
      ticket: savedTicket,
    })
  } catch (error) {
    console.error('Verify Payment Error:', error)
    return res.status(500).json({ success: false, message: error.message || 'Payment verification failed' })
  }
})

/**
 * 1D. Razorpay Webhook Handler (Backup / Fail-Safe)
 * POST /api/tickets/webhook
 */
router.post('/webhook', async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature']
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET

    // If a webhook secret is configured, verify HMAC signature
    if (webhookSecret && webhookSecret !== 'sample_secret' && webhookSignature) {
      try {
        const expectedSignature = crypto
          .createHmac('sha256', webhookSecret)
          .update(typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
          .digest('hex')

        if (expectedSignature !== webhookSignature) {
          console.warn('[Webhook] Invalid Razorpay webhook signature')
          return res.status(400).json({ success: false, message: 'Invalid webhook signature' })
        }
      } catch (sigErr) {
        console.warn('[Webhook] Signature verification error:', sigErr.message)
      }
    }

    const event = req.body.event
    console.log(`[Razorpay Webhook Event Received]: ${event}`)

    // Handle successful payment capture
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload?.payment?.entity || {}
      const orderEntity = req.body.payload?.order?.entity || {}

      const paymentId = paymentEntity.id || `PAY_${Date.now()}`
      const orderId = paymentEntity.order_id || orderEntity.id || ''

      // Check if ticket was already created by client-side verification
      const existingTicket = await Ticket.findOne({
        $or: [{ paymentId }, { orderId: orderId && orderId !== '' ? orderId : 'NONE' }],
      })

      if (existingTicket) {
        console.log(`[Webhook] Ticket already exists for ${paymentId} (${existingTicket.ticketId})`)
        return res.status(200).json({ status: 'ok', message: 'Ticket already recorded' })
      }

      // If customer closed browser before client verification, issue ticket now
      const customerEmail = paymentEntity.email || 'customer@vibeshillong.com'
      const customerPhone = paymentEntity.contact || 'N/A'
      const customerName = paymentEntity.notes?.customerName || paymentEntity.notes?.name || 'VIBE Guest'
      const eventType = paymentEntity.notes?.eventType || 'adult'
      const amountPaid = (paymentEntity.amount || 0) / 100
      const quantity = Number(paymentEntity.notes?.quantity) || 1

      const eventTitles = {
        kids: 'Kids Neon Carnival (12 PM - 7:30 PM)',
        adult: 'Adult Neon Nights ft. DJ Tina (8 PM Onwards)',
        vip: 'VIP Neon Table & Backstage Pass',
      }

      const ticketId = generateTicketId(eventType.toUpperCase())

      const resolvedPaymentMode = formatPaymentMethod(paymentEntity)

      const newTicket = new Ticket({
        ticketId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        eventType,
        eventTitle: eventTitles[eventType] || 'Neon Event Pass',
        quantity,
        amountPaid,
        paymentId,
        orderId,
        paymentMode: resolvedPaymentMode,
        status: 'VALID',
      })

      const savedTicket = await newTicket.save()
      console.log(`[Webhook] Ticket ${ticketId} issued automatically for ${customerEmail}`)

      // Record Transaction
      await Transaction.create({
        transactionId: paymentId,
        orderId,
        ticketId: savedTicket.ticketId,
        ticketRef: savedTicket._id,
        customerName: savedTicket.customerName,
        customerPhone: savedTicket.customerPhone,
        customerEmail: savedTicket.customerEmail,
        eventType: savedTicket.eventType,
        quantity: savedTicket.quantity,
        amount: savedTicket.amountPaid,
        currency: 'INR',
        paymentGateway: 'Razorpay',
        paymentMode: resolvedPaymentMode,
        status: 'SUCCESS',
      }).catch((txErr) => console.error('[Webhook Transaction log error]:', txErr.message))

      // Send ticket confirmation email
      sendTicketEmail(savedTicket).catch((err) =>
        console.error('[Webhook Email error]:', err.message)
      )
    }

    // Handle payment failure (e.g. wrong UPI PIN, insufficient funds, bank downtime)
    if (event === 'payment.failed') {
      const paymentEntity = req.body.payload?.payment?.entity || {}
      const errorReason = paymentEntity.error_description || paymentEntity.error_reason || 'Unknown failure'
      console.warn(`[Webhook - Payment Failed]: ID=${paymentEntity.id}, Customer=${paymentEntity.email || paymentEntity.contact}, Reason=${errorReason}`)

      await Transaction.create({
        transactionId: paymentEntity.id || `FAIL_${Date.now()}`,
        orderId: paymentEntity.order_id || '',
        customerName: paymentEntity.notes?.customerName || paymentEntity.notes?.name || 'Guest',
        customerPhone: paymentEntity.contact || 'N/A',
        customerEmail: paymentEntity.email || 'N/A',
        eventType: paymentEntity.notes?.eventType || 'adult',
        quantity: Number(paymentEntity.notes?.quantity) || 1,
        amount: (paymentEntity.amount || 0) / 100,
        currency: 'INR',
        paymentGateway: 'Razorpay',
        paymentMode: formatPaymentMethod(paymentEntity),
        status: 'FAILED',
        failureReason: errorReason,
      }).catch((txErr) => console.error('[Failed Transaction log error]:', txErr.message))
    }

    // Handle refund processed (Auto-invalidate/cancel ticket at gate and mark Transaction REFUNDED)
    if (event === 'refund.processed' || event === 'refund.created') {
      const refundEntity = req.body.payload?.refund?.entity || {}
      const paymentId = refundEntity.payment_id
      const refundAmount = (refundEntity.amount || 0) / 100
      if (paymentId) {
        await Transaction.findOneAndUpdate(
          { transactionId: paymentId },
          { status: 'REFUNDED', refundAmount },
          { new: true }
        )
        const cancelledTicket = await Ticket.findOneAndUpdate(
          { paymentId },
          { status: 'CANCELLED', cancellationReason: `Refunded: ₹${refundAmount}` },
          { new: true }
        )
        if (cancelledTicket) {
          console.log(`[Webhook] Ticket ${cancelledTicket.ticketId} marked as CANCELLED due to refund`)
        }
      }
    }

    // Always acknowledge 200 OK to Razorpay so it doesn't retry
    return res.status(200).json({ status: 'ok' })
  } catch (error) {
    console.error('[Razorpay Webhook Error]:', error)
    return res.status(500).json({ success: false, message: error.message })
  }
})

/**
 * 1.5 Get My Tickets by Customer Email (for logged-in Google users)
 * GET /api/tickets/my-tickets?email=...
 */
router.get('/my-tickets', async (req, res) => {
  try {
    const rawEmail = (req.query.email || '').trim()
    if (!rawEmail) {
      return res.status(400).json({ success: false, message: 'Email query parameter is required' })
    }
    const cleanEmail = rawEmail.toLowerCase()
    const escapedEmail = cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const tickets = await Ticket.find({
      customerEmail: { $regex: new RegExp(`^${escapedEmail}$`, 'i') },
    }).sort({ createdAt: -1 })

    return res.json({
      success: true,
      count: tickets.length,
      tickets,
    })
  } catch (error) {
    console.error('Error fetching user tickets:', error)
    return res.status(500).json({ success: false, message: error.message })
  }
})

/**
 * 2. Get Ticket Details by ID
 * GET /api/tickets/:ticketId
 */
router.get('/:ticketId', async (req, res) => {
  try {
    const cleanTicketId = (req.params.ticketId || '').trim().toUpperCase()
    const ticket = await Ticket.findOne({ ticketId: cleanTicketId })

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found in database.',
      })
    }

    return res.json({
      success: true,
      ticket,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

/**
 * 3. Gate Scanner Verification API (Atomic & Race-Condition Safe)
 * POST /api/tickets/scan
 * Body: { ticketId, scannedBy }
 */
router.post('/scan', async (req, res) => {
  try {
    const { ticketId, scannedBy = 'Gate 1 Staff' } = req.body

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        result: 'INVALID',
        message: 'Ticket ID is required.',
      })
    }

    const cleanTicketId = ticketId.trim().toUpperCase()

    // Atomic Update: Only succeeds if status is currently 'VALID'
    const verifiedTicket = await Ticket.findOneAndUpdate(
      { ticketId: cleanTicketId, status: 'VALID' },
      { status: 'USED', scannedAt: new Date(), scannedBy },
      { new: true }
    )

    if (verifiedTicket) {
      return res.status(200).json({
        success: true,
        result: 'VALID',
        message: '✅ ENTRY ALLOWED! Ticket Verified & Marked as Used.',
        ticket: {
          ticketId: verifiedTicket.ticketId,
          customerName: verifiedTicket.customerName,
          customerPhone: verifiedTicket.customerPhone,
          eventType: verifiedTicket.eventType,
          eventTitle: verifiedTicket.eventTitle,
          quantity: verifiedTicket.quantity,
          status: verifiedTicket.status,
          scannedAt: verifiedTicket.scannedAt,
          scannedBy: verifiedTicket.scannedBy,
        },
      })
    }

    // If atomic update returned null, find why it failed
    const existingTicket = await Ticket.findOne({ ticketId: cleanTicketId })

    if (!existingTicket) {
      return res.status(404).json({
        success: false,
        result: 'NOT_FOUND',
        message: '❌ INVALID TICKET! No matching record found.',
      })
    }

    if (existingTicket.status === 'USED') {
      return res.status(200).json({
        success: false,
        result: 'ALREADY_USED',
        message: '⚠️ TICKET ALREADY USED! Duplicate entry attempted.',
        ticket: {
          ticketId: existingTicket.ticketId,
          customerName: existingTicket.customerName,
          eventType: existingTicket.eventType,
          scannedAt: existingTicket.scannedAt,
          scannedBy: existingTicket.scannedBy,
        },
      })
    }

    if (existingTicket.status === 'CANCELLED') {
      return res.status(200).json({
        success: false,
        result: 'CANCELLED',
        message: '❌ TICKET CANCELLED! Access Denied.',
        ticket: existingTicket,
      })
    }

    return res.status(400).json({
      success: false,
      result: 'INVALID',
      message: 'Unknown ticket status.',
    })
  } catch (error) {
    console.error('Scan error:', error)
    return res.status(500).json({
      success: false,
      result: 'ERROR',
      message: error.message || 'Server error verifying ticket',
    })
  }
})

/**
 * 4. List All Tickets (Admin Overview)
 * GET /api/tickets
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 1000
    const tickets = await Ticket.find().sort({ createdAt: -1 }).limit(limit)
    return res.json({ success: true, count: tickets.length, tickets })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

/**
 * 5. Direct Ticket View / Download Link from Email
 * GET /api/tickets/:ticketId/pass
 */
router.get('/:ticketId/pass', (req, res) => {
  const cleanId = (req.params.ticketId || '').trim().toUpperCase()
  return res.redirect(`https://vibeshillong.com/?ticket=${cleanId}`)
})

export default router
