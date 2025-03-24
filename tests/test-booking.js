import dotenv from "dotenv"
import fetch from "node-fetch"
import { logInfo, logError } from "../utils/logger.js"

// Load environment variables
dotenv.config()

export async function testBooking() {
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
      return { success: true, message: "Booking test passed" }
    } else {
      logError("Test", `Failed to book test meeting`)
      logError("Test", `Response: ${JSON.stringify(data, null, 2)}`)

      // Create a detailed error object
      const error = new Error(`Booking test failed: ${data.message || "Unknown error"}`)
      error.response = data
      error.status = response.status

      return {
        success: false,
        message: `Booking test failed: ${data.message || "Unknown error"}`,
        error: error,
      }
    }
  } catch (error) {
    logError("Test", `Booking endpoint test failed: ${error.message}`)
    return {
      success: false,
      message: `Booking test failed: ${error.message}`,
      error: error,
    }
  }
}

// Only run directly if this file is being executed directly
if (process.argv[1].includes("test-booking.js")) {
  testBooking()
}

