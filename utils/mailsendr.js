/**
 * Utility for sending emails using the mailsendr service
 */

export async function sendEmail({ to, from, subject, html, text }) {
  try {
    const response = await fetch("https://api.mailsendr.com/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MAILSENDR_API_KEY}`,
      },
      body: JSON.stringify({
        to,
        from,
        subject,
        html,
        text: text || "",
        tracking_settings: {
          click_tracking: {
            enable: true,
          },
          open_tracking: {
            enable: true,
          },
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Mailsendr API error: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error sending email with mailsendr:", error)
    throw error
  }
}

