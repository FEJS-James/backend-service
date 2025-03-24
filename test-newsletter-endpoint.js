// Test script to diagnose newsletter endpoint issues
import dotenv from "dotenv"
import fetch from "node-fetch"
import { logInfo, logError } from "./utils/logger.js"

// Load environment variables
dotenv.config()

async function testNewsletterEndpoint() {
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
    } else {
      logError("Test", `Failed to subscribe test email: ${testEmail}`)
      logError("Test", `Response: ${JSON.stringify(data)}`)
    }
  } catch (error) {
    logError("Test", `Newsletter endpoint test failed: ${error.message}`)
  }
}

// Run the test
testNewsletterEndpoint()

