/**
 * Generates responsive, dark-mode neon HTML email template for VIBE Shillong E-Passes.
 * Compatible with Gmail, Apple Mail, Outlook, and mobile email clients.
 *
 * @param {Object} ticket - MongoDB Ticket document
 * @returns {string} Fully rendered HTML email string
 */
export function generateTicketEmailHtml(ticket) {
  const badgeText = ticket.eventType ? `${ticket.eventType.toUpperCase()} PASS CONFIRMED` : 'FESTIVAL PASS CONFIRMED'
  const formattedAmount = Number(ticket.amountPaid || 0).toLocaleString('en-IN')
  const quantity = Number(ticket.quantity) || 1

  const eventTimings = {
    kids: '12:00 PM – 7:30 PM',
    adult: '8:00 PM Onwards',
    vip: '8:00 PM Onwards',
  }
  const eventTypeKey = (ticket.eventType || 'adult').toLowerCase()
  const timingText = eventTimings[eventTypeKey] || '8:00 PM Onwards'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your VIBE Shillong Festival Pass</title>
  <style>
    body {
      margin: 0;
      padding: 24px 12px;
      background-color: #05020c;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #ffffff;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 540px;
      margin: 0 auto;
      background: #0d071a;
      border: 1px solid #ff35c4;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(255, 53, 196, 0.2);
    }
    .header-banner {
      background: linear-gradient(135deg, #1b0c33 0%, #0d071a 100%);
      padding: 32px 24px 20px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .brand-title {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 3px;
      color: #ffffff;
      margin: 0 0 6px 0;
      text-transform: uppercase;
    }
    .brand-subtitle {
      font-size: 11px;
      font-weight: 700;
      color: #35eaff;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin: 0;
    }
    .status-badge {
      display: inline-block;
      margin-top: 14px;
      background: #ff35c4;
      color: #06020e;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 6px 16px;
      border-radius: 20px;
    }
    .content-body {
      padding: 24px 28px;
    }
    .ticket-id-box {
      background: rgba(53, 234, 255, 0.08);
      border: 1px dashed rgba(53, 234, 255, 0.4);
      border-radius: 14px;
      padding: 16px;
      text-align: center;
      margin-bottom: 24px;
    }
    .ticket-id-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #8f85a3;
      margin-bottom: 4px;
    }
    .ticket-id-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 22px;
      font-weight: 800;
      color: #35eaff;
      letter-spacing: 2px;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .info-table td {
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      vertical-align: middle;
    }
    .info-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #8f85a3;
      font-weight: 600;
    }
    .info-value {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
      text-align: right;
    }
    .amount-highlight {
      color: #00ff88;
      font-size: 16px;
      font-weight: 800;
    }
    .instructions-card {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      padding: 14px 16px;
      font-size: 12px;
      line-height: 1.6;
      color: #bbb3cb;
      margin-top: 20px;
    }
    .footer-section {
      background: #080311;
      padding: 20px 24px;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 11px;
      color: #6c6380;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Header Banner -->
    <div class="header-banner">
      <h1 class="brand-title">VIBE SHILLONG</h1>
      <p class="brand-subtitle">Official Entry E-Pass</p>
      <div class="status-badge">${badgeText}</div>
    </div>

    <!-- Ticket Body -->
    <div class="content-body">
      <!-- Unique Ticket Code Box -->
      <div class="ticket-id-box">
        <div class="ticket-id-label">Official Ticket ID</div>
        <div class="ticket-id-code">${ticket.ticketId}</div>
      </div>

      <!-- Pass Metadata Table -->
      <table class="info-table">
        <tr>
          <td class="info-label">Attendee Name</td>
          <td class="info-value">${ticket.customerName}</td>
        </tr>
        <tr>
          <td class="info-label">Pass Tier</td>
          <td class="info-value">${ticket.eventTitle || 'Neon Festival Pass'}</td>
        </tr>
        <tr>
          <td class="info-label">Date & Time</td>
          <td class="info-value">Saturday, 12 December 2026 (${timingText})</td>
        </tr>
        <tr>
          <td class="info-label">Venue</td>
          <td class="info-value">F Lounge by FTV, Shillong</td>
        </tr>
        <tr>
          <td class="info-label">Quantity</td>
          <td class="info-value">${quantity} ${quantity === 1 ? 'Pass' : 'Passes'}</td>
        </tr>
        <tr>
          <td class="info-label">Amount Paid</td>
          <td class="info-value amount-highlight">₹${formattedAmount} (${ticket.paymentMode || 'Online'})</td>
        </tr>
        <tr>
          <td class="info-label">Payment ID</td>
          <td class="info-value" style="font-family: monospace; font-size: 12px; color: #bbb3cb;">
            ${ticket.paymentId || 'N/A'}
          </td>
        </tr>
      </table>

      <!-- Entry Instructions -->
      <div class="instructions-card">
        ⚡ <strong>Entry Instructions:</strong> Please present this email or your saved digital E-Pass with the QR code at the entrance for instant handheld scanner check-in. Valid Government Photo ID required.
      </div>
    </div>

    <!-- Footer -->
    <div class="footer-section">
      Need assistance? Contact support at support@VIBEshillong.com or WhatsApp +91 82230 87569.<br>
      © 2026 VIBE Shillong. All rights reserved. F Lounge by FTV.
    </div>
  </div>
</body>
</html>
  `.trim()
}
