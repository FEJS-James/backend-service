// Test script for the MailerSend functionality with attachments
import dotenv from "dotenv"
import { sendEmail } from "./utils/mailersend.js"
import { logInfo, logError } from "./utils/logger.js"
import ical from "ical-generator"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

// Load environment variables
dotenv.config()

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function testMailerSendWithAttachment() {
  try {
    logInfo("Test", "Testing MailerSend email sending with attachment...")

    // Create a simple ICS calendar file
    const cal = ical({
      domain: "commercialcoding.com",
      prodId: { company: "Commercial Coding", product: "Test" },
      name: "Test Calendar",
      timezone: "UTC",
    })

    const event = cal.createEvent({
      start: new Date(),
      end: new Date(Date.now() + 3600000), // 1 hour from now
      summary: "Test Calendar Event",
      description: "This is a test calendar event",
      location: "Online",
      organizer: {
        name: "Test Organizer",
        email: process.env.MAILSENDR_FROM_EMAIL,
      },
    })

    const icsContent = cal.toString()

    // Write the ICS file to disk for debugging
    const icsPath = path.join(__dirname, "test-event.ics")
    fs.writeFileSync(icsPath, icsContent)
    logInfo("Test", `ICS file written to ${icsPath}`)

    // Create a simple text file
    const textContent = "This is a test text file attachment."
    const textPath = path.join(__dirname, "test-attachment.txt")
    fs.writeFileSync(textPath, textContent)
    logInfo("Test", `Text file written to ${textPath}`)

    // Send email with both attachments
    const result = await sendEmail({
      to: "test@example.com", // Replace with a real email for testing
      from: process.env.MAILSENDR_FROM_EMAIL,
      subject: "Test Email with Multiple Attachments from MailerSend",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1>Test Email with Attachments</h1>
          <p>This is a test email to verify the MailerSend integration is working correctly with attachments.</p>
          <p>Sent at: ${new Date().toISOString()}</p>
          <p>Two files are attached to this email:</p>
          <ul>
            <li>A calendar file (.ics)</li>
            <li>A text file (.txt)</li>
          </ul>
        </div>
      `,
      text: "This is a test email to verify the MailerSend integration is working correctly with attachments.",
      attachments: [
        {
          filename: "test-event.ics",
          content: icsContent,
          contentType: "text/calendar",
        },
        {
          filename: "test-attachment.txt",
          content: textContent,
          contentType: "text/plain",
        },
      ],
    })

    logInfo("Test", "Email with attachments sent successfully!")
    logInfo("Test", `Response: ${JSON.stringify(result, null, 2)}`)
  } catch (error) {
    logError("Test", `MailerSend attachment test failed: ${error.message}`)
    console.error(error)
  }
}

// Run the test
testMailerSendWithAttachment()

