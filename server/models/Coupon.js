import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      default: 'percentage',
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: null, // Cap for percentage discounts (e.g. max 500)
    },
    minOrderAmount: {
      type: Number,
      default: 0, // Minimum order amount required
    },
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    validTill: {
      type: Date,
      default: null, // null = no expiry
    },
    applicableEvents: {
      type: [String],
      default: ['all'], // 'all', 'kids', 'adult', 'vip'
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Coupon', couponSchema)
