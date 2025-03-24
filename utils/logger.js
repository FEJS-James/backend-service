/**
 * Utility for logging with timestamps and context
 */

/**
 * Sanitizes a message to remove any potentially sensitive information
 * @param {string} message - The message to sanitize
 * @returns {string} - The sanitized message
 */
function sanitizeMessage(message) {
  if (typeof message !== "string") return message

  // List of patterns to sanitize (sensitive information)
  const sensitivePatterns = [
    // Private key patterns
    /-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/g,

    // Email patterns that might be service accounts
    /[\w.-]+@[\w.-]+\.iam\.gserviceaccount\.com/g,

    // API keys and tokens
    /api[_-]?key[\s]*:[\s]*["'].*?["']/g,
    /auth[_-]?token[\s]*:[\s]*["'].*?["']/g,

    // Other potentially sensitive patterns
    /password[\s]*:[\s]*["'].*?["']/g,
    /secret[\s]*:[\s]*["'].*?["']/g,
  ]

  // Replace all sensitive patterns with [REDACTED]
  let sanitized = message
  sensitivePatterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, "[REDACTED]")
  })

  return sanitized
}

export function logError(context, error) {
  // Sanitize the error message
  const sanitizedError = sanitizeMessage(error)
  console.error(`[${new Date().toISOString()}] [ERROR] [${context}]`, sanitizedError)

  // In a production environment, you might want to send errors to a monitoring service
  // like Sentry, LogRocket, etc.
}

export function logInfo(context, message) {
  // Sanitize the message
  const sanitizedMessage = sanitizeMessage(message)
  console.log(`[${new Date().toISOString()}] [INFO] [${context}]`, sanitizedMessage)
}

