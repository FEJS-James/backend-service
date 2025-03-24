// Test script for the MailerSend functionality
import dotenv from "dotenv"
import { sendEmail } from "./utils/mailersend.js"
import { logInfo, logError } from "./utils/logger.js"

// Load environment variables
dotenv.config()

async function testMailerSend() {
  try {
    logInfo("Test", "Testing MailerSend email sending...")

    const result = await sendEmail({
      to: "test@example.com", // Replace with a real email for testing
      from: process.env.MAILSENDR_FROM_EMAIL,
      subject: "Test Email from MailerSend",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1>Test Email</h1>
          <p>This is a test email to verify the MailerSend integration is working correctly.</p>
          <p>Sent at: ${new Date().toISOString()}</p>
        </div>
      `,
      text: "This is a test email to verify the MailerSend integration is working correctly.",
    })

    logInfo("Test", "Email sent successfully!")
    logInfo("Test", `Response: ${JSON.stringify(result, null, 2)}`)
  } catch (error) {
    logError("Test", `MailerSend test failed: ${error.message}`)
    console.error(error)
  }
}

// Run the test
testMailerSend()

