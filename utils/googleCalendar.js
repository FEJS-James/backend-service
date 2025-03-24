import { google } from "googleapis"
import { logError, logInfo } from "./logger.js"
import ical from "ical-generator"

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
 * Create a calendar event with Google Meet link
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

    // Create event resource
    // Note: We don't include attendees here due to service account limitations
    const event = {
      summary,
      description:
        description +
        "\n\nAttendees:\n" +
        attendees.map((a) => `- ${a.displayName || a.email} (${a.email})`).join("\n"),
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
    }

    // Add Google Meet conferencing if requested
    if (addMeetLink) {
      // Use the correct conference data format
      event.conferenceData = {
        createRequest: {
          requestId: `meeting-${Date.now()}`,
        },
      }
    }

    logInfo("GoogleCalendar", "Creating calendar event without attendees due to service account limitations")

    // Insert the event
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: addMeetLink ? 1 : 0,
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
      description:
        description + (response.data.hangoutLink ? `\n\nJoin with Google Meet: ${response.data.hangoutLink}` : ""),
      location: response.data.hangoutLink || "Online Meeting",
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
      meetLink: response.data.hangoutLink,
      icsContent: cal.toString(),
    }
  } catch (error) {
    logError("GoogleCalendar", `Error creating calendar event: ${error.message}`)
    throw error
  }
}

