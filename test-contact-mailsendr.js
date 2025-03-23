// Example of how to test the contact-us endpoint with mailsendr
async function testContactForm() {
  try {
    const response = await fetch("https://your-vercel-url.vercel.app/api/contact-us", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        phone: "123-456-7890",
        message: "This is a test message to verify mailsendr integration.",
        subject: "Test Contact Form Submission",
      }),
    })

    const data = await response.json()
    console.log("Response:", data)
    return data
  } catch (error) {
    console.error("Error testing contact form:", error)
    throw error
  }
}

// Run the test
testContactForm()

