import express from "express"

const router = express.Router()

/**
 * GET /api/test
 * Simple test endpoint to verify API connectivity and CORS configuration
 */
router.get("/test", (req, res) => {
  // Get the request origin
  const origin = req.get("origin") || "Unknown origin"

  // Get current timestamp
  const timestamp = new Date().toISOString()

  // Return test response
  res.status(200).json({
    success: true,
    message: "API is working correctly!",
    data: {
      service: "Commercial Coding API",
      version: "1.0.0",
      timestamp,
      origin,
      cors: "If you can see this from commercialcoding.com, CORS is configured correctly!",
      requestHeaders: {
        "user-agent": req.get("user-agent"),
        "content-type": req.get("content-type"),
        accept: req.get("accept"),
      },
    },
  })
})

/**
 * POST /api/test
 * Test endpoint for POST requests
 */
router.post("/test", (req, res) => {
  // Get the request origin
  const origin = req.get("origin") || "Unknown origin"

  // Return test response with the request body
  res.status(200).json({
    success: true,
    message: "POST request received successfully!",
    data: {
      service: "Commercial Coding API",
      timestamp: new Date().toISOString(),
      origin,
      receivedData: req.body || "No data received",
    },
  })
})

export default router

