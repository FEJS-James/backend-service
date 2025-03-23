export function logError(context, error) {
  console.error(`[${new Date().toISOString()}] [ERROR] [${context}]`, error)

  // In a production environment, you might want to send errors to a monitoring service
  // like Sentry, LogRocket, etc.
}

export function logInfo(context, message) {
  console.log(`[${new Date().toISOString()}] [INFO] [${context}]`, message)
}

