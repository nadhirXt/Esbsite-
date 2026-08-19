import nodemailer from 'nodemailer'

/**
 * Shared Nodemailer transporter configured with Gmail.
 * Reused across all API routes that send emails.
 */
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

/**
 * Default sender address for all outgoing emails.
 */
export const FROM_ADDRESS = `"ESB Hub" <${process.env.SENDER_EMAIL || process.env.GMAIL_EMAIL}>`
