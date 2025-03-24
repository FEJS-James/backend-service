import dotenv from "dotenv"
import fetch from "node-fetch"
import { logInfo, logError } from "./utils/logger.js"

// Load environment variables
dotenv.config()

async function testContactForm() {
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
    } else {
      logError("Test", `Contact form submission failed`)
      logError("Test", `Response: ${JSON.stringify(data)}`)
    }
  } catch (error) {
    logError("Test", `Contact form test failed: ${error.message}`)
  }
}

// Run the test
testContactForm()

