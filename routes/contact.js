import express from "express"
import { sendEmail } from "../utils/mailersend.js"
import { generateEmailTemplate } from "../utils/emailTemplate.js"
import { appendToSheet } from "../utils/googleSheets.js"
import { logInfo, logError } from "../utils/logger.js"

const router = express.Router()

// POST /api/contact-us
router.post("/contact-us", async (req, res) => {
  try {
    const { name, email, phone, message, subject } = req.body

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
        field: "name",
      })
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
        field: "email",
      })
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
        field: "message",
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format. Please provide a valid email address.",
        field: "email",
      })
    }

    // Log contact form submission
    logInfo("Contact", `Contact form submission from ${name} (${email})`)

    // 1. Write to Google Sheet
    try {
      const timestamp = new Date().toISOString()
      const sheetData = [
        [timestamp, name, email, phone || "Not provided", subject || "Contact Form Submission", message],
      ]

      await appendToSheet("Contact Form", sheetData)
      logInfo("Contact", "Contact form data saved to Google Sheet")
    } catch (sheetError) {
      // Log the error but continue with email sending
      logError("Contact", `Error saving to Google Sheet: ${sheetError.message}`)
      // We don't want to fail the whole request if just the sheet write fails
    }

    // 2. Generate email content
    const htmlContent = generateEmailTemplate({
      name,
      email,
      phone: phone || "Not provided",
      message,
    })

    // 3. Send email using mailsendr
    try {
      await sendEmail({
        to: "info@commercialcoding.com",
        from: process.env.MAILSENDR_FROM_EMAIL,
        subject: subject || "New Contact Form Submission",
        html: htmlContent,
      })
      logInfo("Contact", `Email sent successfully to info@commercialcoding.com`)
    } catch (emailError) {
      logError("Contact", `Error sending email: ${emailError.message}`)
      return res.status(500).json({
        success: false,
        message: "Failed to send your message via email. Please try again later or contact us directly.",
        error: emailError.message,
      })
    }

    res.status(200).json({
      success: true,
      message: "Your message has been sent successfully!",
    })
  } catch (error) {
    logError("Contact", `Contact form error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while processing your request. Please try again later.",
      error: error.message,
    })
  }
})

export default router

