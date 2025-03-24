/**
 * Utility for sending emails using the MailerSend service
 */
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend"
import { logError, logInfo } from "./logger.js"

export async function sendEmail({ to, from, subject, html, text, attachments = [] }) {
  try {
    // Get the API key from environment variables
    const apiKey = process.env.MAILSENDR_API_KEY

    if (!apiKey) {
      throw new Error("Missing MailerSend API key. Check your environment variables.")
    }

    // Initialize MailerSend with API key
    const mailerSend = new MailerSend({
      apiKey: apiKey,
    })

    // Create sender
    const sender = new Sender(from, "Commercial Coding")

    // Create recipient(s)
    const recipients = Array.isArray(to) ? to.map((email) => new Recipient(email)) : [new Recipient(to)]

    // Create email params
    const emailParams = new EmailParams().setFrom(sender).setTo(recipients).setSubject(subject).setHtml(html)

    // Add plain text if provided
    if (text) {
      emailParams.setText(text)
    }

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      // Process attachments
      const processedAttachments = attachments.map((attachment) => {
        // Always encode content as base64
        let content

        if (typeof attachment.content === "string") {
          // If it's a string, encode it to base64
          content = Buffer.from(attachment.content).toString("base64")
        } else if (Buffer.isBuffer(attachment.content)) {
          // If it's a Buffer, convert to base64 string
          content = attachment.content.toString("base64")
        } else {
          // For any other type, convert to string first, then to base64
          content = Buffer.from(String(attachment.content)).toString("base64")
        }

        // Return a properly formatted attachment object
        return {
          content: content,
          filename: attachment.filename,
          disposition: "attachment", // Always use "attachment" as disposition
          id: attachment.id || undefined,
          contentType: attachment.contentType || undefined,
        }
      })

      // Set attachments on the email params
      emailParams.setAttachments(processedAttachments)
    }

    logInfo("MailerSend", `Sending email to ${Array.isArray(to) ? to.join(", ") : to}`)

    // Send the email
    const response = await mailerSend.email.send(emailParams)

    // Handle response properly - the response structure might be different than expected
    let messageId = null

    // Check if response has headers and if headers has a get method
    if (response && response.headers) {
      if (typeof response.headers.get === "function") {
        messageId = response.headers.get("x-message-id")
      } else if (response.headers["x-message-id"]) {
        // If headers is an object with direct properties
        messageId = response.headers["x-message-id"]
      }
    }

    logInfo("MailerSend", `Email sent successfully${messageId ? ` with ID: ${messageId}` : ""}`)

    return {
      success: true,
      messageId: messageId,
      response: response,
    }
  } catch (error) {
    // Make sure we don't log the actual error message which might contain sensitive info
    if (
      error.message &&
      (error.message.includes("api_key") ||
        error.message.includes("apiKey") ||
        error.message.includes("authentication") ||
        error.message.includes("auth"))
    ) {
      logError("MailerSend", "Error sending email: Authentication error")
    } else {
      logError("MailerSend", `Error sending email: ${error.message}`)
    }
    console.error("Error sending email with MailerSend:", error)
    throw new Error("Failed to send email. Check your MailerSend credentials.")
  }
}

