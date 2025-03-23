# Commercial Coding Backend Service

A backend service built with Express.js for Commercial Coding, providing API endpoints for contact forms, newsletter subscriptions, and meeting bookings.

## Features

- **Contact Form Endpoint**: Receives form submissions and sends branded HTML emails
- **Newsletter Subscription**: Adds email addresses to a Google Sheet
- **Meeting Booking**: Placeholder endpoint for future implementation
- **Test Endpoint**: Verifies API connectivity and CORS configuration

## Tech Stack

- **Express.js**: Web framework for Node.js
- **Google Sheets API**: For storing newsletter subscriptions
- **Mailsendr**: For sending branded HTML emails
- **Vercel**: For serverless deployment

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Google Cloud Platform account (for Google Sheets API)
- Mailsendr account

## Code Changes

To deploy code changes to the GitHub repository, use the included `deploy.sh` script. This script automates the Git workflow by generating a unique version ID, creating a commit with your changes, and pushing them to the staging branch. Simply make the script executable with `chmod +x deploy.sh` and run it with `./deploy.sh`. The script is particularly useful for managing changes generated with v0, ensuring all modifications are properly versioned and tracked.

