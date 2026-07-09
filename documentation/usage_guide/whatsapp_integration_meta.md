# Meta WhatsApp Cloud API Integration Guide

This guide details how to replace our simulated WhatsApp webhook with a live, production WhatsApp Cloud API webhook using the Meta Developer Portal.

---

## 1. Meta Developer App Setup

1. Go to the **[Meta App Dashboard](https://developers.facebook.com/)** and log in.
2. Click **Create App** and select **Other** ➔ **Business** as the app type.
3. Add an app name (e.g., `Klerk Document Processor`) and link your Business Manager Account.
4. On the App setup page, scroll down to **WhatsApp** and click **Set up**.
5. Once configured, Meta will provide you with a **Temporary Access Token**, a **Phone Number ID**, and a **WhatsApp Business Account ID** for your sandbox testing.

---

## 2. Webhook Setup & Handshake (Verification)

Meta requires webhook endpoints to implement a standard GET handshake to verify ownership before sending messages.

### The GET Verification Signature
To support this validation, add a `GET /api/webhooks/whatsapp` verification route in your backend (`server.ts`):

```typescript
app.get('/api/webhooks/whatsapp', (req: Request, res: Response) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'your_custom_secure_verify_token';

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      logger.info('Webhook verified successfully by Meta');
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send('Forbidden: Verification token mismatch');
    }
  }
  return res.status(400).send('Bad Request');
});
```

### Configuration on Meta Dashboard
1. In the left panel of your Meta App Dashboard, go to **WhatsApp** ➔ **Configuration**.
2. Click **Edit** next to **Webhook URL**.
3. Set the **Callback URL** to your public production endpoint:
   `https://your-public-domain.com/api/webhooks/whatsapp`
4. Set the **Verify Token** to match the value of `WHATSAPP_VERIFY_TOKEN` in your `.env`.
5. Click **Verify and save**.

---

## 3. Subscribing to Message Webhooks

Once verified, you must subscribe to message events:
1. In the Webhook settings on the Meta Dashboard, find the list of webhook fields.
2. Click **Subscribe** next to **`messages`**.
3. Now, whenever a user sends an image, PDF, or document to your registered WhatsApp number, Meta will trigger a `POST` request to your webhook callback.

---

## 4. Production Webhook Payload Mapping

When Meta sends a webhook event, the payload structure looks like this:

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15550198888",
              "phone_number_id": "1002931"
            },
            "contacts": [
              {
                "profile": { "name": "John Doe" },
                "wa_id": "33612345678"
              }
            ],
            "messages": [
              {
                "from": "33612345678",
                "id": "wamid.HBgLMzM2NTI1MDQ4OTAVAgASGBQzQTdDNEM1N...",
                "timestamp": "1783579899",
                "type": "document",
                "document": {
                  "filename": "facture_june.pdf",
                  "mime_type": "application/pdf",
                  "sha256": "4392f...",
                  "id": "MEDIA_OBJECT_ID"
                }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

### Media Downloading Steps (Handling Meta Media API)
Unlike standard URLs, Meta does not send direct public media download URLs. Instead, they provide a `MEDIA_OBJECT_ID`. Your webhook handler must:

1. **Request the Media Metadata**:
   Make a GET request to Meta's Graph API to get the download URL:
   ```text
   GET https://graph.facebook.com/v20.0/MEDIA_OBJECT_ID
   Headers: { "Authorization": "Bearer YOUR_WHATSAPP_ACCESS_TOKEN" }
   ```
2. **Retrieve the Download URL**:
   The response returns a temporary `url` field.
3. **Download the File**:
   Make a GET request to the retrieved `url` field:
   ```text
   GET <retrieved_url>
   Headers: { "Authorization": "Bearer YOUR_WHATSAPP_ACCESS_TOKEN" }
   ```
4. Save the buffer locally and enqueue it in Klerk's `QueueService` for document parsing!
