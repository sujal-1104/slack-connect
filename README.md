# Slack Connect

This is the submission for the **Refold Intern Assignment**.

Slack Connect is a full-stack OAuth-integrated messaging platform that connects with the Slack API. It allows users to authenticate via Slack, send immediate messages to channels, schedule future messages, view them, and cancel them if needed.

---

## 🗂 Folder Structure

slack-connect/
├── slack-connect-backend/ # Express + TypeScript backend
├── slack-connect-frontend/ # React + TypeScript frontend
├── README.md

---

## 🚀 Tech Stack

| Layer      | Tech                             |
|------------|----------------------------------|
| Frontend   | React, TypeScript, Vite          |
| Backend    | Node.js, Express, TypeScript     |
| Database   | Sequelize ORM + SQLite/PostgreSQL|
| Auth       | OAuth 2.0 via Slack              |
| Dev Tools  | Nodemon, ts-node-dev, dotenv     |

---

## ⚙️ Detailed Setup Instructions

### ✅ 1. Clone the Repository

bash
git clone https://github.com/YOUR_USERNAME/slack-connect.git
cd slack-connect
✅ 2. Backend Setup (slack-connect-backend/)
bash
Copy
Edit
cd slack-connect-backend
cp .env.example .env
npm install
npm run dev
.env configuration:
env
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_REDIRECT_URI=https://localhost:3000/callback
FRONTEND_URL=https://localhost:5173
You can get these credentials by creating a Slack App at:
🔗 https://api.slack.com/apps

✅ 3. Frontend Setup (slack-connect-frontend/)
bash

cd ../slack-connect-frontend
cp .env.example .env
npm install
npm run dev
.env configuration:
env

VITE_BACKEND_URL=https://localhost:5000
✅ 4. HTTPS (Required by Slack for OAuth)
Slack requires HTTPS for OAuth redirects.
To enable this locally:

a. Generate self-signed certificates:
bash

openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 365
b. Update vite.config.ts in the frontend:
ts

import fs from 'fs';

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem'),
    },
    port: 5173,
  },
});
Now your frontend will run on https://localhost:5173 and Slack will accept the redirect.

 Architectural Overview
✅ OAuth Flow
Users click “Connect to Slack” → redirected to Slack's OAuth screen.

Slack redirects back to your backend /callback route with a temporary code.

Backend exchanges code for access + refresh tokens, and stores them using Sequelize.

team_id is saved and passed to the frontend to persist Slack identity.

✅ Token Management
Tokens are stored in a Token table with:

access_token, refresh_token, expires_at, team_id

Before every API request to Slack, backend:

Checks if token is expired

Refreshes it using Slack’s OAuth if needed

✅ Scheduled Message Handling
Messages are stored with team_id, channel_id, text, and send_at

A background cron or loop (run in app.ts) checks periodically for messages whose time has come and posts them to Slack

✨ Features
🔒 Secure OAuth 2.0 flow

💬 Send message to any Slack channel

🕓 Schedule messages for later

📆 List all scheduled messages

❌ Cancel future scheduled messages

🌐 Fully RESTful APIs

🚧 Challenges & Learnings
🔐 Slack OAuth & HTTPS
Slack's requirement for HTTPS made local development tricky. I learned how to generate and use self-signed certificates and configure Vite with HTTPS for a secure local development flow.

🔄 Token Refreshing
Implementing robust token refresh logic required reading through Slack’s documentation and testing edge cases like expired tokens and revoked permissions. I used Sequelize to track token expiry and wrote a helper to auto-refresh when needed.

📆 Scheduling Without Crons
Scheduling messages without external cron services involved implementing a custom time-based polling mechanism that runs periodically and dispatches due messages via Slack’s API.

⚛️ State Management in React
Handling loading states, async fetches, and syncing backend data in real-time taught me how to structure component-level state more efficiently using hooks like useEffect.

📄 .env.example Files
slack-connect-backend/.env.example
env

SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_REDIRECT_URI=https://localhost:3000/callback
FRONTEND_URL=https://localhost:5173
slack-connect-frontend/.env.example
env

VITE_BACKEND_URL=https://localhost:5000

Note:
This project is currently not deployed due to unresolved API fetch issues encountered during the final integration phase. Despite successfully implementing all core features — including Slack OAuth, message sending, and scheduling — some parts of the frontend were unable to consistently fetch data from the backend in a deployed environment.

I made multiple attempts to troubleshoot the issue, particularly around handling cross-origin HTTPS requests and token-based communication with Slack APIs. While I wasn't able to fully resolve it within the assignment timeframe, I remain committed to debugging the problem and achieving a stable deployment post-submission.

I'm passionate about building reliable and complete solutions, and I’ve learned a great deal from this project — especially around OAuth flows, secure local development, and handling scheduled tasks.
