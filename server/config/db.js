import mongoose from 'mongoose'
import dns from 'dns'

// Fix Windows DNS SRV lookup for MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4'])

export const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      'mongodb://127.0.0.1:27017/neon_event_db'

    console.log('[MongoDB]: Connecting to database cluster...')
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    })
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`)
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`)
  }
}
