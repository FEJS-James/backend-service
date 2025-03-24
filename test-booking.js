// Test script for the booking endpoint
import dotenv from "dotenv"
import fetch from "node-fetch"
import { logInfo, logError } from "./utils/logger.js"

// Load environment variables
dotenv.config()

async function testBookingEndpoint() {
  try {
    logInfo("Test", "Testing booking endpoint...")

    // Get tomorrow's date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0) // 10:00 AM

    const meetingDate = tomorrow.toISOString().split("T")[0] // YYYY-MM-DD
    const meetingTime = "10:00"

    const bookingData = {
      fullName: "Test User",
      email: "test@example.com",
      phoneNumber: "123-456-7890",
      companyName: "Test Company",
      meetingDate: meetingDate,
      meetingTime: meetingTime,
      meetingType: "Consultation",
      message: "This is a test booking to verify the booking endpoint functionality.",
    }

    // Make a request to the local endpoint
    const response = await fetch("http://localhost:3000/api/book-meeting", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    })

    const data = await response.json()

    if (response.ok) {
      logInfo("Test", `Successfully booked test meeting`)
      logInfo("Test", `Response: ${JSON.stringify(data, null, 2)}`)
    } else {
      logError("Test", `Failed to book test meeting`)
      logError("Test", `Response: ${JSON.stringify(data, null, 2)}`)
    }
  } catch (error) {
    logError("Test", `Booking endpoint test failed: ${error.message}`)
  }
}

// Run the test
testBookingEndpoint()

