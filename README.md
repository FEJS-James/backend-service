# Commercial Coding Backend Service

A backend service built with Express.js for Commercial Coding, providing API endpoints for contact forms, newsletter subscriptions, and meeting bookings.

## Features

- **Contact Form Endpoint**: Receives form submissions and sends branded HTML emails
- **Newsletter Subscription**: Adds email addresses to a Google Sheet
- **Meeting Booking**: Creates calendar events with Google Meet links and sends confirmations
- **Test Endpoint**: Verifies API connectivity and CORS configuration

## Tech Stack

- **Express.js**: Web framework for Node.js
- **Google Sheets API**: For storing newsletter subscriptions and appointments
- **Google Calendar API**: For creating calendar events with Google Meet links
- **Mailersend**: For sending branded HTML emails
- **Vercel**: For serverless deployment

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Google Cloud Platform account (for Google Sheets and Calendar APIs)
- Mailersend account

## Environment Setup

1. Copy `.env.example` to `.env`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
2. Update the values in `.env` with your actual API keys and credentials:
   - `MAILSENDR_API_KEY`: Your MailerSend API key
   - `MAILSENDR_FROM_EMAIL`: Email address to send from (default: info@commercialcoding.com)
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Your Google service account email
   - `GOOGLE_PRIVATE_KEY`: Your Google service account private key (keep the quotes and \n characters)
   - `GOOGLE_SHEET_ID`: ID of your Google Sheet for storing data

## Code Changes

To deploy code changes to the GitHub repository, use the included `deploy.sh` script. This script automates the Git workflow by generating a unique version ID, creating a commit with your changes, and pushing them to the staging branch.

### Using changes.log

When making changes to the project:

1. Add a new line to the `changes.log` file with a brief one-sentence description of your changes
2. The deploy script will use the **last line** of changes.log as the commit message
3. Run the deployment script with one of the following options:
  - `npm run deploy` - Local deployment only
  - `npm run deploy:push` - Deploy and push to remote

### Deployment Process

The deployment script performs the following actions:

1. Creates a new version branch based on the current date and time
2. Removes any frontend Next.js files (if present)
3. Replaces package.json with server.package.json
4. Merges the version branch into the staging branch
5. Optionally pushes the staging branch to the remote repository

To deploy:

\`\`\`bash
./deploy.sh [push]
\`\`\`

