import dotenv from "dotenv"
import fetch from "node-fetch"
import { logInfo, logError } from "../utils/logger.js"

// Load environment variables
dotenv.config()

export async function testNewsletter() {
  try {
    logInfo("Test", "Testing newsletter endpoint...")

    const testEmail = `test-${Date.now()}@example.com`

    // Make a request to the local endpoint
    const response = await fetch("http://localhost:3000/api/subscribe-newsletter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: testEmail }),
    })

    const data = await response.json()

    if (response.ok) {
      logInfo("Test", `Successfully subscribed test email: ${testEmail}`)
      logInfo("Test", `Response: ${JSON.stringify(data)}`)
      return { success: true, message: "Newsletter test passed" }
    } else {
      logError("Test", `Failed to subscribe test email: ${testEmail}`)
      logError("Test", `Response: ${JSON.stringify(data)}`)

      // Create a detailed error object
      const error = new Error(`Newsletter test failed: ${data.message || "Unknown error"}`)
      error.response = data
      error.status = response.status

      return {
        success: false,
        message: `Newsletter test failed: ${data.message || "Unknown error"}`,
        error: error,
      }
    }
  } catch (error) {
    logError("Test", `Newsletter endpoint test failed: ${error.message}`)
    return {
      success: false,
      message: `Newsletter test failed: ${error.message}`,
      error: error,
    }
  }
}

// Only run directly if this file is being executed directly
if (process.argv[1].includes("test-newsletter.js")) {
  testNewsletter()
}

