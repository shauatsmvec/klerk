import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { DocumentService } from '../services/DocumentService';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { DuplicateDetectionService } from '../services/DuplicateDetectionService';
import { logger } from '../config/logger';
import { buildUploadResponse } from './response';
import { QueueService } from '../queue/QueueService';
import { PendingDocumentRepository } from '../repositories/PendingDocumentRepository';
import { WhatsAppService } from '../services/WhatsAppService';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const publicDir = path.join(process.cwd(), 'public');

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.static(publicDir));

const documentService = new DocumentService();
const repository = new DocumentRepository();
const duplicateService = new DuplicateDetectionService(repository);
const queueService = QueueService.getInstance();
const pendingRepository = new PendingDocumentRepository();
const whatsAppService = new WhatsAppService();

// Helpers
function downloadFile(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download file, status code: ${res.statusCode}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', (err) => reject(err));
    }).on('error', (err) => reject(err));
  });
}

interface DocumentJobData {
  filePath: string;
  originalName: string;
  from?: string;
  phoneNumberId?: string;
}

// Background Worker handler (registered after pg-boss starts)
async function documentWorkerHandler(jobData: DocumentJobData) {
  logger.info({ filePath: jobData.filePath }, 'Background worker processing document');
  
  if (!fs.existsSync(jobData.filePath)) {
    throw new Error(`File not found at path: ${jobData.filePath}`);
  }

  const fileBuffer = fs.readFileSync(jobData.filePath);
  
  try {
    const result = await documentService.processDocument(fileBuffer, jobData.originalName);
    const duplicate = await duplicateService.detect(result.document.sha256Hash);
    await repository.save(result.document);
    logger.info({ originalName: jobData.originalName }, 'Background document processing complete');

    if (jobData.from && jobData.phoneNumberId) {
      await whatsAppService.sendTextMessage(
        jobData.from,
        `✅ Invoice "${jobData.originalName}" has been successfully processed, uploaded to Google Drive, and logged in Google Sheets!`,
        jobData.phoneNumberId
      ).catch((err) => logger.warn({ err: err.message }, 'Failed to send outbound WhatsApp success confirmation'));
    }
  } catch (error: any) {
    logger.error({ err: error, originalName: jobData.originalName }, 'Background document processing failed');
    if (jobData.from && jobData.phoneNumberId) {
      await whatsAppService.sendTextMessage(
        jobData.from,
        `❌ Sorry, we encountered an error while processing your invoice "${jobData.originalName}": ${error.message}`,
        jobData.phoneNumberId
      ).catch((err) => logger.warn({ err: err.message }, 'Failed to send outbound WhatsApp failure notification'));
    }
    throw error;
  } finally {
    // Clean up temporary file
    try {
      fs.unlinkSync(jobData.filePath);
    } catch (cleanupErr) {
      logger.warn({ err: cleanupErr }, 'Failed to clean up temporary file');
    }
  }
}

// SIGTERM hook for clean stop
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Stopping server and queue...');
  await queueService.stop();
  process.exit(0);
});

// Routes
app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/privacy', (_req: Request, res: Response) => {
  res.send('<h1>Privacy Policy</h1><p>Klerk does not share or sell your data.</p>');
});

app.get('/terms', (_req: Request, res: Response) => {
  res.send('<h1>Terms of Service</h1><p>Klerk MVP usage terms.</p>');
});

app.get('/ready', (_req: Request, res: Response) => {
  res.json({ ready: true });
});

app.post('/api/documents/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await documentService.processDocument(req.file.buffer, req.file.originalname);
    const duplicate = await duplicateService.detect(result.document.sha256Hash);
    const saved = await repository.save(result.document);

    const payload = buildUploadResponse({
      document: saved,
      duplicate,
      extraction: result.extraction,
      confidenceValidation: result.confidenceValidation,
      savedToDatabase: Boolean(saved.id),
    });

    return res.json(payload);
  } catch (error) {
    logger.error({ err: error }, 'Upload processing failed');
    return res.status(500).json({ error: 'Failed to process document' });
  }
});

// Graph API Media download utility
async function downloadMetaMedia(mediaId: string): Promise<Buffer> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) {
    throw new Error('WHATSAPP_ACCESS_TOKEN environment variable is not configured');
  }

  // 1. Fetch metadata from Graph API to retrieve download URL
  const metaUrl = `https://graph.facebook.com/v20.0/${mediaId}`;
  const responseBody = await new Promise<string>((resolve, reject) => {
    https.get(metaUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
      res.on('error', err => reject(err));
    }).on('error', err => reject(err));
  });

  const { url } = JSON.parse(responseBody);
  if (!url) {
    throw new Error(`Failed to retrieve download URL from Meta Graph API for media ID: ${mediaId}`);
  }

  // 2. Download raw file attachment binary
  return new Promise<Buffer>((resolve, reject) => {
    https.get(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download Meta media file, status: ${res.statusCode}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', err => reject(err));
    }).on('error', err => reject(err));
  });
}

// Meta Handshake verification
app.get('/api/webhooks/whatsapp', (req: Request, res: Response) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'klerk_verify_token';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      logger.info('WhatsApp webhook verified successfully');
      return res.status(200).send(challenge);
    } else {
      logger.warn({ token }, 'WhatsApp webhook verification failed: Token mismatch');
      return res.sendStatus(403);
    }
  }
  return res.sendStatus(400);
});

app.post('/api/webhooks/whatsapp', async (req: Request, res: Response) => {
  try {
    let from = 'unknown';
    let mediaName = 'whatsapp_document.pdf';
    let fileBuffer: Buffer | null = null;
    let messageText: string | null = null;
    let phoneNumberId = '1117276108146469'; // Default fallback

    // Check if real Meta Webhook payload is present
    if (req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const value = req.body.entry[0].changes[0].value;
      const message = value.messages[0];
      from = message.from || 'unknown';
      phoneNumberId = value.metadata?.phone_number_id || phoneNumberId;

      if (message.type === 'text' && message.text) {
        messageText = message.text.body;
      } else {
        let mediaId: string | null = null;
        if (message.type === 'document' && message.document) {
          mediaId = message.document.id;
          mediaName = message.document.filename || 'whatsapp_document.pdf';
        } else if (message.type === 'image' && message.image) {
          mediaId = message.image.id;
          mediaName = 'whatsapp_image.jpg';
        }

        if (!mediaId) {
          logger.info({ messageType: message.type }, 'Received non-media Meta WhatsApp event. Acknowledged.');
          return res.sendStatus(200);
        }

        logger.info({ mediaId, mediaName, from }, 'Received real Meta WhatsApp webhook media event');
        fileBuffer = await downloadMetaMedia(mediaId);
      }
    } else {
      // Local simulator fallback (can simulate text messages OR media messages)
      const { from: simFrom, mediaUrl, mediaName: simMediaName, messageText: simText } = req.body;
      from = simFrom || 'unknown';

      if (simText) {
        messageText = simText;
      } else {
        if (!mediaUrl || !simMediaName) {
          return res.status(400).json({ error: 'Missing mediaUrl/mediaName or messageText for simulation' });
        }
        mediaName = simMediaName;
        logger.info({ from, mediaUrl, mediaName }, 'Received simulated WhatsApp message webhook');

        try {
          fileBuffer = await downloadFile(mediaUrl);
        } catch (downloadError: any) {
          logger.warn(
            { err: downloadError.message, mediaUrl },
            'Failed to download WhatsApp media. Falling back to structured dummy buffer.'
          );
          fileBuffer = Buffer.from(
            `Supplier: Sanitherm SA\nDocument date: 15/06/2026\nTotal TTC: 124,00 €\n`
          );
        }
      }
    }

    // A: Handle Text Confirmation replies
    if (messageText) {
      const pendingDoc = await pendingRepository.getPending(from);
      if (pendingDoc) {
        const textNormalized = messageText.trim().toLowerCase();
        if (textNormalized === 'yes' || textNormalized === 'y') {
          logger.info({ from, filename: pendingDoc.filename }, 'User confirmed pending invoice upload');

          // Move file from pending to temp directory for processing
          const tmpDir = path.join(process.cwd(), 'uploads', 'tmp');
          fs.mkdirSync(tmpDir, { recursive: true });
          const tmpFilePath = path.join(tmpDir, `${Date.now()}-${pendingDoc.filename}`);
          
          if (fs.existsSync(pendingDoc.tempFilePath)) {
            fs.renameSync(pendingDoc.tempFilePath, tmpFilePath);
          } else {
            return res.status(404).json({ error: 'Temporary pending file not found' });
          }

          // Enqueue the document processing job
          const jobId = await queueService.sendJob('document-processing', {
            filePath: tmpFilePath,
            originalName: pendingDoc.filename,
            from,
            phoneNumberId,
          });

          await whatsAppService.sendTextMessage(
            from,
            `⏳ Confirmed. Processing invoice "${pendingDoc.filename}"...`,
            phoneNumberId
          ).catch(() => {});

          await pendingRepository.deletePending(from);

          return res.status(202).json({
            status: 'accepted',
            jobId,
            message: 'Document confirmed and enqueued for processing',
          });
        } else if (textNormalized === 'no' || textNormalized === 'n') {
          logger.info({ from, filename: pendingDoc.filename }, 'User cancelled pending invoice upload');

          // Clean up the temp file
          if (fs.existsSync(pendingDoc.tempFilePath)) {
            fs.unlinkSync(pendingDoc.tempFilePath);
          }

          await pendingRepository.deletePending(from);

          await whatsAppService.sendTextMessage(
            from,
            `❌ Cancelled. The invoice "${pendingDoc.filename}" has been discarded. Please send the correct document.`,
            phoneNumberId
          ).catch(() => {});

          return res.sendStatus(200);
        } else {
          // Re-prompt the user
          const promptText = formatPendingMessage(
            '⚠️ Pending Document Confirmation',
            pendingDoc.filename,
            pendingDoc.supplierName,
            pendingDoc.totalTtc,
            pendingDoc.documentDate,
            pendingDoc.dueDate,
            pendingDoc.documentType
          );

          await whatsAppService.sendTextMessage(from, promptText, phoneNumberId).catch(() => {});
          return res.sendStatus(200);
        }
      } else {
        logger.info({ from, messageText }, 'Received WhatsApp text reply without a pending document. Acknowledged.');
        return res.sendStatus(200);
      }
    }

    // B: Handle incoming Media message (PDF/Image)
    if (fileBuffer) {
      // Clean up any existing pending document for this number first
      const existingPending = await pendingRepository.getPending(from);
      if (existingPending) {
        if (fs.existsSync(existingPending.tempFilePath)) {
          try {
            fs.unlinkSync(existingPending.tempFilePath);
          } catch {}
        }
        await pendingRepository.deletePending(from);
      }

      // Run initial extraction (OCR & parser) to show preview info to the user
      let supplierName: string | null = null;
      let totalTtc: string | null = null;
      let documentDate: string | null = null;
      let dueDate: string | null = null;
      let documentType: string | null = null;

      try {
        const result = await documentService.processDocument(fileBuffer, mediaName);
        supplierName = result.extraction.supplier_name?.value ? String(result.extraction.supplier_name.value) : null;
        totalTtc = result.extraction.total_ttc?.value ? String(result.extraction.total_ttc.value) : null;
        documentDate = result.extraction.document_date?.value ? String(result.extraction.document_date.value) : null;
        dueDate = result.extraction.due_date?.value ? String(result.extraction.due_date.value) : null;
        documentType = result.document.documentType || 'invoice';
      } catch (err: any) {
        logger.warn({ err: err.message }, 'Failed initial extraction on webhook. Using empty fallbacks.');
      }

      // Save the buffer to uploads/pending/
      const pendingDir = path.join(process.cwd(), 'uploads', 'pending');
      fs.mkdirSync(pendingDir, { recursive: true });
      const tempFilePath = path.join(pendingDir, `${Date.now()}-${mediaName}`);
      fs.writeFileSync(tempFilePath, fileBuffer);

      // Save record to database
      await pendingRepository.savePending({
        phoneNumber: from,
        phoneNumberId,
        filename: mediaName,
        tempFilePath,
        supplierName,
        totalTtc,
        documentDate,
        dueDate,
        documentType,
      });

      // Send prompt text
      const promptText = formatPendingMessage(
        '📄 New Document Detected',
        mediaName,
        supplierName,
        totalTtc,
        documentDate,
        dueDate,
        documentType
      );

      await whatsAppService.sendTextMessage(from, promptText, phoneNumberId).catch(() => {});

      return res.status(202).json({
        status: 'pending_confirmation',
        message: 'Document saved to pending state. Waiting for user confirmation.',
      });
    }

    return res.sendStatus(400);
  } catch (error) {
    logger.error({ err: error }, 'WhatsApp webhook processing failed');
    return res.status(500).json({ error: 'Failed to process webhook' });
  }
});

function formatPendingMessage(
  title: string,
  filename: string,
  supplierName: string | null,
  totalTtc: string | null,
  documentDate: string | null,
  dueDate: string | null,
  documentType: string | null
): string {
  const typeStr = documentType ? documentType.toUpperCase() : 'DOCUMENT';
  return `*${title}*\n` +
         `-------------------------\n` +
         `📂 *File*: ${filename}\n` +
         `📝 *Type*: ${typeStr}\n` +
         `🏢 *Supplier*: ${supplierName || 'Unknown'}\n` +
         `📅 *Date*: ${documentDate || 'Unknown'}\n` +
         `⌛ *Due Date*: ${dueDate || 'Unknown'}\n` +
         `💰 *Total*: ${totalTtc || 'Unknown'}\n` +
         `-------------------------\n\n` +
         `Do you confirm this document?\n` +
         `👉 Reply *Yes* to upload & log\n` +
         `👉 Reply *No* to discard`;
}

app.get('/api/jobs/:id', async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id as string;
    const state = await queueService.getJobStatus(jobId);
    if (!state) {
      return res.status(404).json({ error: 'Job not found' });
    }
    return res.json({ jobId, state });
  } catch (error) {
    logger.error({ err: error, jobId: req.params.id }, 'Failed to check job status');
    return res.status(500).json({ error: 'Failed to check job status' });
  }
});

app.get('/api/documents', async (req: Request, res: Response) => {
  try {
    const docs = await repository.findAll();
    return res.json(docs);
  } catch (error) {
    logger.error({ err: error }, 'Failed to fetch documents');
    return res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

async function verifyWabaSubscription(): Promise<void> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const wabaId = process.env.WABA_ID;
  const KLERK_APP_ID = '1730220628173875';

  if (!token || !wabaId) {
    logger.warn('WABA subscription check skipped: WHATSAPP_ACCESS_TOKEN or WABA_ID not configured');
    return;
  }

  try {
    // 1. Check existing subscribed apps
    const checkUrl = `https://graph.facebook.com/v20.0/${wabaId}/subscribed_apps`;
    const responseBody = await new Promise<string>((resolve, reject) => {
      https.get(checkUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(body));
        res.on('error', err => reject(err));
      }).on('error', err => reject(err));
    });

    const data = JSON.parse(responseBody);
    const isSubscribed = data.data?.some(
      (app: { id: string }) => app.id === KLERK_APP_ID
    );

    if (!isSubscribed) {
      logger.warn('[KLERK] ⚠️ klerk final app not in WABA subscribed_apps — re-registering...');
      
      // 2. POST to force subscribe the app
      await new Promise<void>((resolve, reject) => {
        const req = https.request({
          hostname: 'graph.facebook.com',
          port: 443,
          path: `/v20.0/${wabaId}/subscribed_apps`,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            if (res.statusCode === 200) {
              logger.info('[KLERK] ✅ WABA subscription re-registered successfully');
              resolve();
            } else {
              reject(new Error(`Failed to subscribe app, status: ${res.statusCode}, body: ${body}`));
            }
          });
        });
        req.on('error', err => reject(err));
        req.write(JSON.stringify({}));
        req.end();
      });
    } else {
      logger.info('[KLERK] ✅ WABA subscription active for klerk final app.');
    }
  } catch (error: any) {
    logger.error({ err: error.message }, 'Failed to check/register WABA subscription');
  }
}

export async function startServer(port = 3001): Promise<void> {
  await queueService.start();
  await queueService.registerWorker('document-processing', documentWorkerHandler);
  await verifyWabaSubscription();
  app.listen(port, () => {
    logger.info({ port }, 'Klerk API listening');
  });
}
