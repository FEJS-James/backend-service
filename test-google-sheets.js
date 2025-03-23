// Test script to diagnose Google Sheets integration issues
import dotenv from "dotenv"
import { getGoogleSheetClient, appendToSheet } from "./utils/googleSheets.js"
import { logInfo, logError } from "./utils/logger.js"

// Load environment variables
dotenv.config()

async function testGoogleSheetsConnection() {
  try {
    logInfo("Test", "Testing Google Sheets connection...")

    // Test getting the client
    const sheets = await getGoogleSheetClient()
    logInfo("Test", "Successfully created Google Sheets client")

    // Test getting spreadsheet info
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    })

    logInfo("Test", `Successfully connected to spreadsheet: ${spreadsheet.data.properties.title}`)
    logInfo("Test", "Available sheets:")

    // List all sheets
    spreadsheet.data.sheets.forEach((sheet) => {
      logInfo("Test", `- ${sheet.properties.title}`)
    })

    // Test appending data
    const testEmail = `test-${Date.now()}@example.com`
    await appendToSheet("Newsletter", [[testEmail, new Date().toISOString()]])

    logInfo("Test", `Successfully appended test email (${testEmail}) to Newsletter sheet`)
    logInfo("Test", "All tests passed! Google Sheets integration is working correctly.")
  } catch (error) {
    logError("Test", `Google Sheets test failed: ${error.message}`)
    logError("Test", error.stack)

    // Check common issues
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      logError("Test", "GOOGLE_SERVICE_ACCOUNT_EMAIL is missing")
    }
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      logError("Test", "GOOGLE_PRIVATE_KEY is missing")
    } else if (process.env.GOOGLE_PRIVATE_KEY.includes("\\n")) {
      logInfo("Test", "GOOGLE_PRIVATE_KEY contains escaped newlines (\\n) - this is expected and will be handled")
    }
    if (!process.env.GOOGLE_SHEET_ID) {
      logError("Test", "GOOGLE_SHEET_ID is missing")
    }
  }
}

// Run the test
testGoogleSheetsConnection()

