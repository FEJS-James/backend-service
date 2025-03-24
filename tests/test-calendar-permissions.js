import dotenv from "dotenv"
import { getGoogleCalendarClient, generateJitsiMeetLink } from "../utils/googleCalendar.js"
import { logInfo, logError } from "../utils/logger.js"

// Load environment variables
dotenv.config()

export async function testCalendarPermissions() {
  try {
    logInfo("Test", "Testing Google Calendar API permissions and Jitsi Meet link generation...")

    // Test Jitsi Meet link generation
    const testMeetingName = "Test Meeting"
    const jitsiLink = generateJitsiMeetLink(testMeetingName)
    logInfo("Test", `Successfully generated Jitsi Meet link: ${jitsiLink}`)

    // Verify the link format
    if (!jitsiLink.startsWith("https://meet.jit.si/")) {
      throw new Error("Generated link does not have the correct Jitsi Meet format")
    }

    // Get the calendar client
    const calendar = await getGoogleCalendarClient()
    logInfo("Test", "Successfully created Google Calendar client")

    // Test getting the primary calendar
    const calendarResponse = await calendar.calendars.get({
      calendarId: "primary",
    })

    logInfo("Test", `Successfully accessed primary calendar: ${calendarResponse.data.summary}`)

    // Check if the calendar is part of a Google Workspace
    if (calendarResponse.data.accessRole === "owner") {
      logInfo("Test", "Calendar access role: owner (Good)")
    } else {
      logInfo("Test", `Calendar access role: ${calendarResponse.data.accessRole} (May be insufficient)`)
    }

    // Create a test event with Jitsi Meet link in the location and description
    logInfo("Test", "Creating a test event with Jitsi Meet link...")

    const event = {
      summary: "Test Event with Jitsi Meet",
      description: `This is a test event to check if we can create calendar events with Jitsi Meet links\n\nJoin with Jitsi Meet: ${jitsiLink}`,
      location: jitsiLink,
      start: {
        dateTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        timeZone: "UTC",
      },
      end: {
        dateTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
        timeZone: "UTC",
      },
    }

    // Log the event for debugging
    logInfo("Test", `Attempting to create event with Jitsi Meet link in location: ${event.location}`)

    const eventResponse = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    })

    if (eventResponse.data.id) {
      logInfo("Test", `Success! Calendar event created with ID: ${eventResponse.data.id}`)
      logInfo("Test", `Event has Jitsi Meet link in location: ${eventResponse.data.location}`)

      // Clean up - delete the test event
      await calendar.events.delete({
        calendarId: "primary",
        eventId: eventResponse.data.id,
      })

      logInfo("Test", "Test event deleted")
      return { success: true, message: "Calendar permissions test passed - Jitsi Meet links can be created" }
    } else {
      logError("Test", "Failed to create calendar event")

      // Provide guidance based on the results
      logInfo("Test", "\nTROUBLESHOOTING STEPS:")
      logInfo("Test", "1. Make sure your service account is associated with a Google Workspace account")
      logInfo("Test", "2. Ensure the service account has the necessary permissions")
      logInfo("Test", "3. Check that the Google Calendar API is enabled in your Google Cloud project")

      return {
        success: false,
        message: "Calendar permissions test failed - Cannot create calendar events",
      }
    }
  } catch (error) {
    logError("Test", `Calendar permissions test failed: ${error.message}`)

    if (error.response && error.response.data) {
      logError("Test", `Error response: ${JSON.stringify(error.response.data, null, 2)}`)
    }

    logInfo("Test", "\nTROUBLESHOOTING STEPS:")
    logInfo("Test", "1. Check that your service account credentials are correct")
    logInfo("Test", "2. Ensure the Google Calendar API is enabled in your Google Cloud project")
    logInfo("Test", "3. Verify that the service account has the necessary permissions")

    return {
      success: false,
      message: `Calendar permissions test failed: ${error.message}`,
      error: error,
    }
  }
}

// Only run directly if this file is being executed directly
if (process.argv[1].includes("test-calendar-permissions.js")) {
  testCalendarPermissions()
}

