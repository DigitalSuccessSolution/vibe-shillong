import mongoose from 'mongoose'

const packageSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true, // 'kids', 'adult', 'vip'
    },
    badge: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: true,
    },
    timing: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
      default: 0,
    },
    subtitle: {
      type: String,
      default: '',
    },
    features: {
      type: [String],
      default: [],
    },
    color: {
      type: String,
      default: 'cyan', // 'cyan', 'pink', 'lime'
    },
    popular: {
      type: Boolean,
      default: false,
    },
    soldOut: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

export default mongoose.model('Package', packageSchema)
