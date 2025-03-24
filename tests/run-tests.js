import dotenv from "dotenv"
import { testContactForm } from "./test-contact-form.js"
import { testBooking } from "./test-booking.js"
import { testNewsletter } from "./test-newsletter.js"
import { testGoogleSheets } from "./test-google-sheets.js"
import { testMailerSend } from "./test-mailersend.js"
import { testMailerSendAttachment } from "./test-mailersend-attachment.js"
import { testBookingMeet } from "./test-booking-meet.js"
import { testCalendarPermissions } from "./test-calendar-permissions.js"
import { testCors } from "./test-cors.js"

// Load environment variables
dotenv.config()

// Helper function to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Define all tests with their names
const tests = [
  { name: "Google Sheets Connection", fn: testGoogleSheets },
  { name: "CORS Configuration", fn: testCors },
  { name: "Newsletter Subscription", fn: testNewsletter },
  { name: "Contact Form", fn: testContactForm },
  { name: "MailerSend Email", fn: testMailerSend },
  { name: "MailerSend Attachment", fn: testMailerSendAttachment },
  { name: "Calendar Permissions", fn: testCalendarPermissions },
  { name: "Booking Appointment", fn: testBooking },
  { name: "Booking with Google Meet", fn: testBookingMeet },
]

// Function to run a single test
async function runTest(test) {
  console.log(`\n${"-".repeat(80)}`)
  console.log(`RUNNING TEST: ${test.name}`)
  console.log(`${"-".repeat(80)}`)

  try {
    const startTime = Date.now()
    const result = await test.fn()
    const duration = Date.now() - startTime

    if (result.success) {
      console.log(`\n✅ PASSED: ${test.name} (${duration}ms)`)
      console.log(`   ${result.message}`)
      return { name: test.name, success: true, message: result.message, duration }
    } else {
      console.log(`\n❌ FAILED: ${test.name} (${duration}ms)`)
      console.log(`   ${result.message}`)

      // Add more detailed error information if available
      if (result.error) {
        console.log(`\n   Error Details:`)
        console.log(`   ${"-".repeat(40)}`)

        if (result.error.stack) {
          console.log(`   Stack Trace:`)
          console.log(`   ${result.error.stack.split("\n").join("\n   ")}`)
        }

        if (result.error.response) {
          console.log(`   Response Data:`)
          console.log(`   ${JSON.stringify(result.error.response, null, 2).split("\n").join("\n   ")}`)
        }

        console.log(`   ${"-".repeat(40)}`)
      }

      return {
        name: test.name,
        success: false,
        message: result.message,
        error: result.error,
        duration,
      }
    }
  } catch (error) {
    console.log(`\n❌ ERROR: ${test.name}`)
    console.log(`   Unexpected error occurred while running the test`)
    console.log(`   ${error.message}`)

    // Add stack trace for unexpected errors
    console.log(`\n   Error Details:`)
    console.log(`   ${"-".repeat(40)}`)
    console.log(`   Stack Trace:`)
    console.log(`   ${error.stack.split("\n").join("\n   ")}`)
    console.log(`   ${"-".repeat(40)}`)

    return {
      name: test.name,
      success: false,
      message: `Unexpected error: ${error.message}`,
      error: error,
    }
  }
}

// Function to run all tests
async function runAllTests() {
  console.log(`\n${"=".repeat(80)}`)
  console.log(`COMMERCIAL CODING API TEST SUITE`)
  console.log(`${"=".repeat(80)}`)
  console.log(`Starting tests at: ${new Date().toISOString()}`)
  console.log(`Running ${tests.length} tests with a 5-second pause between each test...\n`)

  const results = []

  // Run each test sequentially with a delay between tests
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i]

    // Add a delay before each test (except the first one)
    if (i > 0) {
      console.log(`\nPausing for 5 seconds before next test...`)
      await delay(5000)
    }

    const result = await runTest(test)
    results.push(result)
  }

  // Print summary
  console.log(`\n${"=".repeat(80)}`)
  console.log(`TEST SUMMARY`)
  console.log(`${"=".repeat(80)}`)

  const passed = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  console.log(`Total tests: ${results.length}`)
  console.log(`Passed: ${passed}`)
  console.log(`Failed: ${failed}`)

  if (failed > 0) {
    console.log(`\nFAILED TESTS:`)
    results
      .filter((r) => !r.success)
      .forEach((result) => {
        console.log(`- ${result.name}: ${result.message}`)
      })
  }

  console.log(`\nTest suite completed at: ${new Date().toISOString()}`)

  return {
    total: results.length,
    passed,
    failed,
    results,
  }
}

// Run the test suite
runAllTests().then((summary) => {
  // Exit with appropriate code
  process.exit(summary.failed > 0 ? 1 : 0)
})

