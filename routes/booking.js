import express from "express"
import { appendToSheet } from "../utils/googleSheets.js"
import { createCalendarEvent } from "../utils/googleCalendar.js"
import { sendEmail } from "../utils/mailersend.js"
import { generateBookingConfirmationEmail } from "../utils/emailTemplates.js"
import { logInfo, logError } from "../utils/logger.js"

const router = express.Router()

// POST /api/book-meeting
router.post("/book-meeting", async (req, res) => {
  try {
    const { fullName, email, phoneNumber, companyName, meetingDate, meetingTime, meetingType, message } = req.body

    // Validate required fields
    if (!fullName || !email || !meetingDate || !meetingTime || !meetingType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields. Please provide fullName, email, meetingDate, meetingTime, and meetingType.",
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      })
    }

    // Parse date and time
    const dateTimeString = `${meetingDate}T${meetingTime}:00`
    const meetingDateTime = new Date(dateTimeString)

    if (isNaN(meetingDateTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date or time format. Please use YYYY-MM-DD for date and HH:MM for time.",
      })
    }

    // Calculate meeting end time (default to 1 hour)
    const meetingEndDateTime = new Date(meetingDateTime.getTime() + 60 * 60 * 1000)

    // Format date and time for display
    const formattedDate = meetingDateTime.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const formattedTime = meetingDateTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })

    // Log booking attempt
    logInfo("Booking", `Meeting booking attempt from ${fullName} (${email}) for ${formattedDate} at ${formattedTime}`)

    // 2. Create Google Calendar event with Jitsi Meet link
    // Prepare notes section with phone number if provided
    const phoneInfo = phoneNumber ? `Contact Phone: ${phoneNumber}` : "No phone number provided"

    const eventDetails = {
      summary: `Meeting with ${fullName} from ${companyName || "N/A"} - ${meetingType}`,
      description: `Meeting Type: ${meetingType}
Company: ${companyName || "N/A"}
${phoneInfo}

${message ? `Additional Notes: ${message}` : ""}`,
      startDateTime: meetingDateTime,
      endDateTime: meetingEndDateTime,
      attendees: [
        { email: email, displayName: fullName },
        { email: "info@commercialcoding.com", displayName: "Commercial Coding" },
      ],
      addMeetLink: true,
    }

    let calendarEvent
    let meetLinkCreated = false

    try {
      calendarEvent = await createCalendarEvent(eventDetails)
      logInfo("Booking", `Calendar event created with ID: ${calendarEvent.id}`)

      if (calendarEvent.meetLink) {
        logInfo("Booking", `Jitsi Meet link created: ${calendarEvent.meetLink}`)
        meetLinkCreated = true
      } else {
        logInfo("Booking", "No Jitsi Meet link was created for this event")
      }
    } catch (calendarError) {
      logError("Booking", `Error creating calendar event: ${calendarError.message}`)

      // If we can't create the calendar event with a Meet link, try again without it
      eventDetails.addMeetLink = false
      calendarEvent = await createCalendarEvent(eventDetails)
      logInfo("Booking", `Calendar event created without Meet link, ID: ${calendarEvent.id}`)
    }

    // 1. Write to Google Sheet (now with Meet link if available)
    const timestamp = new Date().toISOString()
    const sheetData = [
      [
        timestamp,
        fullName,
        email,
        phoneNumber || "Not provided",
        companyName || "Not provided",
        meetingDate,
        meetingTime,
        meetingType,
        message || "No message provided",
        calendarEvent.meetLink || "No Meet link",
        calendarEvent.htmlLink || "No Calendar link",
      ],
    ]

    await appendToSheet("Appointments", sheetData)
    logInfo("Booking", "Appointment data saved to Google Sheet")

    // Add note about calendar invitation
    const calendarNote = meetLinkCreated
      ? "The Jitsi Meet link is included in the calendar event and in this email."
      : "This meeting does not include a video conferencing link. Please contact us if you need a video conferencing link."

    // 3. Send confirmation emails
    const emailData = {
      fullName,
      email,
      phoneNumber: phoneNumber || "Not provided",
      companyName: companyName || "Not provided",
      meetingDate: formattedDate,
      meetingTime: formattedTime,
      meetingType,
      message: message || "No message provided",
      meetLink: calendarEvent.meetLink,
      calendarEventLink: calendarEvent.htmlLink,
      calendarAttachment: calendarEvent.icsContent,
      calendarNote: calendarNote,
      meetingPlatform: "Jitsi Meet", // Add meeting platform info
    }

    // Send to client
    const clientEmailHtml = generateBookingConfirmationEmail({
      ...emailData,
      recipient: "client",
    })

    await sendEmail({
      to: email,
      from: process.env.MAILSENDR_FROM_EMAIL,
      subject: "Your Meeting Confirmation - Commercial Coding",
      html: clientEmailHtml,
      attachments: [
        {
          filename: "meeting.ics",
          content: calendarEvent.icsContent,
          contentType: "text/calendar",
        },
      ],
    })
    logInfo("Booking", `Confirmation email sent to client: ${email}`)

    // Send to Commercial Coding
    const adminEmailHtml = generateBookingConfirmationEmail({
      ...emailData,
      recipient: "admin",
    })

    await sendEmail({
      to: "info@commercialcoding.com",
      from: process.env.MAILSENDR_FROM_EMAIL,
      subject: `New Meeting Booking: ${fullName} - ${meetingType}`,
      html: adminEmailHtml,
      attachments: [
        {
          filename: "meeting.ics",
          content: calendarEvent.icsContent,
          contentType: "text/calendar",
        },
      ],
    })
    logInfo("Booking", "Notification email sent to admin")

    // Return success response
    res.status(200).json({
      success: true,
      message: "Meeting booked successfully!",
      data: {
        meetingId: calendarEvent.id,
        meetLink: calendarEvent.meetLink,
        calendarEventLink: calendarEvent.htmlLink,
        meetLinkCreated: meetLinkCreated,
        meetingPlatform: "Jitsi Meet",
        note: meetLinkCreated
          ? "A Jitsi Meet link has been created for this meeting."
          : "No video conferencing link could be created for this meeting.",
      },
    })
  } catch (error) {
    logError("Booking", `Error booking meeting: ${error.message}`)
    console.error("Booking error:", error)

    res.status(500).json({
      success: false,
      message: "Failed to book meeting. Please try again later.",
      error: error.message,
    })
  }
})

export default router

