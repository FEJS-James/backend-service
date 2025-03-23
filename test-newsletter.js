// Example of how to call the newsletter subscription endpoint from frontend
async function subscribeToNewsletter(email) {
  try {
    const response = await fetch("https://your-vercel-url.vercel.app/api/subscribe-newsletter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error subscribing to newsletter:", error)
    throw error
  }
}

