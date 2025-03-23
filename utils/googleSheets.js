import { google } from "googleapis"
import { logError } from "./logger.js"

export async function getGoogleSheetClient() {
  try {
    // Properly format the private key - this is a common issue
    // The private key from environment variables often has escaped newlines
    const privateKey = process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n") : ""

    if (!privateKey || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SHEET_ID) {
      throw new Error("Missing required Google Sheets credentials. Check your environment variables.")
    }

    // Create a JWT client using service account credentials
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    // Create Google Sheets API client
    const sheets = google.sheets({ version: "v4", auth })

    return sheets
  } catch (error) {
    logError("GoogleSheets", `Error creating Google Sheets client: ${error.message}`)
    throw error
  }
}

export async function appendToSheet(sheetName, values) {
  try {
    const sheets = await getGoogleSheetClient()

    // Ensure the sheet exists and create it if it doesn't
    await ensureSheetExists(sheets, sheetName)

    // Fix: Properly format the range without extra brackets
    const range = `${sheetName}!A:B`

    // Append to the sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: range,
      valueInputOption: "USER_ENTERED",
      resource: {
        values,
      },
    })

    return response.data
  } catch (error) {
    logError("GoogleSheets", `Error appending to sheet: ${error.message}`)
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

      // Add headers to the new sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: `${sheetName}!A1:B1`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [["Email", "Timestamp"]],
        },
      })
    }
  } catch (error) {
    logError("GoogleSheets", `Error ensuring sheet exists: ${error.message}`)
    throw error
  }
}

