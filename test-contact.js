// Example of how to call the contact-us endpoint from frontend
async function submitContactForm(formData) {
  try {
    const response = await fetch("https://your-vercel-url.vercel.app/api/contact-us", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        subject: formData.subject || "New Contact Form Submission",
      }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error submitting contact form:", error)
    throw error
  }
}

