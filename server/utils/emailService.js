import nodemailer from 'nodemailer'
import { generateTicketEmailHtml } from '../templates/ticketEmailTemplate.js'

/**
 * Sends digital ticket confirmation email to attendee
 * Configured via .env: EMAIL_USER, EMAIL_PASS (or SMTP_HOST, SMTP_PORT)
 *
 * @param {Object} ticket - MongoDB Ticket document
 */
export async function sendTicketEmail(ticket) {
  const { EMAIL_USER, EMAIL_PASS, SMTP_HOST = 'smtp.gmail.com', SMTP_PORT = 465 } = process.env

  if (!EMAIL_USER || !EMAIL_PASS) {
    console.log('[Email Service]: EMAIL_USER or EMAIL_PASS missing in server/.env. Skipping email delivery.')
    return { success: false, reason: 'NO_CREDENTIALS' }
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: EMAIL_USER.trim(),
        pass: EMAIL_PASS.replace(/\s+/g, ''),
      },
    })

    const htmlContent = generateTicketEmailHtml(ticket)

    // Plain text alternative for anti-spam filters (RFC standard)
    const plainTextContent = `Hello ${ticket.customerName || 'Festival Guest'},

Your official festival pass for VIBE Shillong is confirmed!

Ticket ID: ${ticket.ticketId}
Event: ${ticket.eventTitle || ticket.eventType} Pass
Date: Saturday, 12 December 2026
Venue: F Lounge by FTV, Shillong
Quantity: ${ticket.quantity || 1} Attendee(s)
Amount Paid: ₹${Number(ticket.amountPaid || 0).toLocaleString('en-IN')}
Status: CONFIRMED / VALID

Please present the QR code in this email at the gate scanner for entry.
Live pass view: https://vibeshillong.com/?ticket=${ticket.ticketId}

For queries, contact vibeshillong@gmail.com
VIBE Shillong 2026 · Official Ticketing`

    const mailOptions = {
      from: `"VIBE Shillong" <${EMAIL_USER}>`,
      to: ticket.customerEmail,
      replyTo: EMAIL_USER,
      subject: `Your VIBE Shillong Festival Pass (${ticket.ticketId})`,
      text: plainTextContent,
      html: htmlContent,
      headers: {
        'X-Entity-Ref-ID': ticket.ticketId || 'VIBE-PASS',
        'X-Mailer': 'VIBE Shillong Ticket Engine',
      },
    }

    // Admin copy: Admin receives a copy of attendee tickets
    if (EMAIL_USER && ticket.customerEmail.trim().toLowerCase() !== EMAIL_USER.trim().toLowerCase()) {
      mailOptions.bcc = EMAIL_USER.trim()
    }

    const info = await transporter.sendMail(mailOptions)

    console.log(`[Email Service]: Ticket sent to ${ticket.customerEmail} (ID: ${info.messageId})`)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('[Email Service Error]:', error.message)
    // Failure never blocks booking, user gets on-screen pass
    return { success: false, error: error.message }
  }
}
