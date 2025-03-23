/**
 * Utility for sending emails using the MailerSend service
 */
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend"

export async function sendEmail({ to, from, subject, html, text }) {
  try {
    // Initialize MailerSend with API key
    const mailerSend = new MailerSend({
      apiKey: process.env.MAILSENDR_API_KEY,
    })

    // Create sender
    const sender = new Sender(from, "Commercial Coding")

    // Create recipient
    const recipients = [new Recipient(to)]

    // Create email params
    const emailParams = new EmailParams().setFrom(sender).setTo(recipients).setSubject(subject).setHtml(html)

    // Add plain text if provided
    if (text) {
      emailParams.setText(text)
    }

    // Send the email
    const response = await mailerSend.email.send(emailParams)

    return {
      success: true,
      messageId: response.headers.get("x-message-id"),
      response,
    }
  } catch (error) {
    console.error("Error sending email with MailerSend:", error)
    throw error
  }
}

