import express from 'express'
import mongoose from 'mongoose'
import Razorpay from 'razorpay'
import Transaction from '../models/Transaction.js'
import Ticket from '../models/Ticket.js'

const router = express.Router()

// Guard: Check if MongoDB is ready
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

/**
 * 1. List All Transactions (With automatic legacy ticket sync)
 * GET /api/transactions
 */
router.get('/', async (req, res) => {
  try {
    // Check if any legacy tickets exist without a transaction record
    const tickets = await Ticket.find().lean()
    if (tickets.length > 0) {
      for (const t of tickets) {
        const txId = t.paymentId || `TX_${t.ticketId}`
        const exists = await Transaction.findOne({ transactionId: txId })
        if (!exists) {
          const rawMode = t.paymentMode || 'UPI'
          const cleanMode = rawMode.toLowerCase().includes('razorpay') ? 'UPI' : rawMode

          await Transaction.create({
            transactionId: txId,
            orderId: t.orderId || '',
            ticketId: t.ticketId,
            ticketRef: t._id,
            customerName: t.customerName,
            customerPhone: t.customerPhone,
            customerEmail: t.customerEmail,
            eventType: t.eventType,
            quantity: t.quantity || 1,
            amount: t.amountPaid || 0,
            currency: 'INR',
            paymentGateway: t.paymentMode?.includes('Counter') ? 'Counter' : 'Razorpay',
            paymentMode: cleanMode,
            status: t.status === 'CANCELLED' ? 'REFUNDED' : 'SUCCESS',
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
          })
        }
      }
    }

    const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(200)

    // Calculate Summary Metrics
    const totalTransactions = transactions.length
    const successfulTx = transactions.filter((t) => t.status === 'SUCCESS')
    const totalRevenue = successfulTx.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
    const totalRefunded = transactions
      .filter((t) => t.status === 'REFUNDED')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
    const failedCount = transactions.filter((t) => t.status === 'FAILED').length

    return res.json({
      success: true,
      count: totalTransactions,
      metrics: {
        totalRevenue,
        totalOrders: successfulTx.length,
        totalRefunded,
        failedCount,
      },
      transactions,
    })
  } catch (error) {
    console.error('List Transactions Error:', error)
    return res.status(500).json({ success: false, message: error.message })
  }
})

/**
 * 2. Get Single Transaction by ID
 * GET /api/transactions/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const q = req.params.id.trim()
    const tx = await Transaction.findOne({
      $or: [{ transactionId: q }, { ticketId: q }, { orderId: q }],
    }).populate('ticketRef')

    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction not found' })
    }

    return res.json({ success: true, transaction: tx })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

/**
 * 3. Process Refund for a Transaction
 * POST /api/transactions/:id/refund
 */
router.post('/:id/refund', async (req, res) => {
  try {
    const q = req.params.id.trim()
    const isValidId = mongoose.Types.ObjectId.isValid(q)
    const tx = await Transaction.findOne({
      $or: [
        { transactionId: q },
        { ticketId: q },
        ...(isValidId ? [{ _id: q }] : []),
      ],
    })

    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' })
    }

    if (tx.status === 'REFUNDED') {
      return res.status(400).json({ success: false, message: 'Transaction is already marked as refunded.' })
    }

    const { refundReason = 'Refunded by Admin / Customer Request' } = req.body || {}
    const refundAmount = Number(tx.amount) || 0

    // If it's a live Razorpay transaction, trigger Razorpay refund API
    if (
      tx.paymentGateway === 'Razorpay' &&
      tx.transactionId &&
      tx.transactionId.startsWith('pay_') &&
      !tx.transactionId.startsWith('pay_test_')
    ) {
      const keyId = process.env.RAZORPAY_KEY_ID
      const keySecret = process.env.RAZORPAY_KEY_SECRET
      if (keyId && keySecret && !keyId.includes('sample')) {
        try {
          const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret })
          await rzp.payments.refund(tx.transactionId, {
            amount: Math.round(refundAmount * 100),
            notes: { reason: refundReason },
          })
          console.log(`[Razorpay Refund]: Processed refund of ₹${refundAmount} for ${tx.transactionId}`)
        } catch (rzpErr) {
          console.warn('[Razorpay Refund Warning]:', rzpErr.error?.description || rzpErr.message)
        }
      }
    }

    // Update Transaction in DB
    tx.status = 'REFUNDED'
    tx.refundAmount = refundAmount
    tx.failureReason = `Refunded: ${refundReason}`
    await tx.save()

    // Invalidate and cancel Ticket at gate
    if (tx.ticketId) {
      const cancelledTicket = await Ticket.findOneAndUpdate(
        { ticketId: tx.ticketId },
        {
          status: 'CANCELLED',
          cancellationReason: `Refunded ₹${refundAmount} (${refundReason})`,
        },
        { new: true }
      )
      if (cancelledTicket) {
        console.log(`[Refund] Ticket ${cancelledTicket.ticketId} marked as CANCELLED at gate`)
      }
    }

    return res.json({
      success: true,
      message: `Transaction of ₹${refundAmount.toLocaleString('en-IN')} marked as REFUNDED. Ticket pass has been cancelled for gate entry.`,
      transaction: tx,
    })
  } catch (error) {
    console.error('Process Refund Error:', error)
    return res.status(500).json({ success: false, message: error.message || 'Refund failed' })
  }
})

export default router
