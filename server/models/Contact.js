import mongoose from 'mongoose'

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      default: 'General Festival Question',
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'RESOLVED'],
      default: 'NEW',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

const Contact = mongoose.model('Contact', contactSchema)
export default Contact
