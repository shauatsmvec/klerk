import https from 'https';
import { env } from '../config/env';
import { logger } from '../config/logger';

export class WhatsAppService {
  private readonly token: string | undefined;

  constructor(token = env.WHATSAPP_ACCESS_TOKEN) {
    this.token = token;
  }

  /**
   * Send a text message to a WhatsApp user
   * @param to The recipient's phone number
   * @param text The body text to send
   * @param phoneNumberId The WhatsApp Cloud API sandbox Phone ID to send from
   */
  public async sendTextMessage(to: string, text: string, phoneNumberId: string): Promise<void> {
    if (!this.token) {
      logger.warn('[WHATSAPP] Access token not configured. Skipping message dispatch.');
      return;
    }

    const payload = JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        body: text,
      },
    });

    const options = {
      hostname: 'graph.facebook.com',
      port: 443,
      path: `/v20.0/${phoneNumberId}/messages`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    return new Promise<void>((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            logger.info({ to, response: body }, '[WHATSAPP] Outbound message sent successfully');
            resolve();
          } else {
            const error = new Error(`Meta Graph API returned status ${res.statusCode}: ${body}`);
            logger.error({ to, statusCode: res.statusCode, body }, '[WHATSAPP] Failed to send outbound message');
            reject(error);
          }
        });
      });

      req.on('error', (err) => {
        logger.error({ to, err }, '[WHATSAPP] Connection error sending message');
        reject(err);
      });

      req.write(payload);
      req.end();
    });
  }
}
