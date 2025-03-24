import dotenv from "dotenv"
import fetch from "node-fetch"
import { logInfo, logError } from "../utils/logger.js"

// Load environment variables
dotenv.config()

export async function testCors() {
  try {
    logInfo("Test", "Testing CORS configuration...")

    // Test the API endpoint with a simulated CORS request
    const response = await fetch("http://localhost:3000/api/test", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://commercialcoding.com", // Simulate request from allowed origin
      },
    })

    // Check if CORS headers are present
    const corsHeader = response.headers.get("access-control-allow-origin")

    if (corsHeader) {
      logInfo("Test", `CORS headers are present: access-control-allow-origin: ${corsHeader}`)

      const data = await response.json()
      logInfo("Test", `Response: ${JSON.stringify(data, null, 2)}`)

      return { success: true, message: "CORS test passed" }
    } else {
      logError("Test", "CORS headers are missing in the response")
      return { success: false, message: "CORS test failed: CORS headers are missing in the response" }
    }
  } catch (error) {
    logError("Test", `CORS test failed: ${error.message}`)
    return { success: false, message: `CORS test failed: ${error.message}` }
  }
}

// Only run directly if this file is being executed directly
if (process.argv[1].includes("test-cors.js")) {
  testCors()
}

