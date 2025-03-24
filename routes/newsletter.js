import express from "express"
import { appendToSheet } from "../utils/googleSheets.js"
import { logError, logInfo } from "../utils/logger.js"

const router = express.Router()

// POST /api/subscribe-newsletter
router.post("/subscribe-newsletter", async (req, res) => {
  try {
    const { email } = req.body

    logInfo("Newsletter", `Subscription attempt for email: ${email}`)

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      })
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      })
    }

    // Prepare the row data
    const values = [[email, new Date().toISOString()]]

    // Append to the sheet
    await appendToSheet("Newsletter", values)

    logInfo("Newsletter", `Successfully subscribed email: ${email}`)

    res.status(200).json({
      success: true,
      message: "Successfully subscribed to the newsletter!",
    })
  } catch (error) {
    logError("Newsletter", `Subscription error: ${error.message}`)

    // Provide a more user-friendly error message
    let errorMessage = "Failed to subscribe. Please try again later."

    if (error.message.includes("Unable to parse range")) {
      errorMessage = "Server configuration error with Google Sheets. Please contact support."
      logError("Newsletter", "Range parsing error. Check the format of your sheet name and range.")
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
    })
  }
})

export default router

