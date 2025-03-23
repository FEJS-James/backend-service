/**
 * Middleware to add security headers and handle CORS preflight requests
 */
export function securityMiddleware(req, res, next) {
  // Set security headers
  res.setHeader("X-Content-Type-Options", "nosniff")
  res.setHeader("X-XSS-Protection", "1; mode=block")
  res.setHeader("X-Frame-Options", "DENY")
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains")

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  next()
}

