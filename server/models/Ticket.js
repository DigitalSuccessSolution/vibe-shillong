import mongoose from 'mongoose'

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    eventType: {
      type: String,
      enum: ['kids', 'adult', 'vip'],
      required: true,
    },
    eventTitle: {
      type: String,
      default: 'Neon Festival Pass',
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    originalAmount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
    },
    paymentId: {
      type: String,
      default: 'OFFLINE_OR_MANUAL',
      index: true,
    },
    paymentMode: {
      type: String,
      default: 'Online UPI',
    },
    orderId: {
      type: String,
      index: true,
    },
    // Gate validation status: VALID -> USED
    status: {
      type: String,
      enum: ['VALID', 'USED', 'CANCELLED'],
      default: 'VALID',
      index: true,
    },
    scannedAt: {
      type: Date,
      default: null,
    },
    scannedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Ticket', ticketSchema)
