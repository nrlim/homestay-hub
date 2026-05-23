import nodemailer from 'nodemailer'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

interface SendBookingConfirmationParams {
  to: string
  userName: string
  homestayName: string
  homestayAddress: string
  checkIn: Date
  checkOut: Date
  rooms: {
    roomNumber: string
    type: string
    priceAtBooking: number
  }[]
  totalPrice: number
  transactionId: string
}

export async function sendBookingConfirmationEmail(params: SendBookingConfirmationParams) {
  const { to, userName, homestayName, homestayAddress, checkIn, checkOut, rooms, totalPrice, transactionId } = params

  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

  // Construct pure HTML string to avoid react-dom/server Server Component crashes
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmed — ${homestayName}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; color: #18181b;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 16px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
              <tr>
                <td style="background: linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%); border-radius: 16px 16px 0 0; padding: 40px 40px 32px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; line-height: 1.2;">Booking Confirmed! 🎉</h1>
                  <p style="margin: 12px 0 0; color: rgba(255,255,255,0.85); font-size: 15px;">Great news, ${userName}! Your reservation is all set.</p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #ffffff; padding: 32px 40px;">
                  <h2 style="margin: 0 0 6px; font-size: 20px; font-weight: 700; color: #0c4a6e;">${homestayName}</h2>
                  <p style="margin: 0; font-size: 13px; color: #0369a1;">📍 ${homestayAddress}</p>
                  
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                  
                  <table width="100%">
                    <tr>
                      <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; text-align: center;">
                        <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Check-in</p>
                        <p style="margin: 0; font-size: 16px; font-weight: 700; color: #0f172a;">${format(checkIn, 'MMM d, yyyy')}</p>
                      </td>
                      <td width="4%" style="text-align: center;">→</td>
                      <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; text-align: center;">
                        <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Check-out</p>
                        <p style="margin: 0; font-size: 16px; font-weight: 700; color: #0f172a;">${format(checkOut, 'MMM d, yyyy')}</p>
                      </td>
                    </tr>
                  </table>

                  <p style="text-align: center; margin: 20px 0;">🌙 <strong>${nights}</strong> ${nights === 1 ? 'night' : 'nights'}</p>
                  
                  <p style="margin: 0 0 12px; font-size: 13px; font-weight: 700; color: #374151; text-transform: uppercase;">Rooms Booked</p>
                  <table width="100%" style="border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
                    <tr style="background-color: #f9fafb;">
                      <th style="padding: 10px 16px; text-align: left; font-size: 12px; color: #6b7280;">Room</th>
                      <th style="padding: 10px 16px; text-align: left; font-size: 12px; color: #6b7280;">Type</th>
                      <th style="padding: 10px 16px; text-align: right; font-size: 12px; color: #6b7280;">Total</th>
                    </tr>
                    ${rooms.map(room => `
                      <tr style="border-top: 1px solid #f3f4f6;">
                        <td style="padding: 12px 16px; font-size: 14px; font-weight: 600;">#${room.roomNumber}</td>
                        <td style="padding: 12px 16px; font-size: 14px;">${room.type}</td>
                        <td style="padding: 12px 16px; font-size: 14px; font-weight: 600; text-align: right;">${formatCurrency(room.priceAtBooking)}</td>
                      </tr>
                    `).join('')}
                  </table>

                  <div style="margin-top: 16px; background: linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%); border-radius: 10px; padding: 16px 20px;">
                    <table width="100%">
                      <tr>
                        <td style="color: rgba(255,255,255,0.85); font-size: 14px;">Total Payment</td>
                        <td style="text-align: right; color: #ffffff; font-size: 22px; font-weight: 800;">${formatCurrency(totalPrice)}</td>
                      </tr>
                    </table>
                  </div>

                  <p style="margin-top: 24px; font-size: 12px; color: #9ca3af; text-align: center;">Transaction ID: ${transactionId}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  try {
    const info = await transporter.sendMail({
      from: `"Homestay Hub" <${process.env.EMAIL_USER}>`,
      to,
      subject: `✅ Booking Confirmed — ${homestayName}`,
      html: htmlContent,
    })
    
    return info
  } catch (error: any) {
    console.error("Nodemailer error:", error);
    throw new Error(`Email sending failed: ${error.message}`)
  }
}
