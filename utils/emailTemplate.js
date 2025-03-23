export function generateEmailTemplate({ name, email, phone, message }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Contact Form Submission</title>
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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Contact Form Submission</h2>
        </div>
        <div class="logo">
          <h1>Commercial Coding</h1>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${name}</div>
          </div>
          <div class="field">
            <div class="label">Email:</div>
            <div class="value">${email}</div>
          </div>
          <div class="field">
            <div class="label">Phone:</div>
            <div class="value">${phone}</div>
          </div>
          <div class="field">
            <div class="label">Message:</div>
            <div class="value">${message}</div>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <a href="mailto:${email}" class="button">Reply to ${name}</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Commercial Coding. All rights reserved.</p>
          <p>This email was sent via mailsendr</p>
        </div>
      </div>
    </body>
    </html>
  `
}

