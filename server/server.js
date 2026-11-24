import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDB } from './config/db.js'
import ticketRoutes from './routes/ticketRoutes.js'
import packageRoutes from './routes/packageRoutes.js'
import contactRoutes from './routes/contactRoutes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure server/.env is loaded even if run from different working directory
dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
const PORT = process.env.PORT || 5000

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Neon Event Ticketing Server is running!',
    timestamp: new Date().toISOString(),
  })
})

// Routes
app.use('/api/tickets', ticketRoutes)
app.use('/api/packages', packageRoutes)
app.use('/api/contact', contactRoutes)

// Start Server
app.listen(PORT, () => {
  console.log(`[Server]: Neon Event backend running on http://localhost:${PORT}`)
})
