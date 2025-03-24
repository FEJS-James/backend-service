import { google } from "googleapis"
import { logError, logInfo } from "./logger.js"

export async function getGoogleSheetClient() {
  try {
    // Get the service account email, private key, and sheet ID from environment variables
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    let privateKey = process.env.GOOGLE_PRIVATE_KEY
    const sheetId = process.env.GOOGLE_SHEET_ID

    // Handle newlines in the private key
    if (privateKey) {
      // Replace literal "\n" strings with actual newlines
      privateKey = privateKey.replace(/\\n/g, "\n")
    }

    if (!privateKey || !serviceAccountEmail || !sheetId) {
      throw new Error("Missing required Google Sheets credentials. Check your environment variables.")
    }

    // Create a JWT client using service account credentials
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    // Create Google Sheets API client
    const sheets = google.sheets({ version: "v4", auth })

    return sheets
  } catch (error) {
    // Make sure we don't log the actual error message which might contain sensitive info
    if (
      error.message &&
      (error.message.includes("private_key") ||
        error.message.includes("client_email") ||
        error.message.includes("service account") ||
        error.message.includes("sheet"))
    ) {
      logError("GoogleSheets", "Error creating Google Sheets client: Authentication error")
    } else {
      logError("GoogleSheets", `Error creating Google Sheets client: ${error.message}`)
    }
    throw new Error("Failed to create Google Sheets client. Check your credentials.")
  }
}

export async function appendToSheet(sheetName, values) {
  try {
    const sheets = await getGoogleSheetClient()

    // Ensure the sheet exists and create it if it doesn't
    await ensureSheetExists(sheets, sheetName)

    // Determine the appropriate range based on the sheet name
    let range = `${sheetName}!A:B`

    // For Contact Form sheet, use a wider range to accommodate more columns
    if (sheetName === "Contact Form") {
      range = `${sheetName}!A:F`
    } else if (sheetName === "Appointments") {
      range = `${sheetName}!A:K` // Extended to include Meet link and Calendar link
    }

    // Append to the sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: range,
      valueInputOption: "USER_ENTERED",
      resource: {
        values,
      },
    })

    logInfo("GoogleSheets", `Data appended to sheet "${sheetName}" successfully`)
    return response.data
  } catch (error) {
    logError("GoogleSheets", `Error appending to sheet "${sheetName}": ${error.message}`)
    throw error
  }
}

async function ensureSheetExists(sheets, sheetName) {
  try {
    // Get the spreadsheet
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    })

    // Check if the sheet exists
    const sheetExists = spreadsheet.data.sheets.some((sheet) => sheet.properties.title === sheetName)

    // If the sheet doesn't exist, create it
    if (!sheetExists) {
      logInfo("GoogleSheets", `Sheet "${sheetName}" does not exist, creating it...`)
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      })

      // Add headers based on the sheet name
      let headers = ["Email", "Timestamp"]

      if (sheetName === "Contact Form") {
        headers = ["Timestamp", "Name", "Email", "Phone", "Subject", "Message"]
      } else if (sheetName === "Appointments") {
        headers = [
          "Timestamp",
          "Name",
          "Email",
          "Phone",
          "Company",
          "Date",
          "Time",
          "Meeting Type",
          "Message",
          "Meet Link",
          "Calendar Link",
        ]
      } else if (sheetName === "Newsletter") {
        headers = ["Email", "Timestamp"]
      }

      // Add headers to the new sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: `${sheetName}!A1:${String.fromCharCode(65 + headers.length - 1)}1`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [headers],
        },
      })

      logInfo("GoogleSheets", `Sheet "${sheetName}" created with headers: ${headers.join(", ")}`)
    }
  } catch (error) {
    logError("GoogleSheets", `Error ensuring sheet "${sheetName}" exists: ${error.message}`)
    throw error
  }
}

