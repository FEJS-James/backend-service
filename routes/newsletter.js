import express from "express"
import { getGoogleSheetClient } from "../utils/googleSheets.js"

const router = express.Router()

// POST /api/subscribe-newsletter
router.post("/subscribe-newsletter", async (req, res) => {
  try {
    const { email } = req.body

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

    // Get Google Sheets client
    const sheets = await getGoogleSheetClient()

    // Prepare the row data
    const values = [[email, new Date().toISOString()]]

    // Append to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Newsletter!A:B",
      valueInputOption: "USER_ENTERED",
      resource: {
        values,
      },
    })

    res.status(200).json({
      success: true,
      message: "Successfully subscribed to the newsletter!",
    })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to subscribe. Please try again later.",
    })
  }
})

export default router

