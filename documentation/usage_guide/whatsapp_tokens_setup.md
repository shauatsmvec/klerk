# How to Set Up WhatsApp Verification & Access Tokens

This guide explains how to configure the `WHATSAPP_VERIFY_TOKEN` and `WHATSAPP_ACCESS_TOKEN` credentials required to authorize webhook handshakes and download attachments from Meta's WhatsApp Cloud API.

---

## 🔑 1. `WHATSAPP_VERIFY_TOKEN` (Webhook Verification password)

This token is a **completely custom string** created by you to secure your webhook. Google/Meta will send this token to your server during the GET handshake to prove that Meta is authorized to connect to your endpoint.

### Setup Instructions:
1. Create a secure password string (e.g., `klerk_secure_verification_2026`).
2. Add this string to your backend environment variables:
   * In local development, add to `.env`:
     ```text
     WHATSAPP_VERIFY_TOKEN=klerk_secure_verification_2026
     ```
   * On Render/Railway dashboard, add `WHATSAPP_VERIFY_TOKEN` with this same value.
3. In your **Meta Developer App Dashboard** (under **WhatsApp** ➔ **Configuration**), paste this exact same string into the **Verify Token** input field when configuring your Callback URL.

---

## 🛡️ 2. `WHATSAPP_ACCESS_TOKEN` (API Authentication Token)

This token is used by your backend server to authenticate requests to the Meta Graph API when downloading files sent to your WhatsApp number.

### Setup Instructions (Option A: Sandbox / Temporary Access Token)
If you are testing Klerk in a sandbox/development environment:
1. Log in to the **[Meta App Dashboard](https://developers.facebook.com/)**.
2. Select your App.
3. In the left navigation menu, expand **WhatsApp** and click **API Setup**.
4. In the main panel, under **Temporary access token**, click the **Copy** button.
5. Paste this token into your `.env` or cloud provider environment:
   ```text
   WHATSAPP_ACCESS_TOKEN=EAAGd8x... (long string)
   ```
> [!WARNING]
> Temporary Access Tokens **expire after 24 hours**. They are only recommended for quick development tests.

---

### Setup Instructions (Option B: Permanent Access Token for Production)
To keep Klerk running continuously in production without token expirations:
1. Go to your **[Meta Business Suite settings](https://business.facebook.com/)** (you must have a Meta Business Account linked to your developer app).
2. Go to **Settings** ➔ **Business settings** ➔ **Users** ➔ **System users**.
3. If you don't have a system user, click **Add** and create an Admin System User.
4. Click on the system user, click **Add Assets**, and:
   * Under **Apps**, select your Klerk Developer App and enable the **Full control** toggle.
5. Click **Generate new token** next to the system user.
6. Select your App in the dropdown and check these two permission boxes:
   * `whatsapp_business_messaging`
   * `whatsapp_business_management`
7. Click **Generate Token**.
8. Copy the generated permanent token (this token **never expires**) and paste it as `WHATSAPP_ACCESS_TOKEN` in your cloud deployment environment variables.
