# Production Cloud Deployment Guide

This guide details how to deploy Klerk (Backend + Frontend Client) to production cloud platforms like **Render** or **Railway**.

---

## ☁️ Option A: Deploying on Render (Recommended)

Render is ideal for multi-service repositories (monorepos) since you can configure custom Root Directories for each app service.

### 1. Deploy the Backend API Service

1. Sign in to **[Render](https://dashboard.render.com/)**.
2. Click **New** ➔ **Web Service**.
3. Connect your GitHub repository (`klerk`).
4. Configure the Web Service Settings:
   * **Name**: `klerk-backend`
   * **Language**: `Node`
   * **Root Directory**: `project`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `node dist/main.js`
   * **Instance Type**: Select **Free** (or any tier).
5. Open the **Advanced** section and add these Environment Variables:
   * `DATABASE_URL` (Your Supabase connection string)
   * `MISTRAL_API_KEY` (Your Mistral AI model API credential key)
   * `PORT` (e.g., `3001` or let Render set it dynamically)
   * `GOOGLE_INTEGRATION_MOCK` (`false` to write to Google Workspace, `true` for testing mocks)
   * `GOOGLE_CLIENT_ID` (Your GCP OAuth client credential ID)
   * `GOOGLE_CLIENT_SECRET` (Your GCP OAuth client secret key)
   * `GOOGLE_REFRESH_TOKEN` (Your GCP OAuth user refresh token)
   * `GOOGLE_SHEET_ID` (Your target log sheet ID)
   * `GOOGLE_DRIVE_FOLDER_ID` (Your target root drive directory ID)
   * `WHATSAPP_VERIFY_TOKEN` (Any custom password string, e.g. `my_secret_verify_token`, to authenticate the Meta Developer handshake)
   * `WHATSAPP_ACCESS_TOKEN` (Meta Graph API developer page token to fetch files)
6. Click **Create Web Service**. Wait for the build logs to compile and show `Klerk API listening`.
7. **Copy your backend public service URL** (e.g. `https://klerk-backend.onrender.com`).

---

### 2. Deploy the Frontend Dashboard Client

1. On the Render Dashboard, click **New** ➔ **Static Site**.
2. Connect your GitHub repository (`klerk`).
3. Configure the Static Site Settings:
   * **Name**: `klerk-dashboard`
   * **Root Directory**: `frontend`
   * **Build Command**: `npm install && npm run build`
   * **Publish Directory**: `dist`
4. Open the **Advanced** section and add this Environment Variable:
   * `VITE_BACKEND_URL`: Paste the backend public service URL you copied in the previous step (e.g., `https://klerk-backend.onrender.com`).
5. Click **Create Static Site**.
6. Render will compile your React files and publish them to a public dashboard link (e.g., `https://klerk-dashboard.onrender.com`).

---

## ⚡ Option B: Deploying on Railway

Railway offers a single-dashboard experience with direct GitHub triggers.

1. Sign in to **[Railway](https://railway.app/)**.
2. Click **New Project** ➔ **Deploy from GitHub repo** and select `klerk`.
3. Railway will deploy the root structure. Click on your service block and go to **Settings**:
   * Under **General**, set **Root Directory** to `project`.
   * Set the **Build Command** to `npm install && npm run build`.
   * Set the **Start Command** to `node dist/main.js`.
4. Go to **Variables** and add all environment variables listed in the Render Backend section above.
5. Railway will automatically expose a public domain. Copy this domain.
6. Deploy the Frontend:
   * Click **New** ➔ **GitHub Repo** and select the same repository.
   * Go to **Settings** ➔ **Root Directory** and set it to `frontend`.
   * Go to **Variables** and add `VITE_BACKEND_URL` pointing to the backend's public domain.

---

## 📲 WhatsApp Webhook Integration Step

Once your backend is live on Render/Railway (e.g., `https://klerk-backend.onrender.com`), you can hook up your live Meta developer app:

1. Go to your **[Meta App Dashboard](https://developers.facebook.com/)** ➔ **WhatsApp** ➔ **Configuration**.
2. Set the **Callback URL** to:
   `https://klerk-backend.onrender.com/api/webhooks/whatsapp`
3. Set the **Verify Token** to the value of `WHATSAPP_VERIFY_TOKEN` configured in your backend service variables.
4. Click **Verify and Save**. The Meta GET challenge handshake will automatically verify within seconds!
