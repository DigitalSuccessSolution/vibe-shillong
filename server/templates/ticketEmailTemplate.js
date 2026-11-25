/**
 * Generates exact pixel-matched, fully-responsive replica of the UI Ticket Modal for VIBE Shillong E-Passes.
 * Features 2-column desktop boarding pass and stacked 100% mobile view for Gmail, iOS Mail & Android.
 *
 * @param {Object} ticket - MongoDB Ticket document
 * @returns {string} Fully rendered HTML email string
 */
export function generateTicketEmailHtml(ticket) {
  const eventTypeKey = (ticket.eventType || 'adult').toLowerCase()

  const passColors = {
    kids: {
      border: '#35eaff',
      badgeBg: '#35eaff',
      badgeText: '#071016',
      accent: '#35eaff',
      glow: 'rgba(53, 234, 255, 0.25)',
    },
    adult: {
      border: '#ff35c4',
      badgeBg: '#ff35c4',
      badgeText: '#080612',
      accent: '#ff35c4',
      glow: 'rgba(255, 53, 196, 0.25)',
    },
    vip: {
      border: '#c8ff3d',
      badgeBg: '#c8ff3d',
      badgeText: '#080612',
      accent: '#c8ff3d',
      glow: 'rgba(200, 255, 61, 0.25)',
    },
  }

  const theme = passColors[eventTypeKey] || passColors.adult
  const ticketId = ticket.ticketId || 'NEON-VALID'
  const customerName = (ticket.customerName || 'Verified Attendee').toUpperCase()
  const quantity = Number(ticket.quantity) || 1
  const amountPaid = Number(ticket.amountPaid || 0).toLocaleString('en-IN')

  const eventTimings = {
    kids: '12:00 PM – 7:30 PM',
    adult: '8:00 PM Onwards',
    vip: '8:00 PM Onwards',
  }
  const timingText = eventTimings[eventTypeKey] || '8:00 PM Onwards'

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticketId)}&color=080414&bgcolor=ffffff`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>VIBE Shillong Ticket Pass - ${ticketId}</title>
  <style>
    body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #05020c !important;
    }
    @media only screen and (max-width: 580px) {
      .outer-container {
        padding: 12px 6px !important;
      }
      .ticket-wrapper {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 18px !important;
      }
      .ticket-col-main {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
        padding: 18px 14px !important;
      }
      .ticket-col-stub {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
        border-left: none !important;
        border-top: 2px dashed rgba(255, 255, 255, 0.22) !important;
        padding: 20px 14px !important;
      }
      .attendee-name {
        font-size: 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #05020c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; -webkit-font-smoothing: antialiased;">

  <!-- Outer Email Center Wrapper -->
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #05020c;">
    <tr>
      <td align="center" class="outer-container" style="padding: 24px 10px;">

        <!-- Pre-Header Title -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin-bottom: 12px;">
          <tr>
            <td align="left" style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: ${theme.accent}; font-weight: 600;">
              ⚡ Official Festival Entry Pass
            </td>
            <td align="right" style="font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #8f85a3;">
              ID: <span style="font-family: 'Courier New', monospace; font-weight: 600; color: #ffffff;">${ticketId}</span>
            </td>
          </tr>
        </table>

        <!-- ======================================================== -->
        <!-- MAIN TICKET PASS (RESPONSIVE 2-COL / STACK ON MOBILE) -->
        <!-- ======================================================== -->
        <table width="100%" class="ticket-wrapper" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0d071a; border: 1.5px solid ${theme.border}; border-radius: 20px; box-shadow: 0 10px 30px ${theme.glow}; overflow: hidden;">
          <tr>
            <td>
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  
                  <!-- =================================================== -->
                  <!-- LEFT / MAIN PASS SECTION -->
                  <!-- =================================================== -->
                  <td valign="top" class="ticket-col-main" style="padding: 22px 22px;">
                    
                    <!-- Top Header: Logo + Title + Pass Badge -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 12px;">
                      <tr>
                        <td valign="middle">
                          <table border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td valign="middle" style="padding-right: 10px;">
                                <img src="https://vibeshillong.com/logo.jpeg" alt="VIBE" width="36" height="36" style="display: block; border-radius: 8px;" />
                              </td>
                              <td valign="middle">
                                <span style="font-size: 13px; font-weight: 700; letter-spacing: 1.5px; color: #ffffff; display: block;">
                                  VIBE SHILLONG
                                </span>
                                <span style="font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.5); display: block; margin-top: 2px;">
                                  Official Festival Pass · 2026
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td align="right" valign="middle">
                          <span style="display: inline-block; background-color: ${theme.badgeBg}; color: ${theme.badgeText}; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 4px 11px; border-radius: 16px;">
                            ${eventTypeKey.toUpperCase()} PASS
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Attendee Name -->
                    <div style="padding-top: 14px; margin-bottom: 12px;">
                      <span style="font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.4); display: block; margin-bottom: 3px;">
                        ATTENDEE NAME
                      </span>
                      <span class="attendee-name" style="font-size: 19px; font-weight: 700; letter-spacing: 0.3px; color: #ffffff; text-transform: uppercase; display: block; line-height: 1.25;">
                        ${customerName}
                      </span>
                    </div>

                    <!-- 2-Column Specs (Date & Timing Box) -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; margin-bottom: 12px; text-align: center;">
                      <tr>
                        <td width="50%" style="padding: 9px 8px; border-right: 1px solid rgba(255, 255, 255, 0.08);">
                          <span style="font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.4); display: block;">DATE</span>
                          <span style="font-size: 12px; font-weight: 600; color: #ffffff; display: block; margin-top: 2px;">12 DEC 2026</span>
                        </td>
                        <td width="50%" style="padding: 9px 8px;">
                          <span style="font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.4); display: block;">TIMING</span>
                          <span style="font-size: 12px; font-weight: 600; color: ${theme.accent}; display: block; margin-top: 2px;">${timingText}</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Venue & Pass Metadata -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px; font-size: 11px; line-height: 1.5; color: rgba(255, 255, 255, 0.75);">
                      <tr>
                        <td style="padding-bottom: 3px;">
                          📍 <span style="font-weight: 600; color: #ffffff;">F Lounge by FTV, Shillong</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="color: rgba(255, 255, 255, 0.5); font-size: 10px;">
                          🎟️ Qty: ${quantity} Pass • ₹${amountPaid} Paid • Admit One • Non-Transferable
                        </td>
                      </tr>
                    </table>

                    <!-- Status Strip & Barcode -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 10px;">
                      <tr>
                        <td align="left">
                          <span style="display: inline-block; background-color: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; font-size: 10px; font-weight: 600; padding: 2px 9px; border-radius: 6px;">
                            ✓ Status: VALID
                          </span>
                        </td>
                        <td align="right" style="font-family: 'Courier New', monospace; font-size: 11px; color: rgba(255,255,255,0.2); letter-spacing: 3px;">
                          |||||||||||||||||||
                        </td>
                      </tr>
                    </table>

                  </td>

                  <!-- =================================================== -->
                  <!-- RIGHT / DIGITAL STUB SECTION (RESPONSIVE STACK) -->
                  <!-- =================================================== -->
                  <td width="185" valign="top" class="ticket-col-stub" style="border-left: 2px dashed rgba(255, 255, 255, 0.14); background-color: rgba(0, 0, 0, 0.4); padding: 20px 14px; text-align: center;">
                    
                    <span style="font-size: 9px; letter-spacing: 1.5px; color: rgba(255,255,255,0.4); text-transform: uppercase; display: block; margin-bottom: 8px; font-weight: 600;">
                      DIGITAL ENTRY STUB
                    </span>

                    <!-- White QR Code Box -->
                    <div style="background-color: #ffffff; padding: 8px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                      <img src="${qrImageUrl}" alt="Scan QR for Entry" width="125" height="125" style="display: block; margin: 0 auto; border-radius: 4px;" />
                      <span style="display: block; font-size: 8px; font-weight: 700; color: #080414; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 4px;">
                        SCAN FOR ENTRY
                      </span>
                    </div>

                    <!-- Official Ticket Code -->
                    <div style="margin-top: 10px;">
                      <span style="font-size: 8px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.4); display: block;">
                        OFFICIAL CODE
                      </span>
                      <span style="font-family: 'Courier New', monospace; font-size: 12px; font-weight: 700; color: ${theme.accent}; letter-spacing: 0.5px; display: block; margin-top: 2px;">
                        ${ticketId}
                      </span>
                      <span style="font-size: 8px; color: rgba(255,255,255,0.3); display: block; margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 3px;">
                        1-TIME FAST SCAN
                      </span>
                    </div>

                  </td>

                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- ======================================================== -->
        <!-- ENTRY INSTRUCTIONS & VENUE GUIDELINES -->
        <!-- ======================================================== -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin-top: 14px; background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; padding: 12px 16px; font-size: 11px; line-height: 1.55; color: #9d94b0;">
          <tr>
            <td>
              ⚡ <span style="font-weight: 600; color: #ffffff;">Entry Instructions:</span> Show this email or the scannable QR stub above at the F Lounge by FTV entrance for instant handheld scanner check-in. Physical Government Photo ID is required.
              <br><br>
              🎨 <span style="font-weight: 600; color: #ffffff;">Dress Code:</span> Wear white or neon fluorescent outfits to glow under ultraviolet blacklights. Free UV neon face-styling booths inside the venue!
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin-top: 14px; text-align: center; font-size: 10px; color: #625977; line-height: 1.55;">
          <tr>
            <td>
              Need assistance? WhatsApp <span style="font-weight: 600; color: #b5accc;">+91 87318 46927</span> or email vibeshillong@gmail.com
              <br>
              © 2026 VIBE Shillong. All rights reserved. F Lounge by FTV, Shillong.
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `.trim()
}
