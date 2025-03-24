/**
 * Generate booking confirmation email
 */
export function generateBookingConfirmationEmail({
  fullName,
  email,
  phoneNumber,
  companyName,
  meetingDate,
  meetingTime,
  meetingType,
  message,
  meetLink,
  calendarEventLink,
  calendarAttachment,
  calendarNote,
  recipient, // "client" or "admin"
}) {
  const isClient = recipient === "client"
  const title = isClient ? "Your Meeting is Confirmed!" : `New Meeting Booking: ${fullName}`

  const intro = isClient
    ? `Thank you for booking a meeting with Commercial Coding. Your ${meetingType} meeting has been scheduled for ${meetingDate} at ${meetingTime}.`
    : `${fullName} from ${companyName} has booked a ${meetingType} meeting for ${meetingDate} at ${meetingTime}.`

  // Create a more prominent Meet link section
  const meetLinkSection = meetLink
    ? `
   <div class="meet-link">
     <h3 style="margin-bottom: 10px; color: #4285F4;">Google Meet Link</h3>
     <p style="font-size: 16px; margin-bottom: 15px;">Join the meeting using this link:</p>
     <a href="${meetLink}" 
        style="display: inline-block; background-color: #4285F4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; margin-bottom: 15px;"
        target="_blank">
       Join Google Meet
     </a>
     <p style="margin-top: 10px; font-size: 14px; color: #555;">
       Or copy this link: <span style="font-family: monospace; background-color: #f5f5f5; padding: 3px 6px; border-radius: 3px;">${meetLink}</span>
     </p>
   </div>
   `
    : `
   <div class="note">
     <p><strong>Note:</strong> This meeting does not include a Google Meet link. Please check your email for any alternative meeting instructions.</p>
   </div>
   `

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
      }
      .container {
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 20px;
        margin: 20px 0;
      }
      .header {
        background-color: #0056b3;
        color: white;
        padding: 15px;
        text-align: center;
        border-radius: 5px 5px 0 0;
      }
      .content {
        padding: 20px;
      }
      .field {
        margin-bottom: 15px;
      }
      .label {
        font-weight: bold;
        margin-bottom: 5px;
      }
      .value {
        background-color: #f9f9f9;
        padding: 10px;
        border-radius: 3px;
      }
      .footer {
        text-align: center;
        margin-top: 20px;
        font-size: 12px;
        color: #666;
      }
      .logo {
        text-align: center;
        margin-bottom: 20px;
      }
      .button {
        display: inline-block;
        background-color: #0056b3;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        margin-top: 15px;
      }
      .meet-button {
        background-color: #4285F4;
      }
      .buttons {
        text-align: center;
        margin: 20px 0;
      }
      .note {
        background-color: #fff8e1;
        padding: 10px;
        border-left: 4px solid #ffc107;
        margin: 15px 0;
      }
      .meet-link {
        background-color: #e8f0fe;
        padding: 20px;
        border-radius: 5px;
        margin: 20px 0;
        text-align: center;
        border: 1px solid #4285F4;
      }
      .meet-link a {
        color: white;
        font-weight: bold;
        text-decoration: none;
      }
      .meeting-details {
        margin: 25px 0;
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 15px;
      }
      .meeting-details h3 {
        margin-top: 0;
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
        color: #0056b3;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>${title}</h2>
      </div>
      <div class="logo">
        <h1>Commercial Coding</h1>
      </div>
      <div class="content">
        <p>${intro}</p>
        
        ${meetLinkSection}
        
        <div class="meeting-details">
          <h3>Meeting Details</h3>
          <div class="field">
            <div class="label">Meeting Type:</div>
            <div class="value">${meetingType}</div>
          </div>
          
          <div class="field">
            <div class="label">Date:</div>
            <div class="value">${meetingDate}</div>
          </div>
          
          <div class="field">
            <div class="label">Time:</div>
            <div class="value">${meetingTime}</div>
          </div>
          
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${fullName}</div>
          </div>
          
          <div class="field">
            <div class="label">Email:</div>
            <div class="value">${email}</div>
          </div>
          
          <div class="field">
            <div class="label">Phone:</div>
            <div class="value">${phoneNumber}</div>
          </div>
          
          <div class="field">
            <div class="label">Company:</div>
            <div class="value">${companyName}</div>
          </div>
          
          ${
            message
              ? `
          <div class="field">
            <div class="label">Message:</div>
            <div class="value">${message}</div>
          </div>
          `
              : ""
          }
        </div>
        
        <div class="buttons">
          ${meetLink ? `<a href="${meetLink}" class="button meet-button" target="_blank">Join Google Meet</a>` : ""}
        </div>
        
        ${
          isClient
            ? `
        <p>We've attached a calendar invitation to this email. You can add it to your calendar by opening the attachment.</p>
        <p>If you need to reschedule or cancel this meeting, please reply to this email or contact us at info@commercialcoding.com.</p>
        `
            : `
        <p>This meeting has been added to the Commercial Coding calendar. A calendar invitation is attached to this email.</p>
        `
        }
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Commercial Coding. All rights reserved.</p>
        <p>This email was sent via MailerSend</p>
      </div>
    </div>
  </body>
  </html>
`
}

