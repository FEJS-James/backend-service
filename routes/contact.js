import express from "express"
import { sendEmail } from "../utils/mailersend.js"
import { generateEmailTemplate } from "../utils/emailTemplate.js"

const router = express.Router()

// POST /api/contact-us
router.post("/contact-us", async (req, res) => {
  try {
    const { name, email, phone, message, subject } = req.body

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required",
      })
    }

    // Generate email content
    const htmlContent = generateEmailTemplate({
      name,
      email,
      phone: phone || "Not provided",
      message,
    })

    // Send email using mailsendr
    await sendEmail({
      to: "info@commercialcoding.com",
      from: process.env.MAILSENDR_FROM_EMAIL,
      subject: subject || "New Contact Form Submission",
      html: htmlContent,
    })

    res.status(200).json({
      success: true,
      message: "Your message has been sent successfully!",
    })
  } catch (error) {
    console.error("Contact form error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    })
  }
})

export default router

