import { google } from "googleapis"
import { logError, logInfo } from "./logger.js"
import ical from "ical-generator"
import crypto from "crypto"

/**
 * Get Google Calendar client
 */
export async function getGoogleCalendarClient() {
  try {
    // Get the service account email and private key from environment variables
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    let privateKey = process.env.GOOGLE_PRIVATE_KEY

    // Handle newlines in the private key
    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, "\n")
    }

    if (!privateKey || !serviceAccountEmail) {
      throw new Error("Missing required Google Calendar credentials. Check your environment variables.")
    }

    // Create a JWT client using service account credentials
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/calendar"],
    })

    // Create Google Calendar API client
    const calendar = google.calendar({ version: "v3", auth })
    return calendar
  } catch (error) {
    // Make sure we don't log the actual error message which might contain sensitive info
    if (
      error.message &&
      (error.message.includes("private_key") ||
        error.message.includes("client_email") ||
        error.message.includes("service account"))
    ) {
      logError("GoogleCalendar", "Error creating Google Calendar client: Authentication error")
    } else {
      logError("GoogleCalendar", `Error creating Google Calendar client: ${error.message}`)
    }
    throw new Error("Failed to create Google Calendar client. Check your credentials.")
  }
}

/**
 * Generate a Jitsi Meet link
 * @param {string} meetingName - Base name for the meeting
 * @returns {string} - Jitsi Meet URL
 */
export function generateJitsiMeetLink(meetingName) {
  // Create a sanitized meeting name (remove spaces, special chars)
  const sanitizedName = meetingName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 20)

  // Add a random string to make the room name unique
  const randomString = crypto.randomBytes(4).toString("hex")

  // Combine the sanitized name with the random string
  const roomName = `${sanitizedName}-${randomString}`

  // Return the full Jitsi Meet URL
  return `https://meet.jit.si/${roomName}`
}

/**
 * Create a calendar event with Jitsi Meet link
 *
 * Note: Service accounts cannot add attendees without Domain-Wide Delegation.
 * This function works around that limitation by:
 * 1. Creating the event without attendees in Google Calendar
 * 2. Including attendees in the ICS file for email attachments
 * 3. Setting the event as public so attendees can still access it
 */
export async function createCalendarEvent({
  summary,
  description,
  startDateTime,
  endDateTime,
  attendees,
  addMeetLink = true,
}) {
  try {
    const calendar = await getGoogleCalendarClient()

    // Generate a Jitsi Meet link if requested
    let meetLink = null
    if (addMeetLink) {
      meetLink = generateJitsiMeetLink(summary)
      logInfo("GoogleCalendar", `Generated Jitsi Meet link: ${meetLink}`)
    }

    // Create event resource
    // Note: We don't include attendees here due to service account limitations
    const event = {
      summary,
      description:
        description +
        "\n\nAttendees:\n" +
        attendees.map((a) => `- ${a.displayName || a.email} (${a.email})`).join("\n") +
        (meetLink ? `\n\nJoin with Jitsi Meet: ${meetLink}` : ""),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "UTC",
      },
      // Make the event public so attendees can access it
      visibility: "public",
      transparency: "opaque", // Show as busy
      // Set the location to the Jitsi Meet link if available
      location: meetLink || "Online Meeting",
    }

    logInfo("GoogleCalendar", "Creating calendar event without attendees due to service account limitations")

    // Insert the event
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      sendUpdates: "none", // Don't send updates since we can't add attendees
    })

    logInfo("GoogleCalendar", `Calendar event created with ID: ${response.data.id}`)

    // Generate ICS file content with attendees
    // The ICS file will include attendees even though the Google Calendar event doesn't
    const cal = ical({
      domain: "commercialcoding.com",
      prodId: { company: "Commercial Coding", product: "Meeting Scheduler" },
      name: "Commercial Coding Meetings",
      timezone: "UTC",
    })

    const icsEvent = cal.createEvent({
      start: startDateTime,
      end: endDateTime,
      summary: summary,
      description: description + (meetLink ? `\n\nJoin with Jitsi Meet: ${meetLink}` : ""),
      location: meetLink || "Online Meeting",
      url: response.data.htmlLink,
      organizer: {
        name: "Commercial Coding",
        email: "info@commercialcoding.com",
      },
      attendees: attendees.map((attendee) => ({
        name: attendee.displayName || attendee.email,
        email: attendee.email,
        rsvp: true,
      })),
    })

    return {
      id: response.data.id,
      htmlLink: response.data.htmlLink,
      meetLink: meetLink,
      icsContent: cal.toString(),
    }
  } catch (error) {
    logError("GoogleCalendar", `Error creating calendar event: ${error.message}`)

    // Log more details about the error
    if (error.response) {
      logError("GoogleCalendar", `Error response: ${JSON.stringify(error.response.data, null, 2)}`)
    }

    throw error
  }
}

