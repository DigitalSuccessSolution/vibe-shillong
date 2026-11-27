import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    orderId: {
      type: String,
      index: true,
      default: '',
    },
    ticketId: {
      type: String,
      index: true,
      default: '',
    },
    ticketRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      default: null,
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
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    amount: {
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
    currency: {
      type: String,
      default: 'INR',
    },
    paymentGateway: {
      type: String,
      default: 'Razorpay',
    },
    paymentMode: {
      type: String,
      default: 'Online UPI',
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'REFUNDED'],
      default: 'SUCCESS',
      index: true,
    },
    failureReason: {
      type: String,
      default: null,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Transaction', transactionSchema)
