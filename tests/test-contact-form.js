import dotenv from "dotenv"
import fetch from "node-fetch"
import { logInfo, logError } from "../utils/logger.js"

// Load environment variables
dotenv.config()

export async function testContactForm() {
  try {
    logInfo("Test", "Testing contact form endpoint...")

    const testData = {
      name: "Test User",
      email: "test@example.com",
      phone: "123-456-7890",
      subject: "Test Contact Form Submission",
      message: "This is a test message to verify the contact form endpoint and Google Sheets integration.",
    }

    // Make a request to the local endpoint
    const response = await fetch("http://localhost:3000/api/contact-us", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    })

    const data = await response.json()

    if (response.ok) {
      logInfo("Test", `Contact form submission successful`)
      logInfo("Test", `Response: ${JSON.stringify(data)}`)
      return { success: true, message: "Contact form test passed" }
    } else {
      logError("Test", `Contact form submission failed`)
      logError("Test", `Response: ${JSON.stringify(data)}`)

      // Create a detailed error object
      const error = new Error(`Contact form test failed: ${data.message || "Unknown error"}`)
      error.response = data
      error.status = response.status

      return {
        success: false,
        message: `Contact form test failed: ${data.message || "Unknown error"}`,
        error: error,
      }
    }
  } catch (error) {
    logError("Test", `Contact form test failed: ${error.message}`)
    return {
      success: false,
      message: `Contact form test failed: ${error.message}`,
      error: error,
    }
  }
}

// Only run directly if this file is being executed directly
if (process.argv[1].includes("test-contact-form.js")) {
  testContactForm()
}

